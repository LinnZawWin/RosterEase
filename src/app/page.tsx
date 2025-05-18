"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay, parse } from 'date-fns';
import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { useId } from 'react';
import PublicHolidayConfiguration from '@/components/PublicHolidayConfiguration';
import StaffCategoryConfiguration from '@/components/StaffCategoryConfiguration';
import StaffConfiguration from '@/components/StaffConfiguration';
import ShiftCategoryConfiguration from '@/components/ShiftCategoryConfiguration';
import ShiftConfiguration from '@/components/ShiftConfiguration';
import FixedShiftConfiguration from '@/components/FixedShiftConfiguration';
import ShiftExceptionConfiguration from '@/components/ShiftExceptionConfiguration';
import ConsecutiveRuleConfiguration from '@/components/ConsecutiveRuleConfiguration';
import LeaveConfiguration from '@/components/LeaveConfiguration';
import { generateRoster } from '@/lib/generateRoster';
import { ConsecutiveShiftAssignmentRule } from '@/models/ConsecutiveShiftAssignmentRule';
import { StaffCategory } from '@/models/StaffCategory';
import { Staff } from '@/models/Staff';
import { ShiftCategory } from '@/models/ShiftCategory';
import { Shift } from '@/models/Shift';
import { FixedShift } from '@/models/FixedShift';
import { ShiftException } from '@/models/ShiftException';
import { Leave } from '@/models/Leave';
import { PublicHoliday } from '@/models/PublicHoliday';
import { exportCalendar } from '@/lib/exportCalendar';
import GeneratedRosterTable from '@/components/GeneratedRosterTable';
import DataVerification from '@/components/DataVerification';


const defaultStaffCategories = ['AT', 'AT-C', 'BT'];

const defaultStaff = [
  { name: 'AT-1', staffCategory: 'AT', fte: 1 },
  { name: 'AT-2', staffCategory: 'AT', fte: 1 },
  { name: 'AT-3', staffCategory: 'AT', fte: 1 },
  { name: 'AT-C', staffCategory: 'AT-C', fte: 1 },
  { name: 'BT-1', staffCategory: 'BT', fte: 1 },
  { name: 'BT-2', staffCategory: 'BT', fte: 0.5 },
  { name: 'BT-3', staffCategory: 'BT', fte: 0.5 },
];

const defaultShiftCategories = ['Day', 'Evening', 'Night', 'Clinic', 'Leave'];

const defaultShifts = [
  { order: 1, shiftCategory: 'Day', name: 'Regular day', startTime: '08:00', endTime: '16:00', duration: 8, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], staffCategories: ['AT', 'AT-C', 'BT'], color: '#DDEBF7' },
  { order: 2, shiftCategory: 'Evening', name: 'Evening', startTime: '14:00', endTime: '22:00', duration: 8, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], staffCategories: ['AT', 'AT-C', 'BT'], color: '#C6E0B4' },
  { order: 3, shiftCategory: 'Night', name: 'Night', startTime: '21:30', endTime: '08:30', duration: 11, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], staffCategories: ['AT', 'BT'], color: '#FCE4D6' },
  { order: 4, shiftCategory: 'Clinic', name: 'Clinic', startTime: '08:00', endTime: '16:30', duration: 8.5, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], staffCategories: ['AT', 'AT-C'] },
  { order: 5, shiftCategory: 'Day', name: 'Day (Weekend)', startTime: '08:00', endTime: '20:30', duration: 12.5, days: ['Sat', 'Sun', 'PH'], staffCategories: ['AT', 'AT-C', 'BT'], color: '#DDEBF7' },
  { order: 6, shiftCategory: 'Night', name: 'Night (Weekend)', startTime: '20:00', endTime: '08:30', duration: 12.5, days: ['Sat', 'Sun', 'PH'], staffCategories: ['AT', 'BT'], color: '#FCE4D6' },
  { order: 7, shiftCategory: 'Leave', name: 'Annual Leave', startTime: '00:00', endTime: '23:30', duration: 8, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], staffCategories: ['AT', 'AT-C', 'BT'], color: '#B34CAF' },
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

const defaultConsecutiveShiftAssignmentRules = [
  {
    type: "Shift" as const, // explicitly type as "Shift"
    shifts: ['Night', 'Night (Weekend)'],
    staffMembers: [], // or specify staff names if needed, e.g. ['AT-1']
    consecutiveDays: 3,
    gapDays: 3,
  },
  {
    type: "Staff" as const,
    shifts: [],
    staffMembers: ['AT-2'],
    consecutiveDays: 5,
    gapDays: 5,
  }
];

