
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {config} from 'dotenv';

config(); // Load environment variables from .env file

export const ai = genkit({
    plugins: [
        googleAI({
            // The API key is automatically read from the GEMINI_API_KEY environment variable.
        }),
    ],
    enableTracing: true,
});

// Define multiple models for fallback strategies
export const geminiPro = googleAI.model('gemini-1.5-pro');
export const geminiFlash = googleAI.model('gemini-1.5-flash', {
  modelFallback: [geminiPro]
});
