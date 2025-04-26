'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';

interface Staff {
  name: string;
  category: string;
  fte: number;
}

interface StaffConfigurationProps {
  staff: Staff[];
  categories: string[];
  setStaff: (staff: Staff[]) => void;
}

export default function StaffConfiguration({ staff, categories, setStaff }: StaffConfigurationProps) {
  const addStaff = () => {
    setStaff([...staff, { name: '', category: categories[0], fte: 1 }]);
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
                  onValueChange={(value) => updateStaff(index, 'category', value)}
                  defaultValue={s.category}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((category) => category.trim() !== '') // Exclude empty or invalid values
                      .map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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