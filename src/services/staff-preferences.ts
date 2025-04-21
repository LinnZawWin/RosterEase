/**
 * Represents staff preferences for shifts and days.
 */
export interface StaffPreferences {
  /**
   * The staff member's name.
   */
  staffName: string;
  /**
   * Preferred days of the week for shifts.
   */
  preferredDays: string[];
  /**
   * Preferred shifts.
   */
  preferredShifts: string[];
  /**
   * Leave requests for specific date ranges.
   */
  leaveRequests: { startDate: string; endDate: string }[];
  /**
   * Preference for consecutive shifts.
   */
  consecutiveShiftPreference: number;
  /**
   * Preference for consecutive days off.
   */
  consecutiveDaysOffPreference: number;
}

/**
 * Asynchronously retrieves staff preferences.
 *
 * @returns A promise that resolves to an array of StaffPreferences objects.
 */
export async function getStaffPreferences(): Promise<StaffPreferences[]> {
  // TODO: Implement this by calling an API.
  return [
    {
      staffName: 'AT-1',
      preferredDays: ['Monday', 'Tuesday', 'Wednesday'],
      preferredShifts: ['Regular day'],
      leaveRequests: [],
      consecutiveShiftPreference: 3,
      consecutiveDaysOffPreference: 2,
    },
    {
      staffName: 'AT-2',
      preferredDays: ['Thursday', 'Friday'],
      preferredShifts: ['Evening'],
      leaveRequests: [],
      consecutiveShiftPreference: 3,
      consecutiveDaysOffPreference: 2,
    },
        {
      staffName: 'AT-C',
      preferredDays: ['Monday', 'Wednesday', 'Thursday'],
      preferredShifts: ['Clinic'],
      leaveRequests: [],
      consecutiveShiftPreference: 3,
      consecutiveDaysOffPreference: 2,
    },
  ];
}
