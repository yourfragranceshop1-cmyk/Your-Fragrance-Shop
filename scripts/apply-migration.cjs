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

async function applyMigration() {
  const client = new Client(connConfig);
  try {
    await client.connect();
    console.log("Connected to Supabase!");

    const migrationFile = path.join(__dirname, '..', 'supabase', 'migrations', '20260518103000_add_image_urls.sql');
    console.log(`Reading migration: ${migrationFile}`);
    const sql = fs.readFileSync(migrationFile, 'utf8');

    console.log("Executing migration SQL...");
    await client.query(sql);
    console.log("Migration executed successfully!");
  } catch (err) {
    console.error("Error during migration:", err.message);
    console.error(err);
  } finally {
    await client.end();
  }
}

applyMigration();
