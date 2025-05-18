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
        <CardTitle>Staff Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {staffCategories.map((cat, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                className="py-1 px-2 h-8 text-sm w-36" // w-36 ≈ 9rem, fits ~20 chars in most fonts
                maxLength={20}
                value={cat}
                onChange={e => {
                  const updated = [...staffCategories];
                  updated[idx] = e.target.value;
                  setStaffCategories(updated);
                }}
                placeholder={`Category ${idx + 1}`}
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