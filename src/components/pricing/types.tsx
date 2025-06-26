export interface Transaction {
    plan_name: string;
    amount: number;
    end_date: string;
  }

export type Plan = {
id: number;
amount: number;
currency: string;
interval: string;
name: string;
status: boolean;
plan_token: string
}