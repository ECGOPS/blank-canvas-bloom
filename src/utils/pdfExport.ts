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
  }
}

/**
 * Export VIT inspection data to CSV format
 */
export const exportInspectionToCsv = (inspection: VITInspectionChecklist, asset: VITAsset | null, getRegionName: (id: string) => string, getDistrictName: (id: string) => string) => {
  if (!asset) return;
  
  // Create headers
  const headers = [
    "Field",
    "Value"
  ];
  
  // Create data rows
  const dataRows = [
    ["Asset Serial Number", asset?.serialNumber || ""],
    ["Asset Type", asset?.typeOfUnit || ""],
    ["Region", asset ? getRegionName(asset.regionId) : ""],
    ["District", asset ? getDistrictName(asset.districtId) : ""],
    ["Inspection Date", formatDate(inspection.inspectionDate)],
    ["Inspector", inspection.inspectedBy],
    ["Rodent/Termite Encroachment", inspection.rodentTermiteEncroachment],
    ["Clean & Dust Free", inspection.cleanDustFree],
    ["Protection Button Enabled", inspection.protectionButtonEnabled],
    ["Recloser Button Enabled", inspection.recloserButtonEnabled],
    ["Ground/Earth Button Enabled", inspection.groundEarthButtonEnabled],
    ["AC Power On", inspection.acPowerOn],
    ["Battery Power Low", inspection.batteryPowerLow],
    ["Handle Lock On", inspection.handleLockOn],
    ["Remote Button Enabled", inspection.remoteButtonEnabled],
    ["Gas Level Low", inspection.gasLevelLow],
    ["Earthing Arrangement Adequate", inspection.earthingArrangementAdequate],
    ["No Fuses Blown", inspection.noFusesBlown],
    ["No Damage to Bushings", inspection.noDamageToBushings],
    ["No Damage to HV Connections", inspection.noDamageToHVConnections],
    ["Insulators Clean", inspection.insulatorsClean],
    ["Paintwork Adequate", inspection.paintworkAdequate],
    ["PT Fuse Link Intact", inspection.ptFuseLinkIntact],
    ["No Corrosion", inspection.noCorrosion],
    ["Silica Gel Condition", inspection.silicaGelCondition],
    ["Correct Labelling", inspection.correctLabelling],
    ["Remarks", inspection.remarks]
  ];
  
  // Combine headers and data
  const csvContent = [
    headers.join(","), 
    ...dataRows.map(row => `"${row[0]}","${row[1]}"`).join("\n")
  ].join("\n");
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `vit-inspection-${asset?.serialNumber}-${inspection.inspectionDate.split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate comprehensive PDF report for VIT inspection
 */
export const exportInspectionToPDF = async (inspection: VITInspectionChecklist, asset: VITAsset | null, getRegionName: (id: string) => string, getDistrictName: (id: string) => string) => {
  if (!asset) return;

  const region = getRegionName(asset.regionId);
  const district = getDistrictName(asset.districtId);
  
  // Create PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add title and logo
  const titlePage = pdfDoc.addPage([600, 400]);
  const { width, height } = titlePage.getSize();
  const fontSize = 30;

  titlePage.drawText('VIT Inspection Report', {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    color: rgb(0, 0.53, 0.71),
  });
  
  // Add date and inspector info
  const datePage = pdfDoc.addPage([600, 400]);
  datePage.drawText(`Date: ${formatDate(inspection.inspectionDate)}`, {
    x: 50,
    y: height - 3 * fontSize,
    size: fontSize,
    color: rgb(0, 0, 0),
  });

  const inspectorPage = pdfDoc.addPage([600, 400]);
  inspectorPage.drawText(`Inspector: ${inspection.inspectedBy}`, {
    x: 50,
    y: height - 2 * fontSize,
    size: fontSize,
    color: rgb(0, 0, 0),
  });
  
  // Add asset information
  const assetInfoPage = pdfDoc.addPage([600, 400]);
  assetInfoPage.drawText("Asset Information", {
    x: 50,
    y: 300,
    size: 20,
    color: rgb(0, 0.2, 0.4),
  });

  assetInfoPage.drawText(`Serial Number: ${asset.serialNumber}`, {
    x: 50,
    y: 250,
    size: 14,
    color: rgb(0, 0, 0),
  });
  assetInfoPage.drawText(`Type of Unit: ${asset.typeOfUnit}`, {
    x: 50,
    y: 230,
    size: 14,
    color: rgb(0, 0, 0),
  });
  assetInfoPage.drawText(`Voltage Level: ${asset.voltageLevel}`, {
    x: 50,
    y: 210,
    size: 14,
    color: rgb(0, 0, 0),
  });
  assetInfoPage.drawText(`Region: ${region}`, {
    x: 300,
    y: 250,
    size: 14,
    color: rgb(0, 0, 0),
  });
  assetInfoPage.drawText(`District: ${district}`, {
    x: 300,
    y: 230,
    size: 14,
    color: rgb(0, 0, 0),
  });
  assetInfoPage.drawText(`Location: ${asset.location}`, {
    x: 300,
    y: 210,
    size: 14,
    color: rgb(0, 0, 0),
  });
  assetInfoPage.drawText(`Status: ${asset.status}`, {
    x: 300,
    y: 190,
    size: 14,
    color: rgb(0, 0, 0),
  });
  
  // Add inspection checklist - General Condition
  const generalConditionPage = pdfDoc.addPage([600, 400]);
  generalConditionPage.drawText("General Condition", {
    x: 50,
    y: 300,
    size: 20,
    color: rgb(0, 0.2, 0.4),
  });

  // Draw table header
  generalConditionPage.drawText("Item", {
    x: 50,
    y: 250,
    size: 12,
    color: rgb(1, 1, 1),
  });
  
  generalConditionPage.drawText("Status", {
    x: 300,
    y: 250,
    size: 12,
    color: rgb(1, 1, 1),
  });
  
  // Draw header background
  generalConditionPage.drawRectangle({
    x: 50,
    y: 250,
    width: 500,
    height: 20,
    color: rgb(0, 0.2, 0.4),
  });

  // Draw table rows
  let yPosition = 230;
  const generalConditionItems = [
    ["Rodent/Termite Encroachment", inspection.rodentTermiteEncroachment],
    ["Clean and Dust Free", inspection.cleanDustFree],
    ["Silica Gel Condition", inspection.silicaGelCondition],
    ["No Corrosion", inspection.noCorrosion],
    ["Paintwork Adequate", inspection.paintworkAdequate]
  ];
  
  generalConditionItems.forEach((item, index) => {
    // Draw row background (alternating colors)
    if (index % 2 === 0) {
      generalConditionPage.drawRectangle({
        x: 50,
        y: yPosition - 15,
        width: 500,
        height: 20,
        color: rgb(0.95, 0.95, 0.95),
      });
    }
    
    // Draw item name
    generalConditionPage.drawText(item[0], {
      x: 50,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });
    
    // Draw status
    generalConditionPage.drawText(item[1], {
      x: 300,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 20;
  });
  
  // Add inspection checklist - Operational Status
  const operationalPage = pdfDoc.addPage([600, 400]);
  operationalPage.drawText("Operational Status", {
    x: 50,
    y: 300,
    size: 20,
    color: rgb(0, 0.2, 0.4),
  });

  // Draw table header
  operationalPage.drawText("Item", {
    x: 50,
    y: 250,
    size: 12,
    color: rgb(1, 1, 1),
  });
  
  operationalPage.drawText("Status", {
    x: 300,
    y: 250,
    size: 12,
    color: rgb(1, 1, 1),
  });
  
  // Draw header background
  operationalPage.drawRectangle({
    x: 50,
    y: 250,
    width: 500,
    height: 20,
    color: rgb(0, 0.2, 0.4),
  });

  // Draw table rows
  yPosition = 230;
  const operationalItems = [
    ["Protection Button Enabled", inspection.protectionButtonEnabled],
    ["Recloser Button Enabled", inspection.recloserButtonEnabled],
    ["AC Power On", inspection.acPowerOn],
    ["Battery Power Low", inspection.batteryPowerLow],
    ["Remote Button Enabled", inspection.remoteButtonEnabled]
  ];
  
  operationalItems.forEach((item, index) => {
    // Draw row background (alternating colors)
    if (index % 2 === 0) {
      operationalPage.drawRectangle({
        x: 50,
        y: yPosition - 15,
        width: 500,
        height: 20,
        color: rgb(0.95, 0.95, 0.95),
      });
    }
    
    // Draw item name
    operationalPage.drawText(item[0], {
      x: 50,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });
    
    // Draw status
    operationalPage.drawText(item[1], {
      x: 300,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 20;
  });
  
  // Add inspection checklist - Safety & Protection
  const safetyPage = pdfDoc.addPage([600, 400]);
  safetyPage.drawText("Safety & Protection", {
    x: 50,
    y: 300,
    size: 20,
    color: rgb(0, 0.2, 0.4),
  });

  // Draw table header
  safetyPage.drawText("Item", {
    x: 50,
    y: 250,
    size: 12,
    color: rgb(1, 1, 1),
  });
  
  safetyPage.drawText("Status", {
    x: 300,
    y: 250,
    size: 12,
    color: rgb(1, 1, 1),
  });
  
  // Draw header background
  safetyPage.drawRectangle({
    x: 50,
    y: 250,
    width: 500,
    height: 20,
    color: rgb(0, 0.2, 0.4),
  });

  // Draw table rows
  yPosition = 230;
  const safetyItems = [
    ["Ground/Earth Button Enabled", inspection.groundEarthButtonEnabled],
    ["Handle Lock On", inspection.handleLockOn],
    ["Earthing Arrangement Adequate", inspection.earthingArrangementAdequate],
    ["Gas Level Low", inspection.gasLevelLow],
    ["Correct Labelling", inspection.correctLabelling]
  ];
  
  safetyItems.forEach((item, index) => {
    // Draw row background (alternating colors)
    if (index % 2 === 0) {
      safetyPage.drawRectangle({
        x: 50,
        y: yPosition - 15,
        width: 500,
        height: 20,
        color: rgb(0.95, 0.95, 0.95),
      });
    }
    
    // Draw item name
    safetyPage.drawText(item[0], {
      x: 50,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });
    
    // Draw status
    safetyPage.drawText(item[1], {
      x: 300,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 20;
  });
  
  // Component Condition
  const componentPage = pdfDoc.addPage([600, 400]);
  componentPage.drawText("Component Condition", {
    x: 50,
    y: 300,
    size: 20,
    color: rgb(0, 0.2, 0.4),
  });

  // Draw table header
  componentPage.drawText("Item", {
    x: 50,
    y: 250,
    size: 12,
    color: rgb(1, 1, 1),
  });
  
  componentPage.drawText("Status", {
    x: 300,
    y: 250,
    size: 12,
    color: rgb(1, 1, 1),
  });
  
  // Draw header background
  componentPage.drawRectangle({
    x: 50,
    y: 250,
    width: 500,
    height: 20,
    color: rgb(0, 0.2, 0.4),
  });

  // Draw table rows
  yPosition = 230;
  const componentItems = [
    ["No Fuses Blown", inspection.noFusesBlown],
    ["No Damage to Bushings", inspection.noDamageToBushings],
    ["No Damage to HV Connections", inspection.noDamageToHVConnections],
    ["Insulators Clean", inspection.insulatorsClean],
    ["PT Fuse Link Intact", inspection.ptFuseLinkIntact]
  ];
  
  componentItems.forEach((item, index) => {
    // Draw row background (alternating colors)
    if (index % 2 === 0) {
      componentPage.drawRectangle({
        x: 50,
        y: yPosition - 15,
        width: 500,
        height: 20,
        color: rgb(0.95, 0.95, 0.95),
      });
    }
    
    // Draw item name
    componentPage.drawText(item[0], {
      x: 50,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });
    
    // Draw status
    componentPage.drawText(item[1], {
      x: 300,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 20;
  });
  
  // Remarks
  const remarksPage = pdfDoc.addPage([600, 400]);
  remarksPage.drawText("Remarks", {
    x: 50,
    y: 300,
    size: 20,
    color: rgb(0, 0.2, 0.4),
  });

  if (inspection.remarks) {
    remarksPage.drawText(inspection.remarks, {
      x: 50,
      y: 250,
      size: 14,
      color: rgb(0, 0, 0),
      maxWidth: 500,
    });
  }
  
  // Summary of Issues
  const issuesCount = Object.entries(inspection).reduce((count, [key, value]) => {
    if (key === 'rodentTermiteEncroachment' && value === 'Yes') return count + 1;
    if (key === 'batteryPowerLow' && value === 'Yes') return count + 1;
    if (key === 'gasLevelLow' && value === 'Yes') return count + 1;
    if (key === 'silicaGelCondition' && value === 'Bad') return count + 1;
    
    if (
      ['cleanDustFree', 'protectionButtonEnabled', 'recloserButtonEnabled', 
       'groundEarthButtonEnabled', 'acPowerOn', 'handleLockOn', 'remoteButtonEnabled', 
       'earthingArrangementAdequate', 'noFusesBlown', 'noDamageToBushings', 
       'noDamageToHVConnections', 'insulatorsClean', 'paintworkAdequate', 
       'ptFuseLinkIntact', 'noCorrosion', 'correctLabelling'].includes(key) && 
      value === 'No'
    ) {
      return count + 1;
    }
    
    return count;
  }, 0);
  
  // Summary section
  const summaryPage = pdfDoc.addPage([600, 400]);
  summaryPage.drawText("Inspection Summary", {
    x: 50,
    y: 300,
    size: 20,
    color: rgb(0, 0.2, 0.4),
  });

  summaryPage.drawText(`Total issues found: ${issuesCount}`, {
    x: 50,
    y: 250,
    size: 14,
    color: rgb(0, 0, 0),
  });
  summaryPage.drawText(`Overall assessment: ${issuesCount === 0 ? 'No issues found' : issuesCount < 3 ? 'Minor issues found' : issuesCount < 7 ? 'Moderate issues found' : 'Major issues found'}`, {
    x: 50,
    y: 230,
    size: 14,
    color: rgb(0, 0, 0),
  });
  
  // Add timestamp and page numbers
  const totalPages = pdfDoc.getPages().length;
  for (let i = 0; i < totalPages; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();
    page.drawText(`Generated: ${new Date().toLocaleString()}`, {
      x: 50,
      y: height - 10,
      size: 8,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText(`Page ${i + 1} of ${totalPages}`, {
      x: width - 100,
      y: height - 10,
      size: 8,
      color: rgb(0.5, 0.5, 0.5),
    });
  }
  
  // Save PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `vit-inspection-${asset.serialNumber}-${inspection.inspectionDate.split('T')[0]}.pdf`;
  link.click();
  return link.download;
};

/**
 * Generate comprehensive PDF report for Substation inspection
 */
export const exportSubstationInspectionToPDF = async (inspection: SubstationInspection) => {
  // Create PDF with jsPDF and autotable for a more professional look
  const doc = new jsPDF();
  
  // Add header with logo and title
  doc.setFillColor(0, 83, 156);
  doc.rect(0, 0, 210, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("Substation Inspection Report", 105, 12, { align: "center" });
  
  // Add inspection details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  
  let startY = 30;
  
  // Inspection summary box
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(10, startY, 190, 40, 2, 2, 'FD');
  
  doc.setFontSize(11);
  doc.text(`Substation No: ${inspection.substationNo}`, 15, startY + 8);
  doc.text(`Substation Name: ${inspection.substationName || "N/A"}`, 105, startY + 8);
  doc.text(`Region: ${inspection.region}`, 15, startY + 16);
  doc.text(`District: ${inspection.district}`, 105, startY + 16);
  doc.text(`Date: ${formatDate(inspection.date)}`, 15, startY + 24);
  doc.text(`Type: ${inspection.type.toUpperCase()}`, 105, startY + 24);
  doc.text(`Inspected By: ${inspection.createdBy}`, 15, startY + 32);
  
  startY = 80;
  
  // Calculate summary statistics for inspection items
  const allItems = inspection.items.flatMap(category => category.items || []);
  const totalItems = allItems.length;
  const goodItems = allItems.filter(item => item?.status === "good").length;
  const badItems = totalItems - goodItems;
  const percentageGood = totalItems > 0 ? (goodItems / totalItems) * 100 : 0;
  
  // Add summary statistics in a visually appealing format
  doc.setFillColor(0, 83, 156);
  doc.rect(10, startY, 190, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text("Inspection Summary", 105, startY + 6, { align: "center" });
  
  startY += 15;
  
  // Create summary grid
  doc.setFillColor(245, 245, 245);
  doc.rect(10, startY, 45, 20, 'F');
  doc.rect(57, startY, 45, 20, 'F');
  doc.rect(104, startY, 45, 20, 'F');
  doc.rect(151, startY, 49, 20, 'F');
  
  doc.setDrawColor(200, 200, 200);
  doc.rect(10, startY, 45, 20, 'S');
  doc.rect(57, startY, 45, 20, 'S');
  doc.rect(104, startY, 45, 20, 'S');
  doc.rect(151, startY, 49, 20, 'S');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text("Total Items", 32, startY + 6, { align: "center" });
  doc.text("Good Condition", 79, startY + 6, { align: "center" });
  doc.text("Needs Attention", 126, startY + 6, { align: "center" });
  doc.text("Overall Condition", 175, startY + 6, { align: "center" });
  
  doc.setFontSize(12);
  doc.text(`${totalItems}`, 32, startY + 15, { align: "center" });
  
  doc.setTextColor(0, 128, 0);
  doc.text(`${goodItems}`, 79, startY + 15, { align: "center" });
  
  doc.setTextColor(220, 0, 0);
  doc.text(`${badItems}`, 126, startY + 15, { align: "center" });
  
  // Set color based on condition
  if (percentageGood >= 90) {
    doc.setTextColor(0, 128, 0);
  } else if (percentageGood >= 75) {
    doc.setTextColor(0, 100, 0);
  } else if (percentageGood >= 60) {
    doc.setTextColor(255, 140, 0);
  } else {
    doc.setTextColor(220, 0, 0);
  }
  
  doc.text(
    `${percentageGood >= 90 ? "Excellent" : 
    percentageGood >= 75 ? "Good" : 
    percentageGood >= 60 ? "Fair" : "Poor"}`,
    175, startY + 15, { align: "center" }
  );
  
  startY += 30;
  
  // Add inspection items by category using auto-table for better formatting
  if (inspection.items && Array.isArray(inspection.items)) {
    for (const category of inspection.items) {
      if (!category || !category.items) continue;
      
      // Add category header
      doc.setFillColor(240, 240, 240);
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(10, startY, 190, 8, 1, 1, 'FD');
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(category.category, 15, startY + 5.5);
      
      startY += 10;
      
      // Prepare table data
      const tableBody = category.items.map(item => [
        item.status === "good" ? "✓" : "✗",
        item.name,
        item.status.toUpperCase(),
        item.remarks || ""
      ]);
      
      // Add table using autotable for better formatting
      doc.autoTable({
        startY: startY,
        head: [["Status", "Item", "Condition", "Remarks"]],
        body: tableBody,
        theme: 'grid',
        headStyles: {
          fillColor: [220, 220, 220],
          textColor: [0, 0, 0],
        },
        styles: {
          cellPadding: 2,
          fontSize: 9,
          lineWidth: 0.1,
          lineColor: [200, 200, 200]
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 65 },
          2: { cellWidth: 25 }
        },
        margin: { left: 10 }
      });
      
      startY = doc.lastAutoTable?.finalY || startY + 10;
      startY += 10;
      
      // Add page if needed
      if (startY > 260) {
        doc.addPage();
        startY = 20;
      }
    }
  }
  
  // Add footer with timestamp and page numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Add footer line
    doc.setDrawColor(220, 220, 220);
    doc.line(10, 280, 200, 280);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 12, 287);
    doc.text(`Page ${i} of ${totalPages}`, 198, 287, { align: "right" });
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
    ["Created By", inspection.createdBy],
    ["Created At", new Date(inspection.createdAt).toLocaleString()]
  ];

  // Create header rows for each inspection category
  let csvRows = [
    ["Inspection Report - Substation " + inspection.substationNo],
    ["Basic Information:"],
    ...basicInfo.map(row => `"${row[0]}","${row[1]}"`),
    [""], // Empty row for separation
    ["Inspection Items:"],
    ["Category", "Item", "Status", "Remarks"]
  ];

  // Add inspection items
  if (inspection.items && Array.isArray(inspection.items)) {
    inspection.items.forEach(category => {
      if (!category || !category.items) return;
      
      category.items.forEach(item => {
        if (!item) return;
        csvRows.push(`"${category.category}","${item.name}","${item.status}","${item.remarks || ''}"`);
      });
    });
  }

  // Add summary
  const allItems = inspection.items.flatMap(category => category.items || []);
  const totalItems = allItems.length;
  const goodItems = allItems.filter(item => item?.status === "good").length;
  const badItems = totalItems - goodItems;
  const percentageGood = totalItems > 0 ? (goodItems / totalItems) * 100 : 0;
  
  csvRows.push(
    [""], // Empty row for separation
    ["Summary:"],
    [`"Total Items","${totalItems}"`],
    [`"Good Condition","${goodItems}"`],
    [`"Needs Attention","${badItems}"`],
    [`"Overall Condition","${percentageGood >= 90 ? "Excellent" : 
      percentageGood >= 75 ? "Good" : 
      percentageGood >= 60 ? "Fair" : "Poor"}"`]
  );

  // Join all rows
  const csvContent = csvRows.join("\n");
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `substation-inspection-${inspection.substationNo
