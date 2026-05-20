"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { projectInviteApi, type InvitePreview } from "@/src/features/projects/api/project-invite.api";
import { PROJECT_ROLE_LABELS, normalizeProjectRole } from "@/src/features/projects/lib/project-permissions";
import { getApiErrorMessage } from "@/src/lib/api-error";

interface InviteAcceptViewProps {
  token: string;
}

export function InviteAcceptView({ token }: InviteAcceptViewProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteReturnUrl = `/invite/${encodeURIComponent(token)}`;

  const loadPreview = useCallback(async () => {
    setLoadingPreview(true);
    try {
      const data = await projectInviteApi.getPreview(token);
      setPreview(data);
    } catch {
      setPreview({ valid: false, message: "Không thể tải thông tin lời mời." });
    } finally {
      setLoadingPreview(false);
    }
  }, [token]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  const handleAccept = async () => {
    setAccepting(true);
    setError(null);
    try {
      await projectInviteApi.accept(token);
      const projectId = preview?.projectId;
      if (projectId) {
        router.push(`/projects/${projectId}`);
      } else {
        router.push("/projects");
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể tham gia dự án."));
    } finally {
      setAccepting(false);
    }
  };

  const roleKey = preview?.role ? normalizeProjectRole(preview.role) : null;
  const roleLabel =
    roleKey && roleKey in PROJECT_ROLE_LABELS
      ? PROJECT_ROLE_LABELS[roleKey]
      : preview?.role ?? "Thành viên";

  const registerHref = `/register?returnUrl=${encodeURIComponent(inviteReturnUrl)}`;
  const loginHref = `/login?returnUrl=${encodeURIComponent(inviteReturnUrl)}`;

  if (loadingPreview || status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Đang tải lời mời…
      </div>
    );
  }

  if (!preview?.valid) {
    return (
      <Card className="mx-auto w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-center text-xl">Lời mời không khả dụng</CardTitle>
          <CardDescription className="text-center">
            {preview?.message ?? "Liên kết đã hết hạn hoặc không tồn tại."}
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/login">Về trang đăng nhập</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md shadow-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Users className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">Tham gia dự án</CardTitle>
        <CardDescription>
          {preview.inviterName ? (
            <>
              <strong>{preview.inviterName}</strong> mời bạn vào dự án
            </>
          ) : (
            "Bạn được mời vào dự án"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
          <p className="text-lg font-bold text-slate-900">{preview.projectName}</p>
          <p className="mt-1 text-sm text-slate-500">
            Vai trò: <span className="font-medium text-slate-700">{roleLabel}</span>
          </p>
        </div>
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {status === "authenticated" && session?.accessToken ? (
          <Button
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
            disabled={accepting}
            onClick={handleAccept}
          >
            {accepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tham gia…
              </>
            ) : (
              "Tham gia dự án"
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-center text-sm text-slate-600">
              Bạn cần đăng nhập để tham gia dự án. Chưa có tài khoản? Hãy đăng ký trước.
            </p>
            <Button asChild className="w-full rounded-xl bg-blue-600 hover:bg-blue-700">
              <Link href={registerHref}>Đăng ký tài khoản</Link>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-xl">
              <Link href={loginHref}>Đã có tài khoản — Đăng nhập</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
