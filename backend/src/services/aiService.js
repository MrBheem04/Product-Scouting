const OpenAI = require('openai');

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Generates buying insights and recommendations based on price metrics
 * @param {object} product - Mongoose Product doc
 * @param {array} priceHistory - List of historical price documents
 * @returns {Promise<object>} - AI Insights payload
 */
const getBuyingInsights = async (product, priceHistory) => {
  const currentPrice = product.currentPrice;
  const originalPrice = product.originalPrice;
  
  // Calculate price stats
  const prices = priceHistory.map((h) => h.price);
  const lowest = prices.length ? Math.min(...prices) : currentPrice;
  const highest = prices.length ? Math.max(...prices) : originalPrice;
  const average = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : currentPrice;
  
  // Generate predictive recommendation indicators
  let score = 50; // 0 (Don't Buy) to 100 (Instant Buy)
  let suggestion = 'Hold';
  let reasoning = '';
  
  if (currentPrice <= lowest * 1.05) {
    score = 95;
    suggestion = 'Buy Now';
    reasoning = 'The product is at or within 5% of its historical lowest price. This is an exceptional deal!';
  } else if (currentPrice >= highest * 0.95) {
    score = 15;
    suggestion = 'Strong Skip';
    reasoning = 'The product is currently listed near its historical highest price. We suggest holding for a discount.';
  } else if (currentPrice < average) {
    score = 75;
    suggestion = 'Good Deal';
    reasoning = 'The current price is below the historical average. It is a solid time to purchase if you need it immediately.';
  } else {
    score = 45;
    suggestion = 'Hold / Wait';
    reasoning = 'The price is currently sitting above the historical average. Consider setting a price alert at 10% lower.';
  }
  
  const mockAIResponse = {
    buyScore: score,
    recommendation: suggestion,
    lowestPrice: lowest,
    highestPrice: highest,
    averagePrice: average,
    smartInsight: reasoning,
    valueForMoneyRating: parseFloat(((product.ratings || 4.2) * (score / 100) + 1).toFixed(1)),
    bestTimeToBuyPrediction: score > 70 ? 'Within next 24-48 hours' : 'Mid-week sales or upcoming festival promotions',
    alternatives: [
      {
        title: `Visually Similar LookAlike Alternative Pro (15% Cheaper)`,
        price: Math.round(currentPrice * 0.85),
        store: product.store === 'amazon' ? 'flipkart' : 'amazon',
        rating: 4.4,
        savings: Math.round(currentPrice * 0.15)
      },
      {
        title: `Budget Choice Essential Variant`,
        price: Math.round(currentPrice * 0.65),
        store: 'meesho',
        rating: 4.0,
        savings: Math.round(currentPrice * 0.35)
      }
    ]
  };

  if (!openai) {
    console.log('[AI Service] OpenAI Key not provided. Returning local expert rules engine insights.');
    return mockAIResponse;
  }
  
  try {
    const prompt = `Analyze this product for an ecommerce price tracking app:
Title: ${product.title}
Store: ${product.store}
Current Price: INR ${currentPrice}
Original Price: INR ${originalPrice}
Historical Lowest: INR ${lowest}
Historical Highest: INR ${highest}
Historical Average: INR ${average}
Ratings: ${product.ratings}/5 based on ${product.ratingsCount} reviews.

Provide:
1. A value-for-money buy score out of 100.
2. A single buying recommendation choice (Buy Now, Good Deal, Hold / Wait, Strong Skip).
3. A short explanation reasoning of why the user should buy/skip right now based on stats.
4. Smart buying timing predictions.

Format your response as a strict JSON with the following keys:
{
  "buyScore": number,
  "recommendation": string,
  "smartInsight": string,
  "bestTimeToBuyPrediction": string
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });
    
    const res = JSON.parse(completion.choices[0].message.content);
    return {
      ...mockAIResponse,
      buyScore: res.buyScore || score,
      recommendation: res.recommendation || suggestion,
      smartInsight: res.smartInsight || reasoning,
      bestTimeToBuyPrediction: res.bestTimeToBuyPrediction || mockAIResponse.bestTimeToBuyPrediction
    };
  } catch (err) {
    console.warn(`[AI Service] OpenAI request failed: ${err.message}. Defaulting to expert rules.`);
    return mockAIResponse;
  }
};

/**
 * Dynamic Chatbot Conversation Responder
 */
const getChatResponse = async (userMessage, productContext) => {
  const defaultText = `Hi! I am your ScoutPrice AI Assistant. 
Based on ${productContext ? productContext.title : 'our catalog'}, here is my insight:
Currently, prices are highly volatile. I recommend setting a Price Alert to be notified immediately when a drop occurs. 
I can also look for visually similar items or coupons that can save you an additional 10-15% today!`;

  if (!openai) {
    return {
      reply: defaultText + ` (Powered by ScoutPrice Local Assistant)`
    };
  }
  
  try {
    const prompt = `You are a helpful, professional, and friendly shopping assistant called "ScoutPrice Assistant".
The user says: "${userMessage}".
Current product being viewed context (if any): ${productContext ? JSON.stringify(productContext) : 'None'}.
Reply as an expert shopping assistant, telling the user if the item is worth it, recommending stores or strategies, and keeping it concise (under 3 sentences).`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    });
    
    return {
      reply: completion.choices[0].message.content.trim()
    };
  } catch (err) {
    return {
      reply: defaultText
    };
  }
};

module.exports = {
  getBuyingInsights,
  getChatResponse
};
