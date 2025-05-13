export interface Transaction {
    payment_type: 'mobilemoneyrw' | 'card';
    end_date?: string;
    amount?: number;
    t_id?: number;
    payment_plan: number,
    end_data: string
  }