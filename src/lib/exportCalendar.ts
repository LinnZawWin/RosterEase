import { format } from 'date-fns';
import * as XLSXStyle from 'xlsx-js-style';
import { PublicHoliday } from '@/models/PublicHoliday';

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
  publicHolidays: PublicHoliday[];
  dateRange: { from: Date | null; to: Date | null };
}) {
  if (!calendarData || calendarData.length === 0) {
    alert('No calendar data available to export. Please generate a roster first.');
    return;
  }

  // Group days into fortnights (blocks of 14 days, starting from the first Monday)
  const sortedDays = [...calendarData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const fortnights: any[][] = [];
  let block: any[] = [];
  let blockStartDate: Date | null = null;

  sortedDays.forEach((day) => {
    const dateObj = new Date(day.date);
    if (!blockStartDate) {
      // Start block on first Monday
      if (dateObj.getDay() === 1) {
        blockStartDate = dateObj;
        block = [day];
      }
    } else {
      block.push(day);
      if (block.length === 14) {
        fortnights.push(block);
        block = [];
        blockStartDate = null;
      }
    }
  });
  // Push last block if not empty
  if (block.length > 0) fortnights.push(block);

  // Prepare Excel rows for each pair of fortnights (side by side)
  const excelRows: any[][] = [];
  const cellStyles: { [cell: string]: any } = {};
  const cellTypes: { [cell: string]: any } = {};

  // Helper to get ordinal suffix for a date
  function getOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  // Helper to get Excel column letter
  function colLetter(idx: number) {
    let s = '';
    while (idx >= 0) {
      s = String.fromCharCode((idx % 26) + 65) + s;
      idx = Math.floor(idx / 26) - 1;
    }
    return s;
  }

  // Each row block: header, date row, staff rows, empty row
  for (let pairIdx = 0; pairIdx < fortnights.length; pairIdx += 2) {
    const leftBlock = fortnights[pairIdx];
    const rightBlock = fortnights[pairIdx + 1];

    // --- HEADER ROW ---
    const leftStart = leftBlock && leftBlock[0] ? new Date(leftBlock[0].date) : null;
    const rightStart = rightBlock && rightBlock[0] ? new Date(rightBlock[0].date) : null;
    const leftMonth = leftStart ? format(leftStart, 'MMM-yy') : '';
    const rightMonth = rightStart ? format(rightStart, 'MMM-yy') : '';

    // Header: [Month, Mon, Tue, ..., Sun] x2 + Total Hours
    const headerRow = [
      leftMonth, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
      '', // spacer
      rightMonth, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
      'Total Hours'
    ];
    excelRows.push(headerRow);

    // Style header
    headerRow.forEach((_, i) => {
      const col = colLetter(i);
      const row = excelRows.length;
      cellStyles[`${col}${row}`] = {
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };
    });

    // --- DATE ROW ---
    const leftDates: (Date | null)[] = [];
    if (leftBlock) {
      const monday = leftBlock[0] ? new Date(leftBlock[0].date) : null;
      if (monday) {
        for (let i = 0; i < 7; i++) {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          leftDates.push(d);
        }
      }
    }
    const rightDates: (Date | null)[] = [];
    if (rightBlock) {
      const monday = rightBlock[0] ? new Date(rightBlock[0].date) : null;
      if (monday) {
        for (let i = 0; i < 7; i++) {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          rightDates.push(d);
        }
      }
    }

    const dateRow = [
      '',
      ...leftDates.map((d) => {
        if (!d) return '';
        const dateStr = format(d, 'yyyy-MM-dd');
        const isPH = publicHolidays.some(ph => ph.date === dateStr);
        return `${getOrdinal(d.getDate())}${isPH ? ' (PH)' : ''}`;
      }),
      '',
      ...rightDates.map((d) => {
        if (!d) return '';
        const dateStr = format(d, 'yyyy-MM-dd');
        const isPH = publicHolidays.some(ph => ph.date === dateStr);
        return `${getOrdinal(d.getDate())}${isPH ? ' (PH)' : ''}`;
      }),
      ''
    ];
    excelRows.push(dateRow);

    // Style the whole date row as bold and italic, and border each week block
    dateRow.forEach((_, i) => {
      const col = colLetter(i);
      const row = excelRows.length;
      let border = {};
      // Border for left week block (columns B-H, i=1-7)
      if (i >= 1 && i <= 7) {
        border = {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        };
      }
      // Border for right week block (columns J-P, i=9-15)
      if (i >= 9 && i <= 15) {
        border = {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        };
      }
      cellStyles[`${col}${row}`] = {
        font: { bold: true, italic: true },
        alignment: { horizontal: "center", vertical: "center" },
        ...border
      };
    });

    // --- STAFF ROWS ---
    staff.forEach((s) => {
      let totalHours = 0;
      const row: (string | number)[] = [];
      row.push(s.name);

      // Left block (Mon-Sun)
      for (let i = 0; i < 7; i++) {
        const d = leftDates[i];
        if (!d) {
          row.push('');
          continue;
        }
        const dayRoster = leftBlock?.find((r) => r.date === format(d, 'yyyy-MM-dd'));
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
          const shift = shiftsForStaff[0];
          row.push(shift.duration);
          totalHours += shift.duration;
          // Color
          const shiftConfig = shifts.find((sh) => sh.name === shift.name);
          let fillColor = '';
          if (shiftConfig && shiftConfig.color) {
            fillColor = shiftConfig.color.replace('#', '').toUpperCase();
          }
          const col = colLetter(1 + i);
          const rowNum = excelRows.length + 1;
          if (fillColor) {
            cellStyles[`${col}${rowNum}`] = {
              fill: {
                patternType: "solid",
                fgColor: { rgb: fillColor }
              },
              border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
              }
            };
          } else {
            cellStyles[`${col}${rowNum}`] = {
              border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
              }
            };
          }
          cellTypes[`${col}${rowNum}`] = { t: 'n' };
        }
      }

      row.push(''); // spacer

      // Right block (Mon-Sun)
      for (let i = 0; i < 7; i++) {
        const d = rightDates[i];
        if (!d) {
          row.push('');
          continue;
        }
        const dayRoster = rightBlock?.find((r) => r.date === format(d, 'yyyy-MM-dd'));
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
          const shift = shiftsForStaff[0];
          row.push(shift.duration);
          totalHours += shift.duration;
          // Color
          const shiftConfig = shifts.find((sh) => sh.name === shift.name);
          let fillColor = '';
          if (shiftConfig && shiftConfig.color) {
            fillColor = shiftConfig.color.replace('#', '').toUpperCase();
          }
          const col = colLetter(9 + i);
          const rowNum = excelRows.length + 1;
          if (fillColor) {
            cellStyles[`${col}${rowNum}`] = {
              fill: {
                patternType: "solid",
                fgColor: { rgb: fillColor }
              },
              border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
              }
            };
          } else {
            cellStyles[`${col}${rowNum}`] = {
              border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
              }
            };
          }
          cellTypes[`${col}${rowNum}`] = { t: 'n' };
        }
      }

      // Total hours column (column R, index 16)
      row.push(totalHours);

      // Style total hours column
      const totalCol = colLetter(16);
      const rowNum = excelRows.length + 1;
      cellStyles[`${totalCol}${rowNum}`] = {
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };
      cellTypes[`${totalCol}${rowNum}`] = { t: 'n' };

      excelRows.push(row);
    });

    // Add empty row after each block
    excelRows.push([]);
  }

  // Create worksheet and workbook using xlsx-js-style
  const ws = XLSXStyle.utils.aoa_to_sheet(excelRows);

  // Apply cell styles for shift colors and borders
  Object.entries(cellStyles).forEach(([cell, style]) => {
    if (!ws[cell]) ws[cell] = { t: 'n', v: 0 };
    ws[cell].s = style;
  });

  // Apply cell types for duration cells (force as number)
  Object.entries(cellTypes).forEach(([cell, typeObj]) => {
    if (ws[cell]) {
      ws[cell].t = 'n';
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
  XLSXStyle.writeFile(wb, `Roster_Fortnightly_${fromDate}_to_${toDate}_${timestamp}.xlsx`);
}