import { Staff } from './Staff';
import { Shift } from './Shift';

export type FixedShift = {
    staff: Staff;
    shift: Shift;
    days: string[];
};