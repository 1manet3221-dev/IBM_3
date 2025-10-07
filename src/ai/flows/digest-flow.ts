
'use server';
/**
 * @fileOverview A Genkit flow for generating a weekly health digest.
 *
 * - weeklyDigest - A function that takes blockchain records and generates a markdown report.
 * - WeeklyDigestInput - The input type for the weeklyDigest function.
 * - WeeklyDigestOutput - The return type for the weeklyDigest function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Block } from '@/lib/blockchain';

// Define Input and Output schemas for clarity and validation.
const WeeklyDigestInputSchema = z.array(z.any()).describe("An array of blockchain records.");
export type WeeklyDigestInput = z.infer<typeof WeeklyDigestInputSchema>;

const WeeklyDigestOutputSchema = z.object({
    markdownReport: z.string().describe("The full health report in Markdown format."),
});
export type WeeklyDigestOutput = z.infer<typeof WeeklyDigestOutputSchema>;


/**
 * A Genkit prompt that instructs the AI to act as a health analyst.
 */
const digestPrompt = ai.definePrompt({
    name: 'digestPrompt',
    input: { schema: z.any() }, // The input will be the array of summarized records.
    output: { schema: WeeklyDigestOutputSchema },
    prompt: `
        You are a compassionate and insightful AI health analyst. Your task is to analyze a week's worth of physiological data and generate a clear, empathetic, and actionable summary for the user.

        You will receive a summarized array of JSON objects, where each object represents a noteworthy health event that was flagged as 'Warning' or 'Critical'.

        **Your report must be in Markdown format and include the following sections:**

        1.  **## Weekly Health Overview**
            *   Start with a brief, high-level summary of the week. Was it calm? Stressful? Volatile?
            *   Identify the most frequent condition logged this week.
            *   Mention the total number of significant events recorded.

        2.  **## Notable Events**
            *   Based on the data, highlight the top 2-3 most significant events. A significant event is one with high confidence, a 'Critical' anomalyType, and an extreme condition like 'Anxiety Spike' or 'Critical'.
            *   For each event, create a sub-heading (e.g., "### Critical Anxiety Spike on Monday Evening").
            *   Briefly describe the event and its severity based on the provided data.

        3.  **## Identified Trends & Patterns**
            *   Analyze the timestamps of the events. Do you see any patterns? For example, does stress often spike in the afternoon? Is fatigue more common on certain days?
            *   Mention any correlations you can infer. For instance, "We noticed that periods of high stress were often followed by fatigue a few hours later."
            *   If there are no clear patterns, state that the week's events appeared to be isolated incidents.

        4.  **## Actionable Recommendations**
            *   Based on the analysis, provide 2-3 personalized and empathetic recommendations.
            *   If stress is common, suggest specific mindfulness techniques or break reminders.
            *   If fatigue is a problem, recommend focusing on sleep hygiene or hydration.
            *   Phrase these as supportive suggestions, not commands. For example, "It might be helpful to..." or "Perhaps consider...".

        **Summarized Input Data:**
        \`\`\`json
        {{{json this}}}
        \`\`\`

        Generate the report.
    `,
});

const weeklyDigestFlow = ai.defineFlow(
  {
    name: 'weeklyDigestFlow',
    inputSchema: WeeklyDigestInputSchema,
    outputSchema: WeeklyDigestOutputSchema,
  },
  async (records: Block[]) => {
    // Filter for only relevant, non-genesis blocks
    const significantRecords = records.filter(r => r.index > 0 && (r.data.anomalyType === 'Critical' || r.data.anomalyType === 'Warning'));

    if (significantRecords.length === 0) {
        return { markdownReport: "## No Significant Events Logged This Week\n\nYour physiological data remained stable, with no critical events recorded on the AuraChain. Keep up the great work in maintaining your well-being!" };
    }

    // Create a summarized version to prevent exceeding token limits
    const summarizedData = significantRecords.map(r => ({
      condition: r.data.condition,
      confidence: r.data.confidence,
      anomalyType: r.data.anomalyType,
      timestamp: r.timestamp
    }));

    const { output } = await digestPrompt(summarizedData);
    return output!;
  }
);


export async function weeklyDigest(records: WeeklyDigestInput): Promise<WeeklyDigestOutput> {
    return await weeklyDigestFlow(records);
}
