// vite.config.ts

import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';
import type {Plugin, ViteDevServer} from 'vite';
import type {Server as HttpServer} from 'http';
import {Server as IOServer} from 'socket.io';
import BiMap from 'bidirectional-map';

const webSocketServer: Plugin = {
	name: 'webSocketServer',
	configureServer: (server: ViteDevServer) => {
		if (!server.httpServer) return;
		const httpServer = server.httpServer as HttpServer;
		const io = new IOServer(httpServer);


		const clientUserMap = new BiMap<string>(); // Maps socket ID to Postgres user ID


		io.on('connection', socket => {
			console.log(`Socket.IO Client Connected - Socket ID: ${socket.id}`);

			socket.on('register', ({userId}) => {
				clientUserMap.set(socket.id, userId);
				console.log(`Registered Postgres User ID ${userId} for Socket ID ${socket.id}`);
				// Log the entire map for debugging
				console.log('Current Client-User Map:', clientUserMap.entries());
			});

			socket.on('message-sent', ({ recipientUserId }) => {
				console.log(`Message sent event received. Recipient User ID: ${recipientUserId}`);

				const recipientSocketId = clientUserMap.getKey(recipientUserId);
				if (recipientSocketId) {
					console.log(`Recipient is connected. Emitting 'message-received' to Socket ID: ${recipientSocketId}`);
					io.to(recipientSocketId).emit('message-received');
				} else {
					console.log(`Recipient User ID ${recipientUserId} is not currently connected.`);
				}
			});

			socket.on('disconnect', () => {
				console.log(`Socket.IO Client Disconnected - Socket ID: ${socket.id}`);
				clientUserMap.delete(socket.id);
				// Log the entire map for debugging
				console.log('Current Client-User Map:', clientUserMap.entries());
			});

			// ... additional logic ...
		});
	}
};

export default defineConfig({
	plugins: [sveltekit(), webSocketServer]
});
