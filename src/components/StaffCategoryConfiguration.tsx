'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import { StaffCategory } from '@/models/StaffCategory';

interface StaffCategoryConfigurationProps {
  staffCategories: StaffCategory[];
  setStaffCategories: (staffCategories: StaffCategory[]) => void;
}

export default function StaffCategoryConfiguration({ staffCategories, setStaffCategories }: StaffCategoryConfigurationProps) {
  const addStaffCategory = () => {
    setStaffCategories([...staffCategories, '']);
  };

  const removeStaffCategory = (index: number) => {
    const newStaffCategories = [...staffCategories];
    newStaffCategories.splice(index, 1);
    setStaffCategories(newStaffCategories);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Category Configuration</CardTitle>
        <CardDescription>
          Configure categories for the staff.
        </CardDescription>
      </CardHeader>
      <CardContent>
    <div>
      {staffCategories.map((staffCategory, index) => (
        <div key={index} className="mb-4 border rounded p-4">
          <div className="grid grid-cols-1 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category Name</label>
              <Input
                type="text"
                value={staffCategory}
                onChange={(e) => {
                  const newStaffCategories = [...staffCategories];
                  newStaffCategories[index] = e.target.value;
                  setStaffCategories(newStaffCategories);
                }}
              />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => removeStaffCategory(index)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        </div>
      ))}
      <Button variant="secondary" onClick={addStaffCategory}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Category
      </Button>
    </div>
    </CardContent>
    </Card>
  );
}