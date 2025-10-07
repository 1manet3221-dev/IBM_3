

// Helper for random number generation within a specified range
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

// TIMING CONFIGURATION
export const CHART_TIME_WINDOW = 60 * 1000; // 60 seconds
export const SENSOR_UPDATE_INTERVAL = 1000; // 1 second
export const AI_ANALYSIS_INTERVAL = 10000; // 10 seconds - Must be less than SIMULATION_MODE_INTERVAL
export const BASELINE_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
export const LOG_COOLDOWN = 60 * 1000; // 60 seconds to prevent logging the same condition
export const SIMULATION_MODE_INTERVAL = 15000; // 15 seconds to cycle through moods

// BASELINE GENERATION
export const generateUserBaseline = () => ({
    heartRate: { avg: rand(60, 75), min: rand(55, 65), max: rand(75, 80) },
    respiratoryRate: { avg: rand(14, 18), min: rand(12, 16), max: rand(18, 20) },
    temperature: { avg: rand(36.2, 36.6), min: rand(36.1, 36.4), max: rand(36.6, 36.9) },
    spo2: { avg: rand(97, 99), min: rand(96, 98), max: rand(98, 100) },
});


// SIMULATION MODE CONFIGURATION
export type SimulationMode = 'Normal' | 'Mild Stress' | 'High Stress' | 'Fatigue' | 'Anxiety Spike' | 'High Temp' | 'Critical' | 'Sad' | 'Happy' | 'Depressed' | 'Nervous';

export const LOGGABLE_MOODS: (SimulationMode)[] = [
    'Anxiety Spike',
    'High Temp',
    'Critical',
    'High Stress',
    'Fatigue'
];


// A comprehensive cycle to showcase all extreme states.
export const simulationCycle: SimulationMode[] = [
    'High Stress', // This will now be logged
    'Anxiety Spike', // This SHOULD be logged
    'Normal',
    'Fatigue', // This will now be logged
    'Critical', // This SHOULD be logged
    'Normal',
    'High Temp', // This SHOULD be logged
    'Normal',
];
