'use server';

import { fetchAuthed, fetchAuthedJson, buildApiUrl } from "@/lib/api-client";
export async function getAvailablePlans() {
  try {
    const url = buildApiUrl('/payments/payment-plans?status=active');
    const response = await fetchAuthed(url)
    if (!response.ok) {
      throw new Error("Failed to fetch payment plans")
    }
    return response.json();
  } catch (error) {
    console.log('error')
  }
}


const sanitizePath = (path: string) => {
  // Remove leading slashes and any scheme/host attempts
  return path.replace(/^\/+/, '').replace(/[^\w\-\/\?\=\&]/g, '');
};

export async function requestPayment(pathname: string, amount: number, plan_id: number) {
  const safePath = sanitizePath(pathname);
  const payload = {
    "amount": Number(amount),
    "currency": "RWF",
    "redirect_url": `${process.env.NEXT_PUBLIC_CLIENT_URL}/${safePath}`,
    "payment_options": "card",
    "customer": {},
    "customization": {
      "title": "Cellilox AI Doc Assistant Service",
      "description": "This AI Doc Assistant Service",
      "logo": "http://logo.png"
    },
    "payment_plan": Number(plan_id),
  }

  try {
    const url = buildApiUrl('/payments/charge-card-and-mobilerwanda');
    const response = await fetchAuthedJson(url, {
      method: "POST",
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      throw new Error("Failed to fet url")
    }
    return response.json();
  } catch (error) {
    console.log('Error', error)
  }
}


export async function buyCredits(pathname: string, amount: number) {
  const safePath = sanitizePath(pathname);
  const payload = {
    "amount": Number(amount),
    "currency": "RWF",
    "redirect_url": `${process.env.NEXT_PUBLIC_CLIENT_URL}/${safePath}`,
    "payment_options": "card",
    "customer": {},
    "customization": {
      "title": "Cellilox AI Doc Assistant Service",
      "description": "This AI Doc Assistant Service",
      "logo": "http://logo.png"
    }
  }

  try {
    const url = buildApiUrl('/payments/pay-for-credits');
    const response = await fetchAuthedJson(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      throw new Error("Failed to fet url")
    }
    return response.json();
  } catch (error) {
    console.log('Error', error)
  }
}


export async function getUserPlan(planId: number | undefined) {
  try {
    const url = buildApiUrl(`/payments/payment-plans/${planId}`);
    const response = await fetchAuthed(url, {
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
    const url = buildApiUrl(`/payments/subscription?transsaction_id=${transaction_id}`);
    const response = await fetchAuthed(url, {
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
    const url = buildApiUrl(`/payments/cancel-subscription?sub_id=${sub_id}`);
    const response = await fetchAuthedJson(url, {
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
    const url = buildApiUrl(`/payments/activate-subscription?sub_id=${sub_id}`);
    const response = await fetchAuthedJson(url, {
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
    const url = buildApiUrl(`/payments/history?page=${page}&per_page=${per_page}`);
    const response = await fetchAuthed(url);
    if (!response.ok) throw new Error("Failed to fetch payment history");
    return response.json();
  } catch (error) {
    console.error('Error fetching payment history', error);
    return null;
  }
}

export async function downloadInvoice(t_id: number) {
  try {
    const url = buildApiUrl(`/payments/invoices/${t_id}`);
    const response = await fetchAuthed(url);
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
    const url = buildApiUrl(`/payments/proration-details?new_plan_id=${new_plan_id}`);
    const response = await fetchAuthed(url);
    if (!response.ok) throw new Error("Failed to fetch proration details");
    return response.json();
  } catch (error) {
    console.error('Error fetching proration details', error);
    return null;
  }
}
