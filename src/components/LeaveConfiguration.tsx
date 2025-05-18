import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';

export default function LeaveConfiguration({ staff, leaves, setLeaves }: any) {
  const handleChange = (index: number, field: string, value: any) => {
    const newLeaves = [...leaves];
    newLeaves[index] = { ...newLeaves[index], [field]: value };
    setLeaves(newLeaves);
  };

  const addLeave = () => {
    setLeaves([...leaves, { staff: staff[0]?.name || '', from: '', to: '' }]);
  };

  const removeLeave = (index: number) => {
    const newLeaves = [...leaves];
    newLeaves.splice(index, 1);
    setLeaves(newLeaves);
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
        {leaves.map((leave: any, idx: number) => (
          <div key={idx} className="mb-4 border rounded p-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Staff</label>
                <select
                  className="border rounded px-2 py-1 w-full"
                  value={leave.staff}
                  onChange={e => handleChange(idx, 'staff', e.target.value)}
                >
                  {staff.map((s: any) => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <Input
                  type="date"
                  value={leave.from ? leave.from.toISOString ? leave.from.toISOString().slice(0, 10) : leave.from : ''}
                  onChange={e => handleChange(idx, 'from', new Date(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <Input
                  type="date"
                  value={leave.to ? leave.to.toISOString ? leave.to.toISOString().slice(0, 10) : leave.to : ''}
                  onChange={e => handleChange(idx, 'to', new Date(e.target.value))}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeLeave(idx)}
              className="mt-2"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        ))}
        <Button variant="secondary" onClick={addLeave}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Leave
        </Button>
      </CardContent>
    </Card>
  );
}