
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { LoadMonitoringData } from '@/lib/asset-types';
import { formatDate } from '@/utils/calculations';

/**
 * Export Load Monitoring data to PDF format
 */
export const exportLoadMonitoringToPDF = (data: LoadMonitoringData) => {
  // Create a PDF document
  const doc = new jsPDF();
  
  // Add header with ECG branding
  doc.setFillColor(0, 83, 156);
  doc.rect(0, 0, 210, 25, 'F');
  
  // Add title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Load Monitoring Report", 105, 15, { align: "center" });
  
  // Add basic info section
  doc.setDrawColor(0, 83, 156);
  doc.setLineWidth(0.5);
  doc.line(14, 35, 196, 35);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text("Load Monitoring Information", 14, 45);
  
  // Create basic information table
  const basicInfo = [
    ['Substation', data.substationName],
    ['Feeder', data.feederName],
    ['Region', data.region],
    ['District', data.district],
    ['Date', formatDate(data.date)],
    ['Recorded By', data.recordedBy]
  ];
  
  doc.autoTable({
    startY: 50,
    head: [['Field', 'Value']],
    body: basicInfo,
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 83, 156],
      textColor: [255, 255, 255],
      fontStyle: 'bold' 
    },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  // Add load readings section
  doc.text("Load Readings", 14, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 120);
  
  // Add load readings table
  const readingsData = [
    ['Maximum Load (MW)', data.maximumLoadMW.toString(), data.maximumLoadTime || ''],
    ['Minimum Load (MW)', data.minimumLoadMW.toString(), data.minimumLoadTime || ''],
    ['Average Load (MW)', data.averageLoadMW.toString(), '']
  ];
  
  doc.autoTable({
    startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 125,
    head: [['Reading Type', 'Value (MW)', 'Time']],
    body: readingsData,
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 83, 156],
      textColor: [255, 255, 255],
      fontStyle: 'bold' 
    },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  // Add hourly load profile if available
  if (data.hourlyReadings && data.hourlyReadings.length > 0) {
    doc.text("Hourly Load Profile", 14, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 180);
    
    const hourlyData = data.hourlyReadings.map(reading => [
      reading.hour.toString(),
      reading.loadMW.toString()
    ]);
    
    doc.autoTable({
      startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 185,
      head: [['Hour', 'Load (MW)']],
      body: hourlyData,
      theme: 'grid',
      headStyles: { 
        fillColor: [0, 83, 156],
        textColor: [255, 255, 255],
        fontStyle: 'bold' 
      },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
  }
  
  // Add remarks if available
  if (data.remarks) {
    doc.addPage();
    doc.text("Remarks", 14, 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const splitRemarks = doc.splitTextToSize(data.remarks, 180);
    doc.text(splitRemarks, 14, 40);
  }
  
  // Add footer with ECG branding and timestamp
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 280);
    doc.text(`Page ${i} of ${pageCount}`, 180, 280, { align: 'right' });
    
    // Add watermark/logo
    doc.setFontSize(16);
    doc.setTextColor(230, 230, 230);
    doc.text("ECG - Electricity Company of Ghana", 105, 150, { align: "center", angle: 45 });
  }
  
  // Save the PDF
  const fileName = `load-monitoring-${data.substationName}-${formatDate(data.date)}.pdf`;
  doc.save(fileName);
  return fileName;
};

/**
 * Export Load Monitoring data to CSV format
 */
export const exportLoadMonitoringToCsv = (data: LoadMonitoringData) => {
  // Create basic info rows
  const basicInfo = [
    ["Substation", data.substationName],
    ["Feeder", data.feederName],
    ["Region", data.region],
    ["District", data.district],
    ["Date", formatDate(data.date)],
    ["Recorded By", data.recordedBy]
  ];

  // Create header rows and data structure
  let csvRows = [
    ["Load Monitoring Report - " + data.substationName],
    ["Basic Information:"],
    ...basicInfo.map(row => `"${row[0]}","${row[1]}"`),
    [""], // Empty row for separation
    ["Load Readings:"],
    ["Reading Type", "Value (MW)", "Time"],
    [`"Maximum Load","${data.maximumLoadMW}","${data.maximumLoadTime || ''}"`],
    [`"Minimum Load","${data.minimumLoadMW}","${data.minimumLoadTime || ''}"`],
    [`"Average Load","${data.averageLoadMW}",""`]
  ];

  // Add hourly readings if available
  if (data.hourlyReadings && data.hourlyReadings.length > 0) {
    csvRows.push(
      [""], // Empty row for separation
      ["Hourly Load Profile:"],
      ["Hour", "Load (MW)"]
    );
    
    data.hourlyReadings.forEach(reading => {
      csvRows.push(`"${reading.hour}","${reading.loadMW}"`);
    });
  }

  // Add remarks if available
  if (data.remarks) {
    csvRows.push(
      [""], // Empty row for separation
      ["Remarks:"],
      [`"${data.remarks}"`]
    );
  }

  // Join all rows
  const csvContent = csvRows.join("\n");
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `load-monitoring-${data.substationName}-${formatDate(data.date)}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
