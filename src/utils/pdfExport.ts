
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { VITAsset, VITInspectionChecklist, SubstationInspection } from "@/lib/types";
import { LoadMonitoringData } from "@/lib/asset-types";
import { formatDate } from "@/utils/calculations";
import { format } from 'date-fns';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

// Add type declaration for jsPDF with autotable extensions
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY?: number;
    };
    autoTable: (options: any) => jsPDF;
    setPage: (pageNumber: number) => jsPDF;
    internal: {
      events: any;
      scaleFactor: number;
      pageSize: {
        width: number;
        getWidth: () => number;
        height: number;
        getHeight: () => number;
      };
      pages: number[];
      getEncryptor(objectId: number): (data: string) => string;
      getCurrentPageInfo: () => { pageNumber: number };
      getNumberOfPages: () => number;
    };
  }
}

/**
 * Export a single VIT asset to CSV format
 */
export const exportVITAssetToCsv = (asset: VITAsset) => {
  const header = "ID,Region,District,Voltage Level,Type of Unit,Serial Number,Location,GPS Coordinates,Status,Protection,Created At,Created By\n";
  const csv = header + `${asset.id},${asset.regionId},${asset.districtId},${asset.voltageLevel},${asset.typeOfUnit},${asset.serialNumber},${asset.location},${asset.gpsCoordinates},${asset.status},${asset.protection},${asset.createdAt},${asset.createdBy}\n`;

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `vit-asset-${asset.serialNumber}.csv`;
  link.click();
};

/**
 * Export a single VIT inspection to CSV format
 */
export const exportVITInspectionToCsv = (inspection: VITInspectionChecklist) => {
  const header = "ID,Asset ID,Inspection Date,Rodent/Termite Encroachment,Clean/Dust Free,Protection Button Enabled,Recloser Button Enabled,Ground/Earth Button Enabled,AC Power On,Battery Power Low,Handle Lock On,Remote Button Enabled,Gas Level Low,Earthing Arrangement Adequate,No Fuses Blown,No Damage to Bushings,No Damage to HV Connections,Insulators Clean,Paintwork Adequate,PT Fuse Link Intact,No Corrosion,Silica Gel Condition,Correct Labelling,Remarks\n";
  const csv = header + `${inspection.id},${inspection.vitAssetId || ''},${inspection.inspectionDate},${inspection.rodentTermiteEncroachment},${inspection.cleanDustFree},${inspection.protectionButtonEnabled},${inspection.recloserButtonEnabled},${inspection.groundEarthButtonEnabled},${inspection.acPowerOn},${inspection.batteryPowerLow},${inspection.handleLockOn},${inspection.remoteButtonEnabled},${inspection.gasLevelLow},${inspection.earthingArrangementAdequate},${inspection.noFusesBlown},${inspection.noDamageToBushings},${inspection.noDamageToHVConnections},${inspection.insulatorsClean},${inspection.paintworkAdequate},${inspection.ptFuseLinkIntact},${inspection.noCorrosion},${inspection.silicaGelCondition},${inspection.correctLabelling},${inspection.remarks}\n`;

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `vit-inspection-${inspection.id}.csv`;
  link.click();
};

/**
 * Generate PDF report for VIT asset
 */
