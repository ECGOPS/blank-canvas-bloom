
import React from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { YesNoOption } from '@/lib/types';

interface YesNoStatusProps {
  label: string;
  status: YesNoOption;
}

export function YesNoStatus({ label, status }: YesNoStatusProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'Yes':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <Check className="mr-1 h-3 w-3" />
            Yes
          </Badge>
        );
      case 'No':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
            <X className="mr-1 h-3 w-3" />
            No
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            <AlertTriangle className="mr-1 h-3 w-3" />
            N/A
          </Badge>
        );
    }
  };

  return (
    <div className="flex justify-between items-center">
      <span>{label}</span>
      {getStatusBadge()}
    </div>
  );
}
