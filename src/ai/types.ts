
import { z } from 'zod';

// Schema for sensor statistics over a time window
const SensorStatsSchema = z.object({
  avg: z.number().default(0),
  min: z.number().default(0),
  max: z.number().default(0),
});
export type SensorStats = z.infer<typeof SensorStatsSchema>;

export const RecentReadingsSchema = z.object({
    heartRate: SensorStatsSchema,
    respiratoryRate: SensorStatsSchema,
    temperature: SensorStatsSchema,
    spo2: SensorStatsSchema.optional(), // Make spo2 optional as it may not always be present
});
export type RecentReadings = z.infer<typeof RecentReadingsSchema>;


// The final state classified by the system
const stateEnum = z.enum([
    'Normal',
    'Mild Stress',
    'High Stress',
    'Fatigue',
    'Anxiety Spike',
    'Critical'
]);

export const ReminderSchema = z.object({
    id: z.string(),
    title: z.string(),
    time: z.string(), // ISO 8601 format: YYYY-MM-DDTHH:mm
    type: z.enum(['Medication', 'Appointment']),
});
export type Reminder = z.infer<typeof ReminderSchema>;


// Represents a prediction from a single ML model in the ensemble
export const EnsemblePredictionSchema = z.object({
    model: z.string().describe("The name of the ML model (e.g., 'SVM', 'LSTM')."),
    prediction: z.string().describe("The prediction made by the model (e.g., 'Normal', 'High Stress')."),
    confidence: z.number().min(0).max(1).describe('The confidence score of this specific model.'),
});
export type EnsemblePrediction = z.infer<typeof EnsemblePredictionSchema>;


// Define the input schema for the main analysis flow
export const ClassifyMentalStateInputSchema = z.object({
  recentReadings: RecentReadingsSchema.describe("A summary of the user's sensor data over the last minute."),
  userBaseline: RecentReadingsSchema.describe("The user's normal, long-term baseline data for comparison."),
  localPredictions: z.array(EnsemblePredictionSchema).optional().describe('The array of predictions from the local, lightweight ML models.'),
  reminders: z.array(ReminderSchema).optional().describe("A list of the user's upcoming reminders."),
});
export type ClassifyMentalStateInput = z.infer<typeof ClassifyMentalStateInputSchema>;


// Define the output schema for the holistic analysis
export const HolisticAnalysisOutputSchema = z.object({
  state: stateEnum.describe("The final classified state of the user (e.g., 'Normal', 'High Stress')."),
  confidence: z.number().min(0).max(1).describe('The confidence score of the final classification, from 0 to 1.'),
  reasoning: z.string().describe("A brief, user-friendly explanation for the classification based on sensor data trends and the user's baseline."),
  action: z.string().describe("A short, empathetic, and personalized wellness recommendation for the user (e.g. Relax, Hydrate, Seek Medical Help)."),
  isCritical: z.boolean().describe('Set to true if the event is considered critical and should be logged to the blockchain.'),
  localPredictions: z.array(EnsemblePredictionSchema).optional().describe('The array of predictions from the local, lightweight ML models.'),
});
export type HolisticAnalysisOutput = z.infer<typeof HolisticAnalysisOutputSchema>;
