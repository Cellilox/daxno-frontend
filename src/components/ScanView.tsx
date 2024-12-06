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
                    <p>Use your smart phone</p>
                </div>
                <div className="mt-3">
                    <button className="p-3 bg-blue-600 rounded text-white"
                        onClick={toggleExpand}
                    >
                        Click to scan
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
                    backgroundColor: "#FCF5EB",
                    transition: "all 0.8s ease",
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: 'column',
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
               {
                isOuterExpanded?
                 <div style={{
                    alignSelf: 'end',
                    marginRight: '50px'
                 }}
                onClick={toggleExpand}>
                    <div>
                    <Image src="/close.svg" alt="My Icon" width={40} height={40} />
                    </div>
                </div>: null
               }


                <div
                    style={{
                        width: "80%",
                        height: "80%",
                        backgroundColor: "white",
                        transform: isInnerVisible ? "scaleY(1)" : "scaleY(0)",
                        transformOrigin: "top",
                        transition: "transform 0.5s ease",
                        display: "flex",
                        flexDirection: 'column',
                        alignItems: "stretch",
                        justifyContent: "flex-start",
                    }}
                >
                    <div style={{
                        opacity: isQRCodeVisible ? 1 : 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignContent: 'center'
                    }}>
                        <h1 className='text-customBlue text-5xl mt-6'>Scan</h1>
                    </div>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: '50px'
                    }}>
                        <div style={{ 
                            width: '50%', 
                            height: '300px',
                            opacity: isQRCodeVisible ? 1 : 0, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'flex-start', 
                            alignItems: 'center', 
                            }}>
                            <h1 className="text-3xl bold">Follow Instruction</h1>
                            <div className="flex justify-center items-center">
                                <ol>
                                    <li>Do it on your</li>
                                    <li>Do it on your</li>
                                    <li>Do it on your</li>
                                </ol>
                            </div>
                        </div>
                        <div
                            style={{
                                width: '50%',
                                opacity: isQRCodeVisible ? 1 : 0,
                                transition: "opacity 0.3s ease",
                                display: 'flex',
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <ProductQRCode />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}