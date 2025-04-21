/**
 * Represents a shift type with its duration and eligible staff categories.
 */
export interface Shift {
  /**
   * The name of the shift type (e.g., Regular day, Evening, Night, Clinic).
   */
  name: string;
  /**
   * The duration of the shift in hours.
   */
  duration: number;
  /**
   * The staff categories eligible for this shift.
   */
  eligibleStaffCategories: string[];
}

/**
 * Asynchronously retrieves shift type configurations.
 *
 * @returns A promise that resolves to an array of Shift objects.
 */
export async function getShifts(): Promise<Shift[]> {
  // TODO: Implement this by calling an API.
  return [
    {
      name: 'Regular day',
      duration: 8,
      eligibleStaffCategories: ['AT-1', 'AT-2', 'AT-3', 'AT-C', 'BT-1', 'BT-2', 'BT-3'],
    },
    {
      name: 'Evening',
      duration: 8,
      eligibleStaffCategories: ['AT-1', 'AT-2', 'AT-3', 'BT-1', 'BT-2', 'BT-3'],
    },
    {
      name: 'Night',
      duration: 11,
      eligibleStaffCategories: ['AT-1', 'AT-2', 'AT-3', 'BT-1', 'BT-2', 'BT-3'],
    },
    {
      name: 'Clinic',
      duration: 8.5,
      eligibleStaffCategories: ['AT-C', 'AT-1', 'AT-2', 'AT-3'],
    },
    {
      name: 'Day (Weekend)',
      duration: 12.5,
      eligibleStaffCategories: ['AT-1', 'AT-2', 'AT-3', 'BT-1', 'BT-2', 'BT-3'],
    },
        {
      name: 'Night (Weekend)',
      duration: 12.5,
      eligibleStaffCategories: ['AT-1', 'AT-2', 'AT-3', 'BT-1', 'BT-2', 'BT-3'],
    },
  ];
}
