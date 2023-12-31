import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { PageServerData } from './$types';
import { validateUser } from '$lib/server/auth';
import {getPermissionsByUserId} from "$lib/server/db/queries/permissions/getPermissionsByUserId"; // Import the validateUser function

export async function load(requestEvent: RequestEvent): Promise<PageServerData> {
	try {
		const authenticatedUser = await validateUser(requestEvent);

		if (!authenticatedUser) {
			// User is not authenticated
			// If you want to redirect, use: throw redirect(302, '/login');
			// If you want to allow anonymous access, return an empty object or any default data
			return {};
		}

		const permissions = await getPermissionsByUserId(authenticatedUser.id);

		// User is authenticated, return their username
		return {
			username: authenticatedUser.username,
			userid: authenticatedUser.id,
			permissions: permissions
		};
	} catch (err) {
		console.error('Error during user validation:', err);
		throw error(500, 'Internal Server Error');
	}
}
