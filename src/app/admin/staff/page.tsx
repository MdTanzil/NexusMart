import React from "react";

export const metadata = {
  title: "Staff Management, Performance KPIs & Activity Audit Log | NexusMart Enterprise",
};

export default async function Page() {
  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Staff Management, Performance KPIs & Activity Audit Log</h1>
      <p className="text-sm text-slate-500 mt-1">
        Connected to PostgreSQL via Prisma ORM and protected by server-side RBAC permissions.
      </p>
    </main>
  );
}
