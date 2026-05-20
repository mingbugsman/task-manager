"use client";

import { useCallback, useState } from "react";
import type { DeleteDetailItem } from "@/src/components/DeleteConfirmDialog";
import { getApiErrorMessage } from "@/src/lib/api-error";

export interface DeleteConfirmRequest {
  title: string;
  description?: string;
  details?: DeleteDetailItem[];
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
}

export function useDeleteConfirm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [request, setRequest] = useState<DeleteConfirmRequest | null>(null);

  const ask = useCallback((options: DeleteConfirmRequest) => {
    setRequest(options);
    setOpen(true);
    setLoading(false);
    setErrorMessage(null);
  }, []);

  const close = useCallback(() => {
    if (loading) return;
    setOpen(false);
    setRequest(null);
    setErrorMessage(null);
  }, [loading]);

  const confirm = useCallback(async () => {
    if (!request) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      await request.onConfirm();
      setOpen(false);
      setRequest(null);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Không thực hiện được thao tác xóa"));
    } finally {
      setLoading(false);
    }
  }, [request]);

  return {
    open,
    loading,
    errorMessage,
    request,
    ask,
    close,
    confirm,
  };
}
