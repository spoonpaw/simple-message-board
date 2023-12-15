// src/lib/server/email/sendEmail.ts

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { env } from '$env/dynamic/private'; // Adjust this import according to your project structure

// Create an SES client
const sesClient = new SESClient({
	region: env.AWS_REGION,
	credentials: {
		accessKeyId: env.AWS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY
	}
});

type EmailOptions = {
	from: string;
	to: string;
	subject: string;
	text: string;
	html?: string;
};

export async function sendEmail(options: EmailOptions): Promise<void> {
	try {
		const { from, to, subject, text, html } = options;

		const params = {
			Destination: {
				ToAddresses: [to],
			},
			Message: {
				Body: {
					Html: {
						Charset: "UTF-8",
						Data: html || text, // Use HTML content if available
					},
					Text: {
						Charset: "UTF-8",
						Data: text,
					},
				},
				Subject: {
					Charset: 'UTF-8',
					Data: subject,
				},
			},
			Source: from,
		};

		const command = new SendEmailCommand(params);

		await sesClient.send(command);
		console.log(`Email sent successfully to ${to}`);
	} catch (error) {
		console.error('Error sending email:', error);
		throw error; // Re-throw the error for the caller to handle
	}
}
