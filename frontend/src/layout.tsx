import type { ReactNode } from "react";

import { Sidebar } from "@/src/components/layout/Sidebar";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
