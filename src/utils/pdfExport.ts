
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { VITAsset, VITInspectionChecklist, SubstationInspection, InspectionItem } from "@/lib/types";
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
      getNumberOfPages: () => number;
    };
  }
}

/**
 * Export VIT Asset data to CSV format
 */
export const exportVITAssetToCsv = (assets: VITAsset[]) => {
  const header = "Region,District,Voltage Level,Type of Unit,Serial Number,Location,GPS Coordinates,Status,Protection,Photo URL,Created By\n";
  const csv = assets.map(asset => {
    return `${asset.regionId},${asset.districtId},${asset.voltageLevel},${asset.typeOfUnit},${asset.serialNumber},${asset.location},${asset.gpsCoordinates},${asset.status},${asset.protection},${asset.photoUrl || ''},${asset.createdBy}`;
  }).join('\n');

  return header + csv;
};

/**
 * Export VIT Inspection data to CSV format
 */
export const exportVITInspectionToCsv = (inspections: VITInspectionChecklist[]) => {
  const header = "VIT Asset ID,Inspection Date,Inspected By,Rodent/Termite Encroachment,Clean and Dust Free,Protection Button Enabled,Recloser Button Enabled,Ground Earth Button Enabled,AC Power On,Battery Power Low,Handle Lock On,Remote Button Enabled,Gas Level Low,Earthing Arrangement Adequate,No Fuses Blown,No Damage to Bushings,No Damage to HV Connections,Insulators Clean,Paintwork Adequate,PT Fuse Link Intact,No Corrosion,Silica Gel Condition,Correct Labelling,Remarks\n";
  const csv = inspections.map(inspection => {
    return `${inspection.vitAssetId},${formatDate(inspection.inspectionDate)},${inspection.inspectedBy},${inspection.rodentTermiteEncroachment},${inspection.cleanDustFree},${inspection.protectionButtonEnabled},${inspection.recloserButtonEnabled},${inspection.groundEarthButtonEnabled},${inspection.acPowerOn},${inspection.batteryPowerLow},${inspection.handleLockOn},${inspection.remoteButtonEnabled},${inspection.gasLevelLow},${inspection.earthingArrangementAdequate},${inspection.noFusesBlown},${inspection.noDamageToBushings},${inspection.noDamageToHVConnections},${inspection.insulatorsClean},${inspection.paintworkAdequate},${inspection.ptFuseLinkIntact},${inspection.noCorrosion},${inspection.silicaGelCondition},${inspection.correctLabelling},${inspection.remarks || ''}`;
  }).join('\n');

  return header + csv;
};

/**
 * Generate PDF report for VIT asset
 */
