import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CreatePostFormProps {
  communityId: string;
  onPostCreated?: () => void;
}

export function CreatePostForm({ communityId, onPostCreated }: CreatePostFormProps) {
  const { createPost, user } = useApp();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!title.trim()) return alert("Title required");
    if (!user) return alert("User required");

    setLoading(true);
    try {
      await createPost({
        communityId,
        title: title.trim(),
        content: content.trim(),
        authorId: user.id,
      });

      setTitle("");
      setContent("");
      alert("Post created successfully!");
      onPostCreated?.();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Create Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Title
            </label>
            <input
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="What do you want to discuss?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Details
            </label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background resize-none"
              rows={4}
              placeholder="Share details, ask for help, or provide insights..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Posting..." : "Post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
