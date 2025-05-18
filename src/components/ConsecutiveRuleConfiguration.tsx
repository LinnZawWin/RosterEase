'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ConsecutiveShiftAssignmentRule } from '@/models/ConsecutiveShiftAssignmentRule';

const ReactSelect = dynamic(() => import('react-select'), { ssr: false });

interface ConsecutiveRuleConfigurationProps {
  consecutiveShiftAssignmentRules: ConsecutiveShiftAssignmentRule[];
  shifts: { name: string }[];
  staff: { name: string }[];
  setConsecutiveShiftAssignmentRules: (rules: ConsecutiveShiftAssignmentRule[]) => void;
}

export default function ConsecutiveRuleConfiguration({
  consecutiveShiftAssignmentRules,
  shifts,
  staff,
  setConsecutiveShiftAssignmentRules,
}: ConsecutiveRuleConfigurationProps) {
  const addRule = () => {
    setConsecutiveShiftAssignmentRules([
      ...consecutiveShiftAssignmentRules,
      { type: 'Shift', shifts: [], staffMembers: [], consecutiveDays: 1, gapDays: 1 },
    ]);
  };

  const removeRule = (index: number) => {
    const updatedRules = [...consecutiveShiftAssignmentRules];
    updatedRules.splice(index, 1);
    setConsecutiveShiftAssignmentRules(updatedRules);
  };

  const updateRule = (index: number, field: keyof ConsecutiveShiftAssignmentRule, value: any) => {
    const updatedRules = [...consecutiveShiftAssignmentRules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    // Reset fields when type changes
    if (field === 'type') {
      if (value === 'Shift') {
        updatedRules[index].shifts = [];
      } else {
        updatedRules[index].staffMembers = [];
      }
    }
    setConsecutiveShiftAssignmentRules(updatedRules);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consecutive Shift Assignment Rules</CardTitle>
        <CardDescription>Configure special rules for shift assignments.</CardDescription>
      </CardHeader>
      <CardContent>
        {consecutiveShiftAssignmentRules.map((rule, index) => (
          <div key={index} className="mb-4 border rounded p-4">
            <div className="grid grid-cols-4 gap-2">
              {/* Type Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <Select
                  onValueChange={(value) => updateRule(index, 'type', value as 'Shift' | 'Staff')}
                  defaultValue={rule.type || 'Shift'}
                  value={rule.type || 'Shift'}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Shift">Shift</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Show/hide based on type */}
              {rule.type === 'Shift' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Applicable Shifts</label>
                  <ReactSelect
                    isMulti
                    options={shifts.map((shift) => ({ value: shift.name, label: shift.name }))}
                    value={rule.shifts.map((shift) => ({ value: shift, label: shift }))}
                    onChange={(newValue) =>
                      updateRule(index, 'shifts', Array.isArray(newValue) ? newValue.map((v) => v.value) : [])
                    }
                    placeholder="Select shifts"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Applicable Staff</label>
                  <ReactSelect
                    isMulti
                    options={staff.map((s) => ({ value: s.name, label: s.name }))}
                    value={rule.staffMembers.map((s) => ({ value: s, label: s }))}
                    onChange={(newValue) =>
                      updateRule(index, 'staffMembers', Array.isArray(newValue) ? newValue.map((v) => v.value) : [])
                    }
                    placeholder="Select staff"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">No. of Consecutive Days</label>
                <Select
                  onValueChange={(value) => updateRule(index, 'consecutiveDays', parseInt(value, 10))}
                  defaultValue={rule.consecutiveDays.toString()}
                  value={rule.consecutiveDays.toString()}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select Consecutive Days" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 9 }, (_, i) => i + 1).map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">No. of Gap Days</label>
                <Select
                  onValueChange={(value) => updateRule(index, 'gapDays', parseInt(value, 10))}
                  defaultValue={rule.gapDays.toString()}
                  value={rule.gapDays.toString()}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select Gap Days" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 9 }, (_, i) => i + 1).map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => removeRule(index)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        ))}
        <Button variant="secondary" onClick={addRule}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Special Rule
        </Button>
      </CardContent>
    </Card>
  );
}
