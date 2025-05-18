import { Staff } from './Staff';
import { Shift } from './Shift';

export type ShiftException = {
    staff: Staff;
    shift: Shift;
    days: string[];
};