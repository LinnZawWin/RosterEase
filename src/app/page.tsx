"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay, parse } from 'date-fns';
import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { useId } from 'react';
import PublicHolidayConfiguration from '@/components/PublicHolidayConfiguration';
import dynamic from 'next/dynamic';
import CategoryConfiguration from '@/components/StaffCategoryConfiguration';
import StaffConfiguration from '@/components/StaffConfiguration';
import ShiftConfiguration from '@/components/ShiftConfiguration';
import FixedShiftConfiguration from '@/components/FixedShiftConfiguration';
import ShiftExceptionConfiguration from '@/components/ShiftExceptionConfiguration';
import ConsecutiveRuleConfiguration from '@/components/ConsecutiveRuleConfiguration';

// Dynamically import the component with client-side rendering only
const ReactSelect = dynamic(() => import('react-select'), { ssr: false });

const defaultCategories = ['AT', 'AT-C', 'BT'];

const defaultStaff = [
  { name: 'AT-1', category: 'AT', fte: 1 },
  { name: 'AT-2', category: 'AT', fte: 1 },
  { name: 'AT-3', category: 'AT', fte: 1 },
  { name: 'AT-C', category: 'AT-C', fte: 1 },
  { name: 'BT-1', category: 'BT', fte: 1 },
  { name: 'BT-2', category: 'BT', fte: 0.5 },
  { name: 'BT-3', category: 'BT', fte: 0.5 },
];

const defaultShifts = [
  { order: 1, name: 'Regular day', startTime: '08:00', endTime: '16:00', duration: 8, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], categories: ['AT', 'AT-C', 'BT'] },
  { order: 2, name: 'Evening', startTime: '14:00', endTime: '22:00', duration: 8, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], categories: ['AT', 'AT-C', 'BT'] },
  { order: 3, name: 'Night', startTime: '21:30', endTime: '08:30', duration: 11, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], categories: ['AT', 'BT'] },
  { order: 4, name: 'Clinic', startTime: '08:00', endTime: '16:30', duration: 8.5, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], categories: ['AT', 'AT-C'] },
  { order: 5, name: 'Day (Weekend)', startTime: '08:00', endTime: '20:30', duration: 12.5, days: ['Sat', 'Sun', 'PH'], categories: ['AT', 'AT-C', 'BT'] },
  { order: 6, name: 'Night (Weekend)', startTime: '20:00', endTime: '08:30', duration: 12.5, days: ['Sat', 'Sun', 'PH'], categories: ['AT', 'BT'] },
];

const defaultFixedShifts = [
  {
    staff: 'AT-C',
    shift: 'Clinic',
    days: ['Mon', 'Wed', 'Thu'],
  },
];
const defaultShiftExceptions = [
  {
    staff: 'AT-C',
    shift: 'Clinic',
    days: ['Tue', 'Fri'],
  },
];

const defaultSpecialRules = [
  {
    shifts: ['Night', 'Night (Weekend)'],
    consecutiveDays: 3,
    gapDays: 3,
  },
];

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, '0');
  const minute = (i % 2 === 0) ? '00' : '30';
  return `${hour}:${minute}`;
});

const daysOfWeekOptions = [
  { value: 'Sun', label: 'Sunday' },
  { value: 'Mon', label: 'Monday' },
  { value: 'Tue', label: 'Tuesday' },
  { value: 'Wed', label: 'Wednesday' },
  { value: 'Thu', label: 'Thursday' },
  { value: 'Fri', label: 'Friday' },
  { value: 'Sat', label: 'Saturday' },
  { value: 'PH', label: 'Public Holiday' }
];

type Staff = {
  name: string;
  category: string;
  fte: number;
};

type ShiftWithStaff = {
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  staff: Staff[];
  days?: (string | never)[]; // Explicitly define the type of 'days' as an array of strings or never
  order: number; // Add the 'order' property to the type
};

