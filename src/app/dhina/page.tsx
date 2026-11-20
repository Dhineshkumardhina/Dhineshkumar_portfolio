import type { Metadata } from "next";
import { readPortfolioData } from "@/lib/portfolio-server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getMailConfigStatus, readInquiries } from "@/lib/mail-server";
import AdminDashboard from "@/components/AdminDashboard";
import AdminLoginGate from "@/components/AdminLoginGate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dhinesh. — Admin CMS",
  robots: { index: false, follow: false },
};

export default async function DhinaAdminPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return <AdminLoginGate />;
  }

  const [initialData, initialMailConfig, initialInquiries] = await Promise.all([
    readPortfolioData(),
    getMailConfigStatus(),
    readInquiries(),
  ]);

  return (
    <AdminDashboard
      initialData={initialData}
      initialMailConfig={initialMailConfig}
      initialInquiries={initialInquiries}
    />
  );
}
