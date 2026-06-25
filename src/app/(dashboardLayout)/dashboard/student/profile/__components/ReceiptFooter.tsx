import React from 'react';
import { Phone, MapRounded } from '@mui/icons-material';

interface ReceiptFooterProps {
    totalAmount: number;
    collectedBy: string;
}

const ReceiptFooter: React.FC<ReceiptFooterProps> = ({ totalAmount, collectedBy }) => {
    return (
        <>
            <div className="grid grid-cols-12 gap-0 border border-gray-300 mt-4 flex-shrink-0">
                <div className="col-span-8 flex flex-col">
                    <div className="p-3 bg-gray-50 border-b border-gray-200">
                        {/* MonthSelector is rendered separately */}
                    </div>
                    <div className="p-3 bg-gray-100 flex-1 flex items-start gap-2">
                        <span className="font-bold text-sm whitespace-nowrap">কথায়:</span>
                        <div className="border-b border-dotted border-gray-400 w-full h-5"></div>
                    </div>
                </div>
                <div className="col-span-4 text-sm font-semibold">
                    <div className="grid grid-cols-2 h-full">
                        <div className="flex flex-col">
                            <div className="flex-1 flex items-center justify-center bg-gray-200 border-b border-r border-white">
                                সর্বমোট
                            </div>
                            <div className="flex-1 flex items-center justify-center bg-gray-200 border-b border-r border-white">
                                পরিশোধিত
                            </div>
                            <div className="flex-1 flex items-center justify-center bg-gray-200 border-r border-white text-[#9c27b0]">
                                বকেয়া
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex-1 bg-gray-50 border-b border-gray-200 p-1 text-right outline-none">
                                ৳{totalAmount.toLocaleString()}
                            </div>
                            <div className="flex-1 bg-gray-50 border-b border-gray-200 p-1 text-right outline-none">
                                ৳{totalAmount.toLocaleString()}
                            </div>
                            <div className="flex-1 bg-pink-50/50 p-1 text-right outline-none text-red-600">
                                ৳0
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-end justify-between flex-shrink-0">
                <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#4c2a70] p-1 rounded text-white">
                            <Phone />
                        </div>
                        <div>
                            <p>+8801830678383</p>
                            <p>+8801310726000</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="bg-[#4c2a70] p-1 rounded text-white">
                            <MapRounded />
                        </div>
                        <p className="max-w-[250px]">
                            কুয়েত টাওয়ার, স্বপ্ন সুপার শপ বিল্ডিং, নিমাইকাশারি, সিদ্ধিরগঞ্জ, নারায়ণগঞ্জ
                        </p>
                    </div>
                </div>
                <div className="text-center">
                    <div className="w-32 border-t border-black mb-1"></div>
                    <p className="text-sm font-semibold">আদায়কারীর স্বাক্ষর</p>
                    <p className="text-sm mt-1">{collectedBy || "Admin"}</p>
                </div>
            </div>
        </>
    );
};

export default ReceiptFooter;