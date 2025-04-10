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
 * Export a single VIT asset to CSV format
 */
export const exportVITAssetToCsv = (asset: VITAsset) => {
  // Create header row
  const headers = ["Region", "District", "Voltage Level", "Type of Unit", "Serial Number", "Location", "GPS Coordinates", "Status", "Protection"];

  // Create data row
  const data = [
    asset.regionId,
    asset.districtId,
    asset.voltageLevel,
    asset.typeOfUnit,
    asset.serialNumber,
    asset.location,
    asset.gpsCoordinates,
    asset.status,
    asset.protection
  ];

  // Combine headers and data
  const csvContent = [headers.join(","), data.join(",")].join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `vit-asset-${asset.serialNumber}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export a single VIT inspection to CSV format
 */
export const exportVITInspectionToCsv = (inspection: VITInspectionChecklist) => {
  // Create header row
  const headers = [
    "Inspection Date", "Inspected By", "Rodent/Termite Encroachment", "Clean/Dust Free",
    "Protection Button Enabled", "Recloser Button Enabled", "Ground/Earth Button Enabled",
    "AC Power On", "Battery Power Low", "Handle Lock On", "Remote Button Enabled", "Gas Level Low",
    "Earthing Arrangement Adequate", "No Fuses Blown", "No Damage to Bushings", "No Damage to HV Connections",
    "Insulators Clean", "Paintwork Adequate", "PT Fuse Link Intact", "No Corrosion", "Silica Gel Condition",
    "Correct Labelling", "Remarks"
  ];

  // Create data row
  const data = [
    inspection.inspectionDate,
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
    inspection.remarks
  ];

  // Combine headers and data
  const csvContent = [headers.join(","), data.join(",")].join("\n");

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

/**
 * Generate PDF report for VIT asset
 */
export const exportVITAssetToPDF = async (asset: VITAsset, inspections: VITInspectionChecklist[]) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();

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
