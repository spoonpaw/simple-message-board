// src/lib/server/sse/userMailPageConnections.ts

type SendEventFunction = (message: string) => void;

/**
 * A store to keep track of active user connections for the mail page events channel.
 */
export class UserMailPageConnections {
	private static instance: UserMailPageConnections;
	private connections: Map<string, SendEventFunction>;

	private constructor() {
		this.connections = new Map();
	}

	public static getInstance(): UserMailPageConnections {
		if (!UserMailPageConnections.instance) {
			UserMailPageConnections.instance = new UserMailPageConnections();
		}
		return UserMailPageConnections.instance;
	}

	public addConnection(userId: string, sendEvent: SendEventFunction): void {
		this.connections.set(userId, sendEvent);
		console.log(`[UserMailPageConnections] Added connection for user ${userId}`);
	}

	public removeConnection(userId: string): void {
		this.connections.delete(userId);
		console.log(`[UserMailPageConnections] Removed connection for user ${userId}`);
	}

	public getSendEvent(userId: string): SendEventFunction | undefined {
		return this.connections.get(userId);
	}
}
