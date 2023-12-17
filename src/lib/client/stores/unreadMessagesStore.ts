// src/lib/client/stores/unreadMessagesStore.ts
import { writable } from 'svelte/store';

export const unreadMessagesStore = writable(false);
