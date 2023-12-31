// src/routes/user/[id]/$types.d.ts

// Represents the data of the user profile being viewed
import type {Role} from "$lib/shared";

export interface UserProfile {
	username: string;
	email: string;
	profileImageUrl: string;
	isOwnProfile: boolean; // Indicates if the authenticated user is viewing their own profile
	bio: string;
	createdAt: string;
	lastLogin: string;
	hierarchyLevel: number | null;
	id: string;
	banned: boolean;
	role: Role | null;
	postCount: number;
	// Include other properties specific to the user profile as needed
}

// Represents the overall data structure for the page, including the profile and the accessing user's authentication status
export interface PageData {
	userProfile: UserProfile;
	isAuthenticated: boolean; // Indicates if the accessing user is authenticated
	authenticatedUserId: string | null; // The ID of the authenticated user, if any
	authenticatedUsername: string; // The username of the authenticated user, if any
	authenticatedUserHierarchyLevel: number | null; // The hierarchy level of the authenticated user, if any
	permissions: Permission[];
	roles: Role[];
	hasUnreadMessages: boolean;
}
