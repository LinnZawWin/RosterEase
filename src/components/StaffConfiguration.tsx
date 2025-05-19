'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Staff {
  name: string;
  staffCategory: string;
  fte: number;
}

interface StaffConfigurationProps {
  staff: Staff[];
  staffCategories: string[];
  setStaff: (staff: Staff[]) => void;
}

export default function StaffConfiguration({ staff, staffCategories, setStaff }: StaffConfigurationProps) {
  const [localStaff, setLocalStaff] = useState<Staff[]>(staff);

  useEffect(() => {
    setLocalStaff(staff);
  }, [staff]);

  const addStaff = () => {
    setStaff([...staff, { name: '', staffCategory: staffCategories[0], fte: 1 }]);
  };

  const removeStaff = (index: number) => {
    const newStaff = [...staff];
    newStaff.splice(index, 1);
    setStaff(newStaff);
  };

  const handleInputChange = (idx: number, value: string) => {
    const updated = [...localStaff];
    updated[idx] = { ...updated[idx], name: value };
    setLocalStaff(updated);
  };

  const handleInputBlur = (idx: number) => {
    if (localStaff[idx].name !== staff[idx].name) {
      const updated = [...staff];
      updated[idx] = { ...updated[idx], name: localStaff[idx].name };
      setStaff(updated);
    }
  };

  const updateStaff = (index: number, field: string, value: any) => {
    const newStaff = [...staff];
    newStaff[index] = { ...newStaff[index], [field]: value };
    setStaff(newStaff);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Configuration</CardTitle>
        <CardDescription>Configure staff details including their FTE.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {localStaff.map((s, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="text"
                className="py-1 px-2 h-8 text-sm w-36"
                value={s.name}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onBlur={() => handleInputBlur(index)}
                placeholder="Name of the Staff"
              />
              <Select
                onValueChange={(value) => updateStaff(index, 'staffCategory', value)}
                value={s.staffCategory}
              >
                <SelectTrigger className="w-28 h-8 text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {staffCategories
                    .filter((staffCategory) => staffCategory.trim() !== '')
                    .map((staffCategory) => (
                      <SelectItem key={staffCategory} value={staffCategory}>
                        {staffCategory}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(value) => updateStaff(index, 'fte', parseFloat(value))}
                value={s.fte.toString()}
              >
                <SelectTrigger className="w-16 h-8 text-sm">
                  <SelectValue placeholder="FTE" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="0.5">0.5</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeStaff(index)}
                disabled={staff.length <= 1}
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
            onClick={addStaff}
            aria-label="Add"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}