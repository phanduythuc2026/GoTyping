import React from "react";
import { assertSuperAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce zero-trust boundary: unauthenticated or non-super-admin requests
  // will immediately trigger notFound() (404) with zero HTML leakage.
  await assertSuperAdmin();

  return <>{children}</>;
}
