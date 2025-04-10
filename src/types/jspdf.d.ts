
import { jsPDF } from "jspdf";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY?: number;
    };
    autoTable: (options: {
      startY?: number;
      head?: string[][];
      body?: string[][];
      theme?: string;
      headStyles?: {
        fillColor?: number[];
        textColor?: number[];
      };
      styles?: {
        cellPadding?: number;
        fontSize?: number;
        overflow?: string;
        lineWidth?: number;
        lineColor?: number[];
      };
      columnStyles?: {
        [key: number]: {
          cellWidth?: number;
          fillColor?: number[];
        };
      };
      margin?: {
        left?: number;
        top?: number;
        right?: number;
        bottom?: number;
      };
      didDrawPage?: (data: any) => void;
    }) => jsPDF;
    setPage: (pageNumber: number) => jsPDF;
  }
}

declare module "jspdf-autotable" {} 