export const exportVITAssetToPDF = async (asset: VITAsset, inspections: VITInspectionChecklist[]) => {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = 12;
  const lineHeight = fontSize * 1.5;
  let y = page.getHeight() - 50; // Start position from the top

  const drawText = (text: string, x: number, yPos: number, options: { font?: any, size?: number, color?: any, bold?: boolean } = {}) => {
    page.drawText(text, {
      x,
      y: yPos,
      font: options.bold ? boldFont : options.font || font,
      size: options.size || fontSize,
      color: options.color || rgb(0, 0, 0),
    });
  };

  // Asset Information
  drawText(`VIT Asset Report - Serial Number: ${asset.serialNumber}`, 50, y, { font: boldFont, size: 16 });
  y -= lineHeight * 1.5;

  drawText(`Region: ${asset.regionId}`, 50, y);
  drawText(`District: ${asset.districtId}`, 300, y);
  y -= lineHeight;

  drawText(`Voltage Level: ${asset.voltageLevel}`, 50, y);
  drawText(`Type of Unit: ${asset.typeOfUnit}`, 300, y);
  y -= lineHeight;

  drawText(`Location: ${asset.location}`, 50, y);
  drawText(`GPS Coordinates: ${asset.gpsCoordinates}`, 300, y);
  y -= lineHeight;

  drawText(`Status: ${asset.status}`, 50, y);
  drawText(`Protection: ${asset.protection}`, 300, y);
  y -= lineHeight * 1.5;

  // Inspection Checklists
  if (inspections && inspections.length > 0) {
    drawText("Inspection Checklists:", 50, y, { font: boldFont, size: 14 });
    y -= lineHeight;

    for (const inspection of inspections) {
      drawText(`Inspection Date: ${formatDate(inspection.inspectionDate)}`, 60, y, { bold: true });
      y -= lineHeight;

      const checklistItems = [
        `Rodent/Termite Encroachment: ${inspection.rodentTermiteEncroachment}`,
        `Clean/Dust Free: ${inspection.cleanDustFree}`,
        `Protection Button Enabled: ${inspection.protectionButtonEnabled}`,
        `Recloser Button Enabled: ${inspection.recloserButtonEnabled}`,
        `Ground/Earth Button Enabled: ${inspection.groundEarthButtonEnabled}`,
        `AC Power On: ${inspection.acPowerOn}`,
        `Battery Power Low: ${inspection.batteryPowerLow}`,
        `Handle Lock On: ${inspection.handleLockOn}`,
        `Remote Button Enabled: ${inspection.remoteButtonEnabled}`,
        `Gas Level Low: ${inspection.gasLevelLow}`,
        `Earthing Arrangement Adequate: ${inspection.earthingArrangementAdequate}`,
        `No Fuses Blown: ${inspection.noFusesBlown}`,
        `No Damage to Bushings: ${inspection.noDamageToBushings}`,
        `No Damage to HV Connections: ${inspection.noDamageToHVConnections}`,
        `Insulators Clean: ${inspection.insulatorsClean}`,
        `Paintwork Adequate: ${inspection.paintworkAdequate}`,
        `PT Fuse Link Intact: ${inspection.ptFuseLinkIntact}`,
        `No Corrosion: ${inspection.noCorrosion}`,
        `Silica Gel Condition: ${inspection.silicaGelCondition}`,
        `Correct Labelling: ${inspection.correctLabelling}`,
        `Remarks: ${inspection.remarks}`,
      ];

      for (const item of checklistItems) {
        drawText(item, 70, y);
        y -= lineHeight;
        if (y < 50) {
          page = pdfDoc.addPage();
          y = page.getHeight() - 50;
        }
      }
      y -= lineHeight * 0.5; // Space between inspections
    }
  } else {
    drawText("No inspection checklists available for this asset.", 50, y);
    y -= lineHeight;
  }

  // Save the PDF with a descriptive name
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `vit-asset-report-${asset.serialNumber}.pdf`;
  link.click();
};

// Provide aliases for backward compatibility, but do not export them
const exportInspectionToCsv = exportVITInspectionToCsv;
const exportInspectionToPDF = exportVITAssetToPDF;

/**
 * Generate comprehensive PDF report for Substation inspection
 */
export const exportSubstationInspectionToPDF = async (inspection: SubstationInspection) => {
  const doc = new jsPDF();

  // Function to add a new page if content overflows
  const checkPageOverflow = (currentY: number, requiredHeight: number) => {
    if (currentY + requiredHeight > doc.internal.pageSize.getHeight() - 10) {
      doc.addPage();
      return 20; // Reset Y position to the top of the new page
    }
    return currentY;
  };

  // Header
  doc.setFontSize(18);
  doc.text(`Substation Inspection Report`, 105, 20, { align: 'center' });

  // Basic Information
  let startY = 40;
  doc.setFontSize(12);
  doc.text(`Substation Number: ${inspection.substationNo}`, 20, startY);
  
  // Instead of using inspection.substationName, use substationNo as fallback
  doc.text(`Substation Name: ${inspection.substationName || "N/A"}`, 105, startY);
  
  doc.text(`Region: ${inspection.region}`, 20, startY + 8);
  doc.text(`District: ${inspection.district}`, 20, startY + 16);
  doc.text(`Date: ${format(new Date(inspection.date), 'PPP')}`, 105, startY + 16);
  doc.text(`Type: ${inspection.type}`, 20, startY + 24);
  doc.text(`Created By: ${inspection.createdBy || "N/A"}`, 105, startY + 24);
  startY += 32;

  // Inspection Items Table
  doc.setFontSize(14);
  startY = checkPageOverflow(startY, 10);
  doc.text('Inspection Checklist:', 20, startY);
  startY += 8;

  inspection.items.forEach((category) => {
    doc.setFontSize(13);
    startY = checkPageOverflow(startY, 10);
    doc.text(`${category.name}:`, 20, startY);
    startY += 7;

    category.items.forEach((item) => {
      doc.setFontSize(12);
      startY = checkPageOverflow(startY, 10);
      doc.text(`- ${item.name}: ${item.status}`, 30, startY);
      startY += 6;

      if (item.remarks) {
        const remarksLines = doc.splitTextToSize(`  Remarks: ${item.remarks}`, 160);
        for (let i = 0; i < remarksLines.length; i++) {
          startY = checkPageOverflow(startY, 10);
          doc.text(remarksLines[i], 30, startY);
          startY += 6;
        }
      }
    });
    startY += 4;
  });

  // Add Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Page ${i} of ${totalPages}`, 20, doc.internal.pageSize.getHeight() - 10);
  }

  // Save the PDF
  doc.save(`substation-inspection-${inspection.substationNo}-${formatDate(inspection.date)}.pdf`);
};

