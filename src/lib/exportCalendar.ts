import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import * as XLSXStyle from 'xlsx-js-style';

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
  color?: string;
};

export function exportCalendar({
  calendarData,
  staff,
  shifts,
  publicHolidays,
  dateRange,
}: {
  calendarData: any[];
  staff: Staff[];
  shifts: any[];
  publicHolidays: string[];
  dateRange: { from: Date | null; to: Date | null };
}) {
  if (!calendarData || calendarData.length === 0) {
    alert('No calendar data available to export. Please generate a roster first.');
    return;
  }

  // Prepare data for Excel (similar to your CSV logic)
  const weeks: { [key: string]: any[] } = {};
  calendarData.forEach((dayRoster) => {
    const date = new Date(dayRoster.date);
    const monday = new Date(date);
    const day = monday.getDay();
    monday.setDate(monday.getDate() - ((day + 6) % 7));
    const weekKey = format(monday, 'yyyy-MM-dd');
    if (!weeks[weekKey]) weeks[weekKey] = [];
    weeks[weekKey].push(dayRoster);
  });

  const sortedWeekKeys = Object.keys(weeks).sort();
  const excelRows: any[][] = [];
  const cellStyles: { [cell: string]: any } = {};
  const cellTypes: { [cell: string]: any } = {};

  // Track the start and end row for each week block
  let currentRow = 0;
  const weekBlocks: { start: number; end: number }[] = [];

  // Helper to get ordinal suffix for a date
  function getOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  sortedWeekKeys.forEach((weekKey, weekIdx) => {
    const weekDays = weeks[weekKey]
      .map((d) => new Date(d.date))
      .sort((a, b) => a.getTime() - b.getTime());

    const weekDates: (Date | null)[] = [];
    const monday = new Date(weekKey);
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const found = weekDays.find((wd) => format(wd, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd'));
      weekDates.push(found ? d : null);
    }

    // For the very first block, set the previous month if the 1st is not Monday
    let monthYear = weekDates[0] ? format(weekDates[0], 'MMM-yy') : '';
    if (weekIdx === 0 && weekDates.some(d => d && d.getDate() === 1 && d.getDay() !== 1)) {
      // Find the first date in the week that is the 1st
      const firstOfMonth = weekDates.find(d => d && d.getDate() === 1);
      if (firstOfMonth) {
        const prevMonth = new Date(firstOfMonth);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        monthYear = format(prevMonth, 'MMM-yy');
      }
    }

    // Track start row for this week block (1-based for Excel)
    const blockStartRow = currentRow + 1;

    // Add header row with bold and center alignment
    const headerRow = [
      monthYear,
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ];
    excelRows.push(headerRow);
    currentRow++;

    // Apply bold and center alignment to header row cells
    headerRow.forEach((_, i) => {
      const colLetter = String.fromCharCode('A'.charCodeAt(0) + i);
      const rowNum = currentRow; // 1-based index
      cellStyles[`${colLetter}${rowNum}`] = {
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center" }
      };
    });
    // Add date number row (with PH marking and yellow background if public holiday)
    excelRows.push([
      '',
      ...weekDates.map((d, i) => {
        if (!d) return '';
        const dateStr = format(d, 'yyyy-MM-dd');
        const isPH = publicHolidays.includes(dateStr);
        const label = `${getOrdinal(d.getDate())}${isPH ? ' (PH)' : ''}`;
        return label;
      })
    ]);
    currentRow++;

    // Apply bold+italic and center alignment to date number row cells
    weekDates.forEach((d, i) => {
      const colLetter = String.fromCharCode('B'.charCodeAt(0) + i);
      const rowNum = currentRow; // 1-based index (date number row)
      const dateStr = d ? format(d, 'yyyy-MM-dd') : '';
      const isPH = d && publicHolidays.includes(dateStr);
      cellStyles[`${colLetter}${rowNum}`] = {
        ...(isPH
          ? {
              fill: {
                patternType: "solid",
                fgColor: { rgb: "FFF9C4" } // light yellow
              },
              font: { bold: true, italic: true },
              alignment: { horizontal: "center", vertical: "center" }
            }
          : {
              font: { bold: true, italic: true },
              alignment: { horizontal: "center", vertical: "center" }
            }
        )
      };
    });

    staff.forEach((s, staffIdx) => {
      const row: (string | number)[] = [];
      row.push(s.name);
      for (let i = 0; i < 7; i++) {
        const d = weekDates[i];
        if (!d) {
          row.push('');
          continue;
        }
        const dayRoster = calendarData.find(
          (r) => r.date === format(d, 'yyyy-MM-dd')
        );
        if (!dayRoster) {
          row.push('');
          continue;
        }
        const shiftsForStaff = (dayRoster.shifts || []).filter((shift: ShiftWithStaff) =>
          shift.staff.some((st: Staff) => st.name === s.name)
        );
        if (shiftsForStaff.length === 0) {
          row.push('');
        } else {
          // Only show the duration (not shift type), and set cell color
          const shift = shiftsForStaff[0];
          row.push(shift.duration); // Push as number, not string
          // Use the color property from the shifts config data
          const shiftConfig = shifts.find((sh) => sh.name === shift.name);
          let fillColor = '';
          if (shiftConfig && shiftConfig.color) {
            // Remove leading # if present and convert to uppercase for Excel
            fillColor = shiftConfig.color.replace('#', '').toUpperCase();
          }
          // Excel cell address: e.g. B3, C3, etc.
          const colLetter = String.fromCharCode('B'.charCodeAt(0) + i);
          const rowNum = currentRow + 1;
          if (fillColor) {
            cellStyles[`${colLetter}${rowNum}`] = {
              fill: {
                patternType: "solid",
                fgColor: { rgb: fillColor }
              }
            };
          }
          // Set cell type to number for aggregation
          cellTypes[`${colLetter}${rowNum}`] = { t: 'n' };
        }
      }
      excelRows.push(row);
      currentRow++;
    });

    excelRows.push(['']);
    currentRow++;

    // Track end row for this week block (exclude the empty row)
    weekBlocks.push({ start: blockStartRow, end: currentRow - 1 });
  });

  // Apply thick outside border for each week block
  weekBlocks.forEach(({ start, end }) => {
    // Columns A-H (0-7)
    for (let colIdx = 0; colIdx <= 7; colIdx++) {
      const colLetter = String.fromCharCode('A'.charCodeAt(0) + colIdx);

      // Top border
      const topCell = `${colLetter}${start}`;
      cellStyles[topCell] = {
        ...cellStyles[topCell],
        border: {
          ...(cellStyles[topCell]?.border || {}),
          top: { style: "thick", color: { rgb: "000000" } }
        }
      };

      // Bottom border
      const bottomCell = `${colLetter}${end}`;
      cellStyles[bottomCell] = {
        ...cellStyles[bottomCell],
        border: {
          ...(cellStyles[bottomCell]?.border || {}),
          bottom: { style: "thick", color: { rgb: "000000" } }
        }
      };
    }
    // Left and right borders for all rows in block
    for (let row = start; row <= end; row++) {
      // Left border (A)
      const leftCell = `A${row}`;
      cellStyles[leftCell] = {
        ...cellStyles[leftCell],
        border: {
          ...(cellStyles[leftCell]?.border || {}),
          left: { style: "thick", color: { rgb: "000000" } }
        }
      };
      // Right border (H)
      const rightCell = `H${row}`;
      cellStyles[rightCell] = {
        ...cellStyles[rightCell],
        border: {
          ...(cellStyles[rightCell]?.border || {}),
          right: { style: "thick", color: { rgb: "000000" } }
        }
      };
    }
  });

  // Create worksheet and workbook using xlsx-js-style
  const ws = XLSXStyle.utils.aoa_to_sheet(excelRows);

  // Apply cell styles for shift colors and borders
  Object.entries(cellStyles).forEach(([cell, style]) => {
    if (!ws[cell]) ws[cell] = { t: 'n', v: 0 }; // Default to number type
    ws[cell].s = style;
  });

  // Apply cell types for duration cells (force as number)
  Object.entries(cellTypes).forEach(([cell, typeObj]) => {
    if (ws[cell]) {
      ws[cell].t = 'n';
      // If value is string, try to convert to number
      if (typeof ws[cell].v === 'string') {
        const num = Number(ws[cell].v);
        if (!isNaN(num)) ws[cell].v = num;
      }
    }
  });

  const wb = XLSXStyle.utils.book_new();
  XLSXStyle.utils.book_append_sheet(wb, ws, 'Roster');

  // Download Excel file
  const fromDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : 'unknown';
  const toDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : 'unknown';
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  XLSXStyle.writeFile(wb, `Roster_Weekly_${fromDate}_to_${toDate}_${timestamp}.xlsx`);
}