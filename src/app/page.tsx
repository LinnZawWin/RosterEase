"use client";

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, parse } from 'date-fns';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';

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
  { name: 'Regular day', startTime: '08:00', endTime: '16:00', duration: 8 },
  { name: 'Evening', startTime: '14:00', endTime: '22:00', duration: 8 },
  { name: 'Night', startTime: '21:30', endTime: '08:30', duration: 11 },
  { name: 'Clinic', startTime: '08:00', endTime: '16:30', duration: 8.5 },
  { name: 'Day (Weekend)', startTime: '08:00', endTime: '20:30', duration: 12.5 },
  { name: 'Night (Weekend)', startTime: '08:00', endTime: '08:30', duration: 24.5 },
];

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, '0');
  const minute = (i % 2 === 0) ? '00' : '30';
  return `${hour}:${minute}`;
});

export default function Home() {
  const [categories, setCategories] = useState(defaultCategories);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [staff, setStaff] = useState(defaultStaff);
  const [shifts, setShifts] = useState(defaultShifts);

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
      setShifts([...shifts, { name: '', startTime: '08:00', endTime: '16:00', duration: 8 }]);
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
      })),
    };

    // Simulate a delay to mimic an API call or heavy computation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return roster;
  }

  return (
    <div className="container flex mx-auto py-10">
      <div className="flex-1 p-4">
        <Card>
          <CardHeader>
            <CardTitle>RosterEase</CardTitle>
            <CardDescription>
              Generate and manage your staff rosters with ease...
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
                <CardDescription>Configure shift details.</CardDescription>
              </CardHeader>
              <CardContent>
                {shifts.map((shift, index) => (
                  <div key={index} className="mb-4 border rounded p-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <Input
                          type="text"
                          value={shift.name}
                          onChange={(e) => updateShift(index, 'name', e.target.value)}
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Duration</label>
                        <Input
                          type="number"
                          value={calculateDuration(shift.startTime, shift.endTime).toString()}
                          readOnly
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
            <Button variant="secondary" onClick={handleResetConfiguration}>
              Reset Configuration
            </Button>
            <Card>
              <CardContent className="flex justify-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] justify-start text-left font-normal',
                        !dateRange.from || !dateRange.to && 'text-muted-foreground'
                      )}
                    >
                      {formattedDateRange === 'Select Date Range' ? (
                        <span>Select Date Range</span>
                      ) : (
                        <span>{formattedDateRange}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      defaultMonth={dateRange.from ? new Date(dateRange.from) : new Date()}
                      selected={dateRange}
                      onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                      disabled={(date) => date > new Date(new Date().setDate(new Date().getDate() + 365)) || date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={!isValidDateRange} variant="default">
                  Generate Roster
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to generate a roster for {formattedDateRange}?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
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
                        console.log(roster);
                        alert('Roster generated successfully!');
                      }
                    }}
                  >
                    Generate
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
