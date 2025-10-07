
'use client';

import {
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import {
  ChartDataPoint
} from '@/components/dashboard/realtime-chart';
import {
  CHART_TIME_WINDOW,
  SENSOR_UPDATE_INTERVAL,
  AI_ANALYSIS_INTERVAL,
  LOGGABLE_MOODS,
  LOG_COOLDOWN,
  SIMULATION_MODE_INTERVAL,
  simulationCycle,
  generateUserBaseline,
} from '@/config/simulation';
import {
  setAiState,
  setAiLoading,
  getAiState
} from '@/hooks/use-ai-state';
import { addBlock } from '@/ai/services/blockchainService';
import { runLocalEnsemble } from '@/ai/services/local-ml-service';
import { RecentReadings, HealthLog, EnsemblePrediction, Reminder, SimulationMode } from '@/ai/types';
import { addBlockchainRecord, fetchBlockchainRecords } from './use-blockchain-state';
import { Block } from '@/lib/blockchain';

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

const moodBehavior: Record < SimulationMode, () => ChartDataPoint > = {
    Normal: () => ({ timestamp: Date.now(), heartRate: rand(80, 90), respiratoryRate: rand(15, 19), temperature: 27.2, spo2: 94 }),
    'Mild Stress': () => ({ timestamp: Date.now(), heartRate: rand(85, 95), respiratoryRate: rand(18, 22), temperature: rand(37.0, 37.5), spo2: rand(96, 98) }),
    'High Stress': () => ({ timestamp: Date.now(), heartRate: rand(90, 99), respiratoryRate: rand(20, 24), temperature: rand(37.2, 37.8), spo2: rand(95, 97) }),
    Fatigue: () => ({ timestamp: Date.now(), heartRate: rand(55, 65), respiratoryRate: rand(12, 15), temperature: rand(36.0, 36.5), spo2: rand(95, 98) }),
    'Anxiety Spike': () => ({ timestamp: Date.now(), heartRate: rand(95, 99), respiratoryRate: rand(25, 30), temperature: rand(37.5, 38.2), spo2: rand(93, 96) }),
    'High Temp': () => ({ timestamp: Date.now(), heartRate: rand(90, 99), respiratoryRate: rand(22, 26), temperature: rand(38.3, 39.5), spo2: rand(94, 97) }),
    Critical: () => ({ timestamp: Date.now(), heartRate: rand(95, 99), respiratoryRate: rand(28, 35), temperature: rand(38.5, 40.0), spo2: rand(90, 94) }),
    Happy: () => ({ timestamp: Date.now(), heartRate: rand(75, 85), respiratoryRate: rand(16, 20), temperature: rand(36.8, 37.3), spo2: rand(98, 100) }),
    Sad: () => ({ timestamp: Date.now(), heartRate: rand(60, 70), respiratoryRate: rand(14, 17), temperature: rand(36.2, 36.7), spo2: rand(96, 98) }),
    Depressed: () => ({ timestamp: Date.now(), heartRate: rand(58, 68), respiratoryRate: rand(13, 16), temperature: rand(36.0, 36.6), spo2: rand(95, 97) }),
    Nervous: () => ({ timestamp: Date.now(), heartRate: rand(90, 99), respiratoryRate: rand(19, 23), temperature: rand(37.1, 37.6), spo2: rand(96, 98) }),
};


const getHolisticState = (predictions: EnsemblePrediction[]): string => {
    if (!predictions || predictions.length === 0) return 'Normal';

    // Give priority to critical predictions from advanced models
    const tftPrediction = predictions.find(p => p.model === 'Temporal Transformer')?.prediction;
    if (tftPrediction === 'Critical') return 'Critical';
    
    const votes: Record<string, number> = {};
    predictions.forEach(p => {
            votes[p.prediction] = (votes[p.prediction] || 0) + 1;
        });

    if (Object.keys(votes).length === 0) {
        return 'Normal';
    }

    const majorityVote = Object.keys(votes).reduce((a, b) => (votes[a] > votes[b] ? a : b));

    return majorityVote;
};

const generateDynamicFeedback = (state: string, readings: RecentReadings, reminders: Reminder[] | null) => {
  const { heartRate, respiratoryRate, temperature } = readings;
  let reasoning = `The model ensemble detected a state of ${state}.`;
  let action = "Maintain current activity and monitor for any changes.";

  // Check for upcoming reminders
  let upcomingReminderText = '';
  if (reminders && reminders.length > 0) {
      const now = new Date();
      const upcoming = reminders.find(r => {
          const reminderTime = new Date(r.time);
          const diff = (reminderTime.getTime() - now.getTime()) / (1000 * 60);
          return diff > 0 && diff <= 30; // Within the next 30 minutes
      });
      if (upcoming) {
          upcomingReminderText = ` The AI notes you have an upcoming ${upcoming.type} reminder: "${upcoming.title}".`;
      }
  }

  switch (state) {
    case 'High Stress':
      reasoning = `A state of High Stress was detected, driven by an elevated heart rate (AVG: ${heartRate.avg.toFixed(0)} BPM) and faster breathing (Resp Rate AVG: ${respiratoryRate.avg.toFixed(1)} breaths/min).`;
      action = `Your body is showing signs of significant stress. Consider taking a 10-minute break to practice deep breathing or a short walk.${upcomingReminderText}`;
      break;
    case 'Fatigue':
      reasoning = `Signs of Fatigue were detected, characterized by a lower-than-normal heart rate (AVG: ${heartRate.avg.toFixed(0)} BPM) and slower breathing (Resp Rate AVG: ${respiratoryRate.avg.toFixed(1)} breaths/min).`;
      action = "You appear to be fatigued. Ensure you are well-hydrated and consider a short rest or stretching session to recharge.";
      break;
    case 'Anxiety Spike':
      reasoning = `An Anxiety Spike was detected. Your heart rate is significantly elevated (AVG: ${heartRate.avg.toFixed(0)} BPM), and breathing is very rapid (Resp Rate AVG: ${respiratoryRate.avg.toFixed(1)} breaths/min).`;
      action = `A critical spike in anxiety indicators has been detected. Please find a calm space, rest, and focus on slow, deep breaths. Contact a caregiver if symptoms persist.${upcomingReminderText}`;
      break;
    case 'Critical':
       reasoning = `A Critical state was detected with multiple indicators in extreme ranges: Heart Rate (AVG: ${heartRate.avg.toFixed(0)} BPM), Breathing (AVG: ${respiratoryRate.avg.toFixed(1)} breaths/min), and Temperature (AVG: ${temperature.avg.toFixed(1)}°C).`;
       action = "Immediate attention is required. Please cease all strenuous activity, rest in a cool place, and seek assistance or medical advice promptly.";
      break;
    case 'High Temp':
        reasoning = `A high body temperature (AVG: ${temperature.avg.toFixed(1)}°C) was detected, which can be a sign of fever or overheating. Your heart rate and breathing are also elevated.`;
        action = "Your body temperature is high. Please rest in a cool environment, drink water, and monitor your symptoms. Consider medical advice if your temperature remains high.";
        break;
    case 'Normal':
    default:
      reasoning = "Your physiological signals are within their normal range, indicating a balanced state.";
      action = `Your readings are normal. Keep up the great work in maintaining your well-being!${upcomingReminderText}`;
      break;
  }
  return { reasoning, action };
}


export function useSensorSimulation() {
  const [dataHistory, setDataHistory] = useState < ChartDataPoint[] > ([]);
  const [currentMode, setCurrentMode] = useState < SimulationMode > ('Normal');
  const [isInitialDataLoading, setIsInitialDataLoading] = useState(true);

  const userBaselineRef = useRef<RecentReadings>(generateUserBaseline());
  const dataHistoryRef = useRef < ChartDataPoint[] > ([]);
  const lastLogTimesRef = useRef<Map<string, number>>(new Map());
  const lastRespiratoryRateRef = useRef<number | null>(null);
  const lastRespRateUpdateRef = useRef<number>(0);

  useEffect(() => {
    dataHistoryRef.current = dataHistory;
  }, [dataHistory]);
  
  const runAnalysis = useCallback(async () => {
    const currentData = dataHistoryRef.current;
    if (currentData.length === 0) return;
    
    setAiLoading();
    const globalState = getAiState();

    const getStats = (key: keyof Omit < ChartDataPoint, 'timestamp' > ) => {
      const values = currentData.map(d => d[key]).filter(v => typeof v === 'number') as number[];
      if (values.length === 0) return {
        min: 0,
        max: 0,
        avg: 0
      };
      const sum = values.reduce((a, b) => a + b, 0);
      return {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: sum / values.length,
      };
    };

    const recentReadings: RecentReadings = {
      heartRate: getStats('heartRate'),
      respiratoryRate: getStats('respiratoryRate'),
      temperature: getStats('temperature'),
      spo2: getStats('spo2'),
    };
    
    try {
      const localPredictions = await runLocalEnsemble(recentReadings);
      
      const finalState = getHolisticState(localPredictions);
      
      const avgConfidence = localPredictions.reduce((acc, p) => acc + p.confidence, 0) / localPredictions.length;
      
      const isCritical = LOGGABLE_MOODS.map(m => m.toLowerCase()).includes(finalState.toLowerCase());
      
      const { reasoning, action } = generateDynamicFeedback(finalState, recentReadings, globalState.reminders);

      const analysisResult = {
        state: finalState as any,
        confidence: avgConfidence,
        reasoning: reasoning,
        action: action,
        isCritical: isCritical,
        localPredictions: localPredictions,
      };

      if (analysisResult.isCritical) {
        const now = Date.now();
        const lastLogTime = lastLogTimesRef.current.get(analysisResult.state) || 0;
        
        if (now - lastLogTime > LOG_COOLDOWN) { 
          lastLogTimesRef.current.set(analysisResult.state, now);
          const logData: HealthLog = {
            userID: 'Anonymous',
            condition: analysisResult.state,
            anomalyType: analysisResult.confidence > 0.9 ? 'Critical' : 'Warning',
            confidence: analysisResult.confidence,
            heartRate: recentReadings.heartRate.avg,
            temperature: recentReadings.temperature.avg,
            respiratoryRate: recentReadings.respiratoryRate.avg,
            spo2: recentReadings.spo2!.avg,
          };
          addBlock(logData).then((newBlock) => {
              if (newBlock) {
                  addBlockchainRecord(newBlock as unknown as Block);
              }
          }).catch(console.error);
        }
      }

      setAiState({
        aiState: analysisResult,
        sensorData: recentReadings,
        isLoading: false,
        error: null,
      });

    } catch (error) {
       console.error("Error in client-side analysis:", error);
       const errorMessage = error instanceof Error ? error.message : 'AI processing failed on client.';
       setAiState({ aiState: null, isLoading: false, error: errorMessage });
    }
    
  }, []);


  const updateSensorData = useCallback(() => {
    const getNextDataPoint = moodBehavior[currentMode] || moodBehavior['Normal'];
    const baseData = getNextDataPoint();
    const now = Date.now();

    // Only update respiratory rate once per minute, but ensure it adheres to the current mode's logic
    if (now - lastRespRateUpdateRef.current > 60 * 1000 || lastRespiratoryRateRef.current === null) {
        // Generate a new respiratory rate *based on the current mode*
        const currentModeRespRate = (moodBehavior[currentMode] || moodBehavior['Normal'])().respiratoryRate;
        lastRespiratoryRateRef.current = currentModeRespRate;
        lastRespRateUpdateRef.current = now;
    }

    const newDataPoint: ChartDataPoint = {
        ...baseData, // This provides the other live values (HR, Temp, etc.)
        timestamp: now,
        respiratoryRate: lastRespiratoryRateRef.current, // Use the stored, slowly-updating respiratory rate
    };

    setDataHistory((prevData) => {
      const updatedData = [...prevData, newDataPoint].filter((d) => now - d.timestamp <= CHART_TIME_WINDOW);
      return updatedData;
    });

  }, [currentMode]);


  // This effect handles the continuous simulation of sensor data.
  useEffect(() => {
    const sensorIntervalId = setInterval(
      updateSensorData,
      SENSOR_UPDATE_INTERVAL
    );
    
    // This interval runs the AI analysis.
    const analysisIntervalId = setInterval(() => {
        runAnalysis();
    }, AI_ANALYSIS_INTERVAL);

    // This interval cycles through different simulation modes.
    let cycleIndex = 0;
    const modeIntervalId = setInterval(() => {
        cycleIndex = (cycleIndex + 1) % simulationCycle.length;
        setCurrentMode(simulationCycle[cycleIndex]);
    }, SIMULATION_MODE_INTERVAL);


    return () => {
      clearInterval(sensorIntervalId);
      clearInterval(analysisIntervalId);
      clearInterval(modeIntervalId);
    };
  }, [updateSensorData, runAnalysis]);


  // This effect sets up the initial chart data.
  useEffect(() => {
    const now = Date.now();
    const initialData = Array.from({
      length: 10
    }, (_, i) => {
      const timestamp = now - (10 - i) * SENSOR_UPDATE_INTERVAL;
      return { ...moodBehavior['Normal'](),
        timestamp
      };
    });
    setDataHistory(initialData);
    setIsInitialDataLoading(false);
    setAiState({ userBaseline: userBaselineRef.current });

    // Run initial analysis after a short delay
    setTimeout(() => {
        fetchBlockchainRecords();
        runAnalysis();
    }, 100);
  }, [runAnalysis]);

  return {
    dataHistory,
    userBaseline: userBaselineRef.current,
    isInitialDataLoading,
  };
}
