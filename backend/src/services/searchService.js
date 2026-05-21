const Product = require('../models/Product');
const SearchHistory = require('../models/SearchHistory');

let client = null;
let useElastic = false;

if (process.env.ELASTICSEARCH_URL) {
  try {
    const { Client } = require('@elastic/elasticsearch');
    client = new Client({ node: process.env.ELASTICSEARCH_URL });
    useElastic = true;
    console.log(`[Search] Elasticsearch configured at ${process.env.ELASTICSEARCH_URL}`);
  } catch (error) {
    console.log('[Search] @elastic/elasticsearch dependency not installed or configured. Falling back to MongoDB Full-Text search.');
  }
}

// Initialize Indexes (runs on boot)
async function initIndexes() {
  if (!useElastic || !client) return;
  try {
    const indexExists = await client.indices.exists({ index: 'products' });
    if (!indexExists) {
      await client.indices.create({
        index: 'products',
        body: {
          settings: {
            analysis: {
              analyzer: {
                autocomplete_analyzer: {
                  type: 'custom',
                  tokenizer: 'autocomplete_tokenizer',
                  filter: ['lowercase']
                }
              },
              tokenizer: {
                autocomplete_tokenizer: {
                  type: 'edge_ngram',
                  min_gram: 2,
                  max_gram: 15,
                  token_chars: ['letter', 'digit']
                }
              }
            }
          },
          mappings: {
            properties: {
              title: {
                type: 'text',
                analyzer: 'autocomplete_analyzer',
                search_analyzer: 'standard'
              },
              category: { type: 'keyword' },
              store: { type: 'keyword' },
              currentPrice: { type: 'integer' },
              discountPercent: { type: 'integer' },
              ratings: { type: 'float' },
              image: { type: 'keyword', index: false },
              originalUrl: { type: 'keyword', index: false }
            }
          }
        }
      });
      console.log('[Search] Created products index in Elasticsearch');
    }
  } catch (error) {
    console.error('[Search] Failed to initialize Elasticsearch index. Falling back to MongoDB.', error.message);
    useElastic = false;
  }
}

// Index a single product
async function indexProduct(product) {
  if (!useElastic || !client) return;
  try {
    await client.index({
      index: 'products',
      id: product._id.toString(),
      body: {
        title: product.title,
        category: product.category,
        store: product.store,
        currentPrice: product.currentPrice,
        discountPercent: product.discountPercent,
        ratings: product.ratings,
        image: product.image,
        originalUrl: product.originalUrl
      }
    });
  } catch (error) {
    console.warn('[Search] Failed to index product in ES:', error.message);
  }
}

// Bulk sync all products from MongoDB to Elasticsearch
async function syncProductsToElastic() {
  if (!useElastic || !client) return;
  try {
    const products = await Product.find({});
    console.log(`[Search] Syncing ${products.length} products to Elasticsearch...`);
    const operations = products.flatMap(doc => [
      { index: { _index: 'products', _id: doc._id.toString() } },
      {
        title: doc.title,
        category: doc.category,
        store: doc.store,
        currentPrice: doc.currentPrice,
        discountPercent: doc.discountPercent,
        ratings: doc.ratings,
        image: doc.image,
        originalUrl: doc.originalUrl
      }
    ]);
    
    if (operations.length > 0) {
      const bulkResponse = await client.bulk({ refresh: true, operations });
      if (bulkResponse.errors) {
        console.error('[Search] Bulk index had errors');
      } else {
        console.log(`[Search] Synced ${products.length} products to Elasticsearch successfully.`);
      }
    }
  } catch (error) {
    console.error('[Search] Sync error:', error.message);
  }
}

// Search products (with ES / Mongo fallback, autocomplete + typo tolerance)
async function searchProducts({ query, category, store, sort, page = 1, limit = 12 }) {
  // Log query for search history
  if (query && query.trim()) {
    try {
      await SearchHistory.create({ query: query.trim() });
    } catch (e) {
      // ignore history logging errors
    }
  }

  if (useElastic && client) {
    try {
      const must = [];
      if (query) {
        must.push({
          match: {
            title: {
              query,
              fuzziness: 'AUTO',
              operator: 'or'
            }
          }
        });
      }
      
      const filter = [];
      if (category) filter.push({ term: { category } });
      if (store) filter.push({ term: { store } });

      let sortOption = [];
      if (sort === 'price_asc') {
        sortOption.push({ currentPrice: { order: 'asc' } });
      } else if (sort === 'price_desc') {
        sortOption.push({ currentPrice: { order: 'desc' } });
      } else if (sort === 'discount_desc') {
        sortOption.push({ discountPercent: { order: 'desc' } });
      } else if (sort === 'rating_desc') {
        sortOption.push({ ratings: { order: 'desc' } });
      }

      const body = {
        query: {
          bool: {
            must,
            filter
          }
        },
        sort: sortOption,
        from: (page - 1) * limit,
        size: limit
      };

      const response = await client.search({
        index: 'products',
        body
      });

      const hits = response.hits.hits;
      const products = hits.map(hit => ({
        _id: hit._id,
        ...hit._source
      }));

      return {
        products,
        total: response.hits.total.value,
        page,
        pages: Math.ceil(response.hits.total.value / limit)
      };
    } catch (error) {
      console.warn('[Search] Elasticsearch query failed. Falling back to MongoDB text search.', error.message);
    }
  }

  // MongoDB Fallback search
  const mongoQuery = {};
  if (query) {
    mongoQuery.$text = { $search: query };
  }
  if (category) mongoQuery.category = category;
  if (store) mongoQuery.store = store;

  let sortOption = {};
  if (sort === 'price_asc') {
    sortOption.currentPrice = 1;
  } else if (sort === 'price_desc') {
    sortOption.currentPrice = -1;
  } else if (sort === 'discount_desc') {
    sortOption.discountPercent = -1;
  } else if (sort === 'rating_desc') {
    sortOption.ratings = -1;
  } else if (query) {
    // sort by text score relevance
    sortOption.score = { $meta: 'textScore' };
  } else {
    sortOption.createdAt = -1;
  }

  const total = await Product.countDocuments(mongoQuery);
  const products = await Product.find(mongoQuery)
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    products,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
}

// Instant suggestions autocomplete list
async function getSuggestions(prefix) {
  if (!prefix || prefix.length < 2) return [];

  if (useElastic && client) {
    try {
      const response = await client.search({
        index: 'products',
        body: {
          query: {
            match: {
              title: {
                query: prefix,
                analyzer: 'standard'
              }
            }
          },
          size: 5
        }
      });
      return response.hits.hits.map(h => h._source.title);
    } catch (e) {
      // ignore and fallback
    }
  }

  // Mongo suggestions fallback
  const items = await Product.find({ title: new RegExp(prefix, 'i') }).limit(5);
  return items.map(item => item.title);
}

module.exports = {
  initIndexes,
  indexProduct,
  syncProductsToElastic,
  searchProducts,
  getSuggestions
};
