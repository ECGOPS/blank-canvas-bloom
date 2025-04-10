import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SubstationInspection, InspectionItem } from '@/lib/types';
import { formatDate } from '@/utils/calculations';

/**
 * Export a single inspection item to CSV format
 */
export const exportInspectionToCsv = (item: InspectionItem, categoryName: string) => {
  const csvRows = [
    ["Category", "Item", "Status", "Remarks"],
    [categoryName, item.name, item.status, item.remarks || '']
  ];

  const csvContent = csvRows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "inspection-item.csv");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export a single substation inspection to PDF format
 */
export const exportSubstationInspectionToPDF = (inspection: SubstationInspection) => {
  const doc = new jsPDF();
  
  // Function to add autoTable
  const addAutoTable = (options: any) => {
    (doc as any).autoTable(options);
  };

  // Title
  doc.setFontSize(18);
  doc.text(`Inspection Report - Substation ${inspection.substationNo}`, 14, 22);

  // Basic Information
  doc.setFontSize(12);
  doc.text("Basic Information:", 14, 30);

  let y = 38;
  const lineHeight = 8;
  doc.setFontSize(10);
  doc.text(`Substation Number: ${inspection.substationNo}`, 14, y);
  doc.text(`Region: ${inspection.region}`, 100, y);
  y += lineHeight;
  doc.text(`District: ${inspection.district}`, 14, y);
  doc.text(`Date: ${formatDate(inspection.date)}`, 100, y);
  y += lineHeight;
  doc.text(`Type: ${inspection.type}`, 14, y);
  y += lineHeight;
  doc.text(`Created By: ${inspection.createdBy}`, 14, y);
  y += lineHeight;
  doc.text(`Created At: ${inspection.createdAt ? new Date(inspection.createdAt).toLocaleString() : ""}`, 14, y);

  // Inspection Items
  y += lineHeight + 4;
  doc.setFontSize(12);
  doc.text("Inspection Items:", 14, y);

  y += lineHeight;
  if (inspection.items && Array.isArray(inspection.items)) {
    const itemsByCategory: Record<string, InspectionItem[]> = {};
    inspection.items.forEach(item => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });

    let tableData: any[] = [];
    for (const categoryName of Object.keys(itemsByCategory)) {
      tableData.push([{ content: categoryName, styles: { fontStyle: 'bold', fillColor: [220, 220, 220] } }]);
      tableData.push(["Item", "Status", "Remarks"]); // Table headers
      for (const item of itemsByCategory[categoryName]) {
        if (!item) continue;
        tableData.push([item.name, item.status, item.remarks || '']);
      }
    }

    addAutoTable({
      startY: y,
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
      body: tableData,
      columns: [
        { header: 'Item', dataKey: 'item' },
        { header: 'Status', dataKey: 'status' },
        { header: 'Remarks', dataKey: 'remarks' }
      ],
      margin: { horizontal: 14 }
    });
  } else {
    doc.setFontSize(10);
    doc.text("No inspection items found.", 14, y);
  }

  // Summary
  if (inspection.items) {
    const totalItems = inspection.items.length;
    const goodItems = inspection.items.filter(item => item.status === "good").length;
    const badItems = totalItems - goodItems;
    const percentageGood = (goodItems / totalItems) * 100;

    y = (doc as any).autoTable.previous.finalY + lineHeight;
    doc.setFontSize(12);
    doc.text("Summary:", 14, y);

    y += lineHeight;
    doc.setFontSize(10);
    doc.text(`Total Items: ${totalItems}`, 14, y);
    y += lineHeight;
    doc.text(`Good Condition: ${goodItems}`, 14, y);
    y += lineHeight;
    doc.text(`Needs Attention: ${badItems}`, 14, y);
    y += lineHeight;
    doc.text(`Overall Condition: ${percentageGood >= 90 ? "Excellent" : 
                                percentageGood >= 75 ? "Good" : 
                                percentageGood >= 60 ? "Fair" : "Poor"}`, 14, y);
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
