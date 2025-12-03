"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function useGuestOnly(redirectTo = "/") {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (user) {
        router.replace(redirectTo);
        setCanRender(false);
    } else {
        //guest -> allow page to render
        setCanRender(true);
    }
  }, [loading, user, router, redirectTo]);

  return canRender;
}