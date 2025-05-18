'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';

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
  const addStaff = () => {
    setStaff([...staff, { name: '', staffCategory: staffCategories[0], fte: 1 }]);
  };

  const removeStaff = (index: number) => {
    const newStaff = [...staff];
    newStaff.splice(index, 1);
    setStaff(newStaff);
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
        <CardDescription>Configure staff details.</CardDescription>
      </CardHeader>
      <CardContent>
        {staff.map((s, index) => (
          <div key={index} className="mb-4 border rounded p-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <Input
                  type="text"
                  value={s.name}
                  onChange={(e) => updateStaff(index, 'name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <Select
                  onValueChange={(value) => updateStaff(index, 'staffCategory', value)}
                  defaultValue={s.staffCategory}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a staff category" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffCategories
                      .filter((staffCategory) => staffCategory.trim() !== '') // Exclude empty or invalid values
                      .map((staffCategory) => (
                        <SelectItem key={staffCategory} value={staffCategory}>
                          {staffCategory}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">FTE</label>
                <Select
                  onValueChange={(value) => updateStaff(index, 'fte', parseFloat(value))}
                  defaultValue={s.fte.toString()}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select FTE" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="0.5">0.5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => removeStaff(index)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        ))}
        <Button variant="secondary" onClick={addStaff}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </CardContent>
    </Card>
  );
}