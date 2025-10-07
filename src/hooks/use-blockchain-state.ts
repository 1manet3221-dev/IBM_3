

'use client';

import { useState, useEffect, useCallback } from 'react';
import { BlockchainRecord } from '@/components/dashboard/blockchain-records-card';
import { getChain } from '@/ai/services/blockchainService';
import { Block } from '@/lib/blockchain';
import { useToast } from '@/hooks/use-toast';


export interface BlockchainState {
  records: BlockchainRecord[];
  isLoading: boolean;
  error: string | null;
}

// Global state, similar to useAiState
let globalBlockchainState: BlockchainState = {
  records: [],
  isLoading: true,
  error: null,
};

const listeners: Set<() => void> = new Set();

export const mapBlockToRecord = (block: Block): BlockchainRecord => ({
    blockId: block.index,
    condition: block.data.condition,
    timestamp: new Date(block.timestamp).toISOString(),
    confidence: block.data.confidence,
    hash: block.hash,
    previousHash: block.previousHash,
    sensor_data: {
      HR: block.data.heartRate,
      Resp: block.data.respiratoryRate,
      Temp: block.data.temperature,
      SpO2: block.data.spo2,
    },
    userID: block.data.userID,
    status: block.data.anomalyType,
  });

// Function to update global state and notify listeners
const updateState = (newState: Partial<BlockchainState>) => {
  globalBlockchainState = { ...globalBlockchainState, ...newState };
  listeners.forEach((listener) => listener());
};

// Function for external modules to add a new record and trigger an update
export const addBlockchainRecord = (newBlock: Block) => {
    const newRecord = mapBlockToRecord(newBlock);
    const existingRecord = globalBlockchainState.records.find(r => r.blockId === newRecord.blockId);
    
    // Only add if it's not already in the state
    if (!existingRecord) {
        const updatedRecords = [newRecord, ...globalBlockchainState.records];
        updateState({ records: updatedRecords });
    }
};


// Exported function to fetch data and update state
export const fetchBlockchainRecords = async () => {
    if(!globalBlockchainState.isLoading) {
        updateState({ isLoading: true });
    }
    try {
        const chain = await getChain();
        const records = chain.reverse().filter(b => b.index > 0).map(mapBlockToRecord);
        updateState({ records, isLoading: false, error: null });
    } catch (error) {
        console.error("Error fetching blockchain records:", error);
        const errorMessage = error instanceof Error ? error.message : "Could not retrieve blockchain records.";
        updateState({ isLoading: false, error: errorMessage });
    }
};

// The actual React hook
export const useBlockchainState = (): BlockchainState => {
  const [state, setState] = useState(globalBlockchainState);
  const { toast } = useToast();

  useEffect(() => {
    const originalState = { ...globalBlockchainState };

    const listener = () => {
        // Check for new records to show a toast
        if (globalBlockchainState.records.length > originalState.records.length) {
            const newRecord = globalBlockchainState.records[0];
            toast({
                title: "New Critical Event Logged",
                description: `Condition "${newRecord.condition}" was recorded on the AuraChain.`,
            });
            // Update the original state to prevent re-toasting for the same records
            originalState.records = [...globalBlockchainState.records];
        }
        setState(globalBlockchainState);
    };

    listeners.add(listener);
    // Initial sync
    listener(); 
    
    // If initial load and no records, fetch them
    if (globalBlockchainState.records.length === 0 && globalBlockchainState.isLoading) {
        fetchBlockchainRecords();
    }

    return () => {
      listeners.delete(listener);
    };
  }, [toast]);
  
  useEffect(() => {
      if (state.error && !globalBlockchainState.isLoading) {
          toast({
              variant: "destructive",
              title: "AuraChain Fetch Error",
              description: state.error,
          });
      }
  }, [state.error, toast]);

  return state;
};
