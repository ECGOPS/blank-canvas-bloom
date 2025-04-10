
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { VITAsset, VITInspectionChecklist, SubstationInspection } from '@/lib/types';

// Declare module for jsPDF-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    /**
     * Internal properties and methods exposed for extension by plugins
     */
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
      getCurrentPageInfo: () => { pageNumber: number; pageContext: any };
      getNumberOfPages: () => number;
    };
    getNumberOfPages: () => number;
    setPage: (pageNumber: number) => jsPDF;
    getPage: () => number;
  }
}

/**
 * Export VIT inspection data to CSV
 * @param inspection The inspection to export
 */
export function exportVITInspectionToCsv(inspection: VITInspectionChecklist) {
  // Create CSV content
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Field,Value\n";
  
  // Add inspection fields
  csvContent += `ID,${inspection.id}\n`;
  csvContent += `Asset ID,${inspection.vitAssetId}\n`;
  csvContent += `Inspection Date,${inspection.inspectionDate}\n`;
  csvContent += `Inspected By,${inspection.inspectedBy}\n`;
  
  // Add all checklist items
  csvContent += `Rodent/Termite Encroachment,${inspection.rodentTermiteEncroachment}\n`;
  csvContent += `Clean/Dust Free,${inspection.cleanDustFree}\n`;
  csvContent += `Protection Button Enabled,${inspection.protectionButtonEnabled}\n`;
  csvContent += `Recloser Button Enabled,${inspection.recloserButtonEnabled}\n`;
  csvContent += `Ground/Earth Button Enabled,${inspection.groundEarthButtonEnabled}\n`;
  csvContent += `AC Power On,${inspection.acPowerOn}\n`;
  csvContent += `Battery Power Low,${inspection.batteryPowerLow}\n`;
  csvContent += `Handle Lock On,${inspection.handleLockOn}\n`;
  csvContent += `Remote Button Enabled,${inspection.remoteButtonEnabled}\n`;
  csvContent += `Gas Level Low,${inspection.gasLevelLow}\n`;
  csvContent += `Earthing Arrangement Adequate,${inspection.earthingArrangementAdequate}\n`;
  csvContent += `No Fuses Blown,${inspection.noFusesBlown}\n`;
  csvContent += `No Damage to Bushings,${inspection.noDamageToBushings}\n`;
  csvContent += `No Damage to HV Connections,${inspection.noDamageToHVConnections}\n`;
  csvContent += `Insulators Clean,${inspection.insulatorsClean}\n`;
  csvContent += `Paintwork Adequate,${inspection.paintworkAdequate}\n`;
  csvContent += `PT Fuse Link Intact,${inspection.ptFuseLinkIntact}\n`;
  csvContent += `No Corrosion,${inspection.noCorrosion}\n`;
  csvContent += `Silica Gel Condition,${inspection.silicaGelCondition}\n`;
  csvContent += `Correct Labelling,${inspection.correctLabelling}\n`;
  csvContent += `Remarks,${inspection.remarks}\n`;
  
  // Create and trigger download
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `inspection_${inspection.id}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export VIT asset data with inspections to PDF
 * @param asset The asset to export
 * @param inspections Inspections for this asset
 */
export function exportVITAssetToPDF(asset: VITAsset, inspections: VITInspectionChecklist[]) {
  // Create PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text("VIT Asset Report", 105, 15, { align: 'center' });
  
  // Add asset details
  doc.setFontSize(14);
  doc.text("Asset Details", 14, 25);
  
  doc.setFontSize(10);
  doc.text(`ID: ${asset.id}`, 14, 35);
  doc.text(`Serial Number: ${asset.serialNumber}`, 14, 40);
  doc.text(`Voltage Level: ${asset.voltageLevel}`, 14, 45);
  doc.text(`Type of Unit: ${asset.typeOfUnit}`, 14, 50);
  doc.text(`Location: ${asset.location}`, 14, 55);
  doc.text(`GPS Coordinates: ${asset.gpsCoordinates}`, 14, 60);
  doc.text(`Status: ${asset.status}`, 14, 65);
  doc.text(`Protection: ${asset.protection}`, 14, 70);
  
  // Add inspections
  doc.setFontSize(14);
  doc.text("Inspection Records", 14, 85);
  
  let yPos = 95;
  inspections.forEach((inspection, index) => {
    // Check if need to add a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.text(`Inspection #${index + 1} - ${inspection.inspectionDate}`, 14, yPos);
    yPos += 7;
    
    doc.setFontSize(10);
    doc.text(`Inspected By: ${inspection.inspectedBy}`, 20, yPos);
    yPos += 5;
    
    // Add inspection details as a table
    const tableData = [
      ["Item", "Status"],
      ["Rodent/Termite Encroachment", inspection.rodentTermiteEncroachment],
      ["Clean/Dust Free", inspection.cleanDustFree],
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
      ["Correct Labelling", inspection.correctLabelling]
    ];
    
    doc.autoTable({
      startY: yPos,
      head: [tableData[0]],
      body: tableData.slice(1),
      margin: { left: 20 },
      tableWidth: 170,
      styles: { fontSize: 8 }
    });
    
    yPos = (doc.autoTable as any).previous.finalY + 10;
    
    // Add remarks if any
    if (inspection.remarks) {
      doc.text("Remarks:", 20, yPos);
      yPos += 5;
      doc.text(inspection.remarks, 20, yPos, { maxWidth: 170 });
      yPos += 10;
    }
  });
  
  // Add page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${totalPages}`, 190, 287, { align: 'right' });
  }
  
  // Save PDF
  doc.save(`vit_asset_${asset.serialNumber}.pdf`);
}

