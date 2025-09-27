import React, { useState } from 'react';
import { Download, FileText, Table, Image, FileSpreadsheet } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { exportToCSV, exportToExcel, exportPortfolioToPDF, exportTransactionsToPDF, exportChartToPDF } from '../utils/export';
import { toast } from '../hooks/use-toast';

const ExportButton = ({ 
  data, 
  filename, 
  type = 'data', // 'data', 'portfolio', 'transactions', 'chart'
  chartElementId,
  userData,
  title 
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (exportType) => {
    setIsExporting(true);
    
    try {
      switch (exportType) {
        case 'csv':
          exportToCSV(data, `${filename}.csv`);
          break;
        case 'excel':
          exportToExcel(data, `${filename}.xlsx`);
          break;
        case 'pdf':
          if (type === 'portfolio') {
            exportPortfolioToPDF(data, userData, `${filename}.pdf`);
          } else if (type === 'transactions') {
            exportTransactionsToPDF(data, userData, `${filename}.pdf`);
          } else if (type === 'chart' && chartElementId) {
            await exportChartToPDF(chartElementId, `${filename}.pdf`, title);
          } else {
            // Default PDF export for data
            exportToExcel(data, `${filename}.xlsx`);
          }
          break;
        default:
          exportToCSV(data, `${filename}.csv`);
      }
      
      toast({
        title: "Export Successful",
        description: `Data exported as ${exportType.toUpperCase()} successfully`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getExportOptions = () => {
    switch (type) {
      case 'portfolio':
        return [
          { value: 'pdf', label: 'PDF Report', icon: FileText },
          { value: 'excel', label: 'Excel', icon: FileSpreadsheet },
          { value: 'csv', label: 'CSV', icon: Table }
        ];
      case 'transactions':
        return [
          { value: 'pdf', label: 'PDF Report', icon: FileText },
          { value: 'excel', label: 'Excel', icon: FileSpreadsheet },
          { value: 'csv', label: 'CSV', icon: Table }
        ];
      case 'chart':
        return [
          { value: 'pdf', label: 'PDF', icon: Image },
          { value: 'excel', label: 'Excel', icon: FileSpreadsheet },
          { value: 'csv', label: 'CSV', icon: Table }
        ];
      default:
        return [
          { value: 'excel', label: 'Excel', icon: FileSpreadsheet },
          { value: 'csv', label: 'CSV', icon: Table }
        ];
    }
  };

  const exportOptions = getExportOptions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting || !data}
          className="hover:bg-gray-50 transition-all duration-300"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {exportOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleExport(option.value)}
            className="cursor-pointer"
          >
            <option.icon className="h-4 w-4 mr-2" />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
