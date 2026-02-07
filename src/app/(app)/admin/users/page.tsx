import { db } from "@/db";
import { user } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-server";
import { desc } from "drizzle-orm";
import AdminUsersTable from "./AdminUsersTable";
import Link from "next/link";

export default async function AdminUsersPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const users = await db
    .select({
      id: user.id,
      ime: user.ime,
      prezime: user.prezime,
      email: user.email,
      uloga: user.uloga,
    })
    .from(user)
    .orderBy(desc(user.id)); // ako nema createdAt, ovo je sigurno

  return (
    <div className="mx-auto max-w-4xl pb-56">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/settings"
          className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
        >
          ←
        </Link>

        <h1 className="text-2xl font-bold">User management</h1>
      </div>

      <AdminUsersTable users={users} />
      
<div className="h-32" />
    </div>
  );
}

