
import { NextResponse } from 'next/server';
import { broadcast } from '@/lib/events';

export const runtime = 'edge';

// This is the primary endpoint for receiving sensor data from external devices.
export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get('x-api-key');
    // NOTE: This now uses the ThingSpeak Read API Key for consistency, but could be a separate key.
    if (apiKey !== process.env.THINGSPEAK_READ_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // The expected data structure from a sensor device
    const { heartRate, respiratoryRate, temperature, spo2 } = body;

    // Basic validation
    if (heartRate === undefined || respiratoryRate === undefined || temperature === undefined || spo2 === undefined) {
      return NextResponse.json({ error: 'Missing required sensor data fields' }, { status: 400 });
    }
    
    const sensorData = {
        type: 'sensorData',
        payload: {
            timestamp: Date.now(),
            heartRate,
            respiratoryRate,
            temperature,
            spo2
        }
    };

    // Broadcast the validated data to all connected clients
    broadcast(sensorData);

    return NextResponse.json({ message: 'Data received successfully' });
  } catch (error) {
    console.error('Error in /api/ingest:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
