"use client";

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
  { name: 'Regular day', startTime: '08:00', endTime: '16:00', duration: 8, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { name: 'Evening', startTime: '14:00', endTime: '22:00', duration: 8, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { name: 'Night', startTime: '21:30', endTime: '08:30', duration: 11, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { name: 'Clinic', startTime: '08:00', endTime: '16:30', duration: 8.5, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { name: 'Day (Weekend)', startTime: '08:00', endTime: '20:30', duration: 12.5, days: ['Sat', 'Sun'] },
  { name: 'Night (Weekend)', startTime: '08:00', endTime: '08:30', duration: 24.5, days: ['Sat', 'Sun'] },
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
  const [calendarData, setCalendarData] = useState<any[]>([]);

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
    setShifts([...shifts, { name: '', startTime: '08:00', endTime: '16:00', duration: 8, days: [] }]);
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

  async function generateRoster({ startDate, endDate }: { startDate: string; endDate: string; }) {
    // Simulate roster generation logic
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
        days: shift.days, // Include the days property for filtering
      })),
    };

    // Simulate a delay to mimic an API call or heavy computation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate calendar data
    const calendarData = [];
    let currentDate = new Date(startDate);

    while (currentDate <= new Date(endDate)) {
      const dayOfWeek = format(currentDate, 'EEE'); // Get the day of the week (e.g., 'Mon', 'Tue')
      
      // Filter shifts based on the day of the week
      const applicableShifts = roster.shifts.filter((shift) => shift.days?.includes(dayOfWeek));
      console.debug(`Day of Week: ${dayOfWeek}`);
      console.debug('Applicable Shifts:', applicableShifts);
      const assignedStaff = new Set<string>(); // Track assigned staff to avoid duplicates

      const dayRoster = {
        date: format(currentDate, 'yyyy-MM-dd'),
        shifts: applicableShifts.map((shift) => {
          // Filter available staff who are not yet assigned for the day
          const availableStaff = roster.staff.filter((s) => !assignedStaff.has(s.name));

          // Randomly select a staff member for the shift
          const randomStaff =
            availableStaff.length > 0
              ? availableStaff[Math.floor(Math.random() * availableStaff.length)]
              : null;

          if (randomStaff) {
            assignedStaff.add(randomStaff.name); // Mark the staff as assigned
          }

          return {
            ...shift,
            staff: randomStaff ? [randomStaff] : [], // Assign the selected staff or leave empty
          };
        }),
      };

      // Add all applicable shifts for the day, even if no staff is assigned
      dayRoster.shifts = applicableShifts.map((shift) => ({
        ...shift,
        staff: dayRoster.shifts.find((s) => s.name === shift.name)?.staff || [],
      }));

      calendarData.push(dayRoster);
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
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
              Generate and manage your staff rosters with ease......
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
                    <div className="grid grid-cols-4 gap-2">
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
                          <SelectTrigger className="w-[180px]">
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
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select End Time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

              const calendarData = [];
              const currentDate = new Date(dateRange.from);

              while (currentDate <= dateRange.to) {
                const dayRoster = {
                date: format(currentDate, 'yyyy-MM-dd'),
                shifts: roster.shifts.map((shift) => ({
                  ...shift,
                  staff: roster.staff.filter((_, index) => index % roster.shifts.length === roster.shifts.indexOf(shift)),
                })),
                };
                calendarData.push(dayRoster);
                currentDate.setDate(currentDate.getDate() + 1);
              }
              setCalendarData(calendarData);
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
        
      <div className="mt-8">
        <h3 className="text-lg font-bold">Calendar Data (JSON)</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
          {JSON.stringify(calendarData, null, 2)}
        </pre>
      </div>
      </div>
    </div>
  );
}
