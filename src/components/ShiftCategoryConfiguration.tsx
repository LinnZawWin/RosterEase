'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';

interface ShiftCategoryConfigurationProps {
  shiftCategories: string[];
  setShiftCategories: (categories: string[]) => void;
}

export default function ShiftCategoryConfiguration({ shiftCategories, setShiftCategories }: ShiftCategoryConfigurationProps) {
  // Local state for input editing
  const [localValues, setLocalValues] = useState<string[]>(shiftCategories);

  useEffect(() => {
    setLocalValues(shiftCategories);
  }, [shiftCategories]);

  const addCategory = () => {
    setShiftCategories([...shiftCategories, '']);
  };

  const removeCategory = (index: number) => {
    const newCategories = [...shiftCategories];
    newCategories.splice(index, 1);
    setShiftCategories(newCategories);
  };

  const handleInputChange = (idx: number, value: string) => {
    const updated = [...localValues];
    updated[idx] = value;
    setLocalValues(updated);
  };

  const handleInputBlur = (idx: number) => {
    if (localValues[idx] !== shiftCategories[idx]) {
      const updated = [...shiftCategories];
      updated[idx] = localValues[idx];
      setShiftCategories(updated);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shift Categories</CardTitle>
        <CardDescription>
          Configure the categories of the shift.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {localValues.map((cat, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                className="py-1 px-2 h-8 text-sm w-36"
                maxLength={20}
                value={cat}
                onChange={e => handleInputChange(idx, e.target.value)}
                onBlur={() => handleInputBlur(idx)}
                placeholder={`e.g. Day, Night, etc.`}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeCategory(idx)}
                disabled={shiftCategories.length <= 1}
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
            onClick={addCategory}
            aria-label="Add"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}