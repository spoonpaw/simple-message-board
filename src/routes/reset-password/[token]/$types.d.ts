// src/routes/reset-password/[token]/$types.d.ts

export interface PageServerData {
	success?: boolean;
	error?: string;
	token?: string;  // Add the token to the interface
}
