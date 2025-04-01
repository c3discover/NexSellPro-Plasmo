/**
 * @fileoverview SellerTable component for displaying detailed seller information
 * @author NexSellPro
 * @created 2024-03-21
 * @lastModified 2024-03-21
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useEffect, useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { getUsedData } from '../../utils/usedData';
import type { UsedProductData } from '../../utils/usedData';
import { isBrandMatch } from '../../utils/analysisHelpers';

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// CSS class constants for styling seller metrics
const CLASS_SECTION_CONTENT_GREEN = "text-xs font-bold bg-green-100 text-black-600 border-2 border-green-500 text-center p-1 w-full rounded-b-lg shadow-md shadow-black";
const CLASS_SECTION_CONTENT_RED = "text-xs font-bold bg-red-200 text-black-600 border-2 border-red-500 text-center p-1 w-full rounded-b-lg shadow-md shadow-black";
const CLASS_SECTION_CONTENT_DEFAULT = "text-xs font-bold bg-white text-black-600 border-2 border-black-700 text-center p-1 w-full rounded-b-lg shadow-md shadow-black";

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Using UsedProductData type from usedData.ts

////////////////////////////////////////////////
// Props Interface:
////////////////////////////////////////////////
// No props needed for this component

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
export const SellerTable: React.FC = () => {
    ////////////////////////////////////////////////
    // State and Hooks:
    ////////////////////////////////////////////////
    // State for storing product data
    const [productData, setProductData] = React.useState<UsedProductData | null>(null);
    // State for tracking loading status
    const [isLoading, setIsLoading] = useState(true);

    // Effect hook to fetch seller data on component mount
    useEffect(() => {
        let isMounted = true;

        const fetchSellers = async () => {
            try {
                const data = await getUsedData();
                if (data && isMounted) {
                    setProductData(data);
                }
            } catch (error) {
                console.error('Error fetching sellers:', error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchSellers();

        // Cleanup function to prevent memory leaks
        return () => {
            isMounted = false;
        };
    }, []);

    ////////////////////////////////////////////////
    // Helper Functions:
    ////////////////////////////////////////////////
    /**
     * Determines the style classes for different seller types
     * @param type The type of seller (WMT, WFS, SF, etc.)
     * @returns CSS classes for styling the seller type badge
     */
    const getTypeStyle = (type: string) => {
        switch (type) {
            case 'WMT':
                return 'bg-blue-100 text-blue-700 border-blue-500';
            case 'WFS':
            case 'WFS-Brand':
                return 'bg-red-100 text-red-700 border-red-500';
            case 'SF':
            case 'SF-Brand':
                return 'bg-green-100 text-green-700 border-green-500';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-500';
        }
    };

    /**
     * Formats price values to consistent display format
     * @param price Price value to format
     * @returns Formatted price string with $ symbol
     */
    const formatPrice = (price: string | number | undefined): string => {
        if (typeof price === 'number') {
            return `$${price.toFixed(2)}`;
        }
        if (typeof price === 'string') {
            const numPrice = parseFloat(price);
            return isNaN(numPrice) ? price : `$${numPrice.toFixed(2)}`;
        }
        return '-';
    };

    /**
     * Determines the seller type based on seller info and brand
     * @param seller Seller object containing seller information
     * @param brand Brand name to check against
     * @returns Seller type classification
     */
    const getSellerType = (seller: any, brand?: string | null) => {
        if (seller.sellerName === "Walmart.com") return "WMT";

        const isBrandSeller = isBrandMatch(brand, seller.sellerName);

        if (isBrandSeller) {
            return seller.isWFS ? "WFS-Brand" : "SF-Brand";
        }

        return seller.isWFS ? "WFS" : "SF";
    };

    /**
     * Applies highlighting based on maximum sellers threshold
     * @returns CSS classes for styling based on seller count
     */
    const applyMaxSellersHighlight = (): string => {
        const storedSettings = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
        const maxSellers = typeof storedSettings.maxSellers === "string"
            ? parseFloat(storedSettings.maxSellers)
            : storedSettings.maxSellers || null;

        if (maxSellers === null || maxSellers === 0) {
            return CLASS_SECTION_CONTENT_DEFAULT;
        }

        return (productData?.sellers.totalSellers || 0) <= maxSellers
            ? CLASS_SECTION_CONTENT_GREEN
            : CLASS_SECTION_CONTENT_RED;
    };

    ////////////////////////////////////////////////
    // Render Logic:
    ////////////////////////////////////////////////
    if (isLoading) {
        return (
            <div className="p-4 w-full text-center">
                <div className="mx-auto w-8 h-8 rounded-full border-b-2 border-gray-900 animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="w-full rounded-lg overflow-hidden bg-white">
            {/* Quick Stats Section */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="py-2 px-3 text-[10px] font-medium text-gray-600 bg-gray-50 border-b text-left">
                                SELLER NAME
                            </th>
                            <th className="py-2 px-3 text-[10px] font-medium text-gray-600 bg-gray-50 border-b text-center">
                                PRICE
                            </th>
                            <th className="py-2 px-3 text-[10px] font-medium text-gray-600 bg-gray-50 border-b text-center">
                                TYPE
                            </th>
                            <th className="py-2 px-3 text-[10px] font-medium text-gray-600 bg-gray-50 border-b text-center">
                                QTY
                            </th>
                            <th className="py-2 px-3 text-[10px] font-medium text-gray-600 bg-gray-50 border-b text-center">
                                ARRIVES
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {/* All Sellers (main seller first, then others) */}
                        {[...(productData?.sellers.mainSeller ? [productData.sellers.mainSeller] : []),
                        ...(productData?.sellers.otherSellers || [])]
                            .map((seller, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="py-2 px-3 text-[11px] text-left">
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">{seller.sellerName || "-"}</span>
                                            {seller.isProSeller && (
                                                <FiCheckCircle className="text-cyan-500 w-3 h-3" title="Pro Seller" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-2 px-3 text-[11px] text-center font-medium">
                                        {formatPrice(seller.price)}
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                        <TypeBadge type={getSellerType(seller, productData?.basic.brand)} />
                                    </td>
                                    <td className="py-2 px-3 text-[11px] text-center font-medium">
                                        {seller.availableQuantity || "-"}
                                    </td>
                                    <td className="py-2 px-3 text-[11px] text-center text-gray-600">
                                        {seller.arrives || "-"}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// New TypeBadge component for consistent seller type styling
const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
    const getTypeStyle = (type: string) => {
        switch (type) {
            case 'WMT':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'WFS':
            case 'WFS-Brand':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'SF':
            case 'SF-Brand':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full border ${getTypeStyle(type)}`}>
            {type}
        </span>
    );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default SellerTable; 