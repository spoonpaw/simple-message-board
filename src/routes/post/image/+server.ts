// src/routes/post/image/+server.ts

import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp'; // Import sharp
import { v4 as uuidv4 } from 'uuid';
import { env } from '$env/dynamic/private';
// import {validateUser} from '$lib/server/auth';

const s3Client = new S3Client({
	credentials: {
		accessKeyId: env.AWS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY
	},
	region: env.AWS_REGION
});

const maxFileSize = 5 * 1024 * 1024; // 5MB

export const POST: RequestHandler = async (requestEvent: RequestEvent) => {
	// const authenticatedUser = await validateUser(requestEvent);
	// if (!authenticatedUser) {
	// 	return new Response(JSON.stringify({error: 'Unauthorized'}), {
	// 		status: 401,
	// 		headers: {'Content-Type': 'application/json'}
	// 	});
	// }
	const request = requestEvent.request;

	const formData = await request.formData();
	const file = formData.get('file') as File; // Typecast to File

	// Ensure file is a File object and not a string
	if (!file || typeof file === 'string') {
		console.error('No file uploaded');
		return new Response(JSON.stringify({ error: 'No file uploaded' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Check if the file is an image
	if (!file.type.startsWith('image/')) {
		return new Response(JSON.stringify({ error: 'File is not an image' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Check if the file size exceeds the maximum limit
	if (file.size > maxFileSize) {
		return new Response(JSON.stringify({ error: 'Image is too large. Maximum size is 5MB.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	const fileExtension = file.name.split('.').pop();
	const fileName = `post-images/${uuidv4()}.${fileExtension}`;
	const fileUrl = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${fileName}`;

	try {
		// Process the image using sharp
		const buffer = await sharp(await file.arrayBuffer())
			.resize(2000, 2000, { fit: sharp.fit.inside, withoutEnlargement: true })
			.toBuffer();

		await s3Client.send(
			new PutObjectCommand({
				Bucket: env.S3_BUCKET_NAME,
				Key: fileName,
				Body: buffer,
				ContentType: file.type
			})
		);
		console.log('File uploaded successfully:', fileUrl);

		// Return only the URL of the uploaded image
		return new Response(JSON.stringify({ fileUrl }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Error processing or uploading image:', error);
		return new Response(JSON.stringify({ error: 'Error processing or uploading file' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
