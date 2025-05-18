'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Staff } from '@/models/Staff';
import { Shift } from '@/models/Shift';

const ReactSelect = dynamic(() => import('react-select'), { ssr: false });

interface FixedShift {
  staff: Staff;
  shift: Shift;
  days: string[];
}

interface FixedShiftConfigurationProps {
  fixedShifts: FixedShift[];
  staff: Staff[];
  shifts: Shift[];
  daysOfWeekOptions: { value: string; label: string }[];
  updateFixedShift: (index: number, field: string, value: any) => void;
  removeFixedShift: (index: number) => void;
  addFixedShift: () => void;
}

export default function FixedShiftConfiguration({
  fixedShifts,
  staff,
  shifts,
  daysOfWeekOptions,
  updateFixedShift,
  removeFixedShift,
  addFixedShift,
}: FixedShiftConfigurationProps) {
  return (
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
                  onValueChange={(value) => {
                    const selectedStaff = staff.find((s) => s.name === value);
                    updateFixedShift(index, 'staff', selectedStaff || null);
                  }}
                  value={fixedShift.staff?.name || ''}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Select Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff
                      .filter((s) => s.name.trim() !== '') // Exclude empty or invalid values
                      .map((s) => (
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
                  onValueChange={(value) => {
                    const selectedShift = shifts.find((shift) => shift.name === value);
                    updateFixedShift(index, 'shift', selectedShift || null);
                  }}
                  value={fixedShift.shift?.name || ''}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Select Shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts
                      .filter((shift) => shift.name.trim() !== '') // Exclude empty or invalid values
                      .map((shift) => (
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
                  value={daysOfWeekOptions.filter((option) => fixedShift.days?.includes(option.value))}
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
  );
}