'use client'

import { useState } from "react";
import ProductQRCode from "./QRcode";
import Image from "next/image";

export default function ScanView() {
    const [isOuterExpanded, setIsOuterExpanded] = useState(false);
    const [isInnerVisible, setIsInnerVisible] = useState(false);
    const [isQRCodeVisible, setIsQRCodeVisible] = useState(false);

    const toggleExpand = () => {
        if (isOuterExpanded) {
            setIsQRCodeVisible(false); // Hide QR Code first
            setTimeout(() => setIsInnerVisible(false), 300); // Shrink inner square after delay
            setTimeout(() => setIsOuterExpanded(false), 600); // Shrink outer square last
        } else {
            setIsOuterExpanded(true); // Expand outer square
            setTimeout(() => setIsInnerVisible(true), 800); // Show inner square after outer finishes
            setTimeout(() => setIsQRCodeVisible(true), 1300); // Show QR Code after inner transition
        }
    };

    return (
        <div>
            <div className="flex flex-col items-center">
                <div>
                    <button
                        className="text-xs sm:text-sm inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors"
                        onClick={toggleExpand}
                    >
                        Use your smart phone
                    </button>
                </div>
            </div>

            <div
                style={{
                    position: isOuterExpanded ? "fixed" : "absolute",
                    top: isOuterExpanded ? 0 : "50px",
                    left: isOuterExpanded ? 0 : "50px",
                    width: isOuterExpanded ? "100%" : "0px",
                    height: isOuterExpanded ? "100%" : "0px",
                    backgroundColor: "#EFF6FF",
                    transition: "all 0.8s ease",
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {isOuterExpanded ? (
                    <div
                        style={{
                            alignSelf: "flex-end",
                            marginRight: "20px",
                        }}
                        onClick={toggleExpand}
                    >
                        <Image src="/close.svg" alt="Close" width={30} height={30} />
                    </div>
                ) : null}

                <div
                    className="w-4/5 h-4/5 bg-white transform origin-top transition-transform duration-500 flex flex-col items-stretch justify-start"
                    style={{
                        transform: isInnerVisible ? "scaleY(1)" : "scaleY(0)",
                    }}
                >
                    <div
                        className={`transition-opacity duration-300 ${
                            isQRCodeVisible ? "opacity-100" : "opacity-0"
                        } flex justify-center`}
                    >
                        <h1 className="text-customBlue text-3xl md:text-4xl lg:text-5xl mt-6">
                            Scan
                        </h1>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center mt-6 md:mt-12">
                        <div
                            className={`w-full md:w-1/2 h-auto transition-opacity duration-300 ${
                                isQRCodeVisible ? "opacity-100" : "opacity-0"
                            } flex flex-col items-center`}
                        >
                            <h1 className="text-xl md:text-2xl font-bold">
                                Follow Instructions
                            </h1>
                            <ol className="text-sm md:text-base mt-4">
                                <li>1. Download our app [Android, IOs]</li>
                                <li>2. Ensure proper lighting</li>
                                <li>3. Align the QR code within the frame</li>
                            </ol>
                        </div>

                        <div
                            className={`w-full md:w-1/2 h-auto transition-opacity duration-300 ${
                                isQRCodeVisible ? "opacity-100" : "opacity-0"
                            } flex justify-center`}
                        >
                            <ProductQRCode />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
