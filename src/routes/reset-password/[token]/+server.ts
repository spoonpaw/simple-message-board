// src/routes/reset-password/[token]/+server.ts
import {json} from '@sveltejs/kit';
import type {RequestEvent} from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import {pool} from '$lib/server';

export async function POST(requestEvent: RequestEvent) {
    const {params, request} = requestEvent;
    const {token} = params;
    if (!token || token.trim() === '') {
        // Immediately return an error response if token is invalid
        return json({error: 'Invalid or expired token'}, {status: 400});
    }

    const {newPassword} = await request.json();

    // Validate newPassword to ensure it meets your criteria (e.g., minimum length)
    if (!newPassword || newPassword.length < 8 || newPassword.length > 64) {
        return json({error: 'Password must be between 8 and 64 characters.'}, {status: 400});
    }

    const client = await pool.connect();
    try {
        // Verify the token is valid, not expired, and not an empty string
        const tokenVerification = await client.query(
            'SELECT id FROM users WHERE reset_token = $1 AND reset_token IS NOT NULL AND reset_token_expiry > NOW()',
            [token]
        );

        if (tokenVerification.rowCount === 0) {
            client.release();
            return json({error: 'Invalid or expired token'}, {status: 400});
        }

        const userId = tokenVerification.rows[0].id;

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password and clear the reset token
        await client.query(
            'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
            [hashedPassword, userId]
        );

        client.release();
        return json({message: 'Password successfully reset'}, {status: 200});

    } catch (err) {
        console.error('Error in reset password request:', err);
        client.release();
        return json({error: 'An error occurred while resetting the password'}, {status: 500});
    }
}
