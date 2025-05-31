import { Shift } from "./Shift";
import { Staff } from "./Staff";

export type ConsecutiveShiftAssignmentRule = {
  type: 'Shift' | 'Staff';
  shifts: Shift[];
  staffMembers: Staff[];
  consecutiveDays: number;
  gapDays: number;
};