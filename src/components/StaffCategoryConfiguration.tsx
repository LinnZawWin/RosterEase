'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';

interface StaffCategoryConfigurationProps {
  categories: string[];
  setCategories: (categories: string[]) => void;
}

export default function StaffCategoryConfiguration({ categories, setCategories }: StaffCategoryConfigurationProps) {
  const addCategory = () => {
    setCategories([...categories, '']);
  };

  const removeCategory = (index: number) => {
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    setCategories(newCategories);
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
      {categories.map((category, index) => (
        <div key={index} className="mb-4 border rounded p-4">
          <div className="grid grid-cols-1 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category Name</label>
              <Input
                type="text"
                value={category}
                onChange={(e) => {
                  const newCategories = [...categories];
                  newCategories[index] = e.target.value;
                  setCategories(newCategories);
                }}
              />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => removeCategory(index)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        </div>
      ))}
      <Button variant="secondary" onClick={addCategory}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Category
      </Button>
    </div>
    </CardContent>
    </Card>
  );
}