
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
    
    for (const category of inspection.items) {
      if (!category || !category.items) continue;
      
      // Check if we need a new page
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(category.category.charAt(0).toUpperCase() + category.category.slice(1), 14, currentY);
      
      // Prepare items for table
      const tableData = category.items.map(item => {
        if (!item) return ['Unknown', 'N/A', ''];
        return [
          item.name || 'Unknown',
          item.status === "good" ? "Good" : "Bad",
          item.remarks || ''
        ];
      });
      
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
  const totalItems = inspection.items.reduce((count, category) => 
    count + (category.items?.length || 0), 0);
  const goodItems = inspection.items.reduce((count, category) => 
    count + (category.items?.filter(item => item && item.status === "good").length || 0), 0);
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
  if (badItems > 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Critical Issues Requiring Attention", 14, 150);
    
    let criticalItems = [];
    inspection.items.forEach(category => {
      if (!category || !category.items) return;
      category.items.forEach(item => {
        if (item && item.status === "bad") {
          criticalItems.push([
            category.category.charAt(0).toUpperCase() + category.category.slice(1),
            item.name,
            item.remarks || 'No remarks'
          ]);
        }
      });
    });
    
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
  if (!inspections || inspections.length === 0) return;
  
  // Create header row
  const headers = [
    "ID", 
    "Date", 
    "Substation No", 
    "Region", 
    "District", 
    "Type", 
    "Total Items",
    "Good Items",
    "Items Needing Attention",
    "Overall Condition",
    "Created By", 
    "Created At"
  ];
  
  // Create CSV rows
  let csvRows = [headers.join(",")];
  
  // Add data rows
  inspections.forEach(inspection => {
    const allItems = inspection.items.flatMap(category => category.items || []);
    const totalItems = allItems.length;
    const goodItems = allItems.filter(item => item?.status === "good").length;
    const badItems = totalItems - goodItems;
    const percentageGood = totalItems > 0 ? (goodItems / totalItems) * 100 : 0;
    const overallCondition = percentageGood >= 90 ? "Excellent" : 
                            percentageGood >= 75 ? "Good" : 
                            percentageGood >= 60 ? "Fair" : "Poor";
    
    const row = [
      inspection.id,
      formatDate(inspection.date),
      inspection.substationNo,
      inspection.region,
      inspection.district,
      inspection.type,
      totalItems,
      goodItems,
      badItems,
      overallCondition,
      inspection.createdBy || "",
      inspection.createdAt ? new Date(inspection.createdAt).toLocaleString() : ""
    ];
    
    csvRows.push(row.map(value => `"${value}"`).join(","));
  });
  
  // Join rows and create download
  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `all-substation-inspections-${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate and export a professional PDF report for load monitoring data
 */
export const exportLoadMonitoringToPDF = async (loadData) => {
  // Create PDF with jsPDF
  const doc = new jsPDF();
  
  // Add header with ECG branding
  doc.setFillColor(0, 83, 156);
  doc.rect(0, 0, 210, 25, 'F');
  
  // Add title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Transformer Load Monitoring Report", 105, 15, { align: "center" });
  
  // Basic Information Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Basic Information", 14, 40);
  
  doc.setDrawColor(0, 83, 156);
  doc.setLineWidth(0.5);
  doc.line(14, 45, 196, 45);
  
  // Format date and time
  const formattedDate = loadData.date ? format(new Date(loadData.date), "MMMM d, yyyy") : "N/A";
  const formattedTime = loadData.time || "N/A";
  
  // Add basic information table
  doc.autoTable({
    startY: 50,
    head: [['Field', 'Value']],
    body: [
      ['Date', formattedDate],
      ['Time', formattedTime],
      ['Region', loadData.region || "N/A"],
      ['District', loadData.district || "N/A"],
      ['Substation Name', loadData.substationName || "N/A"],
      ['Substation Number', loadData.substationNumber || "N/A"],
      ['Location', loadData.location || "N/A"],
      ['Rating (Amps)', loadData.rating ? `${loadData.rating} A` : "N/A"],
      ['Peak Load Status', loadData.peakLoadStatus ? (loadData.peakLoadStatus.charAt(0).toUpperCase() + loadData.peakLoadStatus.slice(1)) : "N/A"]
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 83, 156],
      textColor: [255, 255, 255],
      fontStyle: 'bold' 
    },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  // Feeder Information Section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Feeder Information", 14, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 130);
  
  doc.setDrawColor(0, 83, 156);
  doc.setLineWidth(0.5);
  doc.line(14, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 135, 196, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 135);
  
  // Add feeder legs table
  if (loadData.feederLegs && loadData.feederLegs.length > 0) {
    const feederRows = loadData.feederLegs.map((leg, index) => [
      `Leg ${index + 1}`,
      leg.redPhaseCurrent ? `${leg.redPhaseCurrent} A` : "0 A",
      leg.yellowPhaseCurrent ? `${leg.yellowPhaseCurrent} A` : "0 A",
      leg.bluePhaseCurrent ? `${leg.bluePhaseCurrent} A` : "0 A",
      leg.neutralCurrent ? `${leg.neutralCurrent} A` : "0 A"
    ]);
    
    doc.autoTable({
      startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 25 : 140,
      head: [['Feeder', 'Red Phase (A)', 'Yellow Phase (A)', 'Blue Phase (A)', 'Neutral (A)']],
      body: feederRows,
      theme: 'grid',
      headStyles: { 
        fillColor: [0, 83, 156],
        textColor: [255, 255, 255],
        fontStyle: 'bold' 
      },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
  } else {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("No feeder information available", 14, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 25 : 140);
  }
  
  // Check if we need a new page for load information
  if (doc.lastAutoTable?.finalY && doc.lastAutoTable.finalY > 220) {
    doc.addPage();
  }
  
  // Load Information Section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Load Information", 14, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 190);
  
  doc.setDrawColor(0, 83, 156);
  doc.setLineWidth(0.5);
  doc.line(14, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 195, 196, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 195);
  
  // Basic calculations table
  doc.autoTable({
    startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 25 : 200,
    head: [['Metric', 'Value']],
    body: [
      ['Rated Load', loadData.ratedLoad ? `${loadData.ratedLoad.toFixed(2)} A` : "N/A"],
      ['Red Phase Bulk Load', loadData.redPhaseBulkLoad ? `${loadData.redPhaseBulkLoad.toFixed(2)} A` : "N/A"],
      ['Yellow Phase Bulk Load', loadData.yellowPhaseBulkLoad ? `${loadData.yellowPhaseBulkLoad.toFixed(2)} A` : "N/A"],
      ['Blue Phase Bulk Load', loadData.bluePhaseBulkLoad ? `${loadData.bluePhaseBulkLoad.toFixed(2)} A` : "N/A"],
      ['Average Current', loadData.averageCurrent ? `${loadData.averageCurrent.toFixed(2)} A` : "N/A"],
      ['Percentage Load on Transformer', loadData.percentageLoad ? `${loadData.percentageLoad.toFixed(2)}%` : "N/A"],
      ['10% Full Load on Neutral', loadData.tenPercentFullLoadNeutral ? `${loadData.tenPercentFullLoadNeutral.toFixed(2)} A` : "N/A"],
      ['Calculated Neutral (Imbalance)', loadData.calculatedNeutral ? `${loadData.calculatedNeutral.toFixed(2)} A` : "N/A"]
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 83, 156],
      textColor: [255, 255, 255],
      fontStyle: 'bold' 
    },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  // Add visual load indicator if percentage load is available
  if (loadData.percentageLoad) {
    // Check if we need a new page
    if (doc.lastAutoTable?.finalY && doc.lastAutoTable.finalY > 220) {
      doc.addPage();
    }
    
    const currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 260;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Load Percentage Indicator", 14, currentY);
    
    // Draw load percentage bar background
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(14, currentY + 10, 180, 20, 3, 3, 'FD');
    
    // Calculate width based on percentage (max 100%)
    const clampedPercentage = Math.min(100, loadData.percentageLoad);
    const barWidth = 180 * (clampedPercentage / 100);
    
    // Set color based on load percentage
    if (clampedPercentage < 50) {
      doc.setFillColor(46, 204, 113); // Green for low load
    } else if (clampedPercentage < 80) {
      doc.setFillColor(241, 196, 15); // Yellow for medium load
    } else {
      doc.setFillColor(231, 76, 60); // Red for high load
    }
    
    // Draw the colored portion of the bar
    doc.roundedRect(14, currentY + 10, barWidth, 20, 3, 3, 'F');
    
    // Add percentage text
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`${loadData.percentageLoad.toFixed(2)}%`, barWidth / 2 + 14, currentY + 23);
    
    // Add load level text
    doc.setFontSize(10);
    let loadLevel;
    if (clampedPercentage < 50) {
      loadLevel = "Low Load";
    } else if (clampedPercentage < 80) {
      loadLevel = "Medium Load";
    } else {
      loadLevel = "High Load";
    }
    doc.text(loadLevel, 105, currentY + 40, { align: "center" });
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
  
  // Save PDF
  const fileName = `load-monitoring-${loadData.substationNumber || 'report'}-${loadData.date || new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  return fileName;
};

/**
 * Export load monitoring data to CSV format
 */
export const exportLoadMonitoringToCsv = (loadData) => {
  if (!loadData) return;
  
  // Create headers for basic information
  const basicInfo = [
    ["Date", loadData.date || ""],
    ["Time", loadData.time || ""],
    ["Region", loadData.region || ""],
    ["District", loadData.district || ""],
    ["Substation Name", loadData.substationName || ""],
    ["Substation Number", loadData.substationNumber || ""],
    ["Location", loadData.location || ""],
    ["Rating (Amps)", loadData.rating || ""],
    ["Peak Load Status", loadData.peakLoadStatus || ""]
  ];
  
  // Create headers for load information
  const loadInfo = [
    ["Rated Load", loadData.ratedLoad?.toFixed(2) || ""],
    ["Red Phase Bulk Load", loadData.redPhaseBulkLoad?.toFixed(2) || ""],
    ["Yellow Phase Bulk Load", loadData.yellowPhaseBulkLoad?.toFixed(2) || ""],
    ["Blue Phase Bulk Load", loadData.bluePhaseBulkLoad?.toFixed(2) || ""],
    ["Average Current", loadData.averageCurrent?.toFixed(2) || ""],
    ["Percentage Load", loadData.percentageLoad?.toFixed(2) || ""],
    ["10% Full Load on Neutral", loadData.tenPercentFullLoadNeutral?.toFixed(2) || ""],
    ["Calculated Neutral", loadData.calculatedNeutral?.toFixed(2) || ""]
  ];
  
  // Start building CSV content
  let csvContent = [
    ["Load Monitoring Report"],
    ["Basic Information:"],
    ...basicInfo.map(row => `"${row[0]}","${row[1]}"`),
    [""],
    ["Load Information:"],
    ...loadInfo.map(row => `"${row[0]}","${row[1]}"`)
  ];
  
  // Add feeder leg information if available
  if (loadData.feederLegs && loadData.feederLegs.length > 0) {
    csvContent.push(
      [""],
      ["Feeder Information:"],
      ["Leg", "Red Phase Current (A)", "Yellow Phase Current (A)", "Blue Phase Current (A)", "Neutral Current (A)"]
    );
    
    loadData.feederLegs.forEach((leg, index) => {
      csvContent.push(`"Leg ${index + 1}","${leg.redPhaseCurrent || 0}","${leg.yellowPhaseCurrent || 0}","${leg.bluePhaseCurrent || 0}","${leg.neutralCurrent || 0}"`);
    });
  }
  
  // Join all rows and create download
  const csvString = csvContent.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", `load-monitoring-${loadData.substationNumber || 'report'}-${loadData.date || new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
