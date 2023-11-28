// src/routes/board/$types.d.ts

export interface PageServerData {
	username: string;
	categories: Category[]; // Add this line to include categories
	// ... any other properties you expect to pass to your page component
}

// Define the Category interface
export interface Category {
	id: string;
	title: string;
	description: string;
	created_at: Date;
	// Add any other properties if needed
}
