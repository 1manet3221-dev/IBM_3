
'use server';
/**
 * @fileOverview A service to interact with the simulated blockchain.
 *
 * This file provides an interface to a simple, in-memory blockchain.
 * It is designed to be a singleton that persists across different AI flows.
 *
 * - addBlock - Adds a new block to the chain.
 * - getChain - Retrieves the entire blockchain.
 * - getBlocksByUserId - Retrieves all blocks for a specific user.
 * - getBlocksByCondition - Retrieves all blocks for a specific condition.
 * - isChainValid - Verifies the integrity of the blockchain.
 */

import { Blockchain } from '@/lib/blockchain';
import { z } from 'zod';

// Define a more detailed structure for health logs, as requested.
const HealthLogSchema = z.object({
  userID: z.string(),
  condition: z.string().describe("The primary emotional or physical state, e.g., 'High Stress'"),
  anomalyType: z.string().describe("The broader category of the event, e.g., 'Warning', 'Critical'"),
  confidence: z.number(),
  heartRate: z.number(),
  temperature: z.number(),
  respiratoryRate: z.number(),
  spo2: z.number(),
});
export type HealthLog = z.infer<typeof HealthLogSchema>;


// Initialize a single, persistent instance of the Blockchain
const blockchain = new Blockchain();


// Export functions that ensure flows are initialized before calling them.
export const addBlock = async (data: HealthLog) => {
    blockchain.addBlock(data);
    const latestBlock = blockchain.getLatestBlock();
    // Return a plain object instead of a class instance
    return { ...latestBlock, data: { ...latestBlock.data } };
};

export const getChain = async () => {
    // Convert each block instance to a plain object
    return blockchain.getChain().map(block => ({ ...block, data: { ...block.data } }));
};

export const getBlocksByUserId = async (userId: string) => {
    return blockchain.getBlocksByUserId(userId).map(block => ({ ...block, data: { ...block.data } }));
};

export const getBlocksByCondition = async (condition: string) => {
    return blockchain.getBlocksByCondition(condition).map(block => ({ ...block, data: { ...block.data } }));
};

export const isChainValid = async () => {
    return blockchain.isChainValid();
};
