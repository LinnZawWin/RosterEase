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
  setFixedShifts: React.Dispatch<React.SetStateAction<FixedShift[]>>;
}

export default function FixedShiftConfiguration({
  fixedShifts,
  staff,
  shifts,
  daysOfWeekOptions,
  setFixedShifts,
}: FixedShiftConfigurationProps) {
  const [localFixedShifts, setLocalFixedShifts] = useState<FixedShift[]>(fixedShifts);

  useEffect(() => {
    setLocalFixedShifts(fixedShifts);
  }, [fixedShifts]);

  const handleLocalChange = (index: number, field: keyof FixedShift, value: any) => {
    const updated = [...localFixedShifts];
    updated[index] = { ...updated[index], [field]: value };
    setLocalFixedShifts(updated);
  };

  const handleBlur = (index: number, field: keyof FixedShift) => {
    if (localFixedShifts[index][field] !== fixedShifts[index][field]) {
      const updated = [...fixedShifts];
      updated[index] = { ...updated[index], [field]: localFixedShifts[index][field] };
      setFixedShifts(updated);
    }
  };

  const addFixedShift = () => {
    setFixedShifts([
      ...fixedShifts,
      {
        staff: staff[0] || { name: '', staffCategory: '', fte: 1 },
        shift: shifts[0] || { order: 1, name: '', shiftCategory: '', startTime: '', endTime: '', duration: 0, days: [] },
        days: [],
      },
    ]);
  };

  const removeFixedShift = (index: number) => {
    const updated = [...fixedShifts];
    updated.splice(index, 1);
    setFixedShifts(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fixed Shift Configuration</CardTitle>
        <CardDescription>
          Assign a specific staff member to a specific shift on selected days of the week.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {localFixedShifts.map((fixedShift, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-center gap-2 rounded p-2"
            >
              <Select
                onValueChange={(value) => {
                  const selectedStaff = staff.find((s) => s.name === value);
                  handleLocalChange(index, 'staff', selectedStaff || { name: '', staffCategory: '', fte: 1 });
                }}
                value={fixedShift.staff?.name || ''}
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
                  const selectedShift = shifts.find((shift) => shift.name === value);
                  handleLocalChange(index, 'shift', selectedShift || { order: 1, name: '', shiftCategory: '', startTime: '', endTime: '', duration: 0, days: [] });
                }}
                value={fixedShift.shift?.name || ''}
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
                  value={daysOfWeekOptions.filter((option) => fixedShift.days?.includes(option.value))}
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
                      height: 'auto', // allow to grow
                      fontSize: '0.875rem',
                      flexWrap: 'wrap',
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      padding: '0 6px',
                      minHeight: '32px',
                      maxHeight: '64px', // allow up to 2 lines
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
                  // menuPortalTarget={typeof window !== 'undefined' ? document.body : undefined} // optional
                  // menuPosition="fixed" // optional
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeFixedShift(index)}
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
            onClick={addFixedShift}
            aria-label="Add"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}