
import React from "react";
import { Check, X } from "lucide-react";

type ChecklistItemProps = {
  label: string;
  value: string;
  isPositive: (value: string) => boolean;
}

export const InspectionChecklistItem: React.FC<ChecklistItemProps> = ({ label, value, isPositive }) => {
  return (
    <li className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium">{label}</span>
      <span className={`text-sm font-semibold flex items-center gap-1 ${
        isPositive(value) ? "text-green-600" : "text-red-600"
      }`}>
        {isPositive(value) ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <X className="h-4 w-4 text-red-600" />
        )}
        {value}
      </span>
    </li>
  );
};
