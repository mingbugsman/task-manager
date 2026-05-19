"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { AppHeader } from "@/src/components/layout/AppHeader";
import { Badge } from "@/components/ui/badge";
import { userApi } from "@/src/features/users/api/user.api";
import type { UserListItem } from "@/src/types/api.types";

export default function AdminUsersPage() {
  const { isReady } = useAuthReady();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.userName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  useEffect(() => {
    if (!isReady) return;

    setLoading(true);
    userApi
      .getUsers({ page: 1, size: 50 })
      .then((res) => setUsers(res.data.data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isReady]);

  return (
    <section>
      <AppHeader
        title="Quản lý User"
        subtitle={`${filteredUsers.length} / ${users.length} người dùng`}
        showSearch
        searchPlaceholder="Tìm theo tên, email..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase text-slate-400">
              <th className="px-6 py-3">ID</th>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-6 py-3">Kích hoạt</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  Đang tải...
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.userId} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-mono text-slate-500">{u.userId}</td>
                  <td className="px-4 py-4 font-medium text-slate-900">{u.userName}</td>
                  <td className="px-4 py-4 text-slate-600">{u.email}</td>
                  <td className="px-4 py-4">
                    <Badge variant={u.status === "ACTIVE" ? "done" : "high"}>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={u.enabled ? "done" : "outline"}>
                      {u.enabled ? "Có" : "Chưa"}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </article>
    </section>
  );
}
