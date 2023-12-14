// src/lib/db/pool.ts
import { env } from '$env/dynamic/private'; // Import the env from SvelteKit's env module
import pkg from 'pg';
const { Pool } = pkg;


// Heroku provides DATABASE_URL, a complete connection string
const connectionString = env.DATABASE_URL;

export const pool = new Pool({
	connectionString: connectionString,
	ssl: {
		rejectUnauthorized: false // Required for Heroku
	}
});
