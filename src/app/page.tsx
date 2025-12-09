"use client";

import { error } from "console";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  const [crash, setCrash] = useState(false);

  if (crash) {
    // This will be caught by GlobalError boundary
    throw new Error("Test global error");
  }

  return (
    <main className="flex flex-1 flex-col p-4">
      <div className="p-6 text-3xl font-semibold">Boilerplate Ready</div>
    </main>
  );
}
