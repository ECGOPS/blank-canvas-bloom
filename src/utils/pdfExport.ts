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

  // Asset Information
  drawText(`VIT Asset Report - Serial Number: ${asset.serialNumber}`, 50, y, { font: boldFont, size: 16 });
  y -= lineHeight * 1.5;

  drawText(`Type of Unit: ${asset.typeOfUnit}`, 50, y);
  y -= lineHeight;
  drawText(`Voltage Level: ${asset.voltageLevel}`, 50, y);
  y -= lineHeight;
  drawText(`Location: ${asset.location}`, 50, y);
  y -= lineHeight;
  drawText(`GPS Coordinates: ${asset.gpsCoordinates}`, 50, y);
  y -= lineHeight;
  drawText(`Status: ${asset.status}`, 50, y);
  y -= lineHeight;
  drawText(`Protection: ${asset.protection}`, 50, y);
  y -= lineHeight;

  // Inspection Checklists
  if (inspections && inspections.length > 0) {
    drawText("Inspection Checklists:", 50, y, { font: boldFont, size: 14 });
    y -= lineHeight;

    for (const inspection of inspections) {
      drawText(`Inspection Date: ${formatDate(inspection.inspectionDate)}`, 60, y, { bold: true });
      y -= lineHeight;

      const checklistItems = [
        `Rodent/Termite Encroachment: ${inspection.rodentTermiteEncroachment}`,
        `Clean and Dust Free: ${inspection.cleanDustFree}`,
        `Protection Button Enabled: ${inspection.protectionButtonEnabled}`,
        `Recloser Button Enabled: ${inspection.recloserButtonEnabled}`,
        `Ground Earth Button Enabled: ${inspection.groundEarthButtonEnabled}`,
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
      ];

      for (const item of checklistItems) {
        drawText(item, 70, y);
        y -= lineHeight;
        if (y < 50) {
          page = pdfDoc.addPage();  // Now we can reassign to page
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
 * Generate PDF report for Substation inspection
 */
export const exportSubstationInspectionToPDF = async (inspection: SubstationInspection) => {
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

  // Inspection Information
  drawText(`Substation Inspection Report - Date: ${formatDate(inspection.date)}`, 50, y, { font: boldFont, size: 16 });
  y -= lineHeight * 1.5;

  drawText(`Substation Name: ${inspection.substationName}`, 50, y);
  y -= lineHeight;
  drawText(`Inspector: ${inspection.inspector}`, 50, y);
  y -= lineHeight;

  // Inspection Items
  if (inspection.items && inspection.items.length > 0) {
    drawText("Inspection Items:", 50, y, { font: boldFont, size: 14 });
    y -= lineHeight;

    for (const item of inspection.items) {
      drawText(`${item.label}: ${item.status}`, 60, y);
      y -= lineHeight;
    }
  } else {
    drawText("No inspection items available for this inspection.", 50, y);
    y -= lineHeight;
  }

  // Save the PDF with a descriptive name
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `substation-inspection-report-${formatDate(inspection.date)}.pdf`;
  link.click();
};

/**
 * Export Substation Inspection data to CSV format
 */
export const exportSubstationInspectionToCsv = (inspections: SubstationInspection[]) => {
  const header = "Date,Substation Name,Inspector,";
  const itemHeaders = inspections[0]?.items?.map(item => item.label).join(',') || '';
  const csvHeader = header + itemHeaders + "\n";

  const csvRows = inspections.map(inspection => {
    const itemStatuses = inspection.items?.map(item => item.status).join(',') || '';
    return `${formatDate(inspection.date)},${inspection.substationName},${inspection.inspector},${itemStatuses}`;
  }).join('\n');

  return csvHeader + csvRows;
};
