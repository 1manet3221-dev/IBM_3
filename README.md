# AuraChain: An AI-Powered Health Monitoring System for Senior Well-being

## 1. Introduction

AuraChain is an intelligent health monitoring system designed to provide continuous, non-invasive oversight for seniors, offering peace of mind to both users and their families. It uses a combination of wearable IoT sensors, a multi-stage AI analysis pipeline, and a secure private blockchain to transform real-time physiological data into actionable health insights.

When a significant health event—such as a sudden spike in stress, the onset of a fever, or extreme fatigue—is detected, the system logs it as an immutable record on **AuraChain**. This creates a secure, tamper-proof history of critical events that can be reviewed by caregivers or medical professionals, ensuring data privacy and integrity.

## 2. The IoT Layer: Real-Time Sensing

The foundation of the system is its Internet of Things (IoT) layer, responsible for capturing raw physiological data from the user in real time.

-   **What it is:** A set of compact, low-power wearable sensors connected to a microcontroller (like an ESP32).
-   **How it works:** The sensors continuously measure vital signs. This data is then transmitted wirelessly to the backend for analysis.
-   **Why it's important:** This layer provides the constant stream of objective data needed for the AI to detect subtle changes in a senior's health status that might otherwise go unnoticed.

#### Sensors Used:

-   **MAX30100 (Pulse Oximeter & Heart-Rate Sensor):**
    -   **Measures:** Heart Rate (BPM), Blood Oxygen (SpO2), and raw photoplethysmography (PPG) waveforms.
    -   **Relevance:** Crucial for detecting cardiovascular stress, respiratory issues, and deriving breathing patterns.
-   **DHT11 (Temperature Sensor):**
    -   **Measures:** Body temperature.
    -   **Relevance:** Essential for identifying fever or hypothermia, which are critical indicators for seniors.

## 3. The AI Core: From Raw Data to Actionable Insights

The AI Core processes the incoming IoT data in a two-stage pipeline to deliver a sophisticated, contextual understanding of the user's health.

### Stage 1: Lightweight ML Ensemble (Edge/Cloud)

The first stage involves a set of fast, efficient machine learning models that perform an initial classification of the sensor data.

-   **What it is:** A collection of classic ML models (SVM, Gradient Boost) and a lightweight neural network (LSTM) optimized for speed.
-   **How it works:** These models are trained to recognize patterns associated with specific conditions (e.g., normal, stress, fatigue). They each "vote" on the user's current state based on the incoming numbers.
-   **Why it's important:** This provides an instant, preliminary assessment. It's the system's "reflex"—capable of flagging an immediate, obvious anomaly without the delay of a larger model.

### Stage 2: Google Gemini (Advanced Reasoning)

The output from the ML ensemble, along with the raw data, is fed to a large language model (LLM) for deeper analysis.

-   **What it is:** Google's Gemini Pro model, used as a sophisticated reasoning engine.
-   **How it works:** Gemini doesn't just look at the numbers; it synthesizes them. It considers the votes from the ML models, the raw sensor data trends, the user's normal baseline, and any active reminders (e.g., "medication due"). It then generates a holistic, human-readable summary.
-   **Why it's important:** This moves beyond simple classification. The LLM can explain *why* it reached a conclusion (e.g., "High stress was detected due to an elevated heart rate combined with rapid breathing") and recommends a personalized, empathetic course of action (e.g., "Consider taking a short break and practicing deep breathing exercises.").

## 4. AuraChain: The Secure Blockchain Log

AuraChain is not a cryptocurrency. It is a private, in-memory **immutable ledger** designed for one purpose: to create a secure, tamper-proof log of critical health events.

-   **What it is:** A chain of cryptographically linked blocks, where each block contains the details of a significant health event.
-   **How it works:**
    1.  When the AI detects a "loggable" condition (e.g., 'Anxiety Spike', 'Critical', 'High Stress'), it triggers the `logCriticalCondition` function.
    2.  A new block is created containing the condition, sensor data, user ID, and a timestamp.
    3.  This block is then "hashed"—a unique cryptographic signature is generated based on its contents and the hash of the *previous* block.
    4.  This linkage ensures that no record can be altered or removed without breaking the entire chain.
-   **Why it's important for Senior Care:**
    -   **Data Integrity:** Provides a trustworthy historical record of major health events, which is invaluable for medical reviews.
    -   **Privacy:** It's a closed, private system. Unlike public blockchains, it is not distributed openly. The data is stored securely within the application's backend.
    -   **Focus:** It only logs what matters. By filtering out "normal" states, the chain becomes a high-signal, low-noise record of a senior's health journey.

## 5. Application & Technical Stack

-   **Frontend:** React / Next.js, ShadCN, Tailwind CSS
    -   Real-time charts for visualizing live vital signs.
    -   A live status banner showing the AI's current assessment.
    -   The **AuraChain Explorer** for securely viewing and verifying the log of past events.
-   **Backend:** Firebase Functions, Genkit
    -   Handles real-time data ingestion.
    -   Executes the AI analysis pipeline (ML models and Gemini).
    -   Manages the AuraChain and logs new blocks.
-   **AI/ML:** Scikit-learn, TensorFlow Lite, Google Gemini
-   **Data Visualization:** Recharts
-   **IoT Device:** ESP32 with MAX30100 and DHT11 sensors.