/**
 * Export a single substation inspection to CSV format
 */
export const exportSubstationInspectionToCsv = (inspection: SubstationInspection) => {
  let csvContent = "data:text/csv;charset=utf-8,";

  // Add headers
  const headers = Object.keys(inspection).join(",");
  csvContent += headers + "\r\n";

  // Convert the inspection object to an array of its values
  const values = Object.values(inspection);
  const row = values.join(",");
  csvContent += row + "\r\n";

  // Create a download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `substation_inspection_${inspection.substationNo}.csv`);
  document.body.appendChild(link); // Required for Firefox

  link.click(); // Simulate click to trigger download
};

/**
 * Export all substation inspections to a single CSV file
 */
export const exportAllSubstationInspectionsToCsv = (inspections: SubstationInspection[]) => {
  let csvContent = "data:text/csv;charset=utf-8,";

  if (inspections.length === 0) {
    alert("No inspections data to export.");
    return;
  }

  // Add headers (use keys from the first inspection object)
  const headers = Object.keys(inspections[0]).join(",");
  csvContent += headers + "\r\n";

  // Add rows for each inspection
  inspections.forEach(inspection => {
    const values = Object.values(inspection).join(",");
    csvContent += values + "\r\n";
  });

  // Create a download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "all_substation_inspections.csv");
  document.body.appendChild(link); // Required for Firefox

  link.click(); // Simulate click to trigger download
};

/**
 * Export load monitoring data to PDF
 */
