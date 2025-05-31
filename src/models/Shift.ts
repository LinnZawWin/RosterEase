import { ShiftCategory } from './ShiftCategory';
import { StaffCategory } from './StaffCategory';

export type Shift = {
  order: number;
  name: string;
  shiftCategory: ShiftCategory;
  staffCategories: StaffCategory[];
  days: string[];
  startTime: string;
  endTime: string;
  duration: number;
  color?: string;
};