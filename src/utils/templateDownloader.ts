
import * as XLSX from 'xlsx';

const TEMPLATE_HEADERS = [
  'id', 'title', 'description', 'price', 'discountPrice', 'category',
  'imageUrl', 'rating', 'inStock', 'colors', 'sizes', 'countryOfOrigin',
  'isNew', 'isBestseller', 'articleNumber', 'barcode', 'wildberriesUrl',
  'ozonUrl', 'avitoUrl', 'stockQuantity'
];

export const downloadCSVTemplate = () => {
  const csvContent = TEMPLATE_HEADERS.join(',') + '\n';
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'products_template.csv';
  link.click();
  window.URL.revokeObjectURL(url);
};

export const downloadExcelTemplate = () => {
  const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');
  XLSX.writeFile(wb, 'products_template.xlsx');
};
