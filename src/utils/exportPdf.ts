import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Profile, OvertimeEntry, AppSettings, MonthSummary } from '../types';
import { MONTH_NAMES_EN } from './timeCalculations';

export interface CustomPdfTexts {
  headerLine1?: string;
  headerLine2?: string;
  titleText?: string;
  dutyHoursText?: string;
  claimantName?: string;
  claimantDesignation?: string;
  certText?: string;
}

export function generatePdfBlob(
  profile: Profile,
  year: number,
  month: number,
  entries: OvertimeEntry[],
  summary: MonthSummary,
  _settings?: AppSettings,
  customTexts?: CustomPdfTexts
): { blob: Blob; fileName: string; doc: jsPDF } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const monthNameEn = MONTH_NAMES_EN[month - 1];
  const cName = customTexts?.claimantName || profile.name;
  const cDesignation = customTexts?.claimantDesignation || profile.designation || 'Driver';
  
  const sanitizedName = cName.trim().replace(/\s+/g, '_');
  const fileName = `${sanitizedName}_${month}_${year}.pdf`;

  const pageWidth = doc.internal.pageSize.getWidth();
  let startY = 14;

  // Header Titles matching Official Consulate Format (Larger Fonts)
  const headerLine1 = customTexts?.headerLine1 || 'Bangladesh Consulate General';
  const headerLine2 = customTexts?.headerLine2 || 'Labour Welfare Wing, Dubai, UAE.';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(headerLine1, pageWidth / 2, startY, { align: 'center' });

  startY += 6;
  doc.setFontSize(12.5);
  doc.text(headerLine2, pageWidth / 2, startY, { align: 'center' });

  startY += 7;
  doc.setFontSize(11);
  const titleText = customTexts?.titleText || `Over-time Bill of ${cName} ${cDesignation} of Labour Wing, for the month of ${monthNameEn}, ${year}`;
  doc.text(titleText, pageWidth / 2, startY, { align: 'center' });
  
  // Underline for title text
  const textWidth = doc.getTextWidth(titleText);
  doc.setLineWidth(0.35);
  doc.line((pageWidth - textWidth) / 2, startY + 1.0, (pageWidth + textWidth) / 2, startY + 1.0);

  startY += 6.5;
  doc.setFontSize(10);
  const dutyHours = customTexts?.dutyHoursText || '(Normal Duty Hours/Time: From 09:00am to 05:00pm)';
  doc.text(dutyHours, pageWidth / 2, startY, { align: 'center' });

  // Generate full month table data matching Official Format
  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const tableData: (string | number)[][] = [];
  let grandTotalOtHours = 0;

  for (let d = 1; d <= totalDaysInMonth; d++) {
    const padMonth = month.toString().padStart(2, '0');
    const padDay = d.toString().padStart(2, '0');
    const dateStr = `${year}-${padMonth}-${padDay}`;
    const dateDisplay = `${d}-${month}-${year}`; // e.g. 1-7-2026

    const dateObj = new Date(year, month - 1, d);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    const foundEntry = entries.find(e => e.dateStr === dateStr);

    if (foundEntry && foundEntry.totalHours > 0) {
      grandTotalOtHours += foundEntry.totalHours;
      tableData.push([
        dateDisplay,
        dayName,
        foundEntry.fromTime || '5:00:00 PM',
        foundEntry.toTime || '10:00:00 PM',
        foundEntry.totalHours.toFixed(2),
        (foundEntry.remark === 'Over Time' ? '' : (foundEntry.remark || ''))
      ]);
    } else {
      tableData.push([
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
    ? grandTotalOtHours.toFixed(2) 
    : (summary.totalOtHours || 0).toFixed(2);

  // Total Summary Row
  tableData.push([
    'TOTAL',
    '',
    '',
    '',
    displayTotalHours,
    ''
  ]);

  autoTable(doc, {
    startY: startY + 4,
    head: [['Date', 'Day', 'Time out', 'Time in', 'Total over-time Hours for which Bill Claimed', 'Remark']],
    body: tableData,
    theme: 'grid',
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.4,
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 9,
      cellPadding: { top: 1.8, bottom: 1.8, left: 1, right: 1 },
      lineWidth: 0.4,
      lineColor: [0, 0, 0]
    },
    bodyStyles: {
      fontSize: 8.5,
      cellPadding: { top: 1.25, bottom: 1.25, left: 1, right: 1 },
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: 0.35,
      lineColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 28 },
      2: { cellWidth: 32 },
      3: { cellWidth: 32 },
      4: { cellWidth: 48, fontStyle: 'bold' },
      5: { halign: 'left' }
    },
    margin: { left: 10, right: 10, top: 38, bottom: 15 },
    didParseCell: function(data) {
      if (data.row.index === tableData.length - 1) {
        if (data.column.index === 0) {
          data.cell.styles.halign = 'center';
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 9;
        }
      }
    }
  });

  // Get y post table to render single page footer
  // @ts-ignore
  const finalY = (doc as any).lastAutoTable?.finalY || 220;

  // Footer & Signatures Block strictly on 1 page (filling bottom)
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);

  let currentY = finalY + 4;
  doc.text('Date:', 10, currentY);

  currentY += 6;
  doc.text('Signature of the Claimant', 10, currentY);
  doc.line(52, currentY, 130, currentY);

  currentY += 6.5;
  const certText = customTexts?.certText || `Certified that Mr. ${cName}, ${cDesignation} was engaged on duty beyond office hours of date times mentioned in this bill. It is also certified that these duties were official and do not include any private duty.`;
  const splitCert = doc.splitTextToSize(certText, pageWidth - 20);
  doc.text(splitCert, 10, currentY);

  currentY += (splitCert.length * 4.2) + 6.5;
  doc.text('Date:.............', 10, currentY);
  doc.line(pageWidth - 85, currentY, pageWidth - 10, currentY);

  const blob = doc.output('blob');
  return { blob, fileName, doc };
}

export function downloadPdf(
  profile: Profile,
  year: number,
  month: number,
  entries: OvertimeEntry[],
  summary: MonthSummary,
  settings: AppSettings,
  customTexts?: CustomPdfTexts
) {
  const { doc, fileName } = generatePdfBlob(profile, year, month, entries, summary, settings, customTexts);
  doc.save(fileName);
}


