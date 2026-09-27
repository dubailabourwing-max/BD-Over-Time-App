import * as XLSX from 'xlsx';
import { Profile, OvertimeEntry, AppSettings, MonthSummary } from '../types';
import { MONTH_NAMES_EN } from './timeCalculations';

export function exportToExcel(
  profile: Profile,
  year: number,
  month: number,
  entries: OvertimeEntry[],
  summary: MonthSummary,
  _settings?: AppSettings
) {
  const monthName = MONTH_NAMES_EN[month - 1];
  const sanitizedName = profile.name.trim().replace(/\s+/g, '_');
  const fileName = `${sanitizedName}_${month}_${year}.xlsx`;

  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const designation = profile.designation || 'Driver';

  // Prepare Excel worksheet rows matching Official Consulate Bill format
  const worksheetData: (string | number)[][] = [
    ['Bangladesh Consulate General'],
    ['Labour Welfare Wing, Dubai, UAE.'],
    [`Over-time Bill of ${profile.name} ${designation} of Labour Wing, for the month of ${monthName}, ${year}`],
    ['(Normal Duty Hours/Time: From 09:00am to 05:00pm)'],
    [''],
    ['Date', 'Day', 'Time out', 'Time in', 'Total over-time Hours for which Bill Claimed', 'Remark']
  ];

  let grandTotalOtHours = 0;

  for (let d = 1; d <= totalDaysInMonth; d++) {
    const padMonth = month.toString().padStart(2, '0');
    const padDay = d.toString().padStart(2, '0');
    const dateStr = `${year}-${padMonth}-${padDay}`;
    const dateDisplay = `${d}-${month}-${year}`;

    const dateObj = new Date(year, month - 1, d);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    const foundEntry = entries.find(e => e.dateStr === dateStr);

    if (foundEntry && foundEntry.totalHours > 0) {
      grandTotalOtHours += foundEntry.totalHours;
      worksheetData.push([
        dateDisplay,
        dayName,
        foundEntry.fromTime || '5:00:00 PM',
        foundEntry.toTime || '10:00:00 PM',
        Number(foundEntry.totalHours.toFixed(2)),
        (foundEntry.remark === 'Over Time' ? '' : (foundEntry.remark || ''))
      ]);
    } else {
      worksheetData.push([
        dateDisplay,
        dayName,
        '----',
        '----',
        '---',
        ''
      ]);
    }
  }

  const displayTotalHours = grandTotalOtHours > 0 
    ? Number(grandTotalOtHours.toFixed(2)) 
    : Number((summary.totalOtHours || 0).toFixed(2));

  // Total Summary Row
  worksheetData.push(['TOTAL', '', '', '', displayTotalHours, '']);
  worksheetData.push(['']);
  worksheetData.push(['Date:']);
  worksheetData.push(['Signature of the Claimant: _______________________']);
  worksheetData.push([`Certified that Mr. ${profile.name}, ${designation} was engaged on duty beyond office hours of date times mentioned in this bill. It is also certified that these duties were official and do not include any private duty.`]);
  worksheetData.push(['Date:.............']);

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Apply column widths
  worksheet['!cols'] = [
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 42 },
    { wch: 25 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `${monthName} ${year}`);

  XLSX.writeFile(workbook, fileName);
}

