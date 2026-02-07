import DashboardClient from "./DashboardClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Cellilox | Dashboard',
  description: 'Your Daxno dashboard: get an overview of your projects, submissions, and recent activity.'
};

export default function Dashboard() {
  return <DashboardClient />;
}