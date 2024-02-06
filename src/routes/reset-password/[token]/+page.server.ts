// src/routes/reset-password/[token]/+page.server.ts

import {error} from '@sveltejs/kit';
import type {RequestEvent} from '@sveltejs/kit';
import {pool} from '$lib/server';

export async function load(requestEvent: RequestEvent) {
    const {params} = requestEvent;
    const {token} = params;

    // Validate the token to ensure it's neither null nor an empty string
    if (!token || token.trim() === '') {
        throw error(404, 'Invalid or expired token');
    }

    const client = await pool.connect();

    try {
        // Check if the token exists, is valid, and is not expired
        const userResult = await client.query(
            'SELECT id FROM users WHERE reset_token = $1 AND reset_token IS NOT NULL AND reset_token_expiry > NOW()',
            [token]
        );

        if (userResult.rowCount === 0) {
            throw error(404, 'Invalid or expired token');
        }

        return {success: true, token: token};

    } catch (err) {
        // Since error handling is already provided, there's no need to modify this part
        throw error(500, 'Server error while processing password reset request');
    } finally {
        // Ensure the database client is always released
        client.release();
    }
}
