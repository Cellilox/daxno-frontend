"use client"

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { usePaymentContext } from "./context/payment/Payment";
import { v4 as uuidv4 } from 'uuid';

interface ChargeMoMo {
    amount: number | undefined,
    currency: string,
    email: string
    tx_ref: string | undefined,
    order_id: string,
    fullname: string,
    phone_number: string
}


export default function ChargeCard(): JSX.Element {
  const { amount, transactionReference } = usePaymentContext()
  console.log('MMM', amount, transactionReference)
  const amountInRwf = amount? amount * 1000: 0;
  console.log('RRRWF', amountInRwf)
  const url = `${process.env.NEXT_PUBLIC_API_URL}/payments/charge-mobile-money-rwanda`
  const [formData, setFormData] = useState<ChargeMoMo>({
        "amount": amountInRwf,
        "currency": "RWF",
        "email": "",
        "tx_ref": transactionReference,
        "order_id": uuidv4(),
        "fullname": "",
        "phone_number": ""
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter()


  const handleChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const validateInitialForm = (): any => {
    let errs: any = {};
    if (!formData.amount) errs.amount = "Amount is required";
    if (!formData.phone_number) errs.phone_number = "Phone number is required";
    if (!formData.fullname) errs.fullname = "Full name is required";
    if (!formData.email) errs.email = "Email is required";
    return errs;
  };



  const handleInitialSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validateInitialForm();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    
    setErrors({});
    setLoading(true);
  
    try {
      console.log("Sent_data", formData);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }
  
      const data = await res.json();
      console.log("RESP", data);
  
      if (data.status === "success" && data.message === "Charge initiated") {
        const redirectUrl = data.meta?.authorization?.redirect;
        if (redirectUrl) {
          alert("Payment Successful!");
          window.location.href = redirectUrl;
        } else {
          alert("Payment was successful, but no redirect URL was provided.");
        }
      } else {
        alert("Payment failed: " + (data.detail?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error);
      //@ts-ignore
      alert(`An error occurred: ${error.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Charge Your Mobile Money</h1>
        <form onSubmit={handleInitialSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount (RWF)
            </label>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone  Number (078... or 079...) (must be linked with you MoMo Rwanda)
            </label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
            {errors.phone_number && (
              <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
            {errors.fullname && (
              <p className="text-red-500 text-sm mt-1">{errors.fullname}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-yellow-600 bg-yellow-500 text-black font-semibold rounded-md"
          >
            {loading ? "Processing..." : "Charge MoMo"}
          </button>
        </form>
    </div>
  );
}
