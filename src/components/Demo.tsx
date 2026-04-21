'use client'

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { createSupportMessage } from "@/actions/support-messages-actions";
import { messageType, messageTypeEnum } from "@/types";
import Alert from "@/components/ui/Alert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type SupportFormData = {
    fullname: string;
    email: string;
    subject: string;
    message: string;
}

export const REQUEST_DEMO_EVENT = "daxno:request-demo";

export default function Demo() {
    const [isOuterExpanded, setIsOuterExpanded] = useState(false);
    const [isInnerVisible, setIsInnerVisible] = useState(false);
    const [isTextVisible, setIsTextVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<messageType | null>(null);
    const isOpenRef = useRef(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<SupportFormData>();

    const openOverlay = useCallback(() => {
        if (isOpenRef.current) return;
        isOpenRef.current = true;
        setIsOuterExpanded(true);
        setTimeout(() => {
            setIsInnerVisible(true);
            setIsTextVisible(true);
        }, 800);
    }, []);

    const closeOverlay = useCallback(() => {
        if (!isOpenRef.current) return;
        isOpenRef.current = false;
        setIsTextVisible(false);
        setTimeout(() => setIsInnerVisible(false), 300);
        setTimeout(() => setIsOuterExpanded(false), 600);
    }, []);

    const toggleExpand = () => {
        if (isOpenRef.current) {
            closeOverlay();
        } else {
            openOverlay();
        }
    };

    useEffect(() => {
        const handler = () => openOverlay();
        window.addEventListener(REQUEST_DEMO_EVENT, handler);
        return () => window.removeEventListener(REQUEST_DEMO_EVENT, handler);
    }, [openOverlay]);

    const onSubmit = async (data: SupportFormData) => {
        setIsLoading(true);
        try {
            const result = await createSupportMessage(data);
            if (result?.ok) {
                setMessage({
                    type: messageTypeEnum.SUCCESS,
                    text: "Thanks! Your request was sent. We'll be in touch shortly.",
                });
                reset();
            } else {
                setMessage({
                    type: messageTypeEnum.ERROR,
                    text: result?.error || "Failed to send your request. Please try again.",
                });
            }
        } catch {
            setMessage({
                type: messageTypeEnum.ERROR,
                text: "Server Error",
            });
        } finally {
            setIsLoading(false);
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
                        Request Demo
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
                    backgroundColor: isOuterExpanded ? "rgba(0, 0, 0, 0.5)" : "transparent",
                    backdropFilter: isOuterExpanded ? "blur(4px)" : "none",
                    transition: "all 0.8s ease",
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    overflowY: "auto",
                }}
            >
                {isOuterExpanded && (
                    <div
                        style={{
                            alignSelf: "flex-end",
                            marginRight: "20px",
                            cursor: "pointer",
                        }}
                        onClick={toggleExpand}
                    >
                        <Image src="/close.svg" alt="Close" width={30} height={30} />
                    </div>
                )}

                {message && <Alert message={message} onClose={() => setMessage(null)} />}

                <div className={`text-center mb-8 transition-opacity duration-300 ${isTextVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Request a Demo
                    </h2>
                    <p className="text-gray-200 max-w-2xl mx-auto px-4">
                        Tell us a bit about you and we&apos;ll reach out to schedule a personalized walkthrough.
                    </p>
                </div>

                <div
                    className="w-full md:w-2/3 lg:w-1/2 transform origin-top transition-transform duration-500 flex flex-col items-stretch justify-start"
                    style={{
                        transform: isInnerVisible ? "scaleY(1)" : "scaleY(0)",
                    }}
                >
                    {isInnerVisible && (
                        <div className="w-full mx-auto px-4">
                            {/*
                                Previously displayed a YouTube demo video:
                                <div className="relative aspect-video rounded-2xl shadow-xl overflow-hidden">
                                    <iframe
                                       width="100%"
                                       height="100%"
                                       src="https://www.youtube.com/embed/OcjhoReRTYE?si=GTLdXpCdEckgVtBl"
                                       title="YouTube video player"
                                       frameBorder="0"
                                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                       referrerPolicy="strict-origin-when-cross-origin"
                                       allowFullScreen>
                                    </iframe>
                                </div>
                            */}
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-4"
                            >
                                <div>
                                    <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
                                        Full name
                                    </label>
                                    <input
                                        id="fullname"
                                        type="text"
                                        disabled={isLoading}
                                        {...register("fullname", { required: "Full name is required" })}
                                        className={`w-full px-3 py-2.5 bg-white border ${errors.fullname ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'} rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all`}
                                        placeholder="Jane Doe"
                                    />
                                    {errors.fullname && (
                                        <p className="text-red-500 text-xs mt-1">{errors.fullname.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Work email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        disabled={isLoading}
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address",
                                            },
                                        })}
                                        className={`w-full px-3 py-2.5 bg-white border ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'} rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all`}
                                        placeholder="jane@company.com"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject
                                    </label>
                                    <input
                                        id="subject"
                                        type="text"
                                        disabled={isLoading}
                                        {...register("subject", { required: "Subject is required" })}
                                        className={`w-full px-3 py-2.5 bg-white border ${errors.subject ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'} rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all`}
                                        placeholder="Demo request"
                                        defaultValue="Demo request"
                                    />
                                    {errors.subject && (
                                        <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        disabled={isLoading}
                                        {...register("message", { required: "Message is required" })}
                                        className={`w-full px-3 py-2.5 bg-white border ${errors.message ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'} rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none`}
                                        placeholder="Tell us about your team, use-case, or what you'd like to see."
                                    />
                                    {errors.message && (
                                        <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg shadow transition duration-200 flex items-center justify-center ${isLoading ? 'cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? <LoadingSpinner /> : "Send request"}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