export default function Home() {
  const [categories, setCategories] = useState(defaultCategories);
  const [dateRange, setDateRange] = useState<{ from: Date | null, to: Date | null }>({
    from: null,
    to: null,
  });
  const [staff, setStaff] = useState(defaultStaff);
  const [shifts, setShifts] = useState(defaultShifts);
  const [fixedShifts, setFixedShifts] = useState(defaultFixedShifts);
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [shiftExceptions, setShiftExceptions] = useState(defaultShiftExceptions);
  const [specialRules, setSpecialRules] = useState(defaultSpecialRules);
  const [publicHolidays, setPublicHolidaysState] = useState<string[]>([]);

  const setPublicHolidays = useCallback((holidays: { name: string; date: string }[]) => {
    setPublicHolidaysState(holidays.map((holiday) => holiday.date));
  }, []);

  const shiftColors: { [key: string]: string } = {
    'Regular day': 'bg-blue-500',
    'Evening': 'bg-green-500',
    'Night': 'bg-red-500',
    'Clinic': 'bg-yellow-500',
    'Day (Weekend)': 'bg-purple-500',
    'Night (Weekend)': 'bg-pink-500',
  };

  const formattedDateRange = dateRange.from && dateRange.to
    ? `${format(dateRange.from, 'yyyy-MM-dd')} - ${format(dateRange.to, 'yyyy-MM-dd')}`
    : 'Select Date Range';

  const isValidDateRange = dateRange.from && dateRange.to && dateRange.to > dateRange.from;

  const handleResetConfiguration = () => {
    setCategories(defaultCategories);
    setStaff(defaultStaff);
    setShifts(defaultShifts);
  };

  const calculateDuration = (startTime: string, endTime: string): number => {
    const start = parse(startTime, 'HH:mm', new Date());
    const end = parse(endTime, 'HH:mm', new Date());
    let duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Duration in hours

    if (duration < 0) {
      duration += 24; // If the end time is earlier than the start time (e.g., night shift), add 24 hours
    }

    return duration;
  };

  const addShift = () => {
    const newOrder = shifts.length > 0 ? Math.max(...shifts.map(shift => shift.order)) + 1 : 1;
    setShifts([...shifts, { order: newOrder, name: '', startTime: '08:00', endTime: '16:00', duration: 8, days: [], categories: categories }]);
  };

  const removeShift = (index: number) => {
    const newShifts = [...shifts];
    newShifts.splice(index, 1);
    setShifts(newShifts);
  };

  const updateShift = (index: number, field: string, value: any) => {
    const newShifts = [...shifts];
    const updatedShift = { ...newShifts[index], [field]: value };

    // Calculate duration if startTime or endTime is updated
    if (field === 'startTime' || field === 'endTime') {
      const startTime = field === 'startTime' ? value : updatedShift.startTime;
      const endTime = field === 'endTime' ? value : updatedShift.endTime;
      updatedShift.duration = calculateDuration(startTime, endTime);
    }

    newShifts[index] = updatedShift;
    setShifts(newShifts);
  };

  const updateShiftDays = (index: number, selectedDays: any) => {
    const newShifts = [...shifts];
    newShifts[index].days = selectedDays.map((day: any) => day.value);
    setShifts(newShifts);
  };

  const updateFixedShift = (index: number, field: string, value: any) => {
    const newFixedShifts = [...calendarData];
    newFixedShifts[index] = { ...newFixedShifts[index], [field]: value };
    setCalendarData(newFixedShifts);
  };
  
  const removeFixedShift = (index: number) => {
    const newFixedShifts = [...calendarData];
    newFixedShifts.splice(index, 1);
    setCalendarData(newFixedShifts);
  };

  const addFixedShift = () => {
    setCalendarData([...calendarData, { staff: '', shift: '', days: [] }]);
  };

  const updateShiftException = (index: number, field: string, value: any) => {
    const newShiftExceptions = [...shiftExceptions];
    newShiftExceptions[index] = { ...newShiftExceptions[index], [field]: value };
    setShiftExceptions(newShiftExceptions);
  };

  const removeShiftException = (index: number) => {
    const newShiftExceptions = [...shiftExceptions];
    newShiftExceptions.splice(index, 1);
    setShiftExceptions(newShiftExceptions);
  };

  const addShiftException = () => {
    setShiftExceptions([...shiftExceptions, { staff: '', shift: '', days: [] }]);
  };
  
  async function generateRoster({ startDate, endDate }: { startDate: string; endDate: string; }) {
    const roster = {
      shifts: defaultShifts,
      staff: defaultStaff,
    };

    const calendarData = [];
    let currentDate = new Date(startDate);

    // Split tracking into consecutive and gap tracking
    const ruleTracking: {
      consecutive: { [key: string]: { currentStaff: string | null; daysRemaining: number } };
      gap: { [key: string]: { [staffName: string]: number } };
    } = {
      consecutive: {},
      gap: {}
    };

    // Initialize separate tracking for consecutive and gap periods
    specialRules.forEach((rule, index) => {
      const ruleId = `rule_${index}`;
      
      // For consecutive day tracking
      ruleTracking.consecutive[ruleId] = {
        currentStaff: null,
        daysRemaining: 0
      };
      
      // For gap day tracking - track by staff name
      ruleTracking.gap[ruleId] = {};
    });

    const workingHoursTracker = initializeWorkingHoursTracker();
    
    // Initialize shift count tracker
    const shiftCountTracker = initializeShiftCountTracker();

    // Extract public holiday dates from PublicHolidayConfiguration
    while (currentDate <= new Date(endDate)) {
      const dayOfWeek = format(currentDate, 'EEE');
      const dateStr = format(currentDate, 'yyyy-MM-dd');

      // Update gap days tracking - decrement for each staff in gap period
      updateGapDaysTracking(ruleTracking.gap);

      // Check if the current date is a public holiday
      const isPublicHoliday = publicHolidays.includes(dateStr);
      const applicableShifts = getApplicableShiftsForDay(
        roster.shifts,
        isPublicHoliday ? 'PH' : dayOfWeek
      );
      const assignedStaff = new Set<string>();

      const remainingShifts: any[] = []; // Initialize an array to hold remaining shifts

      const dayRoster = {
        date: dateStr,
        shifts: applicableShifts.map((shift) => {
          // Process fixed shifts and special rules as before
          const fixedShiftResult = processFixedShift(shift, dayOfWeek, roster, assignedStaff);
          if (fixedShiftResult) {
        const selectedStaff = fixedShiftResult.staff[0]; // Ensure selectedStaff is defined
        return fixedShiftResult;
          }

          const specialRuleResult = processSpecialRuleConsecutiveDays(
        shift,
        dayOfWeek,
        ruleTracking,
        roster,
        assignedStaff,
        shiftCountTracker
          );

          if (specialRuleResult) {
        const selectedStaff = specialRuleResult.staff[0]; // Ensure selectedStaff is defined
        return specialRuleResult;
          }

          // Add the shift to remainingShifts for later processing
          remainingShifts.push(shift);
          return null; // Return null for now, as it will be processed later
        }).filter(Boolean), // Filter out null values
      };

      // Process remaining shifts in another loop
      const lowestWorkingHoursStaff = sortStaffByWorkingHours(
        roster.staff.filter((s: any) => !assignedStaff.has(s.name)),
        workingHoursTracker,
        dateStr
      ).slice(0, remainingShifts.length); // Get the x number of staff with the lowest working hours

      console.log(`${format(currentDate, 'yyyy-MM-dd (EEE)')} | ${sortStaffByWorkingHours(roster.staff, workingHoursTracker, dateStr).map(s => `${s.name}: ${s.hours}`).join(' | ')}`);

      remainingShifts.forEach((shift) => {
        const normalAssignment = assignNormally(
          shift,
          format(currentDate, 'EEE'),
          ruleTracking,
          roster,
          assignedStaff,
          workingHoursTracker,
          format(currentDate, 'yyyy-MM-dd'),
          lowestWorkingHoursStaff,
          shiftCountTracker
        );
        if (normalAssignment.staff && normalAssignment.staff.length > 0) {
          dayRoster.shifts.push(normalAssignment);
        }
      });

      // Update working hours and shift count trackers once for all assignments in this day
      dayRoster?.shifts?.forEach(shift => {
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

    return { ...roster, calendarData };
  }

  function initializeWorkingHoursTracker() {
    const tracker: { [key: string]: number } = {};
    defaultStaff.forEach((staff) => {
      tracker[staff.name] = 0;
    });
    return tracker;
  }

  function updateGapDaysTracking(gapTracking: any) {
    // For each rule
    Object.keys(gapTracking).forEach((ruleId) => {
      // For each staff in gap period for this rule
      Object.keys(gapTracking[ruleId]).forEach((staffName) => {
        gapTracking[ruleId][staffName]--;
        
        // If gap period is over, remove staff from gap tracking
        if (gapTracking[ruleId][staffName] <= 0) {
          delete gapTracking[ruleId][staffName];
        }
      });
    });
  }

  function getApplicableShiftsForDay(shifts: any[], dayOfWeek: string) {
    const specialRuleShifts = specialRules.flatMap((rule) => rule.shifts);
    return shifts
      .filter((shift) => shift.days?.includes(dayOfWeek))
      .sort((a, b) => {
        const aIsSpecial = specialRuleShifts.includes(a.name);
        const bIsSpecial = specialRuleShifts.includes(b.name);
        if (aIsSpecial && !bIsSpecial) return -1;
        if (!aIsSpecial && bIsSpecial) return 1;
        return 0;
      });
  }

  function processFixedShift(shift: any, dayOfWeek: string, roster: any, assignedStaff: Set<string>) {
    const fixedShift = defaultFixedShifts.find(
      (fs) => fs.shift === shift.name && fs.days.includes(dayOfWeek)
    );

    if (fixedShift) {
      const fixedStaffMember = roster.staff.find((s: any) => s.name === fixedShift.staff);
      if (fixedStaffMember) {
        assignedStaff.add(fixedStaffMember.name);
        return { ...shift, staff: [fixedStaffMember] };
      }
    }
    return null;
  }

  function processSpecialRuleConsecutiveDays(
    shift: any,
    dayOfWeek: string,
    ruleTracking: any,
    roster: any,
    assignedStaff: Set<string>,
    shiftCountTracker: any = {} // Make the parameter optional with a default value
  ) {
    let ruleId = null;
    let ruleConfig = null;

    for (let i = 0; i < specialRules.length; i++) {
      if (specialRules[i].shifts.includes(shift.name)) {
        ruleId = `rule_${i}`;
        ruleConfig = specialRules[i];
        break;
      }
    }

    if (ruleId && ruleConfig) {
      const consecutiveTracking = ruleTracking.consecutive[ruleId];
      const gapTracking = ruleTracking.gap[ruleId];

      // Step 1: Check if we have an active staff member in consecutive assignment
      if (consecutiveTracking.currentStaff && consecutiveTracking.daysRemaining > 0) {
        const currentStaffMember = roster.staff.find((s: any) => s.name === consecutiveTracking.currentStaff);
        
        if (
          currentStaffMember &&
          shift.categories?.includes(currentStaffMember.category) &&
          !assignedStaff.has(currentStaffMember.name) &&
          !isStaffInShiftException(currentStaffMember.name, shift.name, dayOfWeek)
        ) {
          // Continue the consecutive assignment
          assignedStaff.add(currentStaffMember.name);
          consecutiveTracking.daysRemaining--;
          // If they've completed their consecutive days, move them to gap period
          if (consecutiveTracking.daysRemaining === 0) {
            // Start gap period for this staff member
            gapTracking[currentStaffMember.name] = ruleConfig.gapDays;
            // Reset consecutive tracking
            consecutiveTracking.currentStaff = null;
          }
          
          return { ...shift, staff: [currentStaffMember] };
        }
      }
      
      // Step 2: If no active staff or current one can't work, find a new eligible staff
      const eligibleStaff = roster.staff.filter(
        (s: any) =>
          shift.categories?.includes(s.category) &&
          !assignedStaff.has(s.name) &&
          !isStaffInShiftException(s.name, shift.name, dayOfWeek) &&
          !gapTracking[s.name] // Not in gap period
      );
      
      if (eligibleStaff.length > 0) {
        const selectedStaff = findStaffWithMinimumShifts(shift, eligibleStaff, shiftCountTracker, dayOfWeek, roster, assignedStaff, ruleTracking);
        
        if (selectedStaff) {
          assignedStaff.add(selectedStaff.name);
          
          // Start a new consecutive assignment
          consecutiveTracking.currentStaff = selectedStaff.name;
          consecutiveTracking.daysRemaining = ruleConfig.consecutiveDays - 1; // Already worked one day
          
          return { ...shift, staff: [selectedStaff] };
        }
      }
    }
    
    return null;
  }

  function findStaffWithMinimumShifts(
    shift: any,
    staffList: any[],
    shiftCountTracker: any,
    dayOfWeek: string,
    roster: any,
    assignedStaff: Set<string>,
    ruleTracking: any
  ) {
    let minShifts = Number.MAX_SAFE_INTEGER;
    const staffWithShiftCounts = staffList.map((s: any) => {
      // Use shift count if available, otherwise default to 0
      const count = (shiftCountTracker[s.name] && shiftCountTracker[s.name][shift.name]) || 0;
      if (count < minShifts) minShifts = count;
      return { staff: s, count };
    });

    // Filter to only include staff with the minimum count
    const staffWithMinShifts = staffWithShiftCounts.filter((item: { staff: any; count: number }) => item.count === minShifts);

    const eligibleStaff = getAvailableStaff(
      shift,
      dayOfWeek,
      roster,
      assignedStaff,
      ruleTracking,
      staffWithMinShifts
    );

    // Select a staff member randomly from the eligible staff with minimum shifts
    const selectedStaffObj = eligibleStaff[Math.floor(Math.random() * eligibleStaff.length)];
    return selectedStaffObj || null;
  }

  function assignNormally(
    shift: any,
    dayOfWeek: string,
    ruleTracking: any,
    roster: any,
    assignedStaff: Set<string>,
    workingHoursTracker: any,
    dateStr: string,
    lowestWorkingHoursStaff: any[],
    shiftCountTracker: any = {} // Make the parameter optional with a default value
  ) {
    if (lowestWorkingHoursStaff.length > 0) {
      const selectedStaff = findStaffWithMinimumShifts(
        shift,
        lowestWorkingHoursStaff,
        shiftCountTracker,
        dayOfWeek,
        roster,
        assignedStaff,
        ruleTracking
      );
      if (selectedStaff) {
        assignedStaff.add(selectedStaff.name);
        return { ...shift, staff: [selectedStaff] };
      }
    }

    const availableStaff = getAvailableStaff(shift, dayOfWeek, roster, assignedStaff, ruleTracking);

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
    roster: any,
    assignedStaff: Set<string>,
    ruleTracking: any,
    selectedStaffs: any[] = []
  ) {
    const staffPool = selectedStaffs.length > 0 ? selectedStaffs : roster.staff; // Use selectedStaffs if not empty
    return staffPool.filter(
      (s: any) =>
        shift.categories?.includes(s.category) &&
        !assignedStaff.has(s.name) &&
        !isStaffInShiftException(s.name, shift.name, dayOfWeek) &&
        !isStaffInSpecialRuleGapDays(s.name, shift.name, ruleTracking)
    );
  }

  function isStaffInShiftException(staffName: string, shiftName: string, dayOfWeek: string) {
    return defaultShiftExceptions.some(
      (ex) => ex.staff === staffName && ex.shift === shiftName && ex.days.includes(dayOfWeek)
    );
  }

  function isStaffInSpecialRuleGapDays(staffName: string, shiftName: string, ruleTracking: any) {
    // Check if staff is in gap period for any rule that covers this shift
    for (let i = 0; i < specialRules.length; i++) {
      if (specialRules[i].shifts.includes(shiftName)) {
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

  /*
  function startConsecutiveDayTrackingIfApplicable(
    shift: any,
    ruleTracking: any,
    selectedStaff: any,
    isSingleCandidate: boolean
  ) {
    if (isSingleCandidate) {
      const ruleId = Object.keys(ruleTracking).find((id) =>
        specialRules[parseInt(id.split('_')[1])] && specialRules[parseInt(id.split('_')[1])].shifts.includes(shift.name)
      );

      if (ruleId) {
        const tracking = ruleTracking[ruleId];
        tracking.currentStaff = selectedStaff.name;
        tracking.daysRemaining = specialRules[parseInt(ruleId.split('_')[1])].consecutiveDays - 1;
      }
    }
  }
  */

  function initializeShiftCountTracker() {
    const tracker: { [staffName: string]: { [shiftName: string]: number } } = {};
    
    defaultStaff.forEach((staff) => {
      tracker[staff.name] = {};
      defaultShifts.forEach((shift) => {
        tracker[staff.name][shift.name] = 0;
      });
    });
    
    return tracker;
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

  // Add this at the top of your component
  const selectId = useId();
  
  // Then use it to create stable IDs for your react-select components

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">RosterEase</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Generate and manage your staff rosters with ease.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
            <CategoryConfiguration categories={categories} setCategories={setCategories} />
            <StaffConfiguration staff={staff} categories={categories} setStaff={setStaff} />
            <ShiftConfiguration
              shifts={shifts}
              categories={categories}
              daysOfWeekOptions={daysOfWeekOptions}
              timeOptions={timeOptions}
              updateShift={updateShift}
              updateShiftDays={updateShiftDays}
              addShift={addShift}
              removeShift={removeShift}
            />
            <FixedShiftConfiguration
              fixedShifts={fixedShifts}
              staff={staff}
              shifts={shifts}
              daysOfWeekOptions={daysOfWeekOptions}
              updateFixedShift={updateFixedShift}
              removeFixedShift={removeFixedShift}
              addFixedShift={addFixedShift}
            />
            <ShiftExceptionConfiguration
              shiftExceptions={shiftExceptions}
              staff={staff}
              shifts={shifts}
              daysOfWeekOptions={daysOfWeekOptions}
              updateShiftException={updateShiftException}
              removeShiftException={removeShiftException}
              addShiftException={addShiftException}
            />
            <ConsecutiveRuleConfiguration
              specialRules={specialRules}
              shifts={shifts}
              setSpecialRules={setSpecialRules}
            />
            <Card>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                  <label className="block text-sm font-medium text-gray-700">Date Range:</label>
                    <div className="flex gap-2">
                    <Input
                      type="date"
                      value={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                      onChange={(e) => {
                      const newFromDate = e.target.value ? new Date(e.target.value) : undefined;
                      if (newFromDate && newFromDate <= new Date()) {
                      alert('From date must be later than the current date.');
                      return;
                      }
                      setDateRange((prev) => {
                      const newToDate = newFromDate
                      ? new Date(newFromDate.getFullYear(), newFromDate.getMonth() + 3, newFromDate.getDate() - 1)
                      : null;
                      return { from: newFromDate || null, to: newToDate };
                      });
                      }}
                      min={format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd')} // Disable dates earlier than tomorrow
                    />
                    <Input
                      type="date"
                      value={dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                      onChange={(e) => {
                      const newToDate = e.target.value ? new Date(e.target.value) : undefined;
                      if (newToDate && dateRange.from && newToDate <= dateRange.from) {
                      alert('To date must be later than the From date.');
                      return;
                      }
                      setDateRange((prev) => ({ ...prev, to: newToDate || null }));
                      }}
                      min={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd')} // Disable dates earlier than 'from' date or tomorrow
                    />
                    </div>
                </div>
                {(() => {
                  const today = new Date();
                  const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                    if (!dateRange.from) {
                    const newFromDate = firstDayOfNextMonth;
                    setDateRange((prev) => {
                      const newToDate = new Date(newFromDate.getFullYear(), newFromDate.getMonth() + 3, newFromDate.getDate() - 1);
                      return { from: newFromDate, to: newToDate };
                    });
                    }
                  return null; // Ensure a valid ReactNode is returned
                })()}
              </CardContent>
            </Card>
            <PublicHolidayConfiguration
              dateRange={dateRange}
              setPublicHolidays={setPublicHolidays} // Pass the memoized function
            />
            <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="secondary" onClick={handleResetConfiguration}>
              Reset Configuration
            </Button>
            <Button
            type="submit"
            onClick={async () => {
              if (dateRange.from && dateRange.to) {
              const startDate = format(dateRange.from, 'yyyy-MM-dd');
              const endDate = format(dateRange.to, 'yyyy-MM-dd');

              const roster = await generateRoster({
                startDate: startDate,
                endDate: endDate,
              });

              setCalendarData(roster.calendarData);
              }
            }}
            >
            Generate Roster
            </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Generated Roster Table</CardTitle>
            <CardDescription>
              View the generated roster in a table format for each month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <h3 className="text-lg font-bold">Shift Legend</h3>
              <div className="flex gap-4 mt-2">
                {Object.entries(shiftColors).map(([shiftName, color]) => (
                  <div key={shiftName} className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full ${color}`}></span>
                    <span>{shiftName}</span>
                  </div>
                ))}
              </div>
            </div>
            {dateRange.from && dateRange.to ? (
                <div className="overflow-x-auto">
                {(() => {
                  const months = [];
                  let currentDate = new Date(dateRange.from);

                  // Generate tables for each month in the range
                  while (currentDate <= dateRange.to) {
                  const start = startOfMonth(currentDate);
                  const end = endOfMonth(currentDate);
                  const days = eachDayOfInterval({ start, end });
                  const firstDayOfWeek = getDay(start); // Get the starting day of the week (0 = Sunday, 6 = Saturday)

                  months.push(
                    <div key={format(start, 'yyyy-MM')}>
                    <h3 className="text-lg font-bold mb-4">{format(start, 'MMMM yyyy')}</h3>
                    <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                      <thead>
                      <tr>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <th key={day} className="border border-gray-300 p-2 bg-gray-100">
                          {day}
                        </th>
                        ))}
                      </tr>
                      </thead>
                      <tbody>
                      {(() => {
                        const rows = [];
                        let cells: JSX.Element[] = [];

                        // Add empty cells for days before the first day of the month
                        for (let i = 0; i < firstDayOfWeek; i++) {
                        cells.push(<td key={`empty-${i}`} className="border border-gray-300 p-4"></td>);
                        }

                        // Add cells for each day of the month
                        days.forEach((day) => {
                        const formattedDay = format(day, 'yyyy-MM-dd');
                        const dayRoster = (calendarData || []).find((d) => d.date === formattedDay);
                        const isWeekend = getDay(day) === 0 || getDay(day) === 6; // Check if the day is Saturday or Sunday
                        const isPublicHoliday = publicHolidays.includes(formattedDay); // Check if the day is a public holiday

                        cells.push(
                          <td
                          key={formattedDay}
                          className={`border border-gray-300 p-4 align-top ${
                            isWeekend
                            ? 'bg-blue-100' // Weekend background color
                            : isPublicHoliday
                            ? 'bg-yellow-100' // Public holiday background color
                            : ''
                          }`}
                          >
                          <div className="font-bold">{format(day, 'd')}</div>
                          {dayRoster && (
                            <div className="text-xs mt-2">
                            {dayRoster?.shifts?.map((shift: ShiftWithStaff, index: number) => (
                              <div key={index} className="flex items-center text-gray-600">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                shiftColors[shift.name] || 'bg-gray-400'
                                } mr-2`}
                              ></span>
                              {shift.name}: {shift.staff.map((s: Staff) => s.name).join(', ')}
                              </div>
                            ))}
                            </div>
                          )}
                          </td>
                        );

                        // If the week is complete, push the row and reset cells
                        if (cells.length === 7) {
                          rows.push(<tr key={`row-${rows.length}`}>{cells}</tr>);
                          cells = [];
                        }
                        });

                        // Add remaining cells to the last row
                        if (cells.length > 0) {
                        while (cells.length < 7) {
                          cells.push(<td key={`empty-${cells.length}`} className="border border-gray-300 p-4"></td>);
                        }
                        rows.push(<tr key={`row-${rows.length}`}>{cells}</tr>);
                        }

                        return rows;
                      })()}
                      </tbody>
                    </table>
                    </div>
                  );

                  // Move to the next month
                  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                  }

                  return months;
                })()}
                </div>
            ) : (
              <p className="text-gray-500">No roster generated yet. Please generate a roster to view the table.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Staff Accumulated Hours</CardTitle>
            <CardDescription>
              View the accumulated hours assigned to each staff member for the selected date range.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dateRange.from && dateRange.to ? (
              <div className="overflow-x-auto">
              <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                <thead>
                <tr>
                  <th className="border border-gray-300 p-2 bg-gray-100">Date</th>
                  {staff.map((s) => (
                  <th key={s.name} className="border border-gray-300 p-2 bg-gray-100">
                    {s.name} ({s.fte})
                  </th>
                  ))}
                </tr>
                </thead>
                <tbody>
                {(() => {
                  const rows = [];
                  let currentDate = new Date(dateRange.from);
                  const accumulatedHours: { [key: string]: number } = {};

                  // Initialize accumulated hours for each staff
                  staff.forEach((s) => {
                  accumulatedHours[s.name] = 0;
                  });

                  while (currentDate <= dateRange.to) {
                  const formattedDate = format(currentDate, 'yyyy-MM-dd');
                  const dayRoster = calendarData.find((d) => d.date === formattedDate);

                  const row = (
                    <tr key={formattedDate}>
                    <td className="border border-gray-300 p-2">{formattedDate}</td>
                    {staff.map((s) => {
                      const dailyHours = dayRoster
                      ? dayRoster?.shifts
                        ?.sort((a: ShiftWithStaff, b: ShiftWithStaff) => a.order - b.order) // Sort shifts by order
                        ?.reduce((total: number, shift: ShiftWithStaff) => {
                          if (shift.staff.some((staffMember) => staffMember.name === s.name)) {
                          return total + shift.duration;
                          }
                          return total;
                        }, 0)
                      : 0;

                      // Add daily hours to accumulated hours
                      accumulatedHours[s.name] += dailyHours;

                      const adjustedHours = s.fte < 1 ? accumulatedHours[s.name] / s.fte : accumulatedHours[s.name];
                      const displayValue =
                      s.fte < 1
                        ? `${adjustedHours} (${accumulatedHours[s.name]})`
                        : `${accumulatedHours[s.name]}`;

                      return (
                      <td key={s.name} className="border border-gray-300 p-2 text-center">
                        {displayValue}
                      </td>
                      );
                    })}
                    </tr>
                  );

                  rows.push(row);
                  currentDate.setDate(currentDate.getDate() + 1);
                  }

                  return rows;
                })()}
                </tbody>
              </table>
              </div>
            ) : (
              <p className="text-gray-500">No data available. Please generate a roster to view accumulated hours.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Shift Assignments Summary</CardTitle>
            <CardDescription>
              View the number of shifts assigned to each staff member for each shift type.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calendarData.length > 0 ? (
              <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 bg-gray-100">Staff</th>
                {shifts.map((shift) => (
            <th key={shift.name} className="border border-gray-300 p-2 bg-gray-100">
              {shift.name}
            </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => {
                const shiftCounts: { [key: string]: number } = {};

                // Initialize shift counts for each shift type
                shifts.forEach((shift) => {
            shiftCounts[shift.name] = 0;
                });

                // Count the number of shifts assigned to the staff
                calendarData.forEach((dayRoster) => {
            dayRoster?.shifts?.forEach((shift: ShiftWithStaff) => {
              if (shift.staff.some((staffMember) => staffMember.name === s.name)) {
                shiftCounts[shift.name]++;
              }
            });
                });

                return (
            <tr key={s.name}>
              <td className="border border-gray-300 p-2">{s.name}</td>
              {shifts.map((shift) => (
                <td key={shift.name} className="border border-gray-300 p-2 text-center">
                  {shiftCounts[shift.name]}
                </td>
              ))}
            </tr>
                );
              })}
            </tbody>
          </table>
              </div>
            ) : (
              <p className="text-gray-500">No shift assignments available. Please generate a roster to view the data.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
