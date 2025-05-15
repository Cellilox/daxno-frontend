'use client'

import { useState } from "react";
import Image from "next/image";

export default function Demo() {
    const [isOuterExpanded, setIsOuterExpanded] = useState(false);
    const [isInnerVisible, setIsInnerVisible] = useState(false);
    const [isTextVisible, setIsTextVisible] = useState(false);

    const toggleExpand = () => {
        if (isOuterExpanded) {
            setIsTextVisible(false);
            setTimeout(() => setIsInnerVisible(false), 300);
            setTimeout(() => setIsOuterExpanded(false), 600);
        } else {
            setIsOuterExpanded(true);
            setTimeout(() => {
                setIsInnerVisible(true);
                setIsTextVisible(true);
            }, 800);
        }
    };

    return (
        <div>
            <div className="flex flex-col items-center">
                <div className="w-full">
                    <button
                        onClick={toggleExpand}
                        className="w-full border-2 border-blue-600 text-blue-600 font-medium py-2.5 md:py-3 px-6 md:px-8 rounded-lg transition-all hover:bg-blue-50 text-sm md:text-base"
                    >
                        Watch Demo
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
                    backgroundColor: isOuterExpanded ? "rgba(0, 0, 0, 0.5)" : "transparent", // semi-transparent dark
                    backdropFilter: isOuterExpanded ? "blur(4px)" : "none", // optional blur
                    transition: "all 0.8s ease",
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {isOuterExpanded && (
                    <div
                        style={{
                            alignSelf: "flex-end",
                            marginRight: "20px",
                        }}
                        onClick={toggleExpand}
                    >
                        <Image src="/close.svg" alt="Close" width={30} height={30} />
                    </div>
                )}

                <div className={`text-center mb-12 transition-opacity duration-300 ${isTextVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        See It in Action
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Watch how TheWings AI transforms document processing in 90 seconds
                    </p>
                </div>

                <div
                    className=" w-full md:w-4/5 transform origin-top transition-transform duration-500 flex flex-col items-stretch justify-start"
                    style={{
                        transform: isInnerVisible ? "scaleY(1)" : "scaleY(0)",
                    }}
                >
                    {isInnerVisible && (
                        <div className="w-full mx-auto px-4">
                            <div className="relative aspect-video rounded-2xl shadow-xl overflow-hidden">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src="https://www.youtube.com/embed/6XwSZ9x6ZRQ?si=Ly71GTA0yQhHnA2u"
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}