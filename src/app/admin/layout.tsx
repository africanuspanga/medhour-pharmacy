import type { Metadata } from "next";
import Link from "next/link";
import { getAdminProfile } from "@/lib/supabase/admin-auth";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await getAdminProfile();

  if (!admin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-surface px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-ink">Access denied</h1>
          <p className="mt-2 text-sm text-ink/60">
            An administrator account is required to view this area.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Back to store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface">
      <header className="flex h-14 items-center justify-between border-b border-ink/10 bg-white px-4 print:hidden md:px-6">
        <span className="text-sm font-bold text-ink">
          Medhour <span className="text-brand">Admin</span>
        </span>
        <span className="text-sm text-ink/60">{admin.full_name ?? admin.email}</span>
      </header>
      <div className="flex flex-col md:flex-row">
        <AdminNav />
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
