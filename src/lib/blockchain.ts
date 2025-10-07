
/**
 * @fileoverview A simple blockchain implementation with indexing.
 */
import { createHash } from 'crypto';

// The new, more detailed data structure for health logs.
export interface HealthLog {
    userID: string;
    condition: string;
    anomalyType: string;
    confidence: number;
    heartRate: number;
    temperature: number;
    respiratoryRate: number;
    spo2: number;
    timestamp?: number; // Optional because it's added during block creation
    [key: string]: any;
}


export class Block {
    public index: number;
    public timestamp: number;
    public data: HealthLog;
    public previousHash: string;
    public hash: string;

    constructor(index: number, timestamp: number, data: HealthLog, previousHash: string = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = { ...data, timestamp }; // Ensure block data has timestamp
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash(): string {
        const hash = createHash('sha256');
        hash.update(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data));
        return hash.digest('hex');
    }
}

export class Blockchain {
    private chain: Block[] = [];
    // Indexes for fast queries
    private userIndex: Map<string, Block[]> = new Map();
    private conditionIndex: Map<string, Block[]> = new Map();

    constructor() {
        // Add genesis block first synchronously
        const genesisBlock = this.createGenesisBlock();
        this.chain.push(genesisBlock);
        this.indexBlock(genesisBlock);
        
        // Then add initial historical data.
        this.addInitialData();
    }

    private indexBlock(block: Block): void {
        if (!block || !block.data) return;
        
        // Index by user ID
        const userBlocks = this.userIndex.get(block.data.userID) || [];
        userBlocks.push(block);
        this.userIndex.set(block.data.userID, userBlocks);

        // Index by condition
        const conditionBlocks = this.conditionIndex.get(block.data.condition) || [];
        conditionBlocks.push(block);
        this.conditionIndex.set(block.data.condition, conditionBlocks);
    }
    
    private addInitialData(): void {
        const now = Date.now();
        const initialEvents: HealthLog[] = [
             {
                condition: 'High Stress',
                confidence: 0.88,
                heartRate: 88,
                respiratoryRate: 22,
                temperature: 37.5,
                spo2: 96.5,
                userID: 'U12345',
                anomalyType: 'Warning',
                timestamp: now - (10 * 60 * 60 * 1000) // 10 hours ago
            },
            {
                condition: 'Anxiety Spike',
                confidence: 0.94,
                heartRate: 89,
                respiratoryRate: 26,
                temperature: 37.8,
                spo2: 94.2,
                userID: 'U12345',
                anomalyType: 'Critical',
                timestamp: now - (8 * 60 * 60 * 1000) // 8 hours ago
            },
            {
                condition: 'Fatigue',
                confidence: 0.82,
                heartRate: 54,
                respiratoryRate: 12,
                temperature: 36.3,
                spo2: 95.1,
                userID: 'U12345',
                anomalyType: 'Warning',
                timestamp: now - (6 * 60 * 60 * 1000) // 6 hours ago
            },
            {
                condition: 'High Temp',
                confidence: 0.91,
                heartRate: 85,
                respiratoryRate: 24,
                temperature: 38.6,
                spo2: 97.0,
                userID: 'U12345',
                anomalyType: 'Critical',
                timestamp: now - (4 * 60 * 60 * 1000)
            },
            {
                condition: 'Critical',
                confidence: 0.98,
                heartRate: 88,
                respiratoryRate: 28,
                temperature: 38.1,
                spo2: 92.5,
                userID: 'U12345',
                anomalyType: 'Critical',
                timestamp: now - (3 * 60 * 60 * 1000)
            },
            {
                condition: 'Fatigue',
                confidence: 0.85,
                heartRate: 58,
                respiratoryRate: 11,
                temperature: 36.2,
                spo2: 96.3,
                userID: 'U12345',
                anomalyType: 'Warning',
                timestamp: now - (2 * 60 * 60 * 1000)
            },
            {
                condition: 'High Stress',
                confidence: 0.89,
                heartRate: 86,
                respiratoryRate: 21,
                temperature: 37.4,
                spo2: 97.1,
                userID: 'U12345',
                anomalyType: 'Warning',
                timestamp: now - (1 * 60 * 60 * 1000)
            },
            {
                condition: 'Normal',
                confidence: 0.98,
                heartRate: 75,
                respiratoryRate: 16,
                temperature: 36.8,
                spo2: 98.5,
                userID: 'U12345',
                anomalyType: 'Normal',
                timestamp: now - (30 * 60 * 1000)
            },
            {
                condition: 'Anxiety Spike',
                confidence: 0.96,
                heartRate: 89,
                respiratoryRate: 27,
                temperature: 37.9,
                spo2: 93.8,
                userID: 'U12345',
                anomalyType: 'Critical',
                timestamp: now - (10 * 60 * 1000)
            }
        ];

        initialEvents.forEach(eventData => {
            const latestBlock = this.getLatestBlock();
            const newBlock = new Block(
                latestBlock.index + 1,
                eventData.timestamp!,
                eventData,
                latestBlock.hash
            );
            this.chain.push(newBlock);
            this.indexBlock(newBlock);
        });
    }

    private createGenesisBlock(): Block {
        const genesisData: HealthLog = { 
            condition: 'Genesis', 
            confidence: 1.0,
            heartRate: 0,
            respiratoryRate: 0,
            temperature: 0,
            spo2: 0,
            userID: 'SYSTEM',
            anomalyType: 'Initialized',
        };
        // Explicitly set a past timestamp for the genesis block
        return new Block(0, Date.now() - (24 * 60 * 60 * 1000), genesisData, "0");
    }

    getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    addBlock(blockData: HealthLog): void {
        const latestBlock = this.getLatestBlock();
        // Use the provided timestamp, or create a new one if it doesn't exist.
        const timestamp = blockData.timestamp || Date.now();
        const newBlock = new Block(latestBlock.index + 1, timestamp, blockData, latestBlock.hash);
        
        this.chain.push(newBlock);
        this.indexBlock(newBlock);
    }

    getChain(): Block[] {
        return this.chain;
    }
    
    // New methods to query using indexes
    getBlocksByUserId(userId: string): Block[] {
        return this.userIndex.get(userId) || [];
    }

    getBlocksByCondition(condition: string): Block[] {
        // Case-insensitive search for better UX
        const lowerCaseCondition = condition.toLowerCase();
        const results: Block[] = [];
        for (const [key, value] of this.conditionIndex.entries()) {
            if(key.toLowerCase().includes(lowerCaseCondition)) {
                results.push(...value);
            }
        }
        return results;
    }


    isChainValid(): boolean {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                console.error(`Block ${currentBlock.index} hash is invalid.`);
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                console.error(`Chain link broken at Block ${currentBlock.index}.`);
                return false;
            }
        }
        return true;
    }
}
