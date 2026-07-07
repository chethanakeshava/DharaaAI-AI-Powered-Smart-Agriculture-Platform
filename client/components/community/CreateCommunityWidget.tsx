import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Community } from "@/lib/supabase";

interface CreateCommunityWidgetProps {
  onCreated?: (c: Community) => void;
}

export function CreateCommunityWidget({ onCreated }: CreateCommunityWidgetProps) {
  const { createCommunity, joinCommunity, user } = useApp();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [loc, setLoc] = useState<string>("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <Card className="opacity-75">
        <CardHeader>
          <CardTitle className="text-lg">Create Community</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You must be logged in to create a community.
          </p>
          <Button asChild className="w-full">
            <a href="/login">Log In</a>
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Don't have an account? <a href="/register" className="text-primary hover:underline">Register here</a>
          </p>
        </CardContent>
      </Card>
    );
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();

    if (!name.trim()) {
      alert("Community name is required");
      return;
    }

    setLoading(true);
    try {
      const c = await createCommunity({
        name: name.trim(),
        description: desc.trim(),
        tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
        location: loc || undefined,
      });

      if (!c) {
        throw new Error("Failed to create community: No response from server");
      }

      await joinCommunity(c.id, user.id);

      setName("");
      setDesc("");
      setTags("");
      setLoc("");

      alert("Community created successfully!");
      onCreated?.(c);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      console.error("Error creating community:", error);
      alert(`Error creating community: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Create Community</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Community Name
            </label>
            <input
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="e.g., Wheat Farmers Network"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background resize-none"
              rows={3}
              placeholder="Describe your community..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Tags (comma separated)
            </label>
            <input
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="e.g., wheat, farming, north-india"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Location (optional)
            </label>
            <input
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="e.g., Punjab, India"
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create & Join"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
