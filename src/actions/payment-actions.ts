'use server';

import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export async function getAvailablePlans() {
  try {
    const response = await fetchAuthed(`${apiUrl}/payments/payment-plans?status=active`)
    if (!response.ok) {
      throw new Error("Failed to fetch payment plans")
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
    "redirect_url": `${process.env.NEXT_PUBLIC_CLIENT_URL}/${pathname}`,
    "payment_options": "card",
    "customer": {},
    "customization": {
      "title": "Cellilox AI Doc Assistant Service",
      "description": "This AI Doc Assistant Service",
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
    if (!response.ok) {
      throw new Error("Failed to fet url")
    }
    console.log('RES', response)
    return response.json();
  } catch (error) {
    console.log('Error', error)
  }
}


export async function buyCredits(pathname: string, amount: number) {
  const payload = {
    "amount": Number(amount),
    "currency": "RWF",
    "redirect_url": `${process.env.NEXT_PUBLIC_CLIENT_URL}/${pathname}`,
    "payment_options": "card",
    "customer": {},
    "customization": {
      "title": "Cellilox AI Doc Assistant Service",
      "description": "This AI Doc Assistant Service",
      "logo": "http://logo.png"
    }
  }

  console.log('PAYLOAD', payload)

  try {
    const response = await fetchAuthedJson(`${apiUrl}/payments/pay-for-credits`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      throw new Error("Failed to fet url")
    }
    console.log('RES', response)
    return response.json();
  } catch (error) {
    console.log('Error', error)
  }
}


export async function getUserPlan(planId: number | undefined) {
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

export async function getUserSubscription(transaction_id: string) {
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

export async function cancelSubscription(sub_id: number) {
  try {
    const response = await fetchAuthedJson(`${apiUrl}/payments/cancel-subscription?sub_id=${sub_id}`, {
      method: 'POST',
    });

    // if (!response.ok) {
    //   throw new Error('Failed to cancel subscription');
    // }

    return await response.json();
  } catch (error) {
    console.log('Error', error)
  }
}


export async function activateSubscription(sub_id: number) {
  try {
    const response = await fetchAuthedJson(`${apiUrl}/payments/activate-subscription?sub_id=${sub_id}`, {
      method: 'POST',
    });

    // if (!response.ok) {
    //   throw new Error('Failed to cancel subscription');
    // }

    return await response.json();
  } catch (error) {
    console.log('Error', error)
  }
}
export async function getPaymentHistory(page: number = 1, per_page: number = 10) {
  try {
    const response = await fetchAuthed(`${apiUrl}/payments/history?page=${page}&per_page=${per_page}`);
    if (!response.ok) throw new Error("Failed to fetch payment history");
    return response.json();
  } catch (error) {
    console.error('Error fetching payment history', error);
    return null;
  }
}

export async function downloadInvoice(t_id: number) {
  try {
    const response = await fetchAuthed(`${apiUrl}/payments/invoices/${t_id}`);
    if (!response.ok) throw new Error("Failed to download invoice");
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error downloading invoice', error);
    return null;
  }
}

export async function getProrationDetails(new_plan_id: string) {
  try {
    const response = await fetchAuthed(`${apiUrl}/payments/proration-details?new_plan_id=${new_plan_id}`);
    if (!response.ok) throw new Error("Failed to fetch proration details");
    return response.json();
  } catch (error) {
    console.error('Error fetching proration details', error);
    return null;
  }
}