const defaultLeaves = [
    {
      staff: 'AT-3',
      from: new Date('2025-05-19'),
      to: new Date('2025-05-30'),
    },
    {
      staff: 'AT-2',
      from: new Date('2025-06-23'),
      to: new Date('2025-06-27'),
    },
    {
      staff: 'AT-C',
      from: new Date('2025-07-07'),
      to: new Date('2025-07-11'),
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
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });

  const [staffCategories, setStaffCategories] = useState(defaultStaffCategories);
  const [staff, setStaff] = useState(defaultStaff);
  const [shiftCategories, setShiftCategories] = useState<string[]>(defaultShiftCategories);
  const [shifts, setShifts] = useState(defaultShifts);
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [fixedShifts, setFixedShifts] = useState(defaultFixedShifts);
  const [shiftExceptions, setShiftExceptions] = useState(defaultShiftExceptions);
  const [publicHolidays, setPublicHolidaysState] = useState<string[]>([]);
  const [consecutiveShiftAssignmentRules, setConsecutiveShiftAssignmentRules] = useState<ConsecutiveShiftAssignmentRule[]>(defaultConsecutiveShiftAssignmentRules);
  const [leaves, setLeaves] = useState(defaultLeaves);

  const setPublicHolidays = useCallback((holidays: { name: string; date: string }[]) => {
    setPublicHolidaysState(holidays.map((holiday) => holiday.date));
  }, []);

  const handleGenerateRoster = async () => {
    if (dateRange.from && dateRange.to) {
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');
      const roster = await generateRoster({
        startDate,
        endDate,
        config: {
          shifts,
          staff,
          consecutiveShiftAssignmentRules,
          fixedShifts,
          shiftExceptions,
          publicHolidays,
          leaves,
        },
      });
      setCalendarData(roster.calendarData);
    } else {
      alert('Please select a valid date range.');
    }
  };

  // Helper to get ordinal suffix for a date
  function getOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  // Use xlsx-js-style for styled Excel export
  const handleExportCalendar = () => {
    exportCalendar({
      calendarData,
      staff,
      shifts,
      publicHolidays,
      dateRange,
    });
  };

  const handleResetConfiguration = () => {
    //setCategories(defaultCategories);
    setStaff(defaultStaff);
    setShifts(defaultShifts);
  };

  const formattedDateRange = dateRange.from && dateRange.to
    ? `${format(dateRange.from, 'yyyy-MM-dd')} - ${format(dateRange.to, 'yyyy-MM-dd')}`
    : 'Select Date Range';

  const isValidDateRange = dateRange.from && dateRange.to && dateRange.to > dateRange.from;

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
    setShifts([...shifts, { order: newOrder, name: '', shiftCategory: '', startTime: '08:00', endTime: '16:00', duration: 8, days: [], staffCategories: staffCategories }]);
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
            <StaffCategoryConfiguration staffCategories={staffCategories} setStaffCategories={setStaffCategories} />
            <StaffConfiguration staff={staff} staffCategories={staffCategories} setStaff={setStaff} />
            <ShiftCategoryConfiguration shiftCategories={shiftCategories} setShiftCategories={setShiftCategories} />
            <ShiftConfiguration
              shifts={shifts}
              shiftCategories={shiftCategories}
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
              consecutiveShiftAssignmentRules={consecutiveShiftAssignmentRules}
              shifts={shifts}
              staff={staff}
              setConsecutiveShiftAssignmentRules={setConsecutiveShiftAssignmentRules}
            />
            <PublicHolidayConfiguration
              dateRange={dateRange}
              setPublicHolidays={setPublicHolidays}
            />
            {/* Leave Configuration Control */}
            <LeaveConfiguration
              staff={staff}
              leaves={leaves}
              setLeaves={setLeaves}
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
                  const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth(), 1);
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex gap-4">
              <Button variant="secondary" onClick={() => alert('Import Configuration')}>
                Import Configuration
              </Button>
              <Button variant="secondary" onClick={() => alert('Export Configuration')}>
                Export Configuration
              </Button>
              </div>
              <Button variant="secondary" onClick={handleResetConfiguration}>
              Reset Configuration
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
            <div className="flex justify-center">
              <Button
              type="submit"
              onClick={handleGenerateRoster}
              >
              Generate Roster
              </Button>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold">Shift Legend</h3>
              <div className="flex gap-4 mt-2">
              {shifts
                .filter(shift => shift.color)
                .map((shift) => (
                <div key={shift.name} className="flex items-center gap-2">
                  <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: shift.color }}
                  ></span>
                  <span>{shift.name}</span>
                </div>
                ))}
              </div>
            </div>
            <div className="my-6" />
            <GeneratedRosterTable
              dateRange={dateRange}
              calendarData={calendarData}
              shifts={shifts}
              publicHolidays={publicHolidays}
            />
            <div className="mt-6 flex justify-center">
                <Button
                onClick={handleExportCalendar}
                >
                Export Calendar
                </Button>
            </div>
          </CardContent>
        </Card>
        <DataVerification
          dateRange={dateRange}
          staff={staff}
          shifts={shifts}
          calendarData={calendarData}
        />
      </div>
    </div>
  );
}