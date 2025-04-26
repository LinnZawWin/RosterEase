'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const ReactSelect = dynamic(() => import('react-select'), { ssr: false });

interface Shift {
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  days: string[];
  categories: string[];
}

interface ShiftConfigurationProps {
  shifts: Shift[];
  categories: string[];
  daysOfWeekOptions: { value: string; label: string }[];
  timeOptions: string[];
  updateShift: (index: number, field: string, value: any) => void;
  updateShiftDays: (index: number, selectedDays: any) => void;
  addShift: () => void;
  removeShift: (index: number) => void;
}

export default function ShiftConfiguration({
  shifts,
  categories,
  daysOfWeekOptions,
  timeOptions,
  updateShift,
  updateShiftDays,
  addShift,
  removeShift,
}: ShiftConfigurationProps) {
  return (
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
                  onChange={(selectedOptions) =>
                    updateShiftDays(index, Array.isArray(selectedOptions) ? selectedOptions : [])
                  }
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
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
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
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
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
  );
}