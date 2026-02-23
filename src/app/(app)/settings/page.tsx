"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type MeResponse = {
  user: {
    id: string;
    ime: string;
    prezime: string;
    email: string;
    uloga: string;
  };
};

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [uloga, setUloga] = useState<string>("");


  useEffect(() => {
    async function loadMe() {
      const res = await fetch("/api/auth/me", { credentials: "include" });

      if (!res.ok) {
        router.push("/login");
        return;
      }

      const data: MeResponse = await res.json();
      setName(`${data.user.ime} ${data.user.prezime}`);
      setUloga(data.user.uloga);

    }

    loadMe();
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <main className="mx-auto w-full max-w-[420px] px-5 pb-28 pt-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white"
          aria-label="Back"
        >
          ←
        </button>
        <h1 className="text-lg font-semibold text-slate-900">Settings</h1>
      </div>

      <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
        {name || "Loading..."}
      </h2>

      <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
         <Row label="Account Settings" href="settings/account" />
        <Row label="Profile Settings" href="settings/profile" />
        <Row label="Terms and Conditions" href="#" />

        {uloga === "admin" && (
          <Row label="Admin panel – Users" href="/admin/users" />
        )}
        <Row label="Delete Account" href="#" danger />
      </div>

      <div className="mt-10">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-4 text-base font-semibold text-white shadow-sm"
        >
          ⎋ Log out
        </button>
      </div>
    </main>
  );
}

function Row({
  label,
  href,
  danger,
}: {
  label: string;
  href: string;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center justify-between px-5 py-4 text-base",
        danger ? "text-red-600" : "text-slate-900",
      ].join(" ")}
    >
      <span>{label}</span>
      <span className="text-slate-400">›</span>
    </Link>
  );
}

