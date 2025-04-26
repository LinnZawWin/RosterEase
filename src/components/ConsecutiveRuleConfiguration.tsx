'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import { PlusCircle, Trash2 } from 'lucide-react';

const ReactSelect = dynamic(() => import('react-select'), { ssr: false });

interface Rule {
  shifts: string[];
  consecutiveDays: number;
  gapDays: number;
}

interface ConsecutiveRuleConfigurationProps {
  specialRules: Rule[];
  shifts: { name: string }[];
  setSpecialRules: (rules: Rule[]) => void;
}

export default function ConsecutiveRuleConfiguration({
  specialRules,
  shifts,
  setSpecialRules,
}: ConsecutiveRuleConfigurationProps) {
  const addRule = () => {
    setSpecialRules([...specialRules, { shifts: [], consecutiveDays: 1, gapDays: 1 }]);
  };

  const removeRule = (index: number) => {
    const updatedRules = [...specialRules];
    updatedRules.splice(index, 1);
    setSpecialRules(updatedRules);
  };

  const updateRule = (index: number, field: string, value: any) => {
    const updatedRules = [...specialRules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setSpecialRules(updatedRules);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Special Rule Configuration</CardTitle>
        <CardDescription>Configure special rules for shift assignments.</CardDescription>
      </CardHeader>
      <CardContent>
        {specialRules.map((rule, index) => (
          <div key={index} className="mb-4 border rounded p-4">
            <div className="grid grid-cols-3 gap-2">
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
              <div>
                <label className="block text-sm font-medium text-gray-700">No. of Consecutive Days</label>
                <Select
                  onValueChange={(value) => updateRule(index, 'consecutiveDays', parseInt(value, 10))}
                  defaultValue={rule.consecutiveDays.toString()}
                >
                  <SelectTrigger className="w-[180px]">
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
                >
                  <SelectTrigger className="w-[180px]">
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