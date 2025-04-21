/**
 * Represents a staff member with their category, FTE, and availability.
 */
export interface Staff {
  /**
   * The name of the staff member.
   */
  name: string;
  /**
   * The category of the staff member (e.g., AT-1, AT-2, AT-C, BT-1, BT-2, BT-3).
   */
  category: string;
  /**
   * The full-time equivalent (FTE) of the staff member.
   */
  fte: number;
}

/**
 * Asynchronously retrieves staff member details.
 *
 * @returns A promise that resolves to an array of Staff objects.
 */
export async function getStaff(): Promise<Staff[]> {
  // TODO: Implement this by calling an API.
  return [
    {
      name: 'AT-1',
      category: 'AT-1',
      fte: 1,
    },
    {
      name: 'AT-2',
      category: 'AT-2',
      fte: 1,
    },
    {
      name: 'AT-3',
      category: 'AT-3',
      fte: 1,
    },
    {
      name: 'AT-C',
      category: 'AT-C',
      fte: 1,
    },
    {
      name: 'BT-1',
      category: 'BT-1',
      fte: 1,
    },
    {
      name: 'BT-2',
      category: 'BT-2',
      fte: 0.5,
    },
    {
      name: 'BT-3',
      category: 'BT-3',
      fte: 0.5,
    },
  ];
}
