
import React from 'react';
import { Check, X } from 'lucide-react';

interface WildberriesImportResultsProps {
  mappingResults: { success: string[]; failed: string[] } | null;
}

export const WildberriesImportResults: React.FC<WildberriesImportResultsProps> = ({ mappingResults }) => {
  if (!mappingResults) return null;

  return (
    <div className="space-y-4 mt-4">
      {mappingResults.success.length > 0 && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-800 flex items-center space-x-1 mb-2">
            <Check className="w-4 h-4" />
            <span>Успешно импортировано с остатками ({mappingResults.success.length})</span>
          </h4>
          <div className="text-sm text-green-700 space-y-1 max-h-40 overflow-y-auto">
            {mappingResults.success.slice(0, 15).map((item, index) => (
              <div key={index} className="font-mono text-xs">{item}</div>
            ))}
            {mappingResults.success.length > 15 && (
              <div className="text-green-600">... и ещё {mappingResults.success.length - 15}</div>
            )}
          </div>
        </div>
      )}

      {mappingResults.failed.length > 0 && (
        <div className="p-4 bg-red-50 rounded-lg">
          <h4 className="font-medium text-red-800 flex items-center space-x-1 mb-2">
            <X className="w-4 h-4" />
            <span>Ошибки ({mappingResults.failed.length})</span>
          </h4>
          <div className="text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
            {mappingResults.failed.slice(0, 15).map((item, index) => (
              <div key={index} className="text-xs">{item}</div>
            ))}
            {mappingResults.failed.length > 15 && (
              <div className="text-red-600">... и ещё {mappingResults.failed.length - 15}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
