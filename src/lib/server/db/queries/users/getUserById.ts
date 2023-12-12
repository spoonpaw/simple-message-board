import {pool} from "$lib/server";
import {error} from "@sveltejs/kit";

export async function getUserById(userId: string) {
	const client = await pool.connect();
	try {
		const res = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
		console.log('User profile data:', res.rows[0]); // Log the fetched data
		return res.rows[0];
	} catch (err) {
		console.error('Error fetching user profile:', err);
		throw error(500, 'Internal Server Error');
	} finally {
		client.release();
	}
}
