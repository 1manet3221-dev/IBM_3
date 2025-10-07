

'use server';
/**
 * @fileOverview A simulated local ML service.
 *
 * This file provides a function that simulates the output of lightweight
 * machine learning models (SVM, KNN, LSTM, Transformer) based on sensor data.
 * This is used to provide input to the main LLM for ensemble analysis.
 */

import { SensorStats, EnsemblePrediction, RecentReadings } from '@/ai/types';

// Helper function for clamping values and rounding
const clampAndRound = (num: number, min: number, max: number) => {
    const clamped = Math.min(Math.max(num, min), max);
    return Math.round(clamped * 100) / 100; // Rounds to 2 decimal places
};


/**
 * Simulates running a local ML model ensemble.
 * In a real-world scenario, this would involve running TensorFlow Lite models.
 * Here, we use rule-based logic to simulate their behavior.
 * @param {object} readings - The recent sensor readings.
 * @returns {Promise<EnsemblePrediction[]>} An array of predictions from the simulated models.
 */
export async function runLocalEnsemble(readings: RecentReadings): Promise<EnsemblePrediction[]> {
  const { heartRate, respiratoryRate, temperature } = readings;
  const predictions: EnsemblePrediction[] = [];

  // --- Dynamic Confidence Logic ---
  const hrConfidence = Math.min(1, Math.abs(heartRate.avg - 75) / 45); 
  const respConfidence = Math.min(1, Math.abs(respiratoryRate.avg - 16) / 10);
  const tempConfidence = Math.min(1, Math.abs(temperature.avg - 36.8) / 2);
  const hrVariability = heartRate.max - heartRate.min;
  const hrVarConfidence = Math.min(1, hrVariability / 30); 

  // 1. SVM Model Simulation (Rule-based thresholding)
  let svmPrediction: string;
  let svmConfidence: number;
  if (heartRate.avg > 110 || respiratoryRate.avg > 24 || temperature.avg > 38.2) {
    svmPrediction = 'Anxiety Spike';
    svmConfidence = 0.85 + (hrConfidence + respConfidence) * 0.07;
  } else if (heartRate.avg > 95 || respiratoryRate.avg > 20) {
    svmPrediction = 'High Stress';
    svmConfidence = 0.78 + hrConfidence * 0.2;
  } else if (heartRate.avg < 60) {
    svmPrediction = 'Fatigue';
    svmConfidence = 0.75 + (1 - hrConfidence) * 0.25;
  } else {
    svmPrediction = 'Normal';
    svmConfidence = 0.95 - (hrConfidence + respConfidence + tempConfidence) / 3;
  }
  predictions.push({
    model: 'SVM',
    prediction: svmPrediction,
    confidence: clampAndRound(svmConfidence, 0.65, 1),
  });

  // 2. KNN Model Simulation (Finds 'neighbors' in conceptual space)
  let knnPrediction: string;
  let knnConfidence: number;
  // Simulates finding nearest neighbors. If HR and Resp Rate are both high, it's near the 'Anxiety' cluster.
  if (heartRate.avg > 105 && respiratoryRate.avg > 22) {
    knnPrediction = 'Anxiety Spike';
    knnConfidence = 0.90 + (hrConfidence + respConfidence) * 0.05;
  // If HR is low but temp is normal, it's near the 'Fatigue' cluster.
  } else if (heartRate.avg < 65 && temperature.avg < 37.0) {
    knnPrediction = 'Fatigue';
    knnConfidence = 0.82 + (1 - hrConfidence) * 0.15;
  // If only temp is high, it's near 'High Temp'
  } else if (temperature.avg > 38.0) {
    knnPrediction = 'High Temp';
    knnConfidence = 0.85 + tempConfidence * 0.15;
  } else {
    knnPrediction = 'Normal';
    knnConfidence = 0.92 - (hrConfidence + tempConfidence) / 2;
  }
  predictions.push({
    model: 'KNN',
    prediction: knnPrediction,
    confidence: clampAndRound(knnConfidence, 0.7, 1),
  });

  // 3. LSTM Model Simulation (Focuses on HR variance and breathing patterns)
  let lstmPrediction: string;
  let lstmConfidence: number;

  if (hrVariability > 30 && respiratoryRate.max > 25) {
    lstmPrediction = 'Anxiety Spike';
    lstmConfidence = 0.92 + (hrVarConfidence + respConfidence) * 0.04; 
  } else if (hrVariability < 8 && heartRate.avg < 60) {
    lstmPrediction = 'Fatigue';
    lstmConfidence = 0.85 + (1 - hrVarConfidence) * 0.15;
  } else if (hrVariability > 20) {
    lstmPrediction = 'High Stress';
    lstmConfidence = 0.80 + hrVarConfidence * 0.2;
  } else {
    lstmPrediction = 'Normal';
    lstmConfidence = 0.93 - hrVarConfidence * 0.2; 
  }
   predictions.push({
    model: 'LSTM',
    prediction: lstmPrediction,
    confidence: clampAndRound(lstmConfidence, 0.75, 1),
  });

  // 4. Temporal Fusion Transformer Simulation (Considers multiple factors over time)
  let tftPrediction: string;
  let tftConfidence: number;

  // TFT can spot complex patterns, like rising temp AND high HR variability -> sign of critical issue
  // Made this condition much stricter to avoid frequent "Critical" states.
  if (tempConfidence > 0.85 && hrVarConfidence > 0.85 && respConfidence > 0.7) {
    tftPrediction = 'Critical';
    tftConfidence = 0.98;
  } else if (hrConfidence > 0.7 && respConfidence > 0.6) {
    tftPrediction = 'Anxiety Spike';
    tftConfidence = 0.90 + (hrConfidence + respConfidence) * 0.05;
  } else if (hrVarConfidence > 0.5) {
      tftPrediction = 'High Stress';
      tftConfidence = 0.85 + hrVarConfidence * 0.15;
  } else {
    tftPrediction = 'Normal';
    tftConfidence = 0.96 - (hrVarConfidence + tempConfidence + respConfidence) / 3;
  }
  predictions.push({
      model: 'Temporal Transformer',
      prediction: tftPrediction,
      confidence: clampAndRound(tftConfidence, 0.7, 1.0),
  });

  return predictions;
}
