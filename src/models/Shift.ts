import { StaffCategory } from './StaffCategory';
import { ShiftCategory } from './ShiftCategory';

export type Shift = {
  order: number;
  shiftCategory: ShiftCategory;
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  days: string[];
  staffCategories: StaffCategory[];
  color?: string;
};