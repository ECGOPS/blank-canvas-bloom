
import React from "react";

type ChecklistItemProps = {
  label: string;
  value: string;
  isPositive: (value: string) => boolean;
}

export const InspectionChecklistItem: React.FC<ChecklistItemProps> = ({ label, value, isPositive }) => {
  // Safely handle undefined or null values
  const displayValue = value ?? "N/A";
  const isValid = value ? isPositive(value) : false;
  
  return (
    <li className="flex justify-between">
      <span className="text-sm">{label}</span>
      <span className={`text-sm font-medium ${
        isValid ? "text-green-600" : "text-red-600"
      }`}>
        {displayValue}
      </span>
    </li>
  );
};