export const exportLoadMonitoringToPDF = (data: LoadMonitoringData) => {
  const doc = new jsPDF();
  
  // Set up document
  doc.setFontSize(22);
  doc.text('Transformer Load Monitoring Report', 105, 20, { align: 'center' });
  
  // Add ECG logo if available
  // const logoUrl = '/lovable-uploads/ecg-logo.png';
  // doc.addImage(logoUrl, 'PNG', 20, 10, 30, 30);
  
  // Basic Information
  doc.setFontSize(14);
  doc.text('Basic Information', 20, 40);
  doc.setLineWidth(0.5);
  doc.line(20, 42, 190, 42);
  
  doc.setFontSize(11);
  const formattedDate = format(new Date(data.date), 'PPP');
  doc.text(`Date: ${formattedDate}`, 20, 50);
  doc.text(`Time: ${data.time}`, 105, 50);
  doc.text(`Region: ${data.region}`, 20, 58);
  doc.text(`District: ${data.district}`, 105, 58);
  doc.text(`Created By: ${data.createdBy || 'N/A'}`, 20, 66);
  
  // Substation Information
  doc.setFontSize(14);
  doc.text('Substation Information', 20, 76);
  doc.line(20, 78, 190, 78);
  
  doc.setFontSize(11);
  doc.text(`Substation Name: ${data.substationName}`, 20, 86);
  doc.text(`Substation Number: ${data.substationNumber}`, 105, 86);
  doc.text(`Location: ${data.location}`, 20, 94);
  doc.text(`Rating: ${data.rating} A`, 105, 94);
  doc.text(`Peak Load Status: ${data.peakLoadStatus}`, 20, 102);
  
  // Load Summary
  doc.setFontSize(14);
  doc.text('Load Summary', 20, 112);
  doc.line(20, 114, 190, 114);
  
  doc.setFontSize(11);
  
  // Calculate load class color
  let loadColor = [0, 0.5, 0]; // Green
  if (data.percentageLoad > 90) {
    loadColor = [0.8, 0, 0]; // Red
  } else if (data.percentageLoad > 75) {
    loadColor = [0.8, 0.6, 0]; // Orange/Yellow
  }
  
  // Draw percentage in circle
  doc.setFillColor(loadColor[0], loadColor[1], loadColor[2]);
  doc.circle(60, 132, 15, 'F');
  doc.setTextColor(1, 1, 1);
  doc.setFontSize(14);
  doc.text(`${data.percentageLoad.toFixed(1)}%`, 60, 132, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('Transformer Load', 60, 152, { align: 'center' });
  
  // Phase Information
  doc.setFontSize(11);
  doc.text('Red Phase:', 100, 124);
  doc.text(`${data.redPhaseBulkLoad.toFixed(1)} A`, 150, 124);
  
  doc.text('Yellow Phase:', 100, 132);
  doc.text(`${data.yellowPhaseBulkLoad.toFixed(1)} A`, 150, 132);
  
  doc.text('Blue Phase:', 100, 140);
  doc.text(`${data.bluePhaseBulkLoad.toFixed(1)} A`, 150, 140);
  
  doc.text('Average Current:', 100, 148);
  doc.text(`${data.averageCurrent.toFixed(2)} A`, 150, 148);
  
  doc.text('Calculated Neutral:', 100, 156);
  doc.text(`${data.calculatedNeutral.toFixed(2)} A`, 150, 156);
  
  // Detailed Calculations
  doc.setFontSize(14);
  doc.text('Detailed Calculations', 20, 170);
  doc.line(20, 172, 190, 172);
  
  doc.setFontSize(11);
  doc.text('Rated Load:', 20, 180);
  doc.text(`${data.ratedLoad.toFixed(2)} A`, 150, 180);
  
  doc.text('Percentage Load:', 20, 188);
  doc.text(`${data.percentageLoad.toFixed(2)}%`, 150, 188);
  
  doc.text('10% Full Load on Neutral:', 20, 196);
  doc.text(`${data.tenPercentFullLoadNeutral.toFixed(2)} A`, 150, 196);
  
  // Load Assessment
  let loadStatus = "Normal";
  if (data.percentageLoad > 90) {
    loadStatus = "Critical";
  } else if (data.percentageLoad > 75) {
    loadStatus = "Warning";
  }
  
  doc.text('Load Status Assessment:', 20, 204);
  doc.text(loadStatus, 150, 204);
  
  // Feeder Legs
  if (data.feederLegs && data.feederLegs.length > 0) {
    // Check if we need a new page
    if (doc.getPage() === 1 && data.feederLegs.length > 2) {
      doc.addPage();
      
      // Add header to new page
      doc.setFontSize(14);
      doc.text('Feeder Legs Information', 20, 20);
      doc.line(20, 22, 190, 22);
      
      let yPos = 30;
      
      // Create a table for feeder legs
      const tableData = data.feederLegs.map((leg, index) => [
        `Leg ${index + 1}`,
        leg.redPhaseCurrent.toFixed(2),
        leg.yellowPhaseCurrent.toFixed(2),
        leg.bluePhaseCurrent.toFixed(2),
        leg.neutralCurrent.toFixed(2)
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['', 'Red Phase (A)', 'Yellow Phase (A)', 'Blue Phase (A)', 'Neutral (A)']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255]
        },
        styles: { fontSize: 10 },
        margin: { top: 30 }
      });
    } else {
      // Add feeder legs on the same page
      doc.setFontSize(14);
      doc.text('Feeder Legs Information', 20, 214);
      doc.line(20, 216, 190, 216);
      
      // Create a table for feeder legs
      const tableData = data.feederLegs.map((leg, index) => [
        `Leg ${index + 1}`,
        leg.redPhaseCurrent.toFixed(2),
        leg.yellowPhaseCurrent.toFixed(2),
        leg.bluePhaseCurrent.toFixed(2),
        leg.neutralCurrent.toFixed(2)
      ]);
      
      doc.autoTable({
        startY: 224,
        head: [['', 'Red Phase (A)', 'Yellow Phase (A)', 'Blue Phase (A)', 'Neutral (A)']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255]
        },
        styles: { fontSize: 10 },
        margin: { top: 224 }
      });
    }
  }
  
  // Add footer with date and page numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Report generated on ${new Date().toLocaleString()} | Page ${i} of ${totalPages}`,
      105,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  doc.save(`load-monitoring-${data.substationNumber}-${format(new Date(data.date), 'yyyy-MM-dd')}.pdf`);
};
