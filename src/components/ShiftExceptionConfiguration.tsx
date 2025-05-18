'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Staff } from '@/models/Staff';
import { Shift } from '@/models/Shift';

const ReactSelect = dynamic(() => import('react-select'), { ssr: false });

interface ShiftException {
  staff: Staff | null;
  shift: Shift | null;
  days: string[];
}

interface ShiftExceptionConfigurationProps {
  shiftExceptions: ShiftException[];
  staff: Staff[];
  shifts: Shift[];
  daysOfWeekOptions: { value: string; label: string }[];
  updateShiftException: (index: number, field: string, value: any) => void;
  removeShiftException: (index: number) => void;
  addShiftException: () => void;
}

export default function ShiftExceptionConfiguration({
  shiftExceptions,
  staff,
  shifts,
  daysOfWeekOptions,
  updateShiftException,
  removeShiftException,
  addShiftException,
}: ShiftExceptionConfigurationProps) {
  return (
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
                  onValueChange={(value) => {
                    const selectedStaff = staff.find((s) => s.name === value) || null;
                    updateShiftException(index, 'staff', selectedStaff);
                  }}
                  value={exception.staff?.name || ''}
                  defaultValue={exception.staff?.name || ''}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Select Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff
                      .filter((s) => s.name.trim() !== '')
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
                    const selectedShift = shifts.find((shift) => shift.name === value) || null;
                    updateShiftException(index, 'shift', selectedShift);
                  }}
                  value={exception.shift?.name || ''}
                  defaultValue={exception.shift?.name || ''}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Select Shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts
                      .filter((shift) => shift.name.trim() !== '')
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
  );
}