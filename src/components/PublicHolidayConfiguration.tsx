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
  const [publicHolidays, setLocalPublicHolidays] = useState<PublicHoliday[]>([]); // Local state for holidays
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

        setLocalPublicHolidays(updatedHolidays); // Update local state
        setPublicHolidays(updatedHolidays); // Pass data back to the parent
      } catch (error) {
        console.error('Error fetching public holidays:', error);
        alert('Failed to retrieve public holidays. Please try again later.');
      }
    }
  };

  useEffect(() => {
    // Only fetch holidays if dateRange is valid
    if (dateRange.from && dateRange.to) {
      fetchPublicHolidays();
    }
  }, [dateRange, setPublicHolidays]);

  const addPublicHoliday = () => {
    setLocalPublicHolidays([...publicHolidays, { name: '', date: '' }]);
    setPublicHolidays([...publicHolidays, { name: '', date: '' }]); // Sync with parent
  };

  const updatePublicHoliday = (index: number, field: string, value: string) => {
    const updatedHolidays = [...publicHolidays];
    updatedHolidays[index] = { ...updatedHolidays[index], [field]: value };
    setLocalPublicHolidays(updatedHolidays);
    setPublicHolidays(updatedHolidays); // Sync with parent
  };

  const removePublicHoliday = (index: number) => {
    const updatedHolidays = [...publicHolidays];
    updatedHolidays.splice(index, 1);
    setLocalPublicHolidays(updatedHolidays);
    setPublicHolidays(updatedHolidays); // Sync with parent
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
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Select State</label>
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
          <div key={index} className="mb-4 border rounded p-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Holiday Name</label>
                <Input
                  type="text"
                  value={holiday.name}
                  onChange={(e) => updatePublicHoliday(index, 'name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <Input
                  type="date"
                  value={holiday.date}
                  onChange={(e) => updatePublicHoliday(index, 'date', e.target.value)}
                  min={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                  max={dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removePublicHoliday(index)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        ))}

        <Button variant="secondary" onClick={addPublicHoliday}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Public Holiday
        </Button>
      </CardContent>
    </Card>
  );
}
