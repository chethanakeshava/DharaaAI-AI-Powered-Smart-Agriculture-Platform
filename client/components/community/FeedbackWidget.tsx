import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FeedbackWidget() {
  const { submitFeedback, user } = useApp();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report a Local Challenge</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Share issues or ask for localized help
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You must be logged in to report challenges.
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

    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    setLoading(true);
    try {
      const result = await submitFeedback({
        userId: user?.id,
        title: title.trim(),
        description: desc.trim(),
        tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
        location: user?.location,
      });

      if (result) {
        setTitle("");
        setDesc("");
        setTags("");
        alert("Thank you! Your feedback has been submitted.");
      } else {
        alert("Error submitting feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Error submitting feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Report a Local Challenge</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Share issues or ask for localized help
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Title
            </label>
            <input
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="Brief description of the challenge"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background resize-none"
              rows={3}
              placeholder="Describe the challenge in detail"
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
              placeholder="e.g., pest, drought, soil"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