/**
 * Export substation inspection data to PDF
 * @param inspection The inspection to export
 */
export function exportSubstationInspectionToPDF(inspection: SubstationInspection) {
  // Create PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text("Substation Inspection Report", 105, 15, { align: 'center' });
  
  // Add substation details
  doc.setFontSize(14);
  doc.text("Substation Details", 14, 25);
  
  doc.setFontSize(10);
  doc.text(`Substation Number: ${inspection.substationNo}`, 14, 35);
  doc.text(`Substation Name: ${inspection.substationName || 'N/A'}`, 14, 40);
  doc.text(`Region: ${inspection.region}`, 14, 45);
  doc.text(`District: ${inspection.district}`, 14, 50);
  doc.text(`Date: ${inspection.date}`, 14, 55);
  doc.text(`Inspection Type: ${inspection.type}`, 14, 60);
  doc.text(`Emergency: ${inspection.isEmergency ? 'Yes' : 'No'}`, 14, 65);
  
  // Add inspection categories
  let yPos = 80;
  inspection.items.forEach(category => {
    // Check if need to add a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.text(`${category.name}`, 14, yPos);
    yPos += 7;
    
    // Add items as a table
    const tableData = [
      ["Item", "Status", "Remarks"]
    ];
    
    category.items.forEach(item => {
      tableData.push([
        item.name,
        item.status,
        item.remarks || '-'
      ]);
    });
    
    doc.autoTable({
      startY: yPos,
      head: [tableData[0]],
      body: tableData.slice(1),
      margin: { left: 14 },
      tableWidth: 182,
      styles: { fontSize: 8 }
    });
    
    yPos = (doc.autoTable as any).previous.finalY + 10;
  });
  
  // Add page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${totalPages}`, 190, 287, { align: 'right' });
  }
  
  // Save PDF
  doc.save(`substation_inspection_${inspection.substationNo}.pdf`);
}

/**
 * Export substation inspection to CSV
 * @param inspection The inspection to export
 */
export function exportSubstationInspectionToCsv(inspection: SubstationInspection) {
  // Create CSV content
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Add header row
  csvContent += "Category,Item,Status,Remarks\n";
  
  // Add all items grouped by category
  inspection.items.forEach(category => {
    category.items.forEach(item => {
      csvContent += `"${category.name}","${item.name}","${item.status}","${item.remarks || ''}"\n`;
    });
  });
  
  // Create and trigger download
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `substation_inspection_${inspection.substationNo}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export all substation inspections to a single CSV file
 * @param inspections Array of inspections to export
 */
export function exportAllSubstationInspectionsToCsv(inspections: SubstationInspection[]) {
  // Create CSV content
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Add header row
  csvContent += "Substation No,Substation Name,Region,District,Date,Type,Emergency,Category,Item,Status,Remarks\n";
  
  // Add all inspections with their items
  inspections.forEach(inspection => {
    inspection.items.forEach(category => {
      category.items.forEach(item => {
        csvContent += `"${inspection.substationNo}","${inspection.substationName || ''}","${inspection.region}","${inspection.district}","${inspection.date}","${inspection.type}","${inspection.isEmergency ? 'Yes' : 'No'}","${category.name}","${item.name}","${item.status}","${item.remarks || ''}"\n`;
      });
    });
  });
  
  // Create and trigger download
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `all_substation_inspections_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Placeholder for Load Monitoring PDF export
 * This is needed to fix import errors in other files
 */
export function exportLoadMonitoringToPDF(data: any) {
  console.log("Load monitoring PDF export not yet implemented", data);
  // Create a simple placeholder PDF
  const doc = new jsPDF();
  doc.text("Load Monitoring Report - Not Yet Implemented", 20, 20);
  doc.save("load_monitoring_report.pdf");
}
