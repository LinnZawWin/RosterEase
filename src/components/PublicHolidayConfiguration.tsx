'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface PublicHoliday {
  name: string;
  date: string;
}

interface PublicHolidayConfigurationProps {
  dateRange: DateRange;
  setPublicHolidays: (holidays: PublicHoliday[]) => void;
}

export default function PublicHolidayConfiguration({ dateRange, setPublicHolidays }: PublicHolidayConfigurationProps) {
  const [publicHolidays, setLocalPublicHolidays] = useState<PublicHoliday[]>([]);
  const [selectedState, setSelectedState] = useState("AU-NSW");

  const fetchPublicHolidays = async () => {
    if (dateRange.from && dateRange.to) {
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');

      try {
        const response = await fetch(
          `https://date.nager.at/api/v3/PublicHolidays/${new Date(dateRange.from).getFullYear()}/AU`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch public holidays');
        }
        const holidays = await response.json();

        const filteredHolidays = holidays.filter(
          (holiday: { localName: string; date: string; counties?: string[] }) =>
            holiday.localName &&
            holiday.date &&
            new Date(holiday.date) >= new Date(startDate) &&
            new Date(holiday.date) <= new Date(endDate) &&
            holiday.counties?.includes(selectedState)
        );

        const updatedHolidays = filteredHolidays.map((holiday: { localName: string; date: string }) => ({
          name: holiday.localName,
          date: holiday.date,
        }));

        setLocalPublicHolidays(updatedHolidays);
        setPublicHolidays(updatedHolidays);
      } catch (error) {
        console.error('Error fetching public holidays:', error);
        alert('Failed to retrieve public holidays. Please try again later.');
      }
    }
  };

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchPublicHolidays();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, setPublicHolidays]);

  const addPublicHoliday = () => {
    setLocalPublicHolidays([...publicHolidays, { name: '', date: '' }]);
    setPublicHolidays([...publicHolidays, { name: '', date: '' }]);
  };

  const updatePublicHoliday = (index: number, field: string, value: string) => {
    const updatedHolidays = [...publicHolidays];
    updatedHolidays[index] = { ...updatedHolidays[index], [field]: value };
    setLocalPublicHolidays(updatedHolidays);
    setPublicHolidays(updatedHolidays);
  };

  const removePublicHoliday = (index: number) => {
    const updatedHolidays = [...publicHolidays];
    updatedHolidays.splice(index, 1);
    setLocalPublicHolidays(updatedHolidays);
    setPublicHolidays(updatedHolidays);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Public Holiday Configuration</CardTitle>
        <CardDescription>
          Configure public holidays within the selected date range.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 min-w-[90px]">State</label>
            <Select
              onValueChange={(value) => {
                setSelectedState(value);
                fetchPublicHolidays();
              }}
              defaultValue="AU-NSW"
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { value: "AU-ACT", label: "Australian Capital Territory" },
                  { value: "AU-NSW", label: "New South Wales" },
                  { value: "AU-NT", label: "Northern Territory" },
                  { value: "AU-QLD", label: "Queensland" },
                  { value: "AU-SA", label: "South Australia" },
                  { value: "AU-TAS", label: "Tasmania" },
                  { value: "AU-VIC", label: "Victoria" },
                  { value: "AU-WA", label: "Western Australia" },
                ]
                  .sort((a, b) => a.label.localeCompare(b.label))
                  .map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          {publicHolidays.map((holiday, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-center gap-2 rounded p-2">
              <Input
                type="text"
                className="py-1 px-2 h-8 text-sm w-48"
                value={holiday.name}
                onChange={e => {
                  const updated = [...publicHolidays];
                  updated[index] = { ...updated[index], name: e.target.value };
                  setLocalPublicHolidays(updated);
                }}
                onBlur={() => {
                  if (publicHolidays[index].name !== holiday.name) {
                    const updated = [...publicHolidays];
                    updated[index] = { ...updated[index], name: holiday.name };
                    setPublicHolidays(updated);
                  }
                }}
                placeholder="Holiday Name"
              />
              <Input
                type="date"
                className="py-1 px-2 h-8 text-sm w-40"
                value={holiday.date}
                onChange={(e) => updatePublicHoliday(index, 'date', e.target.value)}
                min={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                max={dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                placeholder="Date"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removePublicHoliday(index)}
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
            onClick={addPublicHoliday}
            aria-label="Add"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
