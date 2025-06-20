'use server';

import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export async function getAvailablePlans() {
  try {
    const response = await fetchAuthed(`${apiUrl}/payments/payment-plans?status=active`)
  if(!response.ok) {
     throw new Error ("Failed to fetch payment plans")
    }
  return response.json();
  } catch (error) {
    console.log('error')
  }
}


export async function requestPayment(pathname: string, amount: number, plan_id: number) {
  const payload = {
    "amount": Number(amount),
    "currency": "RWF",
    "redirect_url": `${process.env.NEXT_PUBLIC_ClIENT_URL}/${pathname}`,
    "payment_options": "card",
    "customer": {},
    "customization": {
      "title": "Daxno OCR service",
      "description": "This is for Daxno OCR service",
      "logo": "http://logo.png"
    },
    "payment_plan": Number(plan_id),
  }

  console.log('PAYLOAD', payload)

  try {
    const response = await fetchAuthedJson(`${apiUrl}/payments/charge-card-and-mobilerwanda`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
  if(!response.ok) {
    throw new Error ("Failed to fet url")
  }
  console.log('RES', response)
  return response.json();
  } catch (error) {
    console.log('Error', error)
  }
}


export async function getUserPlan (planId:number | undefined)  {
try {
  const response = await fetchAuthed(`${apiUrl}/payments/payment-plans/${planId}`, {
    method: 'GET',
  });
  
  if (!response.ok) {
  throw new Error('Failed user plan');
  }
  return await response.json()
} catch (error) {
  console.log(error)
}
};

export async function getUserSubscription (transaction_id: string)  {
try {
  const response = await fetchAuthed(`${apiUrl}/payments/subscription?transsaction_id=${transaction_id}`, {
    method: 'GET',
  });
  
  // if (!response.ok) {
  // throw new Error('Failed user plan');
  // }
  return await response.json()
} catch (error) {
  console.log(error)
}
};