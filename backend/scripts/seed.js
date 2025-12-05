require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const users = [
    { name: 'Admin User', email: 'admin@google.com', password: 'Admin@123', role: 'admin' },
    { name: 'Regular User', email: 'user@google.com', password: 'User@123', role: 'user' },
  ];

  for (const u of users) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(u.password, salt);

    await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
      [u.name, u.email, hash, u.role]
    );
    console.log('seeded', u.email);
  }

  await client.end();
}
seed().catch(e => { console.error(e); process.exit(1); });