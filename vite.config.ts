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

		const mailPageClientUserMap = new BiMap<string>(); // Maps socket ID to Postgres user ID
		const mailButtonComponentUserMap = new BiMap<string>();

		io.on('connection', socket => {
			console.log(`Socket.IO Client Connected - Socket ID: ${socket.id}`);

			socket.on('register-mail-page', ({userId}) => {
				mailPageClientUserMap.set(socket.id, userId);
				console.log(`Registered Postgres User ID ${userId} for Socket ID ${socket.id}`);
				console.log('Current Mail Page Client-User Map:', mailPageClientUserMap.entries());
			});

			socket.on('register-mail-button', ({userId}) => {
				mailButtonComponentUserMap.set(socket.id, userId);
				// ... logging
			});

			socket.on('deregister-mail-page', () => {
				if (mailPageClientUserMap.has(socket.id)) {
					console.log(`Deregistering User ID ${mailPageClientUserMap.get(socket.id)} from Mail Page - Socket ID: ${socket.id}`);
					mailPageClientUserMap.delete(socket.id);
					console.log('Updated Mail Page Client-User Map:', mailPageClientUserMap.entries());
				} else {
					console.log(`No registration found for Socket ID: ${socket.id} on Mail Page`);
				}
			});

			socket.on('deregister-mail-button', () => {
				mailButtonComponentUserMap.delete(socket.id);
				// ... logging
			});

			socket.on('message-sent', ({recipientUserId}) => {
				console.log(`Message sent event received. Recipient User ID: ${recipientUserId}`);
				const recipientSocketId = mailPageClientUserMap.getKey(recipientUserId);
				if (recipientSocketId) {
					console.log(`Recipient is connected. Emitting 'message-received' to Socket ID: ${recipientSocketId}`);
					io.to(recipientSocketId).emit('mail-page-message-received');
				} else {
					console.log(`Recipient User ID ${recipientUserId} is not currently connected.`);
				}

				// Notify mail button component if the recipient has it loaded
				const recipientMailButtonSocketId = mailButtonComponentUserMap.getKey(recipientUserId);
				if (recipientMailButtonSocketId) {
					io.to(recipientMailButtonSocketId).emit('mail-button-message-received');
				}

			});

			socket.on('disconnect', () => {
				if (mailPageClientUserMap.has(socket.id)) {
					console.log(`Socket.IO Client Disconnected - Socket ID: ${socket.id}. Removing from Mail Page Client-User Map.`);
					mailPageClientUserMap.delete(socket.id);
				} else {
					console.log(`Socket.IO Client Disconnected - Socket ID: ${socket.id}. Not registered for Mail Page.`);
				}
				console.log('Updated Mail Page Client-User Map:', mailPageClientUserMap.entries());
			});
		});
	}
};

export default defineConfig({
	plugins: [sveltekit(), webSocketServer]
});
