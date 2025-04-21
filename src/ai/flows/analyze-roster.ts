'use server';
/**
 * @fileOverview Roster analysis AI agent.
 *
 * - analyzeRoster - A function that handles the roster analysis process.
 * - AnalyzeRosterInput - The input type for the analyzeRoster function.
 * - AnalyzeRosterOutput - The return type for the analyzeRoster function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {Staff} from '@/services/staff';
import {Shift} from '@/services/shift';
import {StaffPreferences} from '@/services/staff-preferences';

const AnalyzeRosterInputSchema = z.object({
  roster: z.string().describe('The generated roster in JSON format.'),
  staff: z.array(z.custom<Staff>()).describe('The staff configuration.'),
  shifts: z.array(z.custom<Shift>()).describe('The shift configuration.'),
  staffPreferences: z.array(z.custom<StaffPreferences>()).describe('The staff preferences.'),
});
export type AnalyzeRosterInput = z.infer<typeof AnalyzeRosterInputSchema>;

const AnalyzeRosterOutputSchema = z.object({
  violations: z.array(
    z.object({
      staffName: z.string().describe('The name of the staff member.'),
      violationType: z.string().describe('The type of violation (e.g., FTE requirements not met, shifts too close together).'),
      details: z.string().describe('Detailed description of the violation.'),
    })
  ).describe('A list of violations found in the roster.'),
});
export type AnalyzeRosterOutput = z.infer<typeof AnalyzeRosterOutputSchema>;

export async function analyzeRoster(input: AnalyzeRosterInput): Promise<AnalyzeRosterOutput> {
  return analyzeRosterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeRosterPrompt',
  input: {
    schema: z.object({
      roster: z.string().describe('The generated roster in JSON format.'),
      staff: z.string().describe('The staff configuration in JSON format.'),
      shifts: z.string().describe('The shift configuration in JSON format.'),
      staffPreferences: z.string().describe('The staff preferences in JSON format.'),
    }),
  },
  output: {
    schema: z.object({
      violations: z.array(
        z.object({
          staffName: z.string().describe('The name of the staff member.'),
          violationType: z.string().describe('The type of violation (e.g., FTE requirements not met, shifts too close together).'),
          details: z.string().describe('Detailed description of the violation.'),
        })
      ).describe('A list of violations found in the roster.'),
    }),
  },
  prompt: `You are an AI assistant specializing in analyzing staff rosters for constraint violations.

You will receive a roster, staff configurations, shift configurations, and staff preferences in JSON format. Your task is to identify any violations of the rules and constraints, such as:

*   FTE requirements not being met (e.g., full-time staff working less than 80 hours per fortnight).
*   Shifts being too close together (e.g., a regular day shift after a night shift).
*   Staff preferences not being respected (e.g., staff assigned to shifts they prefer not to work).
*   Leave requests being violated (staff assigned to shifts during requested leave).

Roster: {{{roster}}}
Staff Configuration: {{{staff}}}
Shift Configuration: {{{shifts}}}
Staff Preferences: {{{staffPreferences}}}

Analyze the roster and identify any violations. Return a JSON object containing a list of violations, including the staff name, violation type, and details of the violation.
`,
});

const analyzeRosterFlow = ai.defineFlow<
  typeof AnalyzeRosterInputSchema,
  typeof AnalyzeRosterOutputSchema
>(
  {
    name: 'analyzeRosterFlow',
    inputSchema: AnalyzeRosterInputSchema,
    outputSchema: AnalyzeRosterOutputSchema,
  },
  async input => {
    const {output} = await prompt({
      roster: JSON.stringify(input.roster),
      staff: JSON.stringify(input.staff),
      shifts: JSON.stringify(input.shifts),
      staffPreferences: JSON.stringify(input.staffPreferences),
    });
    return output!;
  }
);
