import React from 'react';
import { Input } from './ui/input';

export default function LeaveConfiguration({ staff, leaves, setLeaves }: any) {
  const handleChange = (index: number, field: string, value: any) => {
    const newLeaves = [...leaves];
    newLeaves[index] = { ...newLeaves[index], [field]: value };
    setLeaves(newLeaves);
  };

  return (
    <div>
      <h3 className="text-md font-semibold mb-2">Leave Configuration</h3>
      {leaves.map((leave: any, idx: number) => (
        <div key={idx} className="flex gap-2 items-center mb-2">
          <select
            className="border rounded px-2 py-1"
            value={leave.staff}
            onChange={e => handleChange(idx, 'staff', e.target.value)}
          >
            {staff.map((s: any) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
          <Input
            type="date"
            value={leave.from ? leave.from.toISOString().slice(0, 10) : ''}
            onChange={e => handleChange(idx, 'from', new Date(e.target.value))}
          />
          <span>to</span>
          <Input
            type="date"
            value={leave.to ? leave.to.toISOString().slice(0, 10) : ''}
            onChange={e => handleChange(idx, 'to', new Date(e.target.value))}
          />
        </div>
      ))}
    </div>
  );
}