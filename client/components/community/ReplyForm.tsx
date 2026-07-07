import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReplyFormProps {
  discussionId: number;
  discussionTitle: string;
  onReplyAdded?: () => void;
  onCancel?: () => void;
}

export function ReplyForm({
  discussionId,
  discussionTitle,
  onReplyAdded,
  onCancel,
}: ReplyFormProps) {
  const { user } = useApp();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Please enter your reply");
      return;
    }

    if (!user) {
      toast.error("Please log in to reply");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to save reply
      // In a real app, this would call an API endpoint
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Reply posted successfully!");
      setContent("");
      onReplyAdded?.();
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Error posting reply");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-4 mt-4">
      <h4 className="font-semibold text-foreground mb-3">
        Reply to: {discussionTitle}
      </h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          placeholder="Share your thoughts or answer..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm h-24 resize-none"
          disabled={loading}
        />
        <div className="flex gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={loading || !content.trim()}
            className="flex-1"
          >
            {loading ? "Posting..." : "Post Reply"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
