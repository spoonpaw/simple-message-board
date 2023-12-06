// src/routes/user/avatar/+server.ts

import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { env } from '$env/dynamic/private';
import { pool } from '$lib/server';
import { validateUser } from '$lib/server/auth';

// Ensure that all required environment variables are available
const awsAccessKeyId = env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = env.AWS_SECRET_ACCESS_KEY;
const awsRegion = env.AWS_REGION;

if (!awsAccessKeyId || !awsSecretAccessKey || !awsRegion) {
	throw new Error('AWS credentials and region must be defined');
}

// Initialize the S3 Client with AWS credentials and region
const s3Client = new S3Client({
	credentials: {
		accessKeyId: awsAccessKeyId,
		secretAccessKey: awsSecretAccessKey
	},
	region: awsRegion
});

export const POST: RequestHandler = async (requestEvent: RequestEvent) => {
	const authenticatedUser = await validateUser(requestEvent);
	if (!authenticatedUser) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	const userId = authenticatedUser.id;

	// Extract the request object from the RequestEvent
	const request = requestEvent.request;

	const formData = await request.formData();
	const file = formData.get('file');

	if (!file || typeof file === 'string') {
		return new Response(JSON.stringify({ error: 'No file uploaded' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Generate a UUID for the file name and retain the original file extension
	const fileExtension = file.name.split('.').pop();
	const fileName = `avatars/${uuidv4()}.${fileExtension}`;

	// Construct the URL for the uploaded file
	const fileUrl = `https://${env.S3_BUCKET_NAME}.s3.${awsRegion}.amazonaws.com/${fileName}`;

	try {
		// Convert the ReadableStream to a Buffer
		const arrayBuffer = await new Response(file.stream()).arrayBuffer();
		const buffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Buffer

		const command = new PutObjectCommand({
			Bucket: env.S3_BUCKET_NAME,
			Key: fileName,
			Body: buffer, // Now using Node's Buffer
			ContentType: file.type
		});

		await s3Client.send(command);

		// Log the URL and return it in the response
		console.log('Uploaded file URL:', fileUrl);

		// Update the user's profile_image_url in the database
		const client = await pool.connect();
		try {
			await client.query('UPDATE users SET profile_image_url = $1 WHERE id = $2', [
				fileUrl,
				userId
			]);
		} finally {
			client.release();
		}

		// Return the new profile image URL
		return new Response(JSON.stringify({ message: 'File uploaded successfully', fileUrl }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Error uploading to S3:', error);
		return new Response(JSON.stringify({ error: 'Error uploading file' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
