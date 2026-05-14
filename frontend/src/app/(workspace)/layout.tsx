import type { ReactNode } from "react";

import { Layout } from "@/src/layout";
import { AuthSessionProvider } from "@/src/components/providers/AuthSessionProvider";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <AuthSessionProvider>
      <Layout>{children}</Layout>
    </AuthSessionProvider>
  );
}
