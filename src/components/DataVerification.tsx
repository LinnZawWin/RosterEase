import { PublicHoliday } from '@/models/PublicHoliday';
import { format } from 'date-fns';

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

interface DataVerificationProps {
  dateRange: { from: Date | null; to: Date | null };
  staff: Staff[];
  shifts: any[];
  calendarData: any[];
  publicHolidays: PublicHoliday[]; // <-- Add this line
}

export default function DataVerification({
  dateRange,
  staff,
  shifts,
  calendarData,
  publicHolidays, // <-- Accept as prop
}: DataVerificationProps) {
  return (
    <>
      {/* Staff Accumulated Hours */}
      <div className="mb-8">
        <div className="border rounded shadow-sm mb-4">
          <div className="border-b px-4 py-2 bg-gray-50">
            <h2 className="text-lg font-semibold">Staff Accumulated Hours</h2>
            <p className="text-sm text-gray-600">
              View the accumulated hours assigned to each staff member for the selected date range.
            </p>
          </div>
          <div className="p-4">
            {dateRange.from && dateRange.to ? (
              <div className="overflow-x-auto">
                <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-2 bg-gray-100">Date</th>
                      {staff.map((s) => (
                        <th key={s.name} className="border border-gray-300 p-2 bg-gray-100">
                          {s.name} ({s.fte})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const rows: React.ReactNode[] = [];
                      let currentDate = new Date(dateRange.from);
                      const accumulatedHours: { [key: string]: number } = {};

                      // Initialize accumulated hours for each staff
                      staff.forEach((s) => {
                        accumulatedHours[s.name] = 0;
                      });

                      while (currentDate <= dateRange.to) {
                        const formattedDate = format(currentDate, 'yyyy-MM-dd');
                        const dayRoster = calendarData.find((d) => d.date === formattedDate);

                        const row = (
                          <tr key={formattedDate}>
                            <td className="border border-gray-300 p-2">{formattedDate}</td>
                            {staff.map((s) => {
                              const dailyHours = dayRoster
                                ? dayRoster?.shifts
                                    ?.sort((a: ShiftWithStaff, b: ShiftWithStaff) => a.order - b.order)
                                    ?.reduce((total: number, shift: ShiftWithStaff) => {
                                      if (shift.staff.some((staffMember) => staffMember.name === s.name)) {
                                        return total + shift.duration;
                                      }
                                      return total;
                                    }, 0)
                                : 0;

                              // Add daily hours to accumulated hours
                              accumulatedHours[s.name] += dailyHours;

                              const adjustedHours = s.fte < 1 ? accumulatedHours[s.name] / s.fte : accumulatedHours[s.name];
                              const displayValue =
                                s.fte < 1
                                  ? `${adjustedHours} (${accumulatedHours[s.name]})`
                                  : `${accumulatedHours[s.name]}`;

                              return (
                                <td key={s.name} className="border border-gray-300 p-2 text-center">
                                  {displayValue}
                                </td>
                              );
                            })}
                          </tr>
                        );

                        rows.push(row);
                        currentDate.setDate(currentDate.getDate() + 1);
                      }

                      return rows;
                    })()}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No data available. Please generate a roster to view accumulated hours.</p>
            )}
          </div>
        </div>
      </div>

      {/* Shift Assignments Summary */}
      <div>
        <div className="border rounded shadow-sm">
          <div className="border-b px-4 py-2 bg-gray-50">
            <h2 className="text-lg font-semibold">Shift Assignments Summary</h2>
            <p className="text-sm text-gray-600">
              View the number of shifts assigned to each staff member for each shift type.
            </p>
          </div>
          <div className="p-4">
            {calendarData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-2 bg-gray-100">Staff</th>
                      {shifts.map((shift) => (
                        <th key={shift.name} className="border border-gray-300 p-2 bg-gray-100">
                          {shift.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((s) => {
                      const shiftCounts: { [key: string]: number } = {};

                      // Initialize shift counts for each shift type
                      shifts.forEach((shift) => {
                        shiftCounts[shift.name] = 0;
                      });

                      // Count the number of shifts assigned to the staff
                      calendarData.forEach((dayRoster) => {
                        dayRoster?.shifts?.forEach((shift: ShiftWithStaff) => {
                          if (shift.staff.some((staffMember) => staffMember.name === s.name)) {
                            shiftCounts[shift.name]++;
                          }
                        });
                      });

                      return (
                        <tr key={s.name}>
                          <td className="border border-gray-300 p-2">{s.name}</td>
                          {shifts.map((shift) => (
                            <td key={shift.name} className="border border-gray-300 p-2 text-center">
                              {shiftCounts[shift.name]}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No shift assignments available. Please generate a roster to view the data.</p>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Shift Assignments Summary */}
      <div className="mt-8">
        <div className="border rounded shadow-sm">
          <div className="border-b px-4 py-2 bg-gray-50">
            <h2 className="text-lg font-semibold">Weekly Shift Assignments</h2>
            <p className="text-sm text-gray-600">
              View the number of shifts assigned for each shift type, grouped by week (Monday to Sunday).
            </p>
          </div>
          <div className="p-4">
            {calendarData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-2 bg-gray-100">Week</th>
                      {shifts.map((shift) => (
                        <th key={shift.name} className="border border-gray-300 p-2 bg-gray-100">
                          {shift.name}
                        </th>
                      ))}
                      <th className="border border-gray-300 p-2 bg-gray-100">Public Holidays</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Group calendarData by week (Monday to Sunday)
                      const weeks: { [weekKey: string]: any[] } = {};
                      calendarData.forEach((day) => {
                        const dateObj = new Date(day.date);
                        // Get Monday of the current week
                        const dayOfWeek = dateObj.getDay();
                        const monday = new Date(dateObj);
                        monday.setDate(dateObj.getDate() - ((dayOfWeek + 6) % 7));
                        const sunday = new Date(monday);
                        sunday.setDate(monday.getDate() + 6);
                        const weekKey = `${format(monday, 'yyyy-MM-dd')} to ${format(sunday, 'yyyy-MM-dd')}`;
                        if (!weeks[weekKey]) weeks[weekKey] = [];
                        weeks[weekKey].push(day);
                      });

                      // For each week, count shifts by type and public holidays
                      const rows: React.ReactNode[] = [];
                      Object.entries(weeks).forEach(([weekKey, days]) => {
                        const shiftCounts: { [key: string]: number } = {};
                        shifts.forEach((shift) => {
                          shiftCounts[shift.name] = 0;
                        });
                        days.forEach((dayRoster) => {
                          dayRoster?.shifts?.forEach((shift: ShiftWithStaff) => {
                            if (shiftCounts.hasOwnProperty(shift.name)) {
                              shiftCounts[shift.name]++;
                            }
                          });
                        });

                        // Count public holidays in this week
                        const [weekStartStr, weekEndStr] = weekKey.split(' to ');
                        const weekStart = new Date(weekStartStr);
                        const weekEnd = new Date(weekEndStr);
                        const publicHolidayCount = publicHolidays.filter(ph => {
                          const phDate = new Date(ph.date);
                          return phDate >= weekStart && phDate <= weekEnd;
                        }).length;

                        rows.push(
                          <tr key={weekKey}>
                            <td className="border border-gray-300 p-2">{weekKey}</td>
                            {shifts.map((shift) => (
                              <td key={shift.name} className="border border-gray-300 p-2 text-center">
                                {shiftCounts[shift.name]}
                              </td>
                            ))}
                            <td className="border border-gray-300 p-2 text-center">{publicHolidayCount}</td>
                          </tr>
                        );
                      });
                      return rows;
                    })()}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No weekly shift assignments available. Please generate a roster to view the data.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}