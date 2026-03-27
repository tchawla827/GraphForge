"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export function CreateProjectButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Graph" }),
      });
      if (!res.ok) return;
      const json = await res.json() as { data: { id: string } };
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.push(`/editor/${json.data.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleCreate}
      disabled={loading}
      className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
    >
      <Plus size={16} />
      {loading ? "Creating..." : "New project"}
    </Button>
  );
}
