// src/lib/db/pool.ts
import { env } from '$env/dynamic/private'; // Import the env from SvelteKit's env module
import pkg from 'pg';
const { Pool } = pkg;


// Heroku provides DATABASE_URL, a complete connection string
// const connectionString = env.DATABASE_URL;

// export const pool = new Pool({
// 	connectionString: connectionString,
// 	ssl: {
// 		rejectUnauthorized: false // Required for Heroku
// 	}
// });

// this is the way to do it if you don't have a DATABASE_URL (local development)
// Create a new pool instance with your database connection details
export const pool = new Pool({
	user: env.DB_USER,
	host: env.DB_HOST,
	database: env.DB_NAME,
	password: env.DB_PASSWORD,
	port: parseInt(env.DB_PORT || '5432', 10)
});
