// src/lib/db/pool.ts
import { Pool } from 'pg';
import { env } from '$env/dynamic/private'; // Import the env from SvelteKit's env module

// Create a new pool instance with your database connection details
export const pool = new Pool({
	user: env.DB_USER,
	host: env.DB_HOST,
	database: env.DB_NAME,
	password: env.DB_PASSWORD,
	port: parseInt(env.DB_PORT || '5432', 10)
});
