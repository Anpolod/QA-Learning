"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Shows the Admin nav link only to signed-in admins. Reads the cached user from
// localStorage; the /admin page itself still verifies the role with the backend.
export function AdminNavLink() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    function sync() {
      try {
        const user = JSON.parse(localStorage.getItem("qa_learning_user") || "null");
        setIsAdmin(user?.role === "admin");
      } catch {
        setIsAdmin(false);
      }
    }
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("auth-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-change", sync);
    };
  }, [pathname]);

  if (!isAdmin) return null;
  return <Link href="/admin">Admin</Link>;
}
