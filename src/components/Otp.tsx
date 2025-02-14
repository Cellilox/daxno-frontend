"use client"

import React, { FormEvent, useState } from 'react'

type OtpProps = {
    flw_ref: string
}

export default function Otp({flw_ref}: OtpProps) {
    console.log('FLW_RF', flw_ref)
    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [otp, setOtp] = useState<string>("");

    const validateOtpForm = (): any => {
        let errs: any = {};
        if (!otp) errs.otp = "OTP is required";
        return errs;
      };

    const handleOtpSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const errs = validateOtpForm();
        if (Object.keys(errs).length > 0) {
          setErrors(errs);
          return;
        }
        setErrors({});
        setLoading(true);
        try {
          const payload = {
            otp: Number(otp),
            flw_rf: flw_ref
          }
          const verifyUrl = 'http://localhost:8000/payments/validate-charge'
          console.log('OTP_payload', payload)
          const res = await fetch(verifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          setLoading(false);
          console.log('DATA_OTP', data)
          if (data.status === "success" && data.message === "Charge validated") {
            alert("Payment Successful!");
            window.location.href = 'http://localhost:3000/projects';
          } else {
            alert("OTP Verification failed: " + data.details.message);
          }
        } catch (error) {
          setLoading(false);
          console.error("Error:", error);
          alert("An error occurred during OTP verification. Please try again.");
        }
      };


  return (
    <>
      <form onSubmit={handleOtpSubmit} className="space-y-4">
          <p className="text-gray-700 mb-2">
            Please enter the OTP sent to your device.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
            {errors.otp && (
              <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md"
          >
            {loading ? "Verifying..." : "Submit OTP"}
          </button>
        </form>
    </>
  )
}
