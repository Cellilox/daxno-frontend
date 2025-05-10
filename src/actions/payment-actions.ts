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


export async function requestPayment(amount: number, plan_id: number) {
  const payload = {
    // "tx_ref": tx_ref,
    "amount": Number(amount),
    "currency": "RWF",
    "redirect_url": "http://localhost:3000/projects",
    "payment_options": "card",
    "customer": {
      "email": "ntirandth@gmail.com",
      "phonenumber": "0787295921",
      "name": "Thierry Ntirandekura"
    },
    "customization": {
      "title": "Daxno OCR service",
      "description": "This is for Daxno OCR service",
      "logo": "http://logo.png"
    },
    "payment_plan": Number(plan_id),
    "payment_type": "recurrence",
    "recurrence": {
      "interval": "weekly"
    }
  }

  console.log('PAYLOAD', payload)

  try {
    const response = await fetchAuthedJson(`${apiUrl}/payments/charge-card-and-mobilerwanda`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
  // if(!response.ok) {
  //   throw new Error ("Failed to fet url")
  // }
  console.log('RES', response)
  return response.json();
  } catch (error) {
    console.log('Error', error)
  }
}


export async function getSubscriptions (transsaction_id:number | undefined)  {
  const response = await fetchAuthed(`${apiUrl}/payments/subscriptions?transsaction_id=${transsaction_id}`, {
    method: 'GET',
  });

if (!response.ok) {
throw new Error('Failed to fetch subscriptions');
}
return await response.json()
};


export async function getUserPlan (planId:number | undefined)  {
const response = await fetchAuthed(`${apiUrl}/payments/payment-plans/${planId}`, {
  method: 'GET',
});

if (!response.ok) {
throw new Error('Failed user plan');
}
return await response.json()
};