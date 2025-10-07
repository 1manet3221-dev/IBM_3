
'use server';

import { marked } from 'marked';
import { weeklyDigest } from '@/ai/flows/digest-flow';
import { isChainValid as verifyBlockchain } from '@/ai/services/blockchainService';
import { BlockchainRecord } from '@/components/dashboard/blockchain-records-card';


/**
 * A server action that generates a weekly health digest.
 * It receives blockchain records from the client and uses a Genkit flow to generate a summary.
 */
export async function generateDigest(records: BlockchainRecord[]): Promise<string> {
    try {
        const result = await weeklyDigest(records);
        return marked.parse(result.markdownReport);

    } catch (error) {
        console.error("Error generating report:", error);
        const errorMessage = `
## Error Generating Report

There was an issue creating your weekly health summary. The AI model may be unavailable or there was an error processing your data. Please try again later.
        `;
        return marked.parse(errorMessage);
    }
}

/**
 * A server action that verifies the integrity of the blockchain.
 */
export async function verifyChain(): Promise<boolean> {
    try {
        // Add a slight delay to simulate a real verification process
        await new Promise(resolve => setTimeout(resolve, 750));
        return await verifyBlockchain();
    } catch (error) {
        console.error("Error verifying chain:", error);
        return false;
    }
}
