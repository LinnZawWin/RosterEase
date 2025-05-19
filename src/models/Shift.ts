import { StaffCategory } from './StaffCategory';
import { ShiftCategory } from './ShiftCategory';

export type Shift = {
  order: number;
  name: string;
  shiftCategory: ShiftCategory;
  days: string[];
  startTime: string;
  endTime: string;
  duration: number;
  color?: string;
};