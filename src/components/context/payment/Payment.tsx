import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface PaymentContextProps {
  amount: number | undefined;
  paymentPlan: number | undefined;
  transactionReference: string | undefined;
  setAmount: React.Dispatch<React.SetStateAction<number | undefined>>;
  setPaymentPlan: React.Dispatch<React.SetStateAction<number | undefined>>;
  setTransactionReference: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const PaymentContext = createContext<PaymentContextProps | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from localStorage if available
  const [amount, setAmount] = useState<number | undefined>(() => {
    if (typeof window !== 'undefined') {
      const storedAmount = localStorage.getItem('amount');
      return storedAmount ? parseFloat(storedAmount) : undefined;
    }
    return undefined;
  });

  const [paymentPlan, setPaymentPlan] = useState<number | undefined>(() => {
    if (typeof window !== 'undefined') {
      const storedPlan = localStorage.getItem('paymentPlan');
      return storedPlan ? parseInt(storedPlan, 10) : undefined;
    }
    return undefined;
  });

  const [transactionReference, setTransactionReference] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('transactionReference') || '';
    }
    return '';
  });


  // Persist state changes to localStorage
  useEffect(() => {
    if (amount !== undefined) {
      localStorage.setItem('amount', amount.toString());
    }
  }, [amount]);

  useEffect(() => {
    if (paymentPlan !== undefined) {
      localStorage.setItem('paymentPlan', paymentPlan.toString());
    }
  }, [paymentPlan]);

  useEffect(() => {
    if (transactionReference !== undefined) {
      localStorage.setItem('transactionReference', transactionReference || '');
    }
  }, [transactionReference]);



  return (
    <PaymentContext.Provider
      value={{
        amount,
        paymentPlan,
        transactionReference,
        setAmount,
        setPaymentPlan,
        setTransactionReference,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentContext = (): PaymentContextProps => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePaymentContext must be used within a PaymentProvider');
  }
  return context;
};
