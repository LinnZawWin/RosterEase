import { PublicHoliday } from '@/models/PublicHoliday';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay } from 'date-fns';

type Staff = {
  name: string;
  staffCategory: string;
  fte: number;
};

type ShiftWithStaff = {
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  staff: Staff[];
  days?: (string | never)[];
  order: number;
};

interface GeneratedRosterTableProps {
  dateRange: { from: Date | null; to: Date | null };
  calendarData: any[];
  shifts: any[];
  publicHolidays: PublicHoliday[];
}

export default function GeneratedRosterTable({
  dateRange,
  calendarData,
  shifts,
  publicHolidays,
}: GeneratedRosterTableProps) {
  if (!dateRange.from || !dateRange.to) {
    return <p className="text-gray-500">No roster generated yet. Please generate a roster to view the table.</p>;
  }

  return (
    <div className="overflow-x-auto">
      {(() => {
        const months = [];
        let currentDate = new Date(dateRange.from);

        // Generate tables for each month in the range
        while (currentDate <= dateRange.to) {
          const start = startOfMonth(currentDate);
          const end = endOfMonth(currentDate);
          const days = eachDayOfInterval({ start, end });
          const firstDayOfWeek = (getDay(start) + 6) % 7; // 0=Mon, 6=Sun
          const headerBg = "#e0e7ff";
          months.push(
            <div key={format(start, 'yyyy-MM')} className="mb-8">
              <h3 className="text-lg font-bold mb-4">{format(start, 'MMMM yyyy')}</h3>
              <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                <thead>
                  <tr>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <th
                        key={day}
                        className="border border-gray-300 p-2"
                        style={{ backgroundColor: headerBg }}
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const rows = [];
                    let cells: JSX.Element[] = [];

                    // Add empty cells for days before the first day of the month (Monday as first day)
                    for (let i = 0; i < firstDayOfWeek; i++) {
                      cells.push(<td key={`empty-${i}`} className="border border-gray-300 p-4"></td>);
                    }

                    // Add cells for each day of the month
                    days.forEach((day) => {
                      const formattedDay = format(day, 'yyyy-MM-dd');
                      const dayRoster = (calendarData || []).find((d) => d.date === formattedDay);
                      const adjustedDay = (getDay(day) + 6) % 7;
                      const isWeekend = adjustedDay === 5 || adjustedDay === 6;
                      const isPublicHoliday = publicHolidays.some(ph => ph.date === formattedDay);
                      const weekendBg = "#f5f5f5";

                      cells.push(
                        <td
                          key={formattedDay}
                          className={`border border-gray-300 p-4 align-top`}
                          style={{
                            backgroundColor: isPublicHoliday
                              ? "#FFF9C4"
                              : isWeekend
                              ? weekendBg
                              : undefined
                          }}
                        >
                          <div className="font-bold">{format(day, 'd')}</div>
                          {dayRoster && (
                            <div className="text-xs mt-2">
                              {dayRoster?.shifts
                                ?.slice() // create a shallow copy
                                .sort((a: ShiftWithStaff, b: ShiftWithStaff) => {
                                  // Find the order from the shifts array for each shift
                                  const orderA = shifts.find((s) => s.name === a.name)?.order ?? 0;
                                  const orderB = shifts.find((s) => s.name === b.name)?.order ?? 0;
                                  return orderA - orderB;
                                })
                                .map((shift: ShiftWithStaff, index: number) => (
                                  <div key={index} className="flex items-center text-gray-600">
                                    <span
                                      className="w-2 h-2 rounded-full mr-2"
                                      style={{
                                        backgroundColor:
                                          (shifts.find((s) => s.name === shift.name)?.color) || '#ccc'
                                      }}
                                    ></span>
                                    {shift.name}: {shift.staff.map((s: Staff) => s.name).join(', ')}
                                  </div>
                                ))}
                            </div>
                          )}
                        </td>
                      );

                      // If the week is complete, push the row and reset cells
                      if (cells.length === 7) {
                        rows.push(<tr key={`row-${rows.length}`}>{cells}</tr>);
                        cells = [];
                      }
                    });

                    // Add remaining cells to the last row
                    if (cells.length > 0) {
                      while (cells.length < 7) {
                        cells.push(<td key={`empty-${cells.length}`} className="border border-gray-300 p-4"></td>);
                      }
                      rows.push(<tr key={`row-${rows.length}`}>{cells}</tr>);
                    }

                    return rows;
                  })()}
                </tbody>
              </table>
            </div>
          );

          // Move to the next month
          currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        }

        return months;
      })()}
    </div>
  );
}