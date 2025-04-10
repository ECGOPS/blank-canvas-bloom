
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { SubstationInspection, InspectionItem } from '@/lib/types';
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
 * Generate comprehensive PDF report for Substation inspection
 */
export const exportSubstationInspectionToPDF = (inspection: SubstationInspection) => {
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
    console.error("No inspections to export");
    return;
  }

  // Create header row
  const headers = [
    "Substation Number",
    "Region",
    "District", 
    "Date",
    "Type",
    "Good Items",
    "Bad Items",
    "Total Items",
    "Condition Percentage",
    "Overall Rating",
    "Created By",
    "Created At"
  ];

  // Create data rows
  const rows = inspections.map(inspection => {
    const totalItems = inspection.items ? inspection.items.length : 0;
    const goodItems = inspection.items ? inspection.items.filter(item => item.status === "good").length : 0;
    const badItems = totalItems - goodItems;
    const percentageGood = totalItems > 0 ? (goodItems / totalItems) * 100 : 0;
    const overallRating = percentageGood >= 90 ? "Excellent" : 
                          percentageGood >= 75 ? "Good" : 
                          percentageGood >= 60 ? "Fair" : "Poor";
    
    return [
      inspection.substationNo,
      inspection.region,
      inspection.district,
      formatDate(inspection.date),
      inspection.type,
      goodItems.toString(),
      badItems.toString(),
      totalItems.toString(),
      percentageGood.toFixed(2) + "%",
      overallRating,
      inspection.createdBy || "",
      inspection.createdAt ? formatDate(inspection.createdAt) : ""
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `all-substation-inspections-${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
