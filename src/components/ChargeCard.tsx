"use client"

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';

interface AuthorizationData {
  mode: string;
  pin: number | null;
  city: string;
  address: string;
  state: string;
  country: string;
  zipcode: string;
}

interface ChargeCardData {
  amount: number;
  currency: string;
  card_number: string;
  cvv: string;
  expiry_month: string;
  expiry_year: string;
  email: string;
  tx_ref: string;
  authorization: AuthorizationData;
  preauthorize: boolean;
  fullname: string;
  phone_number: string;
  payment_plan: string;
  redirect_url: string;
}

type StepType = "initial" | "pin" | "avs_noauth" | "otp" | "3ds";

export default function ChargeCard(): JSX.Element {
  const url = 'http://localhost:8000/payments/charge-card'
  const [formData, setFormData] = useState<ChargeCardData>({
    amount: 29.0,
    currency: "USD",
    card_number: "",
    cvv: "",
    expiry_month: "",
    expiry_year: "",
    email: "",
    tx_ref: uuidv4(),
    authorization: {
      mode: "", 
      pin: 0,
      city: "",
      address: "",
      state: "",
      country: "",
      zipcode: "",
    },
    preauthorize: false,
    fullname: "",
    phone_number: "",
    payment_plan: "72375",
    redirect_url: "http://localhost:3000",
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [step, setStep] = useState<StepType>("initial");
  const router = useRouter()


  const handleChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleAuthChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      authorization: { ...formData.authorization, [name]: value },
    });
  };


  const validateInitialForm = (): any => {
    let errs: any = {};
    if (!formData.card_number) errs.card_number = "Card number is required";
    if (!formData.cvv) errs.cvv = "CVV is required";
    if (!formData.expiry_month) errs.expiry_month = "Expiry month is required";
    if (!formData.expiry_year) errs.expiry_year = "Expiry year is required";
    if (!formData.email) errs.email = "Email is required";
    if (!formData.fullname) errs.fullname = "Full name is required";
    if (!formData.phone_number) errs.phone_number = "Phone number is required";
    return errs;
  };

  const validatePinForm = (): any => {
    let errs: any = {};
    if (!formData.authorization.pin) errs.pin = "PIN is required";
    return errs;
  };

  const validateAvsForm = (): any => {
    let errs: any = {};
    if (!formData.authorization.city) errs.city = "City is required";
    if (!formData.authorization.address) errs.address = "Address is required";
    if (!formData.authorization.state) errs.state = "State is required";
    if (!formData.authorization.country) errs.country = "Country is required";
    if (!formData.authorization.zipcode) errs.zipcode = "Zipcode is required";
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
      const payload = {...formData, authorization: {
        "mode": "NOAUTH"
      }}
      console.log('Without Auth', payload)
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the basic form data without extra authorization info.
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setLoading(false);
      console.log('DATA_INITIAL', data)

      if (data.status === "success" && data.message === "Successful") {
        alert("Payment Successful!");
        window.location.href = formData.redirect_url;
      } else if (data.status === "success" && data.message === "Charge authorization data required" && data.meta.authorization.mode === "pin") {
        setStep(data.meta.authorization.mode);
      } else if (data.status === "success" && data.message === "Charge authorization data required" && data.meta.authorization.mode === "avs_noauth") {
        setStep(data.meta.authorization.mode)
      } else if (data.status === "success" && data.message === "Charge initiated" && data.meta.authorization.mode === "redirect") {
        router.push(`/payments/${data.data.flw_ref}`)
      } else {
        alert("Payment failed: " + data.detail.message);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };


  const handlePinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validatePinForm();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const payload = {
      ...formData,
      authorization: {
         mode: "pin",
         pin: Number(formData.authorization.pin)
      },
    };

    setLoading(true);
    try {
      console.log('FormData With PIN', payload)
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setLoading(false);
      console.log('DATA_SUBMITTED_WITHPIN', data)
      if (data.status === "success" && data.message === "Successful") {
        alert("Payment Successful!");
        window.location.href = formData.redirect_url;
      } else if (data.status === "success" && data.meta.authorization.mode === 'otp') {
        router.push(`/payments/${data.data.flw_ref}`)
      } else {
        alert("Payment failed: " + data.detail.message);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };


  const handleAvsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validateAvsForm();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const payload = {
      ...formData,
      authorization: { 
       mode: "avs_noauth",
       pin: Number(formData.authorization.pin),
       city: formData.authorization.city,
       address: formData.authorization.address,
       state: formData.authorization.state,
       country: formData.authorization.country,
       zipcode: formData.authorization.zipcode
      },
    };
    console.log('Payload with AVS', payload)
    setLoading(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setLoading(false);
      console.log('DATA_AVS', data)
      if (data.status === "success" && data.message === "Successful") {
        alert("Payment Successful!");
        window.location.href = formData.redirect_url;
      } else if (data.status === "success" && data.message === 'Charge initiated') {
        router.push(`/payments/${data.data.flw_ref}`)
      } else {
        alert("Payment failed: " + data.detail.message);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Charge Your Card</h1>

      {step === "initial" && (
        <form onSubmit={handleInitialSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Card Number
            </label>
            <input
              type="text"
              name="card_number"
              value={formData.card_number}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
            {errors.card_number && (
              <p className="text-red-500 text-sm mt-1">{errors.card_number}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              CVV
            </label>
            <input
              type="text"
              name="cvv"
              value={formData.cvv}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
            {errors.cvv && (
              <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expiry Month
              </label>
              <input
                type="text"
                name="expiry_month"
                value={formData.expiry_month}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              />
              {errors.expiry_month && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.expiry_month}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expiry Year
              </label>
              <input
                type="text"
                name="expiry_year"
                value={formData.expiry_year}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              />
              {errors.expiry_year && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.expiry_year}
                </p>
              )}
            </div>
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
              Phone Number
            </label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
            {errors.phone_number && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone_number}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
          >
            {loading ? "Processing..." : "Charge Card"}
          </button>
        </form>
      )}

      {step === "pin" && (
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <p className="text-gray-700 mb-2">
            Additional verification is required. Please enter your card PIN.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              PIN
            </label>
            <input
              type="password"
              name="pin"
              value={Number(formData.authorization.pin)}
              onChange={handleAuthChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
            {errors.pin && (
              <p className="text-red-500 text-sm mt-1">{errors.pin}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md"
          >
            {loading ? "Processing..." : "Submit PIN"}
          </button>
        </form>
      )}

      {step === "avs_noauth" && (
        <form onSubmit={handleAvsSubmit} className="space-y-4">
          <p className="text-gray-700 mb-2">
            Additional verification is required. Please provide your card PIN and your billing address.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              PIN
            </label>
            <input
              type="password"
              name="pin"
              value={Number(formData.authorization.pin)}
              onChange={handleAuthChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
            {errors.pin && (
              <p className="text-red-500 text-sm mt-1">{errors.pin}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.authorization.city}
              onChange={handleAuthChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.authorization.address}
              onChange={handleAuthChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              type="text"
              name="state"
              value={formData.authorization.state}
              onChange={handleAuthChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">{errors.state}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.authorization.country}
              onChange={handleAuthChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
            {errors.country && (
              <p className="text-red-500 text-sm mt-1">{errors.country}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Zipcode
            </label>
            <input
              type="text"
              name="zipcode"
              value={formData.authorization.zipcode}
              onChange={handleAuthChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
            {errors.zipcode && (
              <p className="text-red-500 text-sm mt-1">{errors.zipcode}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md"
          >
            {loading ? "Processing..." : "Submit Address"}
          </button>
        </form>
      )}

    </div>
  );
}
