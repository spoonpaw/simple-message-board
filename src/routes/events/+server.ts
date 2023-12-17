// src/routes/events/+server.ts

export async function GET(): Promise<Response> {
	const headers = {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive',
	};

	const stream = new ReadableStream({
		start(controller) {
			const sendEvent = (data: string) => {
				controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
			};

			sendEvent('Connected to SSE');

			// Implement logic to handle sending events, disconnections, etc.
		},
		cancel() {
			// Handle cancellation of the stream if necessary
		}
	});

	return new Response(stream, { headers });
};
