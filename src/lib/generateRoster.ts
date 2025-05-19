import { format } from 'date-fns';
import { ConsecutiveShiftAssignmentRule } from '@/models/ConsecutiveShiftAssignmentRule';
import { Staff } from '@/models/Staff';
import { Shift } from '@/models/Shift';
import { FixedShift } from '@/models/FixedShift';
import { ShiftException } from '@/models/ShiftException';
import { Leave } from '@/models/Leave';
import { PublicHoliday } from '@/models/PublicHoliday';


export type ShiftWithStaff = {
    name: string;
    startTime: string;
    endTime: string;
    duration: number;
    staff: Staff[];
    days?: string[];
    order: number;
};

export type RosterConfig = {
    shifts: Shift[];
    staff: Staff[];
    consecutiveShiftAssignmentRules: ConsecutiveShiftAssignmentRule[];
    fixedShifts: FixedShift[];
    shiftExceptions: ShiftException[];
    publicHolidays: PublicHoliday[];
    leaves: Leave[];
};

export async function generateRoster({
    startDate,
    endDate,
    config,
}: {
    startDate: string;
    endDate: string;
    config: RosterConfig;
}) {
    const {
        shifts: defaultShifts,
        staff: defaultStaff,
        consecutiveShiftAssignmentRules,
        fixedShifts: defaultFixedShifts,
        shiftExceptions: defaultShiftExceptions,
        publicHolidays,
        leaves,
    } = config;

    const calendarData = [];
    let currentDate = new Date(startDate);

    const ruleTracking: {
        consecutive: { [key: string]: { currentStaff: string | null; daysRemaining: number } };
        gap: { [key: string]: { [staffName: string]: number } };
    } = {
        consecutive: {},
        gap: {},
    };

    consecutiveShiftAssignmentRules.forEach((rule, index) => {
        const ruleId = `rule_${index}`;
        ruleTracking.consecutive[ruleId] = { currentStaff: null, daysRemaining: 0 };
        ruleTracking.gap[ruleId] = {};
    });

    const workingHoursTracker = initializeWorkingHoursTracker(defaultStaff);
    const shiftCountTracker = initializeShiftCountTracker(defaultStaff, defaultShifts);

    while (currentDate <= new Date(endDate)) {
        const dayOfWeek = format(currentDate, 'EEE');
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        updateGapDaysTracking(ruleTracking.gap);

        const isPublicHoliday = publicHolidays.some(ph => ph.date === dateStr);
        const applicableShifts = getApplicableShiftsForDay(
            defaultShifts,
            consecutiveShiftAssignmentRules,
            isPublicHoliday ? 'PH' : dayOfWeek
        );

        const assignedStaff = new Set<string>();
        const remainingShifts: any[] = [];

        // --- Annual Leave assignment (outside the applicableShifts loop) ---
        const annualLeaveShift = defaultShifts.find((s) => s.name === 'Annual Leave');
        let annualLeaveAssignment = null;
        if (annualLeaveShift) {
            const leaveResult = processLeave(
                annualLeaveShift,
                defaultStaff,
                assignedStaff,
                leaves,
                currentDate
            );
            if (leaveResult) {
                annualLeaveAssignment = leaveResult;
            }
        }
        // ---------------------------------------------------------------

        const dayRoster = {
            date: dateStr,
            shifts: [
                ...(annualLeaveAssignment ? [annualLeaveAssignment] : []),
                ...applicableShifts
                    .map((shift) => {
                        const fixedShiftResult = processFixedShift(
                            shift,
                            dayOfWeek,
                            defaultStaff,
                            assignedStaff,
                            defaultFixedShifts
                        );
                        if (fixedShiftResult) return fixedShiftResult;

                        const consecutiveShiftAssignmentRuleResult = processConsecutiveShiftAssignmentRuleConsecutiveDays(
                            shift,
                            dayOfWeek,
                            ruleTracking,
                            defaultStaff,
                            assignedStaff,
                            consecutiveShiftAssignmentRules,
                            defaultShiftExceptions,
                            shiftCountTracker
                        );
                        console.log(
                            'consecutiveShiftAssignmentRuleResult:',
                            {
                                day: dateStr,
                                shift: shift.name,
                                result: consecutiveShiftAssignmentRuleResult
                            }
                        );
                        if (consecutiveShiftAssignmentRuleResult) return consecutiveShiftAssignmentRuleResult;

                        remainingShifts.push(shift);
                        return null;
                    })
                    .filter(Boolean),
            ],
        };

        const lowestWorkingHoursStaff = sortStaffByWorkingHours(
            defaultStaff.filter((s: any) => !assignedStaff.has(s.name)),
            workingHoursTracker,
            dateStr
        ).slice(0, remainingShifts.length);

        remainingShifts.forEach((shift) => {
            const normalAssignment = assignNormally(
                shift,
                format(currentDate, 'EEE'),
                ruleTracking,
                defaultStaff,
                assignedStaff,
                workingHoursTracker,
                format(currentDate, 'yyyy-MM-dd'),
                lowestWorkingHoursStaff,
                shiftCountTracker,
                consecutiveShiftAssignmentRules,
                defaultShiftExceptions
            );
            if (normalAssignment.staff && normalAssignment.staff.length > 0) {
                dayRoster.shifts.push(normalAssignment);
            }
        });

        dayRoster?.shifts?.forEach((shift) => {
            if (shift.staff && shift.staff.length > 0) {
                const selectedStaff = shift.staff[0];
                if (selectedStaff) {
                    updateWorkingHoursTracker(workingHoursTracker, selectedStaff, shift);
                    updateShiftCountTracker(shiftCountTracker, selectedStaff, shift);
                }
            }
        });

        calendarData.push(dayRoster);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return { calendarData };
}

// --- Helper functions ---

function initializeWorkingHoursTracker(defaultStaff: any[]) {
    const tracker: { [key: string]: number } = {};
    defaultStaff.forEach((staff) => {
        tracker[staff.name] = 0;
    });
    return tracker;
}

function initializeShiftCountTracker(defaultStaff: any[], defaultShifts: any[]) {
    const tracker: { [staffName: string]: { [shiftName: string]: number } } = {};
    defaultStaff.forEach((staff) => {
        tracker[staff.name] = {};
        defaultShifts.forEach((shift) => {
            tracker[staff.name][shift.name] = 0;
        });
    });
    return tracker;
}

function updateGapDaysTracking(gapTracking: any) {
    Object.keys(gapTracking).forEach((ruleId) => {
        Object.keys(gapTracking[ruleId]).forEach((staffName) => {
            gapTracking[ruleId][staffName]--;
            if (gapTracking[ruleId][staffName] <= 0) {
                delete gapTracking[ruleId][staffName];
            }
        });
    });
}

function getApplicableShiftsForDay(shifts: any[], consecutiveShiftAssignmentRules: any[], dayOfWeek: string) {
    const consecutiveShiftAssignmentRuleShifts = consecutiveShiftAssignmentRules.flatMap((rule) => rule.shifts);
    return shifts
        .filter(
            (shift) =>
                shift.days?.includes(dayOfWeek) && shift.name !== 'Annual Leave'
        )
        .sort((a, b) => {
            const aIsSpecial = consecutiveShiftAssignmentRuleShifts.includes(a.name);
            const bIsSpecial = consecutiveShiftAssignmentRuleShifts.includes(b.name);
            if (aIsSpecial && !bIsSpecial) return -1;
            if (!aIsSpecial && bIsSpecial) return 1;
            return 0;
        });
}

function processLeave(
    shift: Shift,
    staff: Staff[],
    assignedStaff: Set<string>,
    leaves: Leave[],
    currentDate: Date
) {
    // Only assign Annual Leave if the current date is within a leave period for a staff member
    if (shift.name !== 'Annual Leave') return null;

    const dayOfWeek = format(currentDate, 'EEE');
    // Only assign Annual Leave shift if there is a leave entry for this date and the shift is configured for this day
    if (!shift.days || !shift.days.includes(dayOfWeek)) return null;

    const eligibleStaff = staff.filter(
        (s) => leaves.some(
                (leave) =>
                    leave.staff === s &&
                    leave.from <= currentDate &&
                    leave.to >= currentDate
            )
    );

    // If there is no leave for this date, do not assign Annual Leave shift at all
    if (eligibleStaff.length === 0) return null;

    eligibleStaff.forEach((s) => assignedStaff.add(s.name));
    return { ...shift, staff: eligibleStaff };
}

function processFixedShift(
    shift: any,
    dayOfWeek: string,
    staff: any[],
    assignedStaff: Set<string>,
    fixedShifts: any[]
) {
    const fixedShift = fixedShifts.find(
        (fs) => fs.shift === shift.name && fs.days.includes(dayOfWeek)
    );
    if (fixedShift) {
        const fixedStaffMember = staff.find((s: any) => s.name === fixedShift.staff);
        if (fixedStaffMember) {
            assignedStaff.add(fixedStaffMember.name);
            return { ...shift, staff: [fixedStaffMember] };
        }
    }
    return null;
}

function processConsecutiveShiftAssignmentRuleConsecutiveDays(
    shift: any,
    dayOfWeek: string,
    ruleTracking: any,
    staff: any[],
    assignedStaff: Set<string>,
    consecutiveShiftAssignmentRules: ConsecutiveShiftAssignmentRule[],
    shiftExceptions: any[],
    shiftCountTracker: any = {}
) {
    let ruleId = null;
    let ruleConfig = null;
    let ruleType: 'Shift' | 'Staff' | null = null;

    // Check for Shift-based rules
    for (let i = 0; i < consecutiveShiftAssignmentRules.length; i++) {
        const rule = consecutiveShiftAssignmentRules[i];
        if (rule.type === 'Shift' && rule.shifts.includes(shift.name)) {
            ruleId = `rule_${i}`;
            ruleConfig = rule;
            ruleType = 'Shift';
            break;
        }
    }

    // Check for Staff-based rules
    if (!ruleId) {
        for (let i = 0; i < consecutiveShiftAssignmentRules.length; i++) {
            const rule = consecutiveShiftAssignmentRules[i];
            if (
                rule.type === 'Staff' &&
                rule.staffMembers &&
                rule.staffMembers.length > 0
            ) {
                // Find eligible staff for this shift
                const eligibleStaff = staff.filter(
                    (s: any) =>
                        rule.staffMembers.includes(s.name) &&
                        shift.categories?.includes(s.staffCategory) &&
                        !assignedStaff.has(s.name) &&
                        !isStaffInShiftException(s.name, shift.name, dayOfWeek, shiftExceptions)
                );
                if (eligibleStaff.length > 0) {
                    ruleId = `rule_${i}`;
                    ruleConfig = rule;
                    ruleType = 'Staff';
                    break;
                }
            }
        }
    }

    if (ruleId && ruleConfig) {
        const consecutiveTracking = ruleTracking.consecutive[ruleId];
        const gapTracking = ruleTracking.gap[ruleId];

        // For Shift-based rules, use the same logic as before
        if (ruleType === 'Shift') {
            if (consecutiveTracking.currentStaff && consecutiveTracking.daysRemaining > 0) {
                const currentStaffMember = staff.find((s: any) => s.name === consecutiveTracking.currentStaff);
                if (
                    currentStaffMember &&
                    shift.categories?.includes(currentStaffMember.staffCategory) &&
                    !assignedStaff.has(currentStaffMember.name) &&
                    !isStaffInShiftException(currentStaffMember.name, shift.name, dayOfWeek, shiftExceptions)
                ) {
                    assignedStaff.add(currentStaffMember.name);
                    consecutiveTracking.daysRemaining--;
                    if (consecutiveTracking.daysRemaining === 0) {
                        gapTracking[currentStaffMember.name] = ruleConfig.gapDays;
                        consecutiveTracking.currentStaff = null;
                    }
                    return { ...shift, staff: [currentStaffMember] };
                }
            }
            const eligibleStaff = staff.filter(
                (s: any) =>
                    shift.categories?.includes(s.staffCategory) &&
                    !assignedStaff.has(s.name) &&
                    !isStaffInShiftException(s.name, shift.name, dayOfWeek, shiftExceptions) &&
                    !gapTracking[s.name]
            );
            if (eligibleStaff.length > 0) {
                const selectedStaff = findStaffWithMinimumShifts(
                    shift,
                    eligibleStaff,
                    shiftCountTracker,
                    dayOfWeek
                );
                if (selectedStaff) {
                    assignedStaff.add(selectedStaff.name);
                    consecutiveTracking.currentStaff = selectedStaff.name;
                    consecutiveTracking.daysRemaining = ruleConfig.consecutiveDays - 1;
                    return { ...shift, staff: [selectedStaff] };
                }
            }
        }

        // For Staff-based rules, track consecutive days for each staff member in staffMembers
        if (ruleType === 'Staff') {
            // Find staff eligible for assignment today
            const eligibleStaff = staff.filter(
                (s: any) =>
                    ruleConfig.staffMembers.includes(s.name) &&
                    shift.categories?.includes(s.staffCategory) &&
                    !assignedStaff.has(s.name) &&
                    !isStaffInShiftException(s.name, shift.name, dayOfWeek, shiftExceptions) &&
                    !gapTracking[s.name]
            );

            // For each eligible staff, track their consecutive assignment
            for (const s of eligibleStaff) {
                if (!consecutiveTracking[s.name]) {
                    consecutiveTracking[s.name] = 0;
                }
                // If staff is already in consecutive assignment
                if (consecutiveTracking[s.name] > 0) {
                    assignedStaff.add(s.name);
                    consecutiveTracking[s.name]--;
                    if (consecutiveTracking[s.name] === 0) {
                        gapTracking[s.name] = ruleConfig.gapDays;
                    }
                    return { ...shift, staff: [s] };
                }
            }

            // If not in consecutive assignment, start for a staff member
            if (eligibleStaff.length > 0) {
                // Pick the staff with minimum shifts
                const selectedStaff = findStaffWithMinimumShifts(
                    shift,
                    eligibleStaff,
                    shiftCountTracker,
                    dayOfWeek
                );
                if (selectedStaff) {
                    assignedStaff.add(selectedStaff.name);
                    consecutiveTracking[selectedStaff.name] = ruleConfig.consecutiveDays - 1;
                    return { ...shift, staff: [selectedStaff] };
                }
            }
        }
    }
    return null;
}

function findStaffWithMinimumShifts(
    shift: any,
    staffList: any[],
    shiftCountTracker: any,
    dayOfWeek: string
) {
    let minShifts = Number.MAX_SAFE_INTEGER;
    const staffWithShiftCounts = staffList.map((s: any) => {
        const count = (shiftCountTracker[s.name] && shiftCountTracker[s.name][shift.name]) || 0;
        if (count < minShifts) minShifts = count;
        return { staff: s, count };
    });
    const staffWithMinShifts = staffWithShiftCounts.filter((item: { staff: any; count: number }) => item.count === minShifts);
    const eligibleStaff = staffWithMinShifts.map((item: any) => item.staff);
    const selectedStaffObj = eligibleStaff[Math.floor(Math.random() * eligibleStaff.length)];
    return selectedStaffObj || null;
}

function assignNormally(
    shift: any,
    dayOfWeek: string,
    ruleTracking: any,
    staff: any[],
    assignedStaff: Set<string>,
    workingHoursTracker: any,
    dateStr: string,
    lowestWorkingHoursStaff: any[],
    shiftCountTracker: any = {},
    consecutiveShiftAssignmentRules: any[],
    shiftExceptions: any[]
) {
    if (lowestWorkingHoursStaff.length > 0) {
        const selectedStaff = findStaffWithMinimumShifts(
            shift,
            lowestWorkingHoursStaff,
            shiftCountTracker,
            dayOfWeek
        );
        if (selectedStaff) {
            assignedStaff.add(selectedStaff.name);
            return { ...shift, staff: [selectedStaff] };
        }
    }
    const availableStaff = getAvailableStaff(
        shift,
        dayOfWeek,
        staff,
        assignedStaff,
        ruleTracking,
        [],
        consecutiveShiftAssignmentRules,
        shiftExceptions
    );
    const sortedStaff = sortStaffByWorkingHours(availableStaff, workingHoursTracker, dateStr);
    if (sortedStaff.length > 0) {
        const selectedStaff = selectStaffWithLowestHours(sortedStaff);
        assignedStaff.add(selectedStaff.name);
        return { ...shift, staff: [selectedStaff] };
    }
    return { ...shift, staff: [] };
}

function getAvailableStaff(
    shift: any,
    dayOfWeek: string,
    staff: any[],
    assignedStaff: Set<string>,
    ruleTracking: any,
    selectedStaffs: any[] = [],
    consecutiveShiftAssignmentRules: any[],
    shiftExceptions: any[]
) {
    const staffPool = selectedStaffs.length > 0 ? selectedStaffs : staff;
    return staffPool.filter(
        (s: any) =>
            shift.categories?.includes(s.staffCategory) &&
            !assignedStaff.has(s.name) &&
            !isStaffInShiftException(s.name, shift.name, dayOfWeek, shiftExceptions) &&
            !isStaffInConsecutiveShiftAssignmentRuleGapDays(s.name, shift.name, ruleTracking, consecutiveShiftAssignmentRules)
    );
}

function isStaffInShiftException(staffName: string, shiftName: string, dayOfWeek: string, shiftExceptions: any[]) {
    return shiftExceptions.some(
        (ex) => ex.staff === staffName && ex.shift === shiftName && ex.days.includes(dayOfWeek)
    );
}

function isStaffInConsecutiveShiftAssignmentRuleGapDays(staffName: string, shiftName: string, ruleTracking: any, consecutiveShiftAssignmentRules: any[]) {
    for (let i = 0; i < consecutiveShiftAssignmentRules.length; i++) {
        if (consecutiveShiftAssignmentRules[i].shifts.includes(shiftName)) {
            const ruleId = `rule_${i}`;
            if (ruleTracking.gap[ruleId] && ruleTracking.gap[ruleId][staffName] > 0) {
                return true;
            }
        }
    }
    return false;
}

function sortStaffByWorkingHours(availableStaff: any[], workingHoursTracker: any, dateStr: string) {
    const staffWithHours = availableStaff.map((staff) => ({
        ...staff,
        hours: calculateWorkingHours(staff, dateStr, workingHoursTracker),
    }));
    return staffWithHours.sort((a, b) => a.hours - b.hours);
}

function calculateWorkingHours(staff: any, dateStr: string, workingHoursTracker: any) {
    return workingHoursTracker[staff.name];
}

function selectStaffWithLowestHours(sortedStaff: any[]) {
    const lowestHours = sortedStaff[0].hours;
    const candidates = sortedStaff.filter((s) => s.hours === lowestHours);
    return candidates[Math.floor(Math.random() * candidates.length)];
}

function updateWorkingHoursTracker(workingHoursTracker: any, staff: any, shift: any) {
    const hours = shift.duration / staff.fte;
    workingHoursTracker[staff.name] += hours;
}

function updateShiftCountTracker(shiftCountTracker: any, staff: any, shift: any) {
    if (staff && staff.name && shift && shift.name) {
        if (!shiftCountTracker[staff.name]) {
            shiftCountTracker[staff.name] = {};
        }
        if (!shiftCountTracker[staff.name][shift.name]) {
            shiftCountTracker[staff.name][shift.name] = 0;
        }
        shiftCountTracker[staff.name][shift.name]++;
    }
}

// New function to handle roster generation from the UI
export const handleGenerateRoster = async (
  dateRange: { from: Date | null; to: Date | null },
  shifts: Shift[],
  staff: Staff[],
  consecutiveShiftAssignmentRules: ConsecutiveShiftAssignmentRule[],
  fixedShifts: FixedShift[],
  shiftExceptions: ShiftException[],
  publicHolidays: PublicHoliday[],
  leaves: Leave[],
  setCalendarData: (data: any) => void
) => {
  if (dateRange.from && dateRange.to) {
    const startDate = format(dateRange.from, 'yyyy-MM-dd');
    const endDate = format(dateRange.to, 'yyyy-MM-dd');
    const roster = await generateRoster({
      startDate,
      endDate,
      config: {
        shifts,
        staff,
        consecutiveShiftAssignmentRules, // model objects
        fixedShifts,
        shiftExceptions,
        publicHolidays, // model objects
        leaves, // model objects
      },
    });
    setCalendarData(roster.calendarData);
  } else {
    alert('Please select a valid date range.');
  }
};