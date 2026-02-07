"use client";

import { useState } from "react";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

type UserRow = {
  id: string;
  ime: string | null;
  prezime: string | null;
  email: string;
  uloga: string;
};

export default function AdminUsersTable({ users }: { users: UserRow[] }) {
  const [items, setItems] = useState<UserRow[]>(users);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ====== DELETE USER ======
  async function deleteUser(userId: string) {
    setLoadingId(userId);

    const res = await fetch(`/api/admin/user/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });

    setLoadingId(null);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.error ?? "Greška pri brisanju korisnika.");
      return;
    }

    setItems((prev) => prev.filter((u) => u.id !== userId));
    setSuccessMsg("Korisnik je uspešno obrisan.");

    setTimeout(() => {
      setSuccessMsg(null);
    }, 3000);

  }

  return (
    <>
      {successMsg && (
        <div className="fixed right-5 top-5 z-[9999] rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 shadow-lg">
          {successMsg}
        </div>
      )}


      {/* ===== TABLE ===== */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-left">Ime</th>
              <th className="p-3 text-left">Prezime</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Uloga</th>
              <th className="p-3 text-right">Akcije</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {items.map((u) => (
              <tr key={u.id}>
                <td className="p-3">{u.ime ?? "—"}</td>
                <td className="p-3">{u.prezime ?? "—"}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.uloga}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setConfirmId(u.id)}
                    disabled={loadingId === u.id}
                    className="rounded-xl border px-3 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    {loadingId === u.id ? "Brišem..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  Nema korisnika.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== CONFIRM MODAL ===== */}
      <ConfirmDeleteModal
        open={!!confirmId}
        onCancel={() => setConfirmId(null)}
        onConfirm={async () => {
          if (!confirmId) return;
          await deleteUser(confirmId);
          setConfirmId(null);
        }}

        loading={loadingId !== null}
      />
    </>
  );
}
