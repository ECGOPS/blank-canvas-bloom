import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { VITAsset, VITInspectionChecklist, SubstationInspection, InspectionItem, InspectionCategory } from "@/lib/types";
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
  
  // Create PDF document with jsPDF for better formatting
  const doc = new jsPDF();
  
  // Add company logo and header
  doc.setFillColor(0, 83, 156);
  doc.rect(0, 0, 210, 25, 'F');
  
  // Add title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("VIT Inspection Report", 105, 15, { align: "center" });
  
  // Add report metadata section
  doc.setDrawColor(0, 83, 156);
  doc.setLineWidth(0.5);
  doc.line(14, 35, 196, 35);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text("Asset Information", 14, 45);
  
  // Asset information table
  doc.autoTable({
    startY: 50,
    head: [['Field', 'Value']],
    body: [
      ['Serial Number', asset.serialNumber],
      ['Type of Unit', asset.typeOfUnit],
      ['Voltage Level', asset.voltageLevel],
      ['Region', region],
      ['District', district],
      ['Location', asset.location],
      ['Status', asset.status]
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 83, 156],
      textColor: [255, 255, 255],
      fontStyle: 'bold' 
    },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  // Inspection details
  doc.text("Inspection Details", 14, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 120);
  
  doc.autoTable({
    startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 125,
    head: [['Field', 'Value']],
    body: [
      ['Inspection Date', formatDate(inspection.inspectionDate)],
      ['Inspected By', inspection.inspectedBy]
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 83, 156],
      textColor: [255, 255, 255],
      fontStyle: 'bold' 
    },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  // Inspection checklist - General Condition
  doc.text("General Condition", 14, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 160);
  
  doc.autoTable({
    startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 165,
    head: [['Item', 'Status']],
    body: [
      ['Rodent/Termite Encroachment', inspection.rodentTermiteEncroachment],
      ['Clean and Dust Free', inspection.cleanDustFree],
      ['Silica Gel Condition', inspection.silicaGelCondition],
      ['No Corrosion', inspection.noCorrosion],
      ['Paintwork Adequate', inspection.paintworkAdequate]
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 83, 156],
      textColor: [255, 255, 255],
      fontStyle: 'bold' 
    },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    columnStyles: { 
      1: { 
        cellCallback: function(cell, data) {
          if (cell.text && (cell.text[0] === 'Yes' || cell.text[0] === 'Good')) {
            cell.styles.textColor = [0, 128, 0]; // Green for good status
          } else if (cell.text && (cell.text[0] === 'No' || cell.text[0] === 'Bad')) {
            cell.styles.textColor = [255, 0, 0]; // Red for bad status
          }
        }
      } 
    }
  });
  
  // Add a new page if needed
  if (doc.lastAutoTable?.finalY && doc.lastAutoTable.finalY > 220) {
    doc.addPage();
  }
  
  // Operational Status
  doc.text("Operational Status", 14, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 30);
  
  doc.autoTable({
    startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 35,
    head: [['Item', 'Status']],
    body: [
      ['Protection Button Enabled', inspection.protectionButtonEnabled],
      ['Recloser Button Enabled', inspection.recloserButtonEnabled],
      ['AC Power On', inspection.acPowerOn],
      ['Battery Power Low', inspection.batteryPowerLow],
      ['Remote Button Enabled', inspection.remoteButtonEnabled]
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 83, 156],
      textColor: [255, 255, 255],
      fontStyle: 'bold' 
    },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    columnStyles: { 
      1: { 
        cellCallback: function(cell, data) {
          if (cell.text && (cell.text[0] === 'Yes' || cell.text[0] === 'Good')) {
            cell.styles.textColor = [0, 128, 0]; // Green for good status
          } else if (cell.text && (cell.text[0] === 'No' || cell.text[0] === 'Bad')) {
            cell.styles.textColor = [255, 0, 0]; // Red for bad status
          }
        }
      } 
    }
  });
  
  // Safety & Protection
  doc.text("Safety & Protection", 14, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 90);
  
  doc.autoTable({
    startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 95,
    head: [['Item', 'Status']],
    body: [
      ['Ground/Earth Button Enabled', inspection.groundEarthButtonEnabled],
      ['Handle Lock On', inspection.handleLockOn],
      ['Earthing Arrangement Adequate', inspection.earthingArrangementAdequate],
      ['Gas Level Low', inspection.gasLevelLow],
      ['Correct Labelling', inspection.correctLabelling]
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 83, 156],
      textColor: [255, 255, 255],
      fontStyle: 'bold' 
    },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    columnStyles: { 
      1: { 
        cellCallback: function(cell, data) {
          if (cell.text && (cell.text[0] === 'Yes' || cell.text[0] === 'Good')) {
            cell.styles.textColor = [0, 128, 0]; // Green for good status
          } else if (cell.text && (cell.text[0] === 'No' || cell.text[0] === 'Bad')) {
            cell.styles.textColor = [255, 0, 0]; // Red for bad status
          }
        }
      } 
    }
  });
  
  // Component Condition
  doc.text("Component Condition", 14, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 150);
  
  doc.autoTable({
    startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 155,
    head: [['Item', 'Status']],
    body: [
      ['No Fuses Blown', inspection.noFusesBlown],
      ['No Damage to Bushings', inspection.noDamageToBushings],
      ['No Damage to HV Connections', inspection.noDamageToHVConnections],
      ['Insulators Clean', inspection.insulatorsClean],
      ['PT Fuse Link Intact', inspection.ptFuseLinkIntact]
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 83, 156],
      textColor: [255, 255, 255],
      fontStyle: 'bold' 
    },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    columnStyles: { 
      1: { 
        cellCallback: function(cell, data) {
          if (cell.text && (cell.text[0] === 'Yes' || cell.text[0] === 'Good')) {
            cell.styles.textColor = [0, 128, 0]; // Green for good status
          } else if (cell.text && (cell.text[0] === 'No' || cell.text[0] === 'Bad')) {
            cell.styles.textColor = [255, 0, 0]; // Red for bad status
          }
        }
      } 
    }
  });
  
  // Add a new page for remarks and summary
  doc.addPage();
  
  // Remarks
  if (inspection.remarks) {
    doc.text("Remarks", 14, 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const splitRemarks = doc.splitTextToSize(inspection.remarks, 180);
    doc.text(splitRemarks, 14, 40);
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
  
  // Add overall assessment and score
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Inspection Summary", 14, 80);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  
  let assessmentCategory;
  let assessmentColor;
  
  if (issuesCount === 0) {
    assessmentCategory = "Excellent";
    assessmentColor = [0, 128, 0]; // Green
  } else if (issuesCount < 3) {
    assessmentCategory = "Good";
    assessmentColor = [0, 128, 0]; // Green
  } else if (issuesCount < 7) {
    assessmentCategory = "Fair";
    assessmentColor = [255, 165, 0]; // Orange
  } else {
    assessmentCategory = "Poor";
    assessmentColor = [255, 0, 0]; // Red
  }
  
  doc.text(`Total issues found: ${issuesCount}`, 14, 90);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(assessmentColor[0], assessmentColor[1], assessmentColor[2]);
  doc.text(`Overall assessment: ${assessmentCategory}`, 14, 100);
  
  // Set back to default text color
  doc.setTextColor(0, 0, 0);
  
  // Add visual assessment indicator
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(14, 110, 180, 20, 3, 3, 'FD');
  
  // Draw assessment bar
  const assessmentWidth = 180 * (1 - (issuesCount / 20)); // 20 is approx. max issues possible
  doc.setFillColor(
    issuesCount === 0 ? 0 : issuesCount < 3 ? 40 : issuesCount < 7 ? 255 : 255,
    issuesCount === 0 ? 180 : issuesCount < 3 ? 167 : issuesCount < 7 ? 165 : 0,
    issuesCount === 0 ? 40 : issuesCount < 3 ? 70 : issuesCount < 7 ? 0 : 0
  );
  doc.roundedRect(14, 110, assessmentWidth, 20, 3, 3, 'F');
  
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
  
  // Save PDF
  doc.save(`vit-inspection-${asset.serialNumber}-${inspection.inspectionDate.split('T')[0]}.pdf`);
  return `vit-inspection-${asset.serialNumber}-${inspection.inspectionDate.split('T')[0]}.pdf`;
};

/**
 * Generate comprehensive PDF report for Substation inspection
 */
export const exportSubstationInspectionToPDF = async (inspection: SubstationInspection) => {
  // Create PDF with jsPDF for better formatting
  const doc = new jsPDF();
  
  // Add header with ECG branding
  doc.setFillColor(0, 83, 156);
  doc.rect(0, 0, 210, 25, 'F');
  
  // Add title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Substation Inspection Report", 105, 15, { align: "center" });
  
  // Add basic info section
  doc.setDrawColor(0, 83, 156);
  doc.setLineWidth(0.5);
  doc.line(14, 35, 196, 35);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text("Substation Information", 14, 45);
  
  // Substation information table
  doc.autoTable({
    startY: 50,
    head: [['Field', 'Value']],
    body: [
      ['Substation Number', inspection.substationNo],
      ['Region', inspection.region],
      ['District', inspection.district],
      ['Date', formatDate(inspection.date)],
      ['Type', inspection.type.charAt(0).toUpperCase() + inspection.type.slice(1)],
      ['Created By', inspection.createdBy || ''],
      ['Created At', inspection.createdAt ? formatDate(inspection.createdAt) : '']
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 83, 156],
      textColor: [255, 255, 255],
      fontStyle: 'bold' 
    },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  // Add inspection items by category
  if (inspection.items && Array.isArray(inspection.items)) {
    let currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 150;
    
    // Group items by category
    const itemsByCategory: Record<string, InspectionItem[]> = {};
    inspection.items.forEach(item => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });
    
    // Process each category
    for (const categoryName of Object.keys(itemsByCategory)) {
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(categoryName.charAt(0).toUpperCase() + categoryName.slice(1), 14, currentY);
      
      // Prepare items for table
      const tableData = itemsByCategory[categoryName].map(item => [
        item.name || 'Unknown',
        item.status === "good" ? "Good" : "Bad",
        item.remarks || ''
      ]);
      
      // Add items table
      doc.autoTable({
        startY: currentY + 5,
        head: [['Item', 'Status', 'Remarks']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 83, 156],
          textColor: [255, 255, 255],
          fontStyle: 'bold' 
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 30,
            cellCallback: function(cell, data) {
              if (cell.text && cell.text[0] === 'Good') {
                cell.styles.textColor = [0, 128, 0]; // Green for good status
              } else if (cell.text && cell.text[0] === 'Bad') {
                cell.styles.textColor = [255, 0, 0]; // Red for bad status
              }
            } 
          },
          2: { cellWidth: 'auto' }
        },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      
      currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : currentY + 80;
    }
  }
  
  // Add a new page for summary
  doc.addPage();
  
  // Calculate summary statistics
  const totalItems = inspection.items ? inspection.items.length : 0;
  const goodItems = inspection.items ? inspection.items.filter(item => item.status === "good").length : 0;
  const badItems = totalItems - goodItems;
  const percentageGood = totalItems > 0 ? (goodItems / totalItems) * 100 : 0;
  
  // Add summary section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Inspection Summary", 14, 30);
  
  // Add summary data
  doc.setFontSize(12);
  
  // Add summary statistics table
  doc.autoTable({
    startY: 40,
    head: [['Metric', 'Value']],
    body: [
      ['Total Items Checked', totalItems.toString()],
      ['Items in Good Condition', goodItems.toString()],
      ['Items Requiring Attention', badItems.toString()],
      ['Percentage in Good Condition', percentageGood.toFixed(2) + '%'],
      ['Overall Condition', percentageGood >= 90 ? "Excellent" : 
        percentageGood >= 75 ? "Good" : 
        percentageGood >= 60 ? "Fair" : "Poor"]
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 83, 156],
      textColor: [255, 255, 255],
      fontStyle: 'bold' 
    },
    columnStyles: {
      1: { 
        cellCallback: function(cell, data) {
          if (cell.section === 'body' && cell.row.index === 4) {
            if (percentageGood >= 90) {
              cell.styles.textColor = [0, 128, 0]; // Green for excellent
            } else if (percentageGood >= 75) {
              cell.styles.textColor = [0, 128, 0]; // Green for good
            } else if (percentageGood >= 60) {
              cell.styles.textColor = [255, 165, 0]; // Orange for fair
            } else {
              cell.styles.textColor = [255, 0, 0]; // Red for poor
            }
          }
        }
      }
    },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  // Add visual assessment indicator
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(14, 110, 180, 20, 3, 3, 'FD');
  
  // Draw assessment bar
  const assessmentWidth = 180 * (percentageGood / 100);
  doc.setFillColor(
    percentageGood >= 90 ? 0 : percentageGood >= 75 ? 40 : percentageGood >= 60 ? 255 : 255,
    percentageGood >= 90 ? 180 : percentageGood >= 75 ? 167 : percentageGood >= 60 ? 165 : 0,
    percentageGood >= 90 ? 40 : percentageGood >= 75 ? 70 : percentageGood >= 60 ? 0 : 0
  );
  doc.roundedRect(14, 110, assessmentWidth, 20, 3, 3, 'F');
  
  // Add percentage text centered in the assessment bar
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`${percentageGood.toFixed(2)}%`, assessmentWidth / 2 + 14, 123);
  
  // Add critical issues section if there are any
  if (badItems > 0 && inspection.items) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Critical Issues Requiring Attention", 14, 150);
    
    let criticalItems = [];
    for (const item of inspection.items) {
      if (item.status === "bad") {
        criticalItems.push([
          item.category.charAt(0).toUpperCase() + item.category.slice(1),
          item.name,
          item.remarks || 'No remarks'
        ]);
      }
    }
    
    if (criticalItems.length > 0) {
      doc.autoTable({
        startY: 160,
        head: [['Category', 'Item', 'Remarks']],
        body: criticalItems,
        theme: 'grid',
        headStyles: { 
          fillColor: [220, 53, 69], // Bootstrap danger color
          textColor: [255, 255, 255],
          fontStyle: 'bold' 
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 60 },
          2: { cellWidth: 'auto' }
        },
        alternateRowStyles: { fillColor: [255, 240, 240] } // Light red for alternating rows
      });
    }
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
  doc.save(`substation-inspection-${inspection.substationNo}-${formatDate(inspection.date)}.pdf`);
  return `substation-inspection-${inspection.substationNo}-${formatDate(inspection.date)}.pdf`;
};

/**
 * Export a single substation inspection to CSV format
 */
export const exportSubstationInspectionToCsv = (inspection: SubstationInspection) => {
  // Create basic info rows
  const basicInfo = [
    ["Substation Number", inspection.substationNo],
    ["Region", inspection.region],
    ["District", inspection.district],
    ["Date", formatDate(inspection.date)],
    ["Type", inspection.type],
    ["Created By", inspection.createdBy],
    ["Created At", inspection.createdAt ? new Date(inspection.createdAt).toLocaleString() : ""]
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
    const itemsByCategory: Record<string, InspectionItem[]> = {};
    inspection.items.forEach(item => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });
    
    // Add each item to CSV
    for (const categoryName of Object.keys(itemsByCategory)) {
      for (const item of itemsByCategory[categoryName]) {
        if (!item) continue;
        const row = `"${categoryName}","${item.name}","${item.status}","${item.remarks || ''}"`;
        csvRows.push(row);
      }
    }
  }

  // Add summary
  const totalItems = inspection.items ? inspection.items.length : 0;
  const goodItems = inspection.items ? inspection.items.filter(item => item.status === "good").length : 0;
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
