'use server';

import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

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


export async function chargeCardWithNoAuth(payload: any) {
    const response = await fetchAuthedJson(`${apiUrl}/payments/charge-card`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) {
      throw new Error('Failed initial card charge');
    }
    return await response.json();
  }

export async function chargeCardWithPin(payload: any) {
const response = await fetchAuthedJson(`${apiUrl}/payments/charge-card`, {
    method: 'POST',
    body: JSON.stringify(payload),
});

if (!response.ok) {
    throw new Error('Failed charge this pin');
}
return await response.json();
}

export async function chargeCardWithAVS(payload: any) {
    const response = await fetchAuthedJson(`${apiUrl}/payments/charge-card`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
        throw new Error('Failed charge this AVS details');
    }
    return await response.json();
    }

export async function OtpVerify(payload: any) {
    const response = await fetchAuthedJson(`${apiUrl}/payments/validate-charge`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
        throw new Error('Failed the otp');
    }
    return await response.json();
    }