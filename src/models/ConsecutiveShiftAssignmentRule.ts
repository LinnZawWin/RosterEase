export type ConsecutiveShiftAssignmentRule = {
  type: 'Shift' | 'Staff';
  shifts: string[];
  staffMembers: string[];
  consecutiveDays: number;
  gapDays: number;
};