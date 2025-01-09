////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// No imports needed

////////////////////////////////////////////////
// Types:
////////////////////////////////////////////////

export interface SellerInfo {
  sellerName: string;
  price: string;
  type: 'WMT' | 'WFS' | 'WFS-Pro' | 'SF' | 'SF-Pro' | string;
  arrives: string;
  isProSeller: boolean;
  isWFS: boolean;
  priceInfo?: {
    currentPrice?: {
      price: number;
      priceString: string;
    };
  };
  fulfillmentStatus?: string;
  arrivalDate?: string;
}

export interface RawSellerData {
  name: string | null;
  price: string | null;
  deliveryInfo: string | null;
  isWFS: boolean;
  isProSeller: boolean;
} 