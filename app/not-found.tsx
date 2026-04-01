import type { Metadata } from "next"
import { DashboardNotFound } from "@/components/dashboard-not-found"

export const metadata: Metadata = {
  title: "Page not found | FABRIVENTORY",
}

export default function NotFound() {
  return <DashboardNotFound />
}
