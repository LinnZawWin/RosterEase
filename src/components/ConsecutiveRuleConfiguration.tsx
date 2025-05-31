'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ConsecutiveShiftAssignmentRule } from '@/models/ConsecutiveShiftAssignmentRule';
import { Shift } from '@/models/Shift';
import { Staff } from '@/models/Staff';

const ReactSelect = dynamic(() => import('react-select'), { ssr: false });

interface ConsecutiveRuleConfigurationProps {
  consecutiveShiftAssignmentRules: ConsecutiveShiftAssignmentRule[];
  shifts: Shift[];
  staff: Staff[];
  setConsecutiveShiftAssignmentRules: (rules: ConsecutiveShiftAssignmentRule[]) => void;
}

export default function ConsecutiveRuleConfiguration({
  consecutiveShiftAssignmentRules,
  shifts,
  staff,
  setConsecutiveShiftAssignmentRules,
}: ConsecutiveRuleConfigurationProps) {
  const [localRules, setLocalRules] = useState<ConsecutiveShiftAssignmentRule[]>(consecutiveShiftAssignmentRules);

  useEffect(() => {
    setLocalRules(consecutiveShiftAssignmentRules);
  }, [consecutiveShiftAssignmentRules]);

  const handleLocalChange = (index: number, field: keyof ConsecutiveShiftAssignmentRule, value: any) => {
    const updated = [...localRules];
    updated[index] = { ...updated[index], [field]: value };
    setLocalRules(updated);
  };

  const handleBlur = (index: number, field: keyof ConsecutiveShiftAssignmentRule) => {
    if (localRules[index][field] !== consecutiveShiftAssignmentRules[index][field]) {
      const updated = [...consecutiveShiftAssignmentRules];
      updated[index] = { ...updated[index], [field]: localRules[index][field] };
      setConsecutiveShiftAssignmentRules(updated);
    }
  };

  const addRule = () => {
    setConsecutiveShiftAssignmentRules([
      ...consecutiveShiftAssignmentRules,
      { type: 'Shift', shifts: [], staffMembers: [], consecutiveDays: 1, gapDays: 1 },
    ]);
  };

  const removeRule = (index: number) => {
    const updated = [...consecutiveShiftAssignmentRules];
    updated.splice(index, 1);
    setConsecutiveShiftAssignmentRules(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consecutive Shift Assignment Rules</CardTitle>
        <CardDescription>
          Configure rules to limit consecutive assignments for specific shifts or staff.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {localRules.map((rule, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-center gap-2 rounded p-2">
              <Select
                onValueChange={(value) => handleLocalChange(index, 'type', value as 'Shift' | 'Staff')}
                value={rule.type || 'Shift'}
              >
                <SelectTrigger className="w-28 h-8 text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Shift">Shift</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                </SelectContent>
              </Select>
              {rule.type === 'Shift' ? (
                <div className="min-w-[160px]">
                  <ReactSelect
                    isMulti
                    options={shifts.map((shift) => ({ value: shift.name, label: shift.name }))}
                    value={rule.shifts.map((shift) => ({ value: shift.name, label: shift.name }))}
                    onChange={(newValue) => {
                      const selectedNames = Array.isArray(newValue) ? newValue.map((v: any) => v.value) : [];
                      const selectedShifts = shifts.filter((s) => selectedNames.includes(s.name));
                      handleLocalChange(index, 'shifts', selectedShifts);
                    }}
                    placeholder="Shifts"
                    classNamePrefix="react-select"
                    styles={{
                      container: (base) => ({
                        ...base,
                        width: 250,
                        minWidth: 250,
                        maxWidth: 250,
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
              ) : (
                <div className="min-w-[160px]">
                  <ReactSelect
                    isMulti
                    options={staff.map((s) => ({ value: s.name, label: s.name }))}
                    value={rule.staffMembers.map((s) => ({ value: s.name, label: s.name }))}
                    onChange={(newValue) => {
                      const selectedNames = Array.isArray(newValue) ? newValue.map((v: any) => v.value) : [];
                      const selectedStaff = staff.filter((s) => selectedNames.includes(s.name));
                      handleLocalChange(index, 'staffMembers', selectedStaff);
                    }}
                    placeholder="Staff"
                    classNamePrefix="react-select"
                    styles={{
                      container: (base) => ({
                        ...base,
                        width: 250,
                        minWidth: 250,
                        maxWidth: 250,
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
              )}
              <Select
                onValueChange={(value) => handleLocalChange(index, 'consecutiveDays', parseInt(value, 10))}
                value={rule.consecutiveDays.toString()}
              >
                <SelectTrigger className="w-24 h-8 text-sm">
                  <SelectValue placeholder="Consecutive" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(value) => handleLocalChange(index, 'gapDays', parseInt(value, 10))}
                value={rule.gapDays.toString()}
              >
                <SelectTrigger className="w-24 h-8 text-sm">
                  <SelectValue placeholder="Gap" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeRule(index)}
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
            onClick={addRule}
            aria-label="Add"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
