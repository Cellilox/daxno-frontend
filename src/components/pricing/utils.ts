"use server"
import { getUserPlan } from "@/actions/payment-actions";
// import { useSubscription } from "../hooks/useSubscription";
import { Transaction } from "./types";
type PlanType = "Free" | "Basic" | "Pro" | "Team";

const PLAN_PAGE_LIMITS: Record<PlanType, number> = {
    Free: 5,
    Basic: 1000,
    Pro:    3000,
    Team: 10000, 
  };


export const checkPlan = async (currentTransaction: Transaction) => {
      const plan = await getUserPlan(currentTransaction?.payment_plan)
      return plan?.data?.name;
}


export const isActivePlan = async (currentTransaction: Transaction): Promise<boolean> => {
    if (!currentTransaction.end_date) {
      return false;
    }
  
    const endDate = new Date(currentTransaction.end_date);
    return endDate.getTime() > Date.now();
  };


export const checkHasPages = async(
  plan: PlanType,
  processedPages: number
): Promise<boolean> => {
  const allowedPages = PLAN_PAGE_LIMITS[plan];
  return processedPages < allowedPages;
};


export const pagesRemaining = async(
  plan: PlanType,
  processedPages: number
): Promise<number> => {
  const allowed = PLAN_PAGE_LIMITS[plan];
  return Math.max(allowed - processedPages, 0);
};