export const exportVITAssetToPDF = async (asset: VITAsset, inspections: VITInspectionChecklist[]) => {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage();  // Changed from const to let to allow reassignment

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

  // Draw header with logo-like styling
  drawText("ELECTRICITY COMPANY OF GHANA", page.getWidth() / 2 - 150, y, { size: 18, bold: true });
  y -= lineHeight;
  drawText("VIT ASSET INSPECTION REPORT", page.getWidth() / 2 - 130, y, { size: 16, bold: true });
  y -= lineHeight * 2;

  // Add horizontal line
  const lineWidth = page.getWidth() - 100;
  page.drawLine({
    start: { x: 50, y },
    end: { x: 50 + lineWidth, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  // Asset Information in a table-like format
  drawText("ASSET INFORMATION", 50, y, { bold: true, size: 14 });
  y -= lineHeight * 1.5;

  // Two-column layout
  const col1 = 50;
  const col2 = 150;
  const col3 = 320;
  const col4 = 420;

  drawText("Serial Number:", col1, y, { bold: true });
  drawText(asset.serialNumber, col2, y);
  drawText("Type of Unit:", col3, y, { bold: true });
  drawText(asset.typeOfUnit, col4, y);
  y -= lineHeight;

  drawText("Voltage Level:", col1, y, { bold: true });
  drawText(asset.voltageLevel, col2, y);
  drawText("Status:", col3, y, { bold: true });
  drawText(asset.status, col4, y);
  y -= lineHeight;

  drawText("Location:", col1, y, { bold: true });
  drawText(asset.location, col2, y);
  drawText("Protection:", col3, y, { bold: true });
  drawText(asset.protection, col4, y);
  y -= lineHeight;

  drawText("GPS Coordinates:", col1, y, { bold: true });
  drawText(asset.gpsCoordinates, col2, y);
  y -= lineHeight * 2;

  // Add another horizontal line
  page.drawLine({
    start: { x: 50, y },
    end: { x: 50 + lineWidth, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  // Inspection Checklists
  if (inspections && inspections.length > 0) {
    drawText("INSPECTION RECORDS", 50, y, { bold: true, size: 14 });
    y -= lineHeight * 1.5;

    for (const inspection of inspections) {
      // Draw box around each inspection
      const boxStartY = y + lineHeight / 2;
      const itemCount = 21 + (inspection.remarks ? 1 : 0); // Count of checklist items + date + remarks if present
      const boxHeight = lineHeight * (itemCount / 2 + 2); // Adjust based on number of items

      // Check if we need a new page for this inspection
      if (y - boxHeight < 50) {
        page = pdfDoc.addPage();
        y = page.getHeight() - 50;
      }

      // Draw inspection header box
      page.drawRectangle({
        x: 40,
        y: y - lineHeight / 2,
        width: page.getWidth() - 80,
        height: lineHeight * 1.5,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
        color: rgb(0.9, 0.9, 0.9),
      });

      drawText(`Inspection Date: ${formatDate(inspection.inspectionDate)}`, 50, y, { bold: true });
      drawText(`Inspector: ${inspection.inspectedBy}`, page.getWidth() / 2, y, { bold: true });
      y -= lineHeight * 1.5;

      // Draw content box
      page.drawRectangle({
        x: 40,
        y: y - (boxHeight - lineHeight * 1.5) + lineHeight / 2,
        width: page.getWidth() - 80,
        height: boxHeight - lineHeight * 1.5,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      // Organize checklist items in two columns
      const leftColumnItems = [
        { label: "Rodent/Termite Encroachment", value: inspection.rodentTermiteEncroachment },
        { label: "Clean and Dust Free", value: inspection.cleanDustFree },
        { label: "Protection Button Enabled", value: inspection.protectionButtonEnabled },
        { label: "Recloser Button Enabled", value: inspection.recloserButtonEnabled },
        { label: "Ground Earth Button Enabled", value: inspection.groundEarthButtonEnabled },
        { label: "AC Power On", value: inspection.acPowerOn },
        { label: "Battery Power Low", value: inspection.batteryPowerLow },
        { label: "Handle Lock On", value: inspection.handleLockOn },
        { label: "Remote Button Enabled", value: inspection.remoteButtonEnabled },
        { label: "Gas Level Low", value: inspection.gasLevelLow },
      ];

      const rightColumnItems = [
        { label: "Earthing Arrangement Adequate", value: inspection.earthingArrangementAdequate },
        { label: "No Fuses Blown", value: inspection.noFusesBlown },
        { label: "No Damage to Bushings", value: inspection.noDamageToBushings },
        { label: "No Damage to HV Connections", value: inspection.noDamageToHVConnections },
        { label: "Insulators Clean", value: inspection.insulatorsClean },
        { label: "Paintwork Adequate", value: inspection.paintworkAdequate },
        { label: "PT Fuse Link Intact", value: inspection.ptFuseLinkIntact },
        { label: "No Corrosion", value: inspection.noCorrosion },
        { label: "Silica Gel Condition", value: inspection.silicaGelCondition },
        { label: "Correct Labelling", value: inspection.correctLabelling },
      ];

      // Left column
      let columnY = y;
      for (const item of leftColumnItems) {
        const isGood = getStatusColor(item.label, item.value);
        drawText(`${item.label}:`, 50, columnY, { bold: true });
        drawText(item.value, 230, columnY, { color: isGood ? rgb(0, 0.5, 0) : rgb(0.8, 0, 0) });
        columnY -= lineHeight;
      }

      // Right column
      columnY = y;
      for (const item of rightColumnItems) {
        const isGood = getStatusColor(item.label, item.value);
        drawText(`${item.label}:`, page.getWidth() / 2, columnY, { bold: true });
        drawText(item.value, page.getWidth() / 2 + 180, columnY, { color: isGood ? rgb(0, 0.5, 0) : rgb(0.8, 0, 0) });
        columnY -= lineHeight;
      }

      y -= lineHeight * 10; // Move down after the columns

      // Add remarks if present
      if (inspection.remarks) {
        drawText("Remarks:", 50, y, { bold: true });
        drawText(inspection.remarks, 120, y);
        y -= lineHeight;
      }

      y -= lineHeight * 1.5; // Space between inspections
    }
  } else {
    drawText("No inspection checklists available for this asset.", 50, y);
    y -= lineHeight;
  }

  // Add page numbers and footer
  const pageCount = pdfDoc.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const pageObj = pdfDoc.getPage(i);
    const pageY = 30;
    pageObj.drawText(`Page ${i + 1} of ${pageCount}`, pageObj.getWidth() - 100, pageY);
    pageObj.drawText(`Generated: ${format(new Date(), 'PPP')}`, 50, pageY);
  }

  // Save the PDF with a descriptive name
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `vit-asset-report-${asset.serialNumber}.pdf`;
  link.click();
};

// Helper function for inspection status colors
const getStatusColor = (key: string, value: string): boolean => {
  if (key === 'Rodent/Termite Encroachment' || key === 'Battery Power Low' || key === 'Gas Level Low') {
    return value === "No";
  } else if (key === 'Silica Gel Condition') {
    return value === "Good";
  } else {
    return value === "Yes";
  }
};

/**
 * Generate PDF report for Substation inspection
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
  doc.text(`Substation Name: ${inspection.substationName || "N/A"}`, 105, startY + 8);
  
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
        remarksLines.forEach((line) => {
          startY = checkPageOverflow(startY, 10);
          doc.text(line, 30, startY);
          startY += 6;
        });
      }
    });
    startY += 4;
  });

  // Add Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.getHeight() - 10);
  }

  // Save the PDF
  doc.save(`substation-inspection-${inspection.substationNo}-${formatDate(inspection.date)}.pdf`);
};

/**
 * Export a single substation inspection to CSV format
 */
export const exportSubstationInspectionToCsv = (inspection: SubstationInspection) => {
  // Create basic info rows
  const basicInfo = [
    ["Substation Number", inspection.substationNo],
    ["Substation Name", inspection.substationName || ""],
    ["Region", inspection.region],
    ["District", inspection.district],
    ["Date", formatDate(inspection.date)],
    ["Type", inspection.type],
    ["Created By", inspection.createdBy || "N/A"],
    ["Created At", inspection.createdAt ? new Date(inspection.createdAt).toLocaleString() : "N/A"]
  ];

  // Create inspection items rows
  const inspectionItems = inspection.items.flatMap(category =>
    category.items.map(item => [category.name, item.name, item.status, item.remarks])
  );

  // Combine all rows
  const csvRows = [
    ...basicInfo.map(row => row.join(",")),
    ["Category", "Item", "Status", "Remarks"].join(","), // Header for inspection items
    ...inspectionItems.map(row => row.join(",")),
  ];

  // Join rows with newline character
  const csvContent = csvRows.join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `substation-inspection-${inspection.substationNo}-${formatDate(inspection.date)}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export all substation inspections to a single CSV file
 */
export const exportAllSubstationInspectionsToCsv = (inspections: SubstationInspection[]) => {
  if (!inspections || inspections.length === 0) {
    return;
  }
  
  // Create header row
  const headers = [
    "ID",
    "Substation Number", 
    "Substation Name",
    "Region", 
    "District", 
    "Date", 
    "Type", 
    "Items Count", 
    "Good Items", 
    "Bad Items", 
    "Created By", 
    "Created At"
  ];
  
  // Create data rows for each inspection
  const rows = inspections.map(inspection => {
    const allItems = inspection.items
      .flatMap(category => category && category.items ? category.items : [])
      .filter(item => item !== undefined);
    
    const totalItems = allItems.length;
    const goodItems = allItems.filter(item => item && item.status === "good").length;
    const badItems = totalItems - goodItems;
    
    return [
      inspection.id,
      inspection.substationNo,
      inspection.substationName || "",
      inspection.region,
      inspection.district,
      formatDate(inspection.date),
      inspection.type,
      totalItems.toString(),
      goodItems.toString(),
      badItems.toString(),
      inspection.createdBy || "N/A",
      inspection.createdAt ? new Date(inspection.createdAt).toLocaleString() : "N/A"
    ];
  });
  
  // Combine headers and data
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `all-substation-inspections-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export VIT inspection to CSV and PDF formats
 */
export const exportInspectionToCsv = (inspection: VITInspectionChecklist, asset: VITAsset | null, getRegionName: (id: string) => string, getDistrictName: (id: string) => string) => {
  // Create header row
  const headers = [
    "Asset Serial Number",
    "Asset Type",
    "Asset Location",
    "Region",
    "District",
    "Inspection Date", 
    "Inspected By",
    "Rodent/Termite Encroachment", 
    "Clean and Dust Free",
    "Protection Button Enabled", 
    "Recloser Button Enabled", 
    "Ground Earth Button Enabled",
    "AC Power On", 
    "Battery Power Low", 
    "Handle Lock On", 
    "Remote Button Enabled", 
    "Gas Level Low",
    "Earthing Arrangement Adequate", 
    "No Fuses Blown", 
    "No Damage to Bushings", 
    "No Damage to HV Connections",
    "Insulators Clean", 
    "Paintwork Adequate", 
    "PT Fuse Link Intact", 
    "No Corrosion", 
    "Silica Gel Condition",
    "Correct Labelling", 
    "Remarks"
  ];

  // Create data row
  const data = [
    asset?.serialNumber || "",
    asset?.typeOfUnit || "",
    asset?.location || "",
    asset ? getRegionName(asset.regionId) : "",
    asset ? getDistrictName(asset.districtId) : "",
    formatDate(inspection.inspectionDate),
    inspection.inspectedBy,
    inspection.rodentTermiteEncroachment,
    inspection.cleanDustFree,
    inspection.protectionButtonEnabled,
    inspection.recloserButtonEnabled,
    inspection.groundEarthButtonEnabled,
    inspection.acPowerOn,
    inspection.batteryPowerLow,
    inspection.handleLockOn,
    inspection.remoteButtonEnabled,
    inspection.gasLevelLow,
    inspection.earthingArrangementAdequate,
    inspection.noFusesBlown,
    inspection.noDamageToBushings,
    inspection.noDamageToHVConnections,
    inspection.insulatorsClean,
    inspection.paintworkAdequate,
    inspection.ptFuseLinkIntact,
    inspection.noCorrosion,
    inspection.silicaGelCondition,
    inspection.correctLabelling,
    inspection.remarks || ""
  ];

  // Combine headers and data
  const csvContent = [
    headers.join(","),
    data.map(item => `"${item}"`).join(",")
  ].join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `vit-inspection-${inspection.id}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportInspectionToPDF = (inspection: VITInspectionChecklist, asset: VITAsset | null, getRegionName: (id: string) => string, getDistrictName: (id: string) => string): string => {
  const doc = new jsPDF();

  // Header styling
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("ELECTRICITY COMPANY OF GHANA", 105, 20, { align: "center" });
  doc.setFontSize(16);
  doc.text("VIT INSPECTION REPORT", 105, 30, { align: "center" });

  // Horizontal line
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  // Asset information section
  doc.setFontSize(14);
  doc.text("ASSET INFORMATION", 20, 45);
  
  doc.setFontSize(11);
  doc.text(`Serial Number: ${asset?.serialNumber || "N/A"}`, 20, 55);
  doc.text(`Type of Unit: ${asset?.typeOfUnit || "N/A"}`, 120, 55);
  
  doc.text(`Voltage Level: ${asset?.voltageLevel || "N/A"}`, 20, 62);
  doc.text(`Status: ${asset?.status || "N/A"}`, 120, 62);
  
  doc.text(`Location: ${asset?.location || "N/A"}`, 20, 69);
  doc.text(`Region: ${asset ? getRegionName(asset.regionId) : "N/A"}`, 120, 69);
  
  doc.text(`GPS Coordinates: ${asset?.gpsCoordinates || "N/A"}`, 20, 76);
  doc.text(`District: ${asset ? getDistrictName(asset.districtId) : "N/A"}`, 120, 76);

  // Inspection information section
  doc.setFontSize(14);
  doc.text("INSPECTION DETAILS", 20, 90);
  
  doc.setFontSize(11);
  doc.text(`Inspection Date: ${formatDate(inspection.inspectionDate)}`, 20, 100);
  doc.text(`Inspected By: ${inspection.inspectedBy}`, 120, 100);

  // Create a table for inspection items
  const tableColumn1 = ["Item", "Status"];
  const tableColumn2 = ["Item", "Status"];
  
  const tableRows1 = [
    ["Rodent/Termite Encroachment", inspection.rodentTermiteEncroachment],
    ["Clean and Dust Free", inspection.cleanDustFree],
    ["Protection Button Enabled", inspection.protectionButtonEnabled],
    ["Recloser Button Enabled", inspection.recloserButtonEnabled],
    ["Ground Earth Button Enabled", inspection.groundEarthButtonEnabled],
    ["AC Power On", inspection.acPowerOn],
    ["Battery Power Low", inspection.batteryPowerLow],
    ["Handle Lock On", inspection.handleLockOn],
    ["Remote Button Enabled", inspection.remoteButtonEnabled],
    ["Gas Level Low", inspection.gasLevelLow]
  ];
  
  const tableRows2 = [
    ["Earthing Arrangement Adequate", inspection.earthingArrangementAdequate],
    ["No Fuses Blown", inspection.noFusesBlown],
    ["No Damage to Bushings", inspection.noDamageToBushings],
    ["No Damage to HV Connections", inspection.noDamageToHVConnections],
    ["Insulators Clean", inspection.insulatorsClean],
    ["Paintwork Adequate", inspection.paintworkAdequate],
    ["PT Fuse Link Intact", inspection.ptFuseLinkIntact],
    ["No Corrosion", inspection.noCorrosion],
    ["Silica Gel Condition", inspection.silicaGelCondition],
    ["Correct Labelling", inspection.correctLabelling]
  ];

  // Left table
  doc.autoTable({
    head: [tableColumn1],
    body: tableRows1,
    startY: 110,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 30 } },
    headStyles: { fillColor: [50, 50, 50] },
    margin: { left: 20 }
  });

  // Right table
  doc.autoTable({
    head: [tableColumn2],
    body: tableRows2,
    startY: 110,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 30 } },
    headStyles: { fillColor: [50, 50, 50] },
    margin: { left: 120 }
  });

  let finalY = Math.max(
    doc.lastAutoTable?.finalY || 0,
    doc.lastAutoTable?.finalY || 0
  );

  // Add remarks if present
  if (inspection.remarks) {
    finalY += 10;
    doc.setFontSize(11);
    doc.text("Remarks:", 20, finalY);
    
    const splitRemarks = doc.splitTextToSize(inspection.remarks, 170);
    doc.text(splitRemarks, 20, finalY + 7);
    finalY += splitRemarks.length * 7 + 10;
  }

  // Add footer
  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), 'PPP')}`, 20, 285);
  doc.text("Page 1 of 1", 180, 285);

  // Save the PDF
  const filename = `vit-inspection-report-${inspection.id}.pdf`;
  doc.save(filename);
  return filename;
};

/**
 * Generate PDF report for load monitoring data
 */
export const exportLoadMonitoringToPDF = (loadData) => {
  const doc = new jsPDF();
  
  // Header styling
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("ELECTRICITY COMPANY OF GHANA", 105, 20, { align: "center" });
  doc.setFontSize(16);
  doc.text("TRANSFORMER LOAD MONITORING REPORT", 105, 30, { align: "center" });

  // Horizontal line
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  // Basic information
  doc.setFontSize(14);
  doc.text("MONITORING INFORMATION", 20, 45);
  
  doc.setFontSize(11);
  doc.text(`Date: ${loadData.date || "N/A"}`, 20, 55);
  doc.text(`Time: ${loadData.time || "N/A"}`, 120, 55);
  
  doc.text(`Region: ${loadData.region || "N/A"}`, 20, 62);
  doc.text(`District: ${loadData.district || "N/A"}`, 120, 62);
  
  doc.text(`Substation Name: ${loadData.substationName || "N/A"}`, 20, 69);
  doc.text(`Substation Number: ${loadData.substationNumber || "N/A"}`, 120, 69);
  
  doc.text(`Location: ${loadData.location || "N/A"}`, 20, 76);
  doc.text(`Rating (Amps): ${loadData.rating || "N/A"}`, 120, 76);
  
  doc.text(`Peak Load Status: ${loadData.peakLoadStatus || "N/A"}`, 20, 83);

  // Load metrics table
  doc.setFontSize(14);
  doc.text("LOAD METRICS", 20, 95);
  
  const metricsData = [
    ["Rated Load", `${loadData.ratedLoad?.toFixed(2) || "N/A"} A`],
    ["Red Phase Bulk Load", `${loadData.redPhaseBulkLoad?.toFixed(2) || "N/A"} A`],
    ["Yellow Phase Bulk Load", `${loadData.yellowPhaseBulkLoad?.toFixed(2) || "N/A"} A`],
    ["Blue Phase Bulk Load", `${loadData.bluePhaseBulkLoad?.toFixed(2) || "N/A"} A`],
    ["Average Current", `${loadData.averageCurrent?.toFixed(2) || "N/A"} A`],
    ["Percentage Load", `${loadData.percentageLoad?.toFixed(2) || "N/A"}%`],
    ["10% Full Load Neutral", `${loadData.tenPercentFullLoadNeutral?.toFixed(2) || "N/A"} A`],
    ["Calculated Neutral", `${loadData.calculatedNeutral?.toFixed(2) || "N/A"} A`]
  ];
  
  doc.autoTable({
    head: [["Metric", "Value"]],
    body: metricsData,
    startY: 100,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 40 } },
    headStyles: { fillColor: [50, 50, 50] }
  });

  let finalY = doc.lastAutoTable?.finalY || 160;
  finalY += 10;

  // Feeder legs table
  if (loadData.feederLegs && loadData.feederLegs.length > 0) {
    doc.setFontSize(14);
    doc.text("FEEDER LEGS", 20, finalY);
    finalY += 5;
    
    const tableHeaders = ["Leg", "Red Phase (A)", "Yellow Phase (A)", "Blue Phase (A)", "Neutral (A)"];
    const tableRows = loadData.feederLegs.map((leg, index) => [
      `Leg ${index + 1}`,
      leg.redPhaseCurrent?.toFixed(2) || "0.00",
      leg.yellowPhaseCurrent?.toFixed(2) || "0.00",
      leg.bluePhaseCurrent?.toFixed(2) || "0.00",
      leg.neutralCurrent?.toFixed(2) || "0.00"
    ]);
    
    doc.autoTable({
      head: [tableHeaders],
      body: tableRows,
      startY: finalY,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [50, 50, 50] }
    });
    
    finalY = doc.lastAutoTable?.finalY || finalY + 40;
    finalY += 10;
  }

  // Add a load balance chart visualization (simplified for this version)
  doc.setFontSize(14);
  doc.text("PHASE BALANCE VISUALIZATION", 20, finalY);
  finalY += 10;
  
  // Draw a simple bar chart for phase currents
  const chartWidth = 150;
  const maxCurrent = Math.max(
    loadData.redPhaseBulkLoad || 0,
    loadData.yellowPhaseBulkLoad || 0,
    loadData.bluePhaseBulkLoad || 0
  );
  
  // Red phase bar
  const redWidth = loadData.redPhaseBulkLoad ? (loadData.redPhaseBulkLoad / maxCurrent) * chartWidth : 0;
  doc.setFillColor(220, 0, 0);
  doc.rect(30, finalY, redWidth, 10, 'F');
  doc.text(`Red: ${loadData.redPhaseBulkLoad?.toFixed(2) || "0.00"} A`, 30 + redWidth + 5, finalY + 7);
  
  // Yellow phase bar
  const yellowWidth = loadData.yellowPhaseBulkLoad ? (loadData.yellowPhaseBulkLoad / maxCurrent) * chartWidth : 0;
  doc.setFillColor(220, 220, 0);
  doc.rect(30, finalY + 15, yellowWidth, 10, 'F');
  doc.text(`Yellow: ${loadData.yellowPhaseBulkLoad?.toFixed(2) || "0.00"} A`, 30 + yellowWidth + 5, finalY + 22);
  
  // Blue phase bar
  const blueWidth = loadData.bluePhaseBulkLoad ? (loadData.bluePhaseBulkLoad / maxCurrent) * chartWidth : 0;
  doc.setFillColor(0, 0, 220);
  doc.rect(30, finalY + 30, blueWidth, 10, 'F');
  doc.text(`Blue: ${loadData.bluePhaseBulkLoad?.toFixed(2) || "0.00"} A`, 30 + blueWidth + 5, finalY + 37);

  // Add footer
  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), 'PPP')}`, 20, 285);
  doc.text("Page 1 of 1", 180, 285);

  // Save the PDF
  const filename = `load-monitoring-report-${loadData.substationNumber || new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
  return filename;
};
