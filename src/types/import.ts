
export interface ImportedProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  imageUrl: string;
  rating?: number;
  inStock: boolean;
  colors?: string;
  sizes?: string;
  countryOfOrigin?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  articleNumber: string;
  barcode?: string;
  wildberriesUrl?: string;
  ozonUrl?: string;
  avitoUrl?: string;
  stockQuantity: number;
}

export type FileType = 'csv' | 'xlsx' | null;
