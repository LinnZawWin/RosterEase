'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Staff } from '@/models/Staff';
import { Shift } from '@/models/Shift';

const ReactSelect = dynamic(() => import('react-select'), { ssr: false });

interface ShiftException {
  staff: Staff;
  shift: Shift;
  days: string[];
}

interface ShiftExceptionConfigurationProps {
  shiftExceptions: ShiftException[];
  staff: Staff[];
  shifts: Shift[];
  daysOfWeekOptions: { value: string; label: string }[];
  setShiftExceptions: React.Dispatch<React.SetStateAction<ShiftException[]>>;
}

export default function ShiftExceptionConfiguration({
  shiftExceptions,
  staff,
  shifts,
  daysOfWeekOptions,
  setShiftExceptions,
}: ShiftExceptionConfigurationProps) {
  const [localShiftExceptions, setLocalShiftExceptions] = useState<ShiftException[]>(shiftExceptions);

  useEffect(() => {
    setLocalShiftExceptions(shiftExceptions);
  }, [shiftExceptions]);

  const handleLocalChange = (index: number, field: keyof ShiftException, value: any) => {
    const updated = [...localShiftExceptions];
    updated[index] = { ...updated[index], [field]: value };
    setLocalShiftExceptions(updated);
  };

  const handleBlur = (index: number, field: keyof ShiftException) => {
    if (localShiftExceptions[index][field] !== shiftExceptions[index][field]) {
      const updated = [...shiftExceptions];
      updated[index] = { ...updated[index], [field]: localShiftExceptions[index][field] };
      setShiftExceptions(updated);
    }
  };

  const addShiftException = () => {
    setShiftExceptions([
      ...shiftExceptions,
      {
        staff: staff[0], // never null
        shift: shifts[0], // never null
        days: [],
      },
    ]);
  };

  const removeShiftException = (index: number) => {
    const updated = [...shiftExceptions];
    updated.splice(index, 1);
    setShiftExceptions(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shift Exception Configuration</CardTitle>
        <CardDescription>
          Specify staff who cannot work certain shifts on selected days of the week.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {localShiftExceptions.map((exception, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-center gap-2 rounded p-2"
            >
              <Select
                onValueChange={(value) => {
                  const selectedStaff = staff.find((s) => s.name === value) || staff[0];
                  handleLocalChange(index, 'staff', selectedStaff);
                }}
                value={exception.staff?.name || staff[0]?.name || ''}
              >
                <SelectTrigger className="w-32 h-8 text-sm" aria-label="Staff" onBlur={() => handleBlur(index, 'staff')}>
                  <SelectValue placeholder="Staff" />
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
              <Select
                onValueChange={(value) => {
                  const selectedShift = shifts.find((shift) => shift.name === value) || shifts[0];
                  handleLocalChange(index, 'shift', selectedShift);
                }}
                value={exception.shift?.name || shifts[0]?.name || ''}
              >
                <SelectTrigger className="w-32 h-8 text-sm" aria-label="Shift" onBlur={() => handleBlur(index, 'shift')}>
                  <SelectValue placeholder="Shift" />
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
              <div className="min-w-[120px]">
                <ReactSelect
                  isMulti
                  options={daysOfWeekOptions}
                  value={daysOfWeekOptions.filter((option) => exception.days?.includes(option.value))}
                  onChange={(newValue) =>
                    handleLocalChange(
                      index,
                      'days',
                      Array.isArray(newValue) ? newValue.map((v) => v.value) : []
                    )
                  }
                  onBlur={() => handleBlur(index, 'days')}
                  placeholder="Days"
                  classNamePrefix="react-select"
                  styles={{
                    container: (base) => ({
                      ...base,
                      width: 350,
                      minWidth: 350,
                      maxWidth: 350,
                    }),
                    control: (base) => ({
                      ...base,
                      minHeight: '32px',
                      height: 'auto',
                      fontSize: '0.875rem',
                      flexWrap: 'wrap',
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      padding: '0 6px',
                      minHeight: '32px',
                      maxHeight: '64px',
                      overflowY: 'auto',
                      alignItems: 'flex-start',
                    }),
                    multiValue: (base) => ({
                      ...base,
                      margin: '2px 2px',
                    }),
                  }}
                  menuPlacement="auto"
                  isClearable={false}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeShiftException(index)}
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
            onClick={addShiftException}
            aria-label="Add"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}