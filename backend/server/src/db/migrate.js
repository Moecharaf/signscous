import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import pool from '../lib/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaSql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

export async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(schemaSql);

    // Seed admin user if not present.
    const { rows } = await client.query(
      "SELECT id FROM users WHERE email = 'admin@signscous.com'"
    );
    if (rows.length === 0) {
      const hash = await bcrypt.hash('admin123', 12);
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)`,
        ['admin-1', 'Signscous Admin', 'admin@signscous.com', hash, 'admin']
      );
      console.log('[migrate] Admin user seeded.');
    }

    await client.query('COMMIT');
    console.log('[migrate] Schema ready.');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
