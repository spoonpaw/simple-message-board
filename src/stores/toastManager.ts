// src/stores/toastManager.ts

import { writable } from 'svelte/store';

export interface Toast {
	id: number;
	message: string;
	type: 'success' | 'error' | 'info';
	duration?: number;
}

function createToastManager() {
	const { subscribe, update } = writable<Toast[]>([]);

	return {
		subscribe,
		addToast: (toast: Omit<Toast, 'id'>) => {
			update(toasts => {
				const id = toasts.length > 0 ? Math.max(...toasts.map(t => t.id)) + 1 : 1;
				return [...toasts, { ...toast, id }];
			});
		},
		removeToast: (id: number) => {
			update(toasts => toasts.filter(t => t.id !== id));
		}
	};
}

export const toastManager = createToastManager();
