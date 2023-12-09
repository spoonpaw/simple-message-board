// src/routes/user/avatar/+server.ts

import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp'; // Import sharp
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

const maxFileSize = 500 * 1024; // 500KB
const maxDimension = 256; // 256x256 pixels

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
	const file = formData.get('file') as File;

	if (!file || typeof file === 'string') {
		return new Response(JSON.stringify({ error: 'No file uploaded' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	if (!['image/jpeg', 'image/png'].includes(file.type)) {
		return new Response(JSON.stringify({ error: 'Invalid file type' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	if (file.size > maxFileSize) {
		return new Response(JSON.stringify({ error: 'File is too large' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const fileExtension = file.name.split('.').pop();
	const fileName = `avatars/${uuidv4()}.${fileExtension}`;
	const fileUrl = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${fileName}`;

	try {
		const buffer = await sharp(await file.arrayBuffer())
			.resize(maxDimension, maxDimension, { fit: sharp.fit.inside, withoutEnlargement: true })
			.toFormat(file.type === 'image/png' ? 'png' : 'jpeg')
			.toBuffer();

		await s3Client.send(
			new PutObjectCommand({
				Bucket: env.S3_BUCKET_NAME,
				Key: fileName,
				Body: buffer,
				ContentType: file.type
			})
		);

		const client = await pool.connect();
		try {
			await client.query('UPDATE users SET profile_image_url = $1 WHERE id = $2', [
				fileUrl,
				userId
			]);
		} finally {
			client.release();
		}

		return new Response(JSON.stringify({ message: 'File uploaded successfully', fileUrl }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Error processing or uploading image:', error);
		return new Response(JSON.stringify({ error: 'Error uploading file' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
