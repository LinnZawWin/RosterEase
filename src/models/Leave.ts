import { Staff } from './Staff';

export type Leave = {
    staff: Staff;
    from: Date;
    to: Date;
};