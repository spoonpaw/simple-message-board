// src/routes/user/[id]/$types.d.ts

// Represents the data of the user profile being viewed
export interface UserProfile {
	username: string;
	email: string;
	profileImageUrl: string;
	// Include other properties specific to the user profile as needed
}

// Represents the overall data structure for the page, including the profile and the accessing user's authentication status
export interface PageData {
	userProfile: UserProfile;
	isAuthenticated: boolean; // Indicates if the accessing user is authenticated
	authenticatedUserId: string | null; // The ID of the authenticated user, if any
	authenticatedUsername: string; // The username of the authenticated user, if any
}
