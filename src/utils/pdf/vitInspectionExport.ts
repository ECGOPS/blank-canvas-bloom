
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { VITInspectionChecklist, VITAsset } from '@/lib/types';
import { formatDate } from '@/utils/calculations';

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
    ...dataRows.map(row => `"${row[0]}","${row[1]}"`)
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
export const exportInspectionToPDF = (inspection: VITInspectionChecklist, asset: VITAsset | null, getRegionName: (id: string) => string, getDistrictName: (id: string) => string) => {
  if (!asset) return null;

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
