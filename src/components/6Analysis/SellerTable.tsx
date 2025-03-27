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
        const fetchSellers = async () => {
            try {
                const data = await getUsedData();
                if (data) {
                    setProductData(data);
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching sellers:', error);
                setIsLoading(false);
            }
        };

        fetchSellers();
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
        <div className="w-full rounded-lg border shadow-lg">
            {/* Quick Stats Section */}
            <div className="flex justify-between px-4 py-2 bg-gray-50 border-b overflow-visible">
                
                {/* Total Sellers */}
                <div className="text-center pb-2 relative group">
                    <div className="text-sm font-semibold bg-gray-50">Total Sellers</div>
                    <div className="relative">
                        <div className={`mt-1 px-3 py-1 rounded-full text-xs font-medium ${!JSON.parse(localStorage.getItem("desiredMetrics") || "{}")?.maxSellers ? 'cursor-help' : ''} ${applyMaxSellersHighlight()}`}>
                            {productData?.sellers.totalSellers || 0}
                        </div>
                        {!JSON.parse(localStorage.getItem("desiredMetrics") || "{}")?.maxSellers && (
                            <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-[100] whitespace-nowrap">
                                Baseline value not in settings
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-800"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* WFS Sellers */}
                <div className="text-center pb-2">
                    <div className="text-sm font-semibold bg-gray-50">WFS Sellers</div>
                    <div className={`mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                        productData?.sellers.otherSellers.filter(s => s.type === "WFS" || s.type === "WFS-Brand").length === 0
                        ? CLASS_SECTION_CONTENT_GREEN
                        : CLASS_SECTION_CONTENT_RED
                    }`}>
                        {productData?.sellers.otherSellers.filter(s => s.type === "WFS" || s.type === "WFS-Brand").length || "0"}
                    </div>
                </div>

                {/* Walmart Sells */}
                <div className="text-center pb-2">
                    <div className="text-sm font-semibold bg-gray-50">Walmart Sells</div>
                    <div className={`mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                        productData?.sellers.mainSeller?.sellerName === "Walmart.com"
                        ? CLASS_SECTION_CONTENT_RED
                        : CLASS_SECTION_CONTENT_GREEN
                    }`}>
                        {productData?.sellers.mainSeller?.sellerName === "Walmart.com" ? "YES" : "NO"}
                    </div>
                </div>

                {/* Brand Sells */}
                <div className="text-center pb-2">
                    <div className="text-sm font-semibold bg-gray-50">Brand Sells</div>
                    <div className={`mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                        productData?.sellers.otherSellers.some(s =>
                            productData?.basic.brand && s.sellerName &&
                            productData.basic.brand.toLowerCase().split(' ').some(brandPart =>
                                s.sellerName.toLowerCase().includes(brandPart)
                            )
                        )
                        ? CLASS_SECTION_CONTENT_RED
                        : CLASS_SECTION_CONTENT_GREEN
                    }`}>
                        {productData?.sellers.otherSellers.some(s =>
                            productData?.basic.brand && s.sellerName &&
                            productData.basic.brand.toLowerCase().split(' ').some(brandPart =>
                                s.sellerName.toLowerCase().includes(brandPart)
                            )
                        ) ? "YES" : "NO"}
                    </div>
                </div>
            </div>

            <table className="min-w-full border-collapse border border-black">
                <thead>
                    <tr>
                        <th className={"py-1 text-xs text-white bg-[#3a3f47] uppercase border-2 border-black"}>
                            SELLER NAME
                        </th>
                        <th className={"py-1 text-xs text-white bg-[#3a3f47] uppercase border-2 border-black"}>
                            PRICE
                        </th>
                        <th className={"py-1 text-xs text-white bg-[#3a3f47] uppercase border-2 border-black"}>
                            TYPE
                        </th>
                        <th className={"py-1 text-xs text-white bg-[#3a3f47] uppercase border-2 border-black"}>
                            QTY
                        </th>
                        <th className={"py-1 text-xs text-white bg-[#3a3f47] uppercase border-2 border-black"}>
                            ARRIVES
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {/* All Sellers (main seller first, then others) */}
                    {[...(productData?.sellers.mainSeller ? [productData.sellers.mainSeller] : []),
                    ...(productData?.sellers.otherSellers || [])]
                        .map((seller, index) => (
                            <tr key={index} className="border-b border-black hover:bg-gray-100">
                                <td className="py-1 text-xs text-center border-x border-black">
                                    <div className="flex items-center justify-center space-x-1">
                                        <span>{seller.sellerName || "-"}</span>
                                        {seller.isProSeller && (
                                            <FiCheckCircle className="text-blue-500" title="Pro Seller" />
                                        )}
                                    </div>
                                </td>
                                <td className="py-1 text-xs text-center border-x border-black">
                                    {formatPrice(seller.price)}
                                </td>
                                <td className="py-1 text-xs text-center border-x border-black">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeStyle(getSellerType(seller, productData?.basic.brand))}`}>
                                        {getSellerType(seller, productData?.basic.brand)}
                                    </span>
                                </td>
                                <td className="py-1 text-xs text-center border-x border-black">
                                    {seller.availableQuantity || "-"}
                                </td>
                                <td className="py-1 text-xs text-center border-x border-black">
                                    {seller.arrives || "-"}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default SellerTable; 