'use client';

import { useState, useEffect } from 'react';
import { Card, CardDescription, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import { StaffCategory } from '@/models/StaffCategory';

interface StaffCategoryConfigurationProps {
  staffCategories: StaffCategory[];
  setStaffCategories: (staffCategories: StaffCategory[]) => void;
}

export default function StaffCategoryConfiguration({ staffCategories, setStaffCategories }: StaffCategoryConfigurationProps) {
  // Manage all local values in a single state array
  const [localValues, setLocalValues] = useState<StaffCategory[]>(staffCategories);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalValues(staffCategories);
  }, [staffCategories]);

  const addStaffCategory = () => {
    setStaffCategories([...staffCategories, '']);
  };

  const removeStaffCategory = (index: number) => {
    const newStaffCategories = [...staffCategories];
    newStaffCategories.splice(index, 1);
    setStaffCategories(newStaffCategories);
  };

  const handleInputChange = (idx: number, value: string) => {
    const updated = [...localValues];
    updated[idx] = value;
    setLocalValues(updated);
  };

  const handleInputBlur = (idx: number) => {
    if (localValues[idx] !== staffCategories[idx]) {
      const updated = [...staffCategories];
      updated[idx] = localValues[idx];
      setStaffCategories(updated);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Staff Categories</CardTitle>
        <CardDescription>
          Configure the categories of the Staff.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 w-full">
          {localValues.map((cat, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
              className="py-1 px-2 h-8 text-sm w-36"
              maxLength={20}
              value={cat}
              onChange={e => handleInputChange(idx, e.target.value)}
              onBlur={() => handleInputBlur(idx)}
              placeholder={`e.g. AT, AT-C, BT, etc.`}
              />
              <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => removeStaffCategory(idx)}
              disabled={staffCategories.length <= 1}
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
            onClick={addStaffCategory}
            aria-label="Add"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}