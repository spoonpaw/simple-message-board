// src/routes/logout/+server.ts

import cookie from 'cookie';
import { dev } from '$app/environment';

export const GET = async () => {
	// Clear the httpOnly cookie by overwriting it with an expired one
	const headers = {
		'Set-Cookie': cookie.serialize('token', '', {
			path: '/',
			expires: new Date(0), // Set it to a past date to expire the cookie
			httpOnly: true,
			sameSite: 'strict',
			secure: !dev // Use secure cookies in production
		})
	};

	// Return a Response with headers to clear the cookie
	return new Response(null, {
		status: 200, // OK status, as we're just clearing the cookie without redirecting
		headers
	});
};
