"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/map", label: "discover", icon: "🧭" },
  { href: "/matches", label: "friends", icon: "👥" },
  { href: "/home", label: "home", icon: "🏠" },
  { href: "/chat", label: "chat", icon: "💬" },
  { href: "/settings", label: "profile", icon: "👤" },
];


function isActive(pathname: string, href: string) {
  if (href === "#") return false;
  if (href === "/") return pathname === "/";
  if (href === "/home") return pathname === "/home";

  return pathname === href || pathname.startsWith(href + "/");
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[min(420px,calc(100vw-32px))]">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 px-5 py-2 flex items-center justify-between">
        {links.map((link) => {
          const active = isActive(pathname, link.href);

          return (
            <Link
              key={link.label}
              href={link.href}
              aria-label={link.label}
              className={[
                "h-10 w-10 flex items-center justify-center rounded-full transition",
                "active:scale-95",
                active
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-blue-400 hover:bg-slate-100/70",
                link.href === "#" ? "pointer-events-none opacity-60" : "",
              ].join(" ")}
            >
              <span className="text-xl leading-none">{link.icon}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
