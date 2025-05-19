import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';

export default function LeaveConfiguration({ staff, leaves, setLeaves }: any) {
  const [localLeaves, setLocalLeaves] = useState(leaves);

  useEffect(() => {
    setLocalLeaves(leaves);
  }, [leaves]);

  const handleLocalChange = (index: number, field: string, value: any) => {
    const updated = [...localLeaves];
    updated[index] = { ...updated[index], [field]: value };
    setLocalLeaves(updated);
  };

  const handleBlur = (index: number, field: string) => {
    if (localLeaves[index][field] !== leaves[index][field]) {
      const updated = [...leaves];
      updated[index] = { ...updated[index], [field]: localLeaves[index][field] };
      setLeaves(updated);
    }
  };

  const addLeave = () => {
    setLeaves([...leaves, { staff: staff[0]?.name || '', from: '', to: '' }]);
  };

  const removeLeave = (index: number) => {
    const updated = [...leaves];
    updated.splice(index, 1);
    setLeaves(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Configuration</CardTitle>
        <CardDescription>
          Configure staff leave within the selected date range.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {localLeaves.map((leave: any, idx: number) => (
            <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 rounded p-2">
              <select
                className="border rounded px-2 py-1 h-8 text-sm w-32"
                value={leave.staff}
                onChange={e => handleLocalChange(idx, 'staff', e.target.value)}
                onBlur={() => handleBlur(idx, 'staff')}
              >
                {staff.map((s: any) => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
              <Input
                type="date"
                className="h-8 text-sm w-36"
                value={leave.from ? (leave.from.toISOString ? leave.from.toISOString().slice(0, 10) : leave.from) : ''}
                onChange={e => handleLocalChange(idx, 'from', e.target.value)}
                onBlur={() => handleBlur(idx, 'from')}
              />
              <Input
                type="date"
                className="h-8 text-sm w-36"
                value={leave.to ? (leave.to.toISOString ? leave.to.toISOString().slice(0, 10) : leave.to) : ''}
                onChange={e => handleLocalChange(idx, 'to', e.target.value)}
                onBlur={() => handleBlur(idx, 'to')}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeLeave(idx)}
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
            onClick={addLeave}
            aria-label="Add"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}