import React, { useEffect, useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { getUsedData } from '../../utils/usedData';
import type { UsedProductData } from '../../utils/usedData';

export const SellerTable: React.FC = () => {
    const [productData, setProductData] = React.useState<UsedProductData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const CLASS_SECTION_CONTENT_GREEN = "text-xs font-bold bg-green-100 text-black-600 border-2 border-green-500 text-center p-1 w-full rounded-b-lg shadow-md shadow-black";
    const CLASS_SECTION_CONTENT_RED = "text-xs font-bold bg-red-200 text-black-600 border-2 border-red-500 text-center p-1 w-full rounded-b-lg shadow-md shadow-black";

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

    // Helper function to format price
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

    // Helper function to determine seller type
    const getSellerType = (seller: any, brand?: string | null) => {
        if (seller.sellerName === "Walmart.com") return "WMT";

        const isBrandSeller = brand && seller.sellerName &&
            brand.toLowerCase().split(' ').some(brandPart =>
                seller.sellerName.toLowerCase().includes(brandPart)
            );

        if (isBrandSeller) {
            return seller.isWFS ? "WFS-Brand" : "SF-Brand";
        }

        return seller.isWFS ? "WFS" : "SF";
    };

    const applyMaxSellersHighlight = (): string => {
        const storedSettings = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
        const maxSellers = typeof storedSettings.maxSellers === "string"
            ? parseFloat(storedSettings.maxSellers)
            : storedSettings.maxSellers || null;

        if (maxSellers === null || maxSellers === 0) {
            return "bg-white text-black-600 border-2 border-black";
        }

        return (productData?.sellers.totalSellers || 0) <= maxSellers
            ? CLASS_SECTION_CONTENT_GREEN
            : CLASS_SECTION_CONTENT_RED;
    };

    if (isLoading) {
        return (
            <div className="p-4 w-full text-center">
                <div className="mx-auto w-8 h-8 rounded-full border-b-2 border-gray-900 animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden w-full rounded-lg border shadow-lg">
            {/* Quick Stats Section */}
            <div className="flex justify-between px-4 py-2 bg-gray-50 border-b">
                
                {/* Total Sellers */}
                <div className="text-center pb-2">
                    <div className="text-sm font-semibold bg-gray-100">Total Sellers</div>
                    <div className={`mt-1 px-3 py-1 border border-black rounded-full text-xs font-medium ${applyMaxSellersHighlight()}`}>
                        {productData?.sellers.totalSellers || 0}
                    </div>
                </div>

                {/* WFS Sellers */}
                <div className="text-center pb-2">
                    <div className="text-sm font-semibold bg-gray-100">WFS Sellers</div>
                    <div className={`mt-1 px-3 py-1 border border-black rounded-full text-xs font-medium ${
                        productData?.sellers.otherSellers.filter(s => s.type === "WFS" || s.type === "WFS-Brand").length === 0
                        ? CLASS_SECTION_CONTENT_GREEN
                        : CLASS_SECTION_CONTENT_RED
                    }`}>
                        {productData?.sellers.otherSellers.filter(s => s.type === "WFS" || s.type === "WFS-Brand").length || "0"}
                    </div>
                </div>

                {/* Walmart Sells */}
                <div className="text-center pb-2">
                    <div className="text-sm font-semibold bg-gray-100">Walmart Sells</div>
                    <div className={`mt-1 px-3 py-1 border border-black rounded-full text-xs font-medium ${
                        productData?.sellers.mainSeller?.sellerName === "Walmart.com"
                        ? CLASS_SECTION_CONTENT_RED
                        : CLASS_SECTION_CONTENT_GREEN
                    }`}>
                        {productData?.sellers.mainSeller?.sellerName === "Walmart.com" ? "YES" : "NO"}
                    </div>
                </div>

                {/* Brand Sells */}
                <div className="text-center pb-2">
                    <div className="text-sm font-semibold bg-gray-100">Brand Sells</div>
                    <div className={`mt-1 px-3 py-1 border border-black rounded-full text-xs font-medium ${
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
                                    {seller.arrives || "-"}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}; 