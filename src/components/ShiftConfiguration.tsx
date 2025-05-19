'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const ReactSelect = dynamic(() => import('react-select'), { ssr: false });
const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, '0');
  const minute = (i % 2 === 0) ? '00' : '30';
  return `${hour}:${minute}`;
});

interface Shift {
  order: number;
  name: string;
  shiftCategory: string;
  startTime: string;
  endTime: string;
  duration: number;
  days: string[];
  color?: string;
}

import type { Dispatch, SetStateAction } from 'react';

interface ShiftConfigurationProps {
  shifts: Shift[];
  shiftCategories: string[];
  daysOfWeekOptions: { label: string; value: string }[]; // <-- Accept from parent
  setShifts: Dispatch<SetStateAction<Shift[]>>;
}

export default function ShiftConfiguration({
  shifts,
  shiftCategories,
  setShifts,
  daysOfWeekOptions, // <-- Use from props
}: ShiftConfigurationProps) {
  // Local state for all editable fields per shift
  const [localShifts, setLocalShifts] = useState<Shift[]>(shifts);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalShifts(shifts);
  }, [shifts]);

  // Update local state only onChange, update parent only onBlur
  const handleLocalChange = (index: number, field: keyof Shift, value: any) => {
    const updated = [...localShifts];
    updated[index] = { ...updated[index], [field]: value };
    setLocalShifts(updated);
  };

  const handleBlur = (index: number, field: keyof Shift) => {
    if (localShifts[index][field] !== shifts[index][field]) {
      const updated = [...shifts];
      updated[index] = { ...updated[index], [field]: localShifts[index][field] };
      setShifts(updated);
    }
  };

  const handleInputChange = (idx: number, field: keyof Shift, value: any) => {
    const updated = [...localShifts];
    updated[idx] = { ...updated[idx], [field]: value };
    setLocalShifts(updated);
  };

  const handleInputBlur = (idx: number, field: keyof Shift) => {
    if (localShifts[idx][field] !== shifts[idx][field]) {
      const updated = [...shifts];
      updated[idx] = { ...updated[idx], [field]: localShifts[idx][field] };
      setShifts(updated);
    }
  };

  const addShift = () => {
    setShifts([
      ...shifts,
      {
        order: shifts.length + 1,
        name: '',
        shiftCategory: shiftCategories[0] || '',
        startTime: '',
        endTime: '',
        duration: 0,
        days: [],
        color: '#FFFFFF',
      },
    ]);
  };

  const removeShift = (idx: number) => {
    const updated = [...shifts];
    updated.splice(idx, 1);
    setShifts(updated);
  };

  function handleRemoveShift(index: number): void {
    removeShift(index);
  }

  function handleAddShift(): void {
    addShift();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shift Configuration</CardTitle>
        <CardDescription>
          Configure the details of each shift, including its category, applicable days of the week, start and end times, duration, and the colour to display in the calendar and exported Excel file.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {localShifts.map((shift, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-center gap-2 rounded p-2"
            >
              <Input
                type="text"
                className="py-1 px-2 h-8 text-sm w-32"
                value={shift.name}
                onChange={(e) => handleLocalChange(index, 'name', e.target.value)}
                onBlur={() => handleBlur(index, 'name')}
                placeholder="e.g. Night (Weekend)"
              />
              <Select
                onValueChange={(value) => handleLocalChange(index, 'shiftCategory', value)}
                value={shift.shiftCategory || ''}
                defaultValue={shift.shiftCategory || ''}
              >
                <SelectTrigger
                  className="w-28 h-8 text-sm"
                  onBlur={() => handleBlur(index, 'shiftCategory')}
                >
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {shiftCategories
                    .filter((cat) => cat && cat !== '')
                    .map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="min-w-[120px]">
                <ReactSelect
                  isMulti
                  options={daysOfWeekOptions}
                  value={daysOfWeekOptions.filter((option) => shift.days?.includes(option.value))}
                  onChange={(selectedOptions) => {
                    handleLocalChange(
                      index,
                      'days',
                      Array.isArray(selectedOptions) ? selectedOptions.map(opt => opt.value) : []
                    );
                  }}
                  onBlur={() => handleBlur(index, 'days')}
                  placeholder="Days of Week"
                  classNamePrefix="react-select"
                  styles={{
                    container: (base) => ({
                      ...base,
                      width: 470, // Set fixed width to 470px
                      minWidth: 470,
                      maxWidth: 470,
                    }),
                    control: (base) => ({
                      ...base,
                      minHeight: '32px',
                      height: '32px',
                      fontSize: '0.875rem',
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      padding: '0 6px',
                    }),
                  }}
                  menuPlacement="auto"
                  isClearable={false}
                />
              </div>
              <Select
                onValueChange={(value) => handleLocalChange(index, 'startTime', value)}
                value={shift.startTime}
              >
                <SelectTrigger
                  className="w-20 h-8 text-sm"
                  onBlur={() => handleBlur(index, 'startTime')}
                >
                  <SelectValue placeholder="Start" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(value) => handleLocalChange(index, 'endTime', value)}
                value={shift.endTime}
              >
                <SelectTrigger
                  className="w-20 h-8 text-sm"
                  onBlur={() => handleBlur(index, 'endTime')}
                >
                  <SelectValue placeholder="End" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                <Input
                type="number"
                step="0.5"
                className="w-20 h-8 text-sm"
                value={shift.duration}
                onChange={(e) => handleLocalChange(index, 'duration', parseFloat(e.target.value))}
                onBlur={() => handleBlur(index, 'duration')}
                placeholder="Hours"
                />
                <Input
                type="color"
                value={shift.color || '#FFFFFF'}
                onChange={(e) => handleLocalChange(index, 'color', e.target.value)}
                onBlur={() => handleBlur(index, 'color')}
                className="h-8 w-10 p-0 border-none bg-transparent"
                style={{ minWidth: 37 }}
                aria-label="Shift Colour"
                />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleRemoveShift(index)}
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 self-start"
            onClick={handleAddShift}
            aria-label="Add"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}