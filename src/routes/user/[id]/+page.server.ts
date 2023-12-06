// src/routes/user/[id]/+page.server.ts

import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { validateUser } from '$lib/server/auth';
import { pool } from '$lib/server';

async function fetchUserProfile(userId: string) {
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

export async function load(requestEvent: RequestEvent) {
	const { id } = requestEvent.params;
	if (!id) {
		console.error('User ID is undefined');
		throw error(404, 'User ID is required');
	}

	// Attempt to authenticate the user but do not redirect if not authenticated
	const authenticatedUser = await validateUser(requestEvent);

	const userProfile = await fetchUserProfile(id);
	if (!userProfile) {
		console.error('No user profile found for user ID:', id);
		throw error(404, 'User profile not found');
	}

	// Check if the authenticated user is viewing their own profile
	const isOwnProfile = authenticatedUser && authenticatedUser.id === id;

	return {
		userProfile: {
			username: userProfile.username,
			email: userProfile.email,
			profileImageUrl: userProfile.profile_image_url,
			bio: userProfile.bio,
			createdAt: userProfile.created_at,
			lastLogin: userProfile.last_login,
			isOwnProfile
			// other user details...
		},
		isAuthenticated: !!authenticatedUser,
		authenticatedUserId: authenticatedUser ? authenticatedUser.id : null,
		authenticatedUsername: authenticatedUser ? authenticatedUser.username : 'Anonymous'
	};
}
