"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { useState, useCallback, useId } from 'react';
import { Input } from '@/components/ui/input';
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
  { order: 1, shiftCategory: 'Day', name: 'Regular day', startTime: '08:00', endTime: '16:00', duration: 8, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], color: '#DDEBF7' },
  { order: 2, shiftCategory: 'Evening', name: 'Evening', startTime: '14:00', endTime: '22:00', duration: 8, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], color: '#C6E0B4' },
  { order: 3, shiftCategory: 'Night', name: 'Night', startTime: '21:30', endTime: '08:30', duration: 11, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], color: '#FCE4D6' },
  { order: 4, shiftCategory: 'Clinic', name: 'Clinic', startTime: '08:00', endTime: '16:30', duration: 8.5, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { order: 5, shiftCategory: 'Day', name: 'Day (Weekend)', startTime: '08:00', endTime: '20:30', duration: 12.5, days: ['Sat', 'Sun', 'PH'], color: '#DDEBF7' },
  { order: 6, shiftCategory: 'Night', name: 'Night (Weekend)', startTime: '20:00', endTime: '08:30', duration: 12.5, days: ['Sat', 'Sun', 'PH'], color: '#FCE4D6' },
  { order: 7, shiftCategory: 'Leave', name: 'Annual Leave', startTime: '00:00', endTime: '23:30', duration: 8, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], color: '#B34CAF' },
];
const defaultFixedShifts = [
  {
    staff: defaultStaff.find(s => s.name === 'AT-C')!,
    shift: defaultShifts.find(shift => shift.name === 'Clinic')!,
    days: ['Mon', 'Wed', 'Thu'],
  },
];
const defaultShiftExceptions = [
  {
    staff: defaultStaff.find(s => s.name === 'AT-C')!,
    shift: defaultShifts.find(shift => shift.name === 'Clinic')!,
    days: ['Tue', 'Fri'],
  },
];
const defaultConsecutiveShiftAssignmentRules = [
  {
    type: "Shift" as const,
    shifts: ['Night', 'Night (Weekend)'],
    staffMembers: [],
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
  { staff: 'AT-3', from: new Date('2025-05-19'), to: new Date('2025-05-30') },
  { staff: 'AT-2', from: new Date('2025-06-23'), to: new Date('2025-06-27') },
  { staff: 'AT-C', from: new Date('2025-07-07'), to: new Date('2025-07-11') },
];
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

export default function Home() {
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [staffCategories, setStaffCategories] = useState<StaffCategory[]>(defaultStaffCategories);
  const [staff, setStaff] = useState<Staff[]>(defaultStaff);
  const [shiftCategories, setShiftCategories] = useState<ShiftCategory[]>(defaultShiftCategories);
  const [shifts, setShifts] = useState<Shift[]>(defaultShifts);
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [fixedShifts, setFixedShifts] = useState<FixedShift[]>(defaultFixedShifts);
  const [shiftExceptions, setShiftExceptions] = useState<ShiftException[]>(defaultShiftExceptions);
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
    setStaff(defaultStaff);
    setShifts(defaultShifts);
  };

  // Responsive and mobile-friendly layout
  return (
    <div className="container mx-auto py-4 px-2 sm:py-6 sm:px-4 lg:px-8">
      <div className="flex flex-col gap-4 sm:gap-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg md:text-xl">RosterEase</CardTitle>
            <CardDescription className="text-xs sm:text-sm md:text-base">
              Generate and manage your staff rosters with ease.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:gap-6">
            
                <div className="flex items-center gap-2 w-full justify-center">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap mr-2">Date Range:</label>
                  <Input
                    type="date"
                    className="w-32 px-1 py-1 text-sm"
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
                    min={format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd')}
                  />
                  <span className="text-gray-400 text-sm px-0">–</span>
                  <Input
                    type="date"
                    className="w-32 px-1 py-1 text-sm"
                    value={dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const newToDate = e.target.value ? new Date(e.target.value) : undefined;
                      if (newToDate && dateRange.from && newToDate <= dateRange.from) {
                        alert('To date must be later than the From date.');
                        return;
                      }
                      setDateRange((prev) => ({ ...prev, to: newToDate || null }));
                    }}
                    min={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd')}
                  />
                </div>
                {/* Auto-set date range if not set */}
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
                  return null;
                })()}
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center">
              <Button
                variant="secondary"
                size="sm"
                className="px-3 py-1 text-xs"
                onClick={() => alert('Import Configuration')}
              >
                Import Config
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="px-3 py-1 text-xs"
                onClick={() => alert('Export Configuration')}
              >
                Export Config
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="px-3 py-1 text-xs"
                onClick={handleResetConfiguration}
              >
                Reset Config
              </Button>
            </div>
            <StaffCategoryConfiguration staffCategories={staffCategories} setStaffCategories={setStaffCategories} />
            <StaffConfiguration staff={staff} staffCategories={staffCategories} setStaff={setStaff} />
            <ShiftCategoryConfiguration shiftCategories={shiftCategories} setShiftCategories={setShiftCategories} />
            <ShiftConfiguration
              shifts={shifts}
              shiftCategories={shiftCategories}
              daysOfWeekOptions={daysOfWeekOptions}
              setShifts={setShifts}
            />
            <FixedShiftConfiguration
              fixedShifts={fixedShifts}
              staff={staff}
              shifts={shifts}
              daysOfWeekOptions={daysOfWeekOptions}
              setFixedShifts={setFixedShifts}
            />
            <ShiftExceptionConfiguration
              shiftExceptions={shiftExceptions}
              staff={staff}
              shifts={shifts}
              daysOfWeekOptions={daysOfWeekOptions}
              setShiftExceptions={setShiftExceptions}
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
            <LeaveConfiguration
              staff={staff}
              leaves={leaves}
              setLeaves={setLeaves}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Generated Roster Table</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              View the generated roster in a table format for each month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Button type="submit" onClick={handleGenerateRoster}>
                Generate Roster
              </Button>
            </div>
            <div className="mt-4">
              <h3 className="text-base sm:text-lg font-bold">Shift Legend</h3>
              <div className="flex flex-wrap gap-2 sm:gap-4 mt-2">
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
              <Button onClick={handleExportCalendar}>
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