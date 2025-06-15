
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Download, FileSpreadsheet } from 'lucide-react';
import { FileType } from '@/types/import';
import { downloadCSVTemplate, downloadExcelTemplate } from '@/utils/templateDownloader';

interface FileUploadSectionProps {
  importFile: File | null;
  fileType: FileType;
  importedDataLength: number;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadSection = ({ 
  importFile, 
  fileType, 
  importedDataLength, 
  onFileUpload 
}: FileUploadSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Импорт товаров</span>
        </CardTitle>
        <CardDescription>
          Загрузите CSV или Excel файл с товарами для массового импорта в систему
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={downloadCSVTemplate}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Шаблон CSV</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={downloadExcelTemplate}
              className="flex items-center space-x-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Шаблон Excel</span>
            </Button>
          </div>
          
          <div className="flex-1">
            <Input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={onFileUpload}
              className="cursor-pointer"
            />
          </div>
        </div>

        {importFile && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
            {fileType === 'xlsx' ? (
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
            ) : (
              <FileText className="w-5 h-5 text-green-600" />
            )}
            <span className="text-green-800">
              Файл загружен: {importFile.name} ({fileType?.toUpperCase()})
            </span>
            <Badge variant="outline">{importedDataLength} товаров</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploadSection;
