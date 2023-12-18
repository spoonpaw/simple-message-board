// src/lib/server/sse/userMailButtonConnections.ts

type SendEventFunction = (message: string) => void;

/**
 * A store to keep track of active user connections for the mail button events channel.
 */
export class UserMailButtonConnections {
	private static instance: UserMailButtonConnections;
	private connections: Map<string, SendEventFunction>;

	private constructor() {
		this.connections = new Map();
	}

	public static getInstance(): UserMailButtonConnections {
		if (!UserMailButtonConnections.instance) {
			UserMailButtonConnections.instance = new UserMailButtonConnections();
		}
		return UserMailButtonConnections.instance;
	}

	public addConnection(userId: string, sendEvent: SendEventFunction): void {
		this.connections.set(userId, sendEvent);
		console.log(`[UserMailButtonConnections] Added connection for user ${userId}`);
		console.log(`[UserMailButtonConnections] Current connections: ${JSON.stringify(Array.from(this.connections.keys()))}`);
	}

	public removeConnection(userId: string): void {
		this.connections.delete(userId);
		console.log(`[UserMailButtonConnections] Removed connection for user ${userId}`);
		console.log(`[UserMailButtonConnections] Current connections: ${JSON.stringify(Array.from(this.connections.keys()))}`);
	}

	public getSendEvent(userId: string): SendEventFunction | undefined {
		return this.connections.get(userId);
	}
}
