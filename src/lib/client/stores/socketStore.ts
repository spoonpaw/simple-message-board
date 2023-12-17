// src/lib/stores/socketStore.ts
import { writable } from 'svelte/store';
import type { Socket } from 'socket.io-client';

export const socketStore = writable<Socket | null>(null);
