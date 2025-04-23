"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay, parse } from 'date-fns';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import ReactSelect from 'react-select';

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
  { name: 'Regular day', startTime: '08:00', endTime: '16:00', duration: 8, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], categories: ['AT', 'AT-C', 'BT'] },
  { name: 'Evening', startTime: '14:00', endTime: '22:00', duration: 8, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], categories: ['AT', 'AT-C', 'BT'] },
  { name: 'Night', startTime: '21:30', endTime: '08:30', duration: 11, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], categories: ['AT', 'BT'] },
  { name: 'Clinic', startTime: '08:00', endTime: '16:30', duration: 8.5, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], categories: ['AT', 'AT-C'] },
  { name: 'Day (Weekend)', startTime: '08:00', endTime: '20:30', duration: 12.5, days: ['Sat', 'Sun'], categories: ['AT', 'AT-C', 'BT'] },
  { name: 'Night (Weekend)', startTime: '20:00', endTime: '08:30', duration: 12.5, days: ['Sat', 'Sun'], categories: ['AT', 'BT'] },
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
};

export default function Home() {
  const [categories, setCategories] = useState(defaultCategories);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [staff, setStaff] = useState(defaultStaff);
  const [shifts, setShifts] = useState(defaultShifts);
  const [fixedShifts, setFixedShifts] = useState(defaultFixedShifts);
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [shiftExceptions, setShiftExceptions] = useState(defaultShiftExceptions);
  const [specialRules, setSpecialRules] = useState(defaultSpecialRules);
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

  const addCategory = () => {
    setCategories([...categories, '']);
  };

  const removeCategory = (index: number) => {
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    setCategories(newCategories);
  };

  const addStaff = () => {
    setStaff([...staff, { name: '', category: categories[0], fte: 1 }]);
  };

  const removeStaff = (index: number) => {
    const newStaff = [...staff];
    newStaff.splice(index, 1);
    setStaff(newStaff);
  };

  const updateStaff = (index: number, field: string, value: any) => {
    const newStaff = [...staff];
    newStaff[index] = { ...newStaff[index], [field]: value };
    setStaff(newStaff);
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
    setShifts([...shifts, { name: '', startTime: '08:00', endTime: '16:00', duration: 8, days: [], categories: categories }]);
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
      startDate,
      endDate,
      staff: staff.map((s) => ({
        name: s.name,
        category: s.category,
        fte: s.fte,
      })),
      shifts: shifts.map((shift) => ({
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        duration: shift.duration,
        days: shift.days,
        categories: shift.categories,
      })),
    };
  
    await new Promise((resolve) => setTimeout(resolve, 1000));
  
    const calendarData = [];
    let currentDate = new Date(startDate);
  
    // Structure to track special rule assignments
    // For each rule, track which staff is currently assigned, how many consecutive days completed,
    // and which staff are in their gap period and for how many more days
    const ruleTracking: {
      [ruleId: string]: {
        activeAssignment: {
          staffName: string | null,
          consecutiveDaysCompleted: number,
        },
        staffInGapPeriod: {
          [staffName: string]: number  // Days remaining in gap period
        }
      }
    } = {};
  
    // Initialize rule tracking
    specialRules.forEach((_, index) => {
      const ruleId = `rule_${index}`;
      ruleTracking[ruleId] = {
        activeAssignment: {
          staffName: null,
          consecutiveDaysCompleted: 0
        },
        staffInGapPeriod: {}
      };
    });
  
    while (currentDate <= new Date(endDate)) {
      const dayOfWeek = format(currentDate, 'EEE');
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      // Decrement gap days for all staff in gap period
      Object.keys(ruleTracking).forEach(ruleId => {
        Object.keys(ruleTracking[ruleId].staffInGapPeriod).forEach(staffName => {
          ruleTracking[ruleId].staffInGapPeriod[staffName]--;
          if (ruleTracking[ruleId].staffInGapPeriod[staffName] <= 0) {
            delete ruleTracking[ruleId].staffInGapPeriod[staffName];
          }
        });
      });
  
      const applicableShifts = roster.shifts.filter((shift) => shift.days?.includes(dayOfWeek));
      const assignedStaff = new Set<string>();
  
      const dayRoster = {
        date: dateStr,
        shifts: applicableShifts.map((shift) => {
          // Handle fixed shifts
          const fixedShift = fixedShifts.find(
            (fs) => fs.shift === shift.name && fs.days.includes(dayOfWeek)
          );
  
          if (fixedShift) {
            const fixedStaffMember = roster.staff.find((s) => s.name === fixedShift.staff);
            if (fixedStaffMember) {
              assignedStaff.add(fixedStaffMember.name);
              return { ...shift, staff: [fixedStaffMember] };
            }
          }
  
          // Check if this shift belongs to a special rule
          let ruleForShift: string | null = null;
          let ruleConfig = null;
  
          for (let i = 0; i < specialRules.length; i++) {
            const rule = specialRules[i];
            const ruleId = `rule_${i}`;
            
            if (rule.shifts.includes(shift.name)) {
              ruleForShift = ruleId;
              ruleConfig = rule;
              break;
            }
          }
  
          // If this shift belongs to a special rule
          if (ruleForShift && ruleConfig) {
            const tracking = ruleTracking[ruleForShift];
            
            // Case 1: We have an active staff assignment for this rule
            if (tracking.activeAssignment.staffName) {
              const activeStaff = roster.staff.find(s => s.name === tracking.activeAssignment.staffName);
              
              // Check if the active staff can work this shift
              if (activeStaff && 
                  shift.categories?.includes(activeStaff.category) && 
                  !assignedStaff.has(activeStaff.name) &&
                  !shiftExceptions.some(ex => 
                    ex.staff === activeStaff.name && 
                    ex.shift === shift.name && 
                    ex.days.includes(dayOfWeek)
                  )) {
                
                // Assign the active staff to this shift
                assignedStaff.add(activeStaff.name);
                tracking.activeAssignment.consecutiveDaysCompleted++;
                
                // Check if they've completed their consecutive days requirement
                if (tracking.activeAssignment.consecutiveDaysCompleted >= ruleConfig.consecutiveDays) {
                  // Start their gap period
                  tracking.staffInGapPeriod[activeStaff.name] = ruleConfig.gapDays;
                  // Reset active assignment
                  tracking.activeAssignment.staffName = null;
                  tracking.activeAssignment.consecutiveDaysCompleted = 0;
                }
                
                return { ...shift, staff: [activeStaff] };
              } else {
                // If the active staff can't work this shift, we need to try another staff
                // but we don't reset the active assignment
              }
            }
            
            // Case 2: We need to start a new staff assignment
            // Find a suitable staff member who isn't in gap period and matches the category
            const eligibleStaff = roster.staff.filter(s => 
              shift.categories?.includes(s.category) &&
              !assignedStaff.has(s.name) &&
              !tracking.staffInGapPeriod[s.name] &&
              !shiftExceptions.some(ex => 
                ex.staff === s.name && 
                ex.shift === shift.name && 
                ex.days.includes(dayOfWeek)
              )
            );
            
            if (eligibleStaff.length > 0) {
              // Choose a staff member randomly
              const chosenStaff = eligibleStaff[Math.floor(Math.random() * eligibleStaff.length)];
              assignedStaff.add(chosenStaff.name);
              
              // Set as the active assignment for this rule
              if (!tracking.activeAssignment.staffName) {
                tracking.activeAssignment.staffName = chosenStaff.name;
                tracking.activeAssignment.consecutiveDaysCompleted = 1;
              }
              
              return { ...shift, staff: [chosenStaff] };
            }
          }
  
          // Regular shift assignment (not part of special rule or no eligible staff found)
          const availableStaff = roster.staff.filter(
            (s) =>
              shift.categories?.includes(s.category) &&
              !assignedStaff.has(s.name) &&
              !shiftExceptions.some(
                (exception) =>
                  exception.staff === s.name &&
                  exception.shift === shift.name &&
                  exception.days.includes(dayOfWeek)
              )
          );
  
          if (availableStaff.length > 0) {
            const randomStaff = availableStaff[Math.floor(Math.random() * availableStaff.length)];
            assignedStaff.add(randomStaff.name);
            return { ...shift, staff: [randomStaff] };
          }
  
          return { ...shift, staff: [] };
        }),
      };
  
      calendarData.push(dayRoster);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return { ...roster, calendarData };
  }

  return (
    <div className="container flex mx-auto py-10">
      <div className="flex-1 p-4">
        <Card>
          <CardHeader>
            <CardTitle>RosterEase</CardTitle>
            <CardDescription>
              Generate and manage your staff rosters with ease.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Configuration</CardTitle>
                <CardDescription>Configure available categories.</CardDescription>
              </CardHeader>
              <CardContent>
                {categories.map((category, index) => (
                  <div key={index} className="mb-4 border rounded p-4">
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Category Name</label>
                        <Input
                          type="text"
                          value={category}
                          onChange={(e) => {
                            const newCategories = [...categories];
                            newCategories[index] = e.target.value;
                            setCategories(newCategories);
                          }}
                        />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeCategory(index)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ))}
                <Button variant="secondary" onClick={addCategory}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Staff Configuration</CardTitle>
                <CardDescription>Configure staff details.</CardDescription>
              </CardHeader>
              <CardContent>
                {staff.map((s, index) => (
                  <div key={index} className="mb-4 border rounded p-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <Input
                          type="text"
                          value={s.name}
                          onChange={(e) => updateStaff(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <Select onValueChange={(value) => updateStaff(index, 'category', value)} defaultValue={s.category}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">FTE</label>
                        <Select onValueChange={(value) => updateStaff(index, 'fte', parseFloat(value))} defaultValue={s.fte.toString()}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select FTE" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="0.5">0.5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeStaff(index)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ))}
                <Button variant="secondary" onClick={addStaff}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Staff
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shift Configuration</CardTitle>
                <CardDescription>Configure shift details, including applicable days.</CardDescription>
              </CardHeader>
              <CardContent>
                {shifts.map((shift, index) => (
                  <div key={index} className="mb-4 border rounded p-4">
                    <div className="grid grid-cols-[2fr,4fr,1fr,1fr,1fr,3fr] gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <Input
                          type="text"
                          value={shift.name}
                          onChange={(e) => updateShift(index, 'name', e.target.value)}
                        />
                      </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Days</label>
                        <ReactSelect
                          isMulti
                          options={daysOfWeekOptions}
                          value={daysOfWeekOptions.filter((option) => shift.days?.includes(option.value))}
                          onChange={(newValue) => updateShiftDays(index, Array.isArray(newValue) ? [...newValue] : [])}
                          placeholder="Select days"
                        />
                        </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Start Time</label>
                        <Select
                          onValueChange={(value) => updateShift(index, 'startTime', value)}
                          defaultValue={shift.startTime}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Select Start Time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">End Time</label>
                        <Select
                          onValueChange={(value) => updateShift(index, 'endTime', value)}
                          defaultValue={shift.endTime}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Select End Time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Working Hours</label>
                        <Input
                          type="number"
                          step="0.5"
                          value={shift.duration}
                          onChange={(e) => updateShift(index, 'duration', parseFloat(e.target.value))}
                        />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Applicable Categories</label>
                          <ReactSelect
                            isMulti
                            options={categories.map((category) => ({ value: category, label: category }))}
                            value={categories
                              .filter((category) => shift.categories?.includes(category))
                              .map((category) => ({ value: category, label: category }))}
                            onChange={(newValue) =>
                              updateShift(index, 'categories', Array.isArray(newValue) ? newValue.map((v) => v.value) : [])
                            }
                            placeholder="Select categories"
                          />
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeShift(index)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ))}
                <Button variant="secondary" onClick={addShift}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Shift
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
              <CardTitle>Fixed Shift Configuration</CardTitle>
              <CardDescription>Configure fixed shifts for specific staff.</CardDescription>
              </CardHeader>
              <CardContent>
              {fixedShifts.map((fixedShift, index) => (
                <div key={index} className="mb-4 border rounded p-4">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                  <label className="block text-sm font-medium text-gray-700">Staff</label>
                  <Select
                    onValueChange={(value) => updateFixedShift(index, 'staff', value)}
                    defaultValue={fixedShift.staff}
                  >
                    <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Select Staff" />
                    </SelectTrigger>
                    <SelectContent>
                    {staff.map((staff) => (
                      <SelectItem key={staff.name} value={staff.name}>
                      {staff.name}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700">Shift</label>
                  <Select
                    onValueChange={(value) => updateFixedShift(index, 'shift', value)}
                    defaultValue={fixedShift.shift}
                  >
                    <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Select Shift" />
                    </SelectTrigger>
                    <SelectContent>
                    {shifts.map((shift) => (
                      <SelectItem key={shift.name} value={shift.name}>
                      {shift.name}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700">Days</label>
                  <ReactSelect
                    isMulti
                    options={daysOfWeekOptions}
                    value={daysOfWeekOptions.filter((option) =>
                    fixedShift.days?.includes(option.value)
                    )}
                    onChange={(newValue) =>
                    updateFixedShift(index, 'days', Array.isArray(newValue) ? newValue.map((v) => v.value) : [])
                    }
                    placeholder="Select days"
                  />
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFixedShift(index)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
                </div>
              ))}
              <Button variant="secondary" onClick={addFixedShift}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Fixed Shift
              </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shift Exception Configuration</CardTitle>
                <CardDescription>Configure staff who cannot work on specific shifts or dates.</CardDescription>
              </CardHeader>
              <CardContent>
                {shiftExceptions.map((exception, index) => (
                  <div key={index} className="mb-4 border rounded p-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Staff</label>
                        <Select
                          onValueChange={(value) => updateShiftException(index, 'staff', value)}
                          defaultValue={exception.staff}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Select Staff" />
                          </SelectTrigger>
                          <SelectContent>
                            {staff.map((s) => (
                              <SelectItem key={s.name} value={s.name}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Shift</label>
                        <Select
                          onValueChange={(value) => updateShiftException(index, 'shift', value)}
                          defaultValue={exception.shift}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Select Shift" />
                          </SelectTrigger>
                          <SelectContent>
                            {shifts.map((shift) => (
                              <SelectItem key={shift.name} value={shift.name}>
                                {shift.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Days</label>
                        <ReactSelect
                          isMulti
                          options={daysOfWeekOptions}
                          value={daysOfWeekOptions.filter((option) => exception.days?.includes(option.value))}
                          onChange={(newValue) =>
                            updateShiftException(index, 'days', Array.isArray(newValue) ? newValue.map((v) => v.value) : [])
                          }
                          placeholder="Select days"
                        />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeShiftException(index)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ))}
                <Button variant="secondary" onClick={addShiftException}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Shift Exception
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
              <CardTitle>Special Rule Configuration</CardTitle>
              <CardDescription>
                Configure special rules for shift assignments.
              </CardDescription>
              </CardHeader>
              <CardContent>
              {specialRules.map((rule, index) => (
                <div key={index} className="mb-4 border rounded p-4">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                  <label className="block text-sm font-medium text-gray-700">Applicable Shifts</label>
                  <ReactSelect
                    isMulti
                    options={shifts.map((shift) => ({ value: shift.name, label: shift.name }))}
                    value={rule.shifts.map((shift) => ({ value: shift, label: shift }))}
                    onChange={(newValue) => {
                    const updatedRules = [...specialRules];
                    updatedRules[index].shifts = Array.isArray(newValue) ? newValue.map((v) => v.value) : [];
                    setSpecialRules(updatedRules);
                    }}
                    placeholder="Select shifts"
                  />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700">No. of Consecutive Days</label>
                  <Select
                    onValueChange={(value) => {
                    const updatedRules = [...specialRules];
                    updatedRules[index].consecutiveDays = parseInt(value, 10);
                    setSpecialRules(updatedRules);
                    }}
                    defaultValue={rule.consecutiveDays.toString()}
                  >
                    <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Consecutive Days" />
                    </SelectTrigger>
                    <SelectContent>
                    {Array.from({ length: 9 }, (_, i) => i + 1).map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                      {value}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700">No. of Gap Days</label>
                  <Select
                    onValueChange={(value) => {
                    const updatedRules = [...specialRules];
                    updatedRules[index].gapDays = parseInt(value, 10);
                    setSpecialRules(updatedRules);
                    }}
                    defaultValue={rule.gapDays.toString()}
                  >
                    <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Gap Days" />
                    </SelectTrigger>
                    <SelectContent>
                    {Array.from({ length: 9 }, (_, i) => i + 1).map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                      {value}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {
                  const updatedRules = [...specialRules];
                  updatedRules.splice(index, 1);
                  setSpecialRules(updatedRules);
                }}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
                </div>
              ))}
              <Button
                variant="secondary"
                onClick={() =>
                setSpecialRules([
                  ...specialRules,
                  { shifts: [], consecutiveDays: 1, gapDays: 1 },
                ])
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Special Rule
              </Button>
              </CardContent>
            </Card>
            <Button variant="secondary" onClick={handleResetConfiguration}>
              Reset Configuration
            </Button>
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
                      : undefined;
                      return { from: newFromDate, to: newToDate };
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
                      setDateRange((prev) => ({ ...prev, to: newToDate }));
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
            Generate
            </Button>
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

                                cells.push(
                                  <td key={formattedDay} className="border border-gray-300 p-4 align-top">
                                    <div className="font-bold">{format(day, 'd')}</div>
                                    {dayRoster && (
                                      <div className="text-xs mt-2">
                                        {dayRoster.shifts.map((shift: ShiftWithStaff, index: number) => (
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
              {s.name}
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
              ? dayRoster.shifts.reduce((total: number, shift: ShiftWithStaff) => {
                  if (shift.staff.some((staffMember) => staffMember.name === s.name)) {
                    return total + shift.duration;
                  }
                  return total;
                }, 0)
              : 0;

                  // Add daily hours to accumulated hours
                  accumulatedHours[s.name] += dailyHours;

                  return (
              <td key={s.name} className="border border-gray-300 p-2 text-center">
                {accumulatedHours[s.name]}
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
            <CardTitle>Shift Assignments</CardTitle>
            <CardDescription>
              View the special rule shift assignments in a table format.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calendarData.length > 0 ? (
              <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
            <thead>
              <tr>
          <th className="border border-gray-300 p-2 bg-gray-100">Date</th>
          <th className="border border-gray-300 p-2 bg-gray-100">Day</th>
          <th className="border border-gray-300 p-2 bg-gray-100">Shift Type</th>
          <th className="border border-gray-300 p-2 bg-gray-100">Assigned Staff</th>
              </tr>
            </thead>
            <tbody>
              {calendarData.flatMap((dayRoster) =>
          dayRoster.shifts
            .filter((shift: ShiftWithStaff) => shift.name.includes('Night'))
            .map((shift: ShiftWithStaff, index: number) => (
              shift.staff.length > 0 && (
                <tr key={`${dayRoster.date}-${index}`}>
            <td className="border border-gray-300 p-2">{format(new Date(dayRoster.date), 'd/MM/yyyy')}</td>
            <td className="border border-gray-300 p-2">{format(new Date(dayRoster.date), 'EEEE')}</td>
            <td className="border border-gray-300 p-2">{shift.name}</td>
            <td className="border border-gray-300 p-2">{shift.staff.map((s: Staff) => s.name).join(', ')}</td>
                </tr>
              )
            ))
              )}
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
