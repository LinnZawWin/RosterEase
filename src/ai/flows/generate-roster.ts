'use server';
/**
 * @fileOverview Generates a roster using AI, considering staff availability, FTE, shift preferences, and constraints.
 *
 * - generateRoster - A function that generates a roster.
 * - GenerateRosterInput - The input type for the generateRoster function.
 * - GenerateRosterOutput - The return type for the generateRoster function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getStaff, Staff} from '@/services/staff';
import {getShifts, Shift} from '@/services/shift';
import {getStaffPreferences, StaffPreferences} from '@/services/staff-preferences';

const GenerateRosterInputSchema = z.object({
  startDate: z.string().describe('The start date for the roster generation (YYYY-MM-DD).'),
  endDate: z.string().describe('The end date for the roster generation (YYYY-MM-DD).'),
});
export type GenerateRosterInput = z.infer<typeof GenerateRosterInputSchema>;

const RosterEntrySchema = z.object({
  staffName: z.string().describe('The name of the staff member assigned to the shift.'),
  shiftName: z.string().describe('The name of the shift.'),
  date: z.string().describe('The date of the shift (YYYY-MM-DD).'),
});

const GenerateRosterOutputSchema = z.object({
  roster: z.array(RosterEntrySchema).describe('The generated roster.'),
  constraintsViolations: z
    .array(z.string())
    .optional()
    .describe('Any violations of the constraints during roster generation.'),
});
export type GenerateRosterOutput = z.infer<typeof GenerateRosterOutputSchema>;

export async function generateRoster(input: GenerateRosterInput): Promise<GenerateRosterOutput> {
  return generateRosterFlow(input);
}

const generateRosterPrompt = ai.definePrompt({
  name: 'generateRosterPrompt',
  input: {
    schema: z.object({
      startDate: z.string().describe('The start date for the roster generation (YYYY-MM-DD).'),
      endDate: z.string().describe('The end date for the roster generation (YYYY-MM-DD).'),
      staff: z.array(z.custom<Staff>()).describe('The list of staff members.'),
      shifts: z.array(z.custom<Shift>()).describe('The list of available shifts.'),
      staffPreferences: z
        .array(z.custom<StaffPreferences>())
        .describe('The preferences of each staff member.'),
    }),
  },
  output: {
    schema: GenerateRosterOutputSchema,
  },
  prompt: `You are an AI Roster Generator. You are provided with the list of staffs, shifts and their preferences, and your task is to generate a roster for the given period.

Consider the following constraints when generating the roster:
- Each staff member has an FTE which indicates the number of hours they must work.
- Each shift has a set of eligible staff categories.
- Staff preferences should be respected as much as possible.
- Shifts should be distributed evenly among staff members.
- Shifts should not be too close together (e.g., no day shift after a night shift).

Here's the information you need to generate the roster:

Start Date: {{{startDate}}}
End Date: {{{endDate}}}

Staffs:
{{#each staff}}
  - Name: {{{name}}}, Category: {{{category}}}, FTE: {{{fte}}}
{{/each}}

Shifts:
{{#each shifts}}
  - Name: {{{name}}}, Duration: {{{duration}}}, Eligible Staff Categories: {{{eligibleStaffCategories}}}
{{/each}}

Staff Preferences:
{{#each staffPreferences}}
  - Staff Name: {{{staffName}}}, Preferred Days: {{{preferredDays}}}, Preferred Shifts: {{{preferredShifts}}}, Leave Requests: {{{leaveRequests}}}, Consecutive Shift Preference: {{{consecutiveShiftPreference}}}, Consecutive Days Off Preference: {{{consecutiveDaysOffPreference}}}
{{/each}}

Generate the roster in JSON format, including the staff name, shift name, and date for each entry. If there are any constraint violations, list them in the 'constraintsViolations' array.
`,
})

const generateRosterFlow = ai.defineFlow<
  typeof GenerateRosterInputSchema,
  typeof GenerateRosterOutputSchema
>(
  {
    name: 'generateRosterFlow',
    inputSchema: GenerateRosterInputSchema,
    outputSchema: GenerateRosterOutputSchema,
  },
  async input => {
    const staff = await getStaff();
    const shifts = await getShifts();
    const staffPreferences = await getStaffPreferences();

    const {output} = await generateRosterPrompt({
      ...input,
      staff,
      shifts,
      staffPreferences,
    });
    return output!;
  }
);
