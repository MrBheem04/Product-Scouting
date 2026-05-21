// MongoDB initialization script – runs once on first container start
// Creates the scoutprice database user with readWrite access

db = db.getSiblingDB('scoutprice');

db.createUser({
  user: 'scoutprice',
  pwd: 'scoutprice_secret',
  roles: [{ role: 'readWrite', db: 'scoutprice' }],
});

// Create initial indexes (the app also creates them via Mongoose, but this ensures they exist early)
db.products.createIndex({ store: 1, sku: 1 }, { unique: true, background: true });
db.products.createIndex({ title: 'text', category: 1 }, { background: true });
db.pricehistories.createIndex({ product: 1, timestamp: -1 }, { background: true });
db.alerts.createIndex({ user: 1, product: 1, active: 1 }, { background: true });

print('✅ ScoutPrice MongoDB initialized successfully');
