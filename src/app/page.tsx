"use client";

import { generateRoster } from '@/ai/flows/generate-roster';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';

const defaultStaff = [
  { name: 'AT-1', category: 'AT-1', fte: 1 },
  { name: 'AT-2', category: 'AT-2', fte: 1 },
  { name: 'AT-3', category: 'AT-3', fte: 1 },
  { name: 'AT-C', category: 'AT-C', fte: 1 },
  { name: 'BT-1', category: 'BT-1', fte: 1 },
  { name: 'BT-2', category: 'BT-2', fte: 0.5 },
  { name: 'BT-3', category: 'BT-3', fte: 0.5 },
];

const defaultShifts = [
  { name: 'Regular day', duration: 8, eligibleStaffCategories: ['AT-1', 'AT-2', 'AT-3', 'AT-C', 'BT-1', 'BT-2', 'BT-3'] },
  { name: 'Evening', duration: 8, eligibleStaffCategories: ['AT-1', 'AT-2', 'AT-3', 'BT-1', 'BT-2', 'BT-3'] },
  { name: 'Night', duration: 11, eligibleStaffCategories: ['AT-1', 'AT-2', 'AT-3', 'BT-1', 'BT-2', 'BT-3'] },
  { name: 'Clinic', duration: 8.5, eligibleStaffCategories: ['AT-C', 'AT-1', 'AT-2', 'AT-3'] },
  { name: 'Day (Weekend)', duration: 12.5, eligibleStaffCategories: ['AT-1', 'AT-2', 'AT-3', 'BT-1', 'BT-2', 'BT-3'] },
  { name: 'Night (Weekend)', duration: 12.5, eligibleStaffCategories: ['AT-1', 'AT-2', 'AT-3', 'BT-1', 'BT-2', 'BT-3'] },
];

const staffCategories = ['AT-1', 'AT-2', 'AT-3', 'AT-C', 'BT-1', 'BT-2', 'BT-3'];

export default function Home() {
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

  const handleReset = () => {
    setStaff(defaultStaff);
    setShifts(defaultShifts);
  };

  const addStaff = () => {
    setStaff([...staff, { name: '', category: staffCategories[0], fte: 1 }]);
  };

  const removeStaff = (index: number) => {
    const newStaff = [...staff];
    newStaff.splice(index, 1);
    setStaff(newStaff);
  };

  const addShift = () => {
    setShifts([...shifts, { name: '', duration: 8, eligibleStaffCategories: [] }]);
  };

  const removeShift = (index: number) => {
    const newShifts = [...shifts];
    newShifts.splice(index, 1);
    setShifts(newShifts);
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Select Date Range</CardTitle>
                  <CardDescription>Choose the start and end dates for roster generation.</CardDescription>
                </CardHeader>
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
                        onSelect={setDateRange}
                        disabled={(date) => date > new Date(new Date().setDate(new Date().getDate() + 365)) || date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generate Roster</CardTitle>
                  <CardDescription>Generate a roster based on selected dates.</CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button disabled={!isValidDateRange} variant="primary">
                        Generate
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
                          onChange={(e) => {
                            const newStaff = [...staff];
                            newStaff[index] = { ...s, name: e.target.value };
                            setStaff(newStaff);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <Select onValueChange={(value) => {
                          const newStaff = [...staff];
                          newStaff[index] = { ...s, category: value };
                          setStaff(newStaff);
                        }}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a category" defaultValue={s.category} />
                          </SelectTrigger>
                          <SelectContent>
                            {staffCategories.map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">FTE</label>
                        <Select onValueChange={(value) => {
                          const newStaff = [...staff];
                            newStaff[index] = { ...s, fte: parseFloat(value) };
                            setStaff(newStaff);
                          }}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select FTE" defaultValue={s.fte.toString()} />
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
                          onChange={(e) => {
                            const newShifts = [...shifts];
                            newShifts[index] = { ...shift, name: e.target.value };
                            setShifts(newShifts);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Duration</label>
                        <Input
                          type="number"
                          value={shift.duration.toString()}
                          onChange={(e) => {
                            const newShifts = [...shifts];
                            newShifts[index] = { ...shift, duration: parseFloat(e.target.value) };
                            setShifts(newShifts);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Eligible Categories</label>
                        <Input
                          type="text"
                          value={shift.eligibleStaffCategories.join(', ')}
                          onChange={(e) => {
                            const newShifts = [...shifts];
                            newShifts[index] = { ...shift, eligibleStaffCategories: e.target.value.split(',').map(s => s.trim()) };
                            setShifts(newShifts);
                          }}
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

            <Button variant="secondary" onClick={handleReset}>
              Reset
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

