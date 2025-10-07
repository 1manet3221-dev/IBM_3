
// This is a more robust, web-standards-based implementation for Server-Sent Events.
// It avoids Node.js-specific 'stream' module for better compatibility with edge runtimes.

interface Connection {
  (data: string): void;
}

let connections: Connection[] = [];

// This function sends data to all connected clients.
export function broadcast(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  for (const connection of connections) {
    try {
        connection(message);
    } catch (err) {
        // Handle potential errors if a connection is closed, etc.
        console.error("Failed to send message to a client", err);
    }
  }
}

// This function subscribes a client to the SSE stream.
export function subscribe(req: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      const onData = (message: string) => {
        try {
            controller.enqueue(encoder.encode(message));
        } catch(e) {
            console.error('SSE Error:', e);
            controller.close();
        }
      };
      
      connections.push(onData);

      // Send a connection confirmation message immediately
      onData(`data: ${JSON.stringify({ type: 'connection', message: 'Connected to event stream.' })}\n\n`);

      req.signal.onabort = () => {
        connections = connections.filter((conn) => conn !== onData);
        console.log("Client disconnected, connection removed.");
        try {
            controller.close();
        } catch (e) {}
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no', // Important for some hosting environments like Vercel
    },
  });
}

// In the main AI analysis flow, we'll use broadcast instead of stream.write
// Example: broadcast({ type: 'analysisUpdate', data: result });
