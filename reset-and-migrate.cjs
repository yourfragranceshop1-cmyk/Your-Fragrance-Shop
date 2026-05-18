const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connConfig = {
  host: "aws-0-eu-west-1.pooler.supabase.com",
  port: 6543,
  user: "postgres.toyeucajztslfnufwfty",
  password: "Supabase@090608",
  database: "postgres",
  ssl: {
    rejectUnauthorized: false
  }
};

async function resetAndMigrate() {
  const client = new Client(connConfig);
  try {
    await client.connect();
    console.log("Connected to Supabase!");

    console.log("Cleaning up old marketplace tables and types...");
    const cleanupQuery = `
      DROP TABLE IF EXISTS 
        "products", 
        "orders", 
        "order_items", 
        "wishlist_items", 
        "messages", 
        "users", 
        "cart_items", 
        "favorites", 
        "user_roles" 
      CASCADE;
      
      DROP TYPE IF EXISTS 
        "role_enum", 
        "app_role", 
        "product_category" 
      CASCADE;
    `;
    await client.query(cleanupQuery);
    console.log("Cleanup successful!");

    // Run migrations
    const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (!file.endsWith('.sql')) continue;
      console.log(`\n--------------------------------------------`);
      console.log(`Running migration: ${file}`);
      console.log(`--------------------------------------------`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      await client.query(sql);
      console.log(`Successfully completed migration: ${file}`);
    }

    console.log("\n🎉 Database fully reset and migrated for Your Fragrance Shop!");
  } catch (err) {
    console.error("Error during reset/migration:", err.message);
    console.error(err);
  } finally {
    await client.end();
  }
}

resetAndMigrate();
