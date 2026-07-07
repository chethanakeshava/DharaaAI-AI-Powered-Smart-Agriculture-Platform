import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, MessageCircle, Users, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";

interface Reply {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

interface DiscussionDetailProps {
  discussion: {
    id: number;
    title: string;
    category: string;
    author: string;
    avatar: string;
    views: number;
    likes: number;
    dislikes: number;
    preview: string;
    content: string;
    lastActive: string;
  };
  replies: Reply[];
  onClose: () => void;
  onReplyAdded: (reply: Reply) => void;
  onLike: (discussionId: number) => void;
  onDislike: (discussionId: number) => void;
  userLiked: boolean;
  userDisliked: boolean;
  likeCount: number;
  dislikeCount: number;
}

export function DiscussionDetail({
  discussion,
  replies,
  onClose,
  onReplyAdded,
  onLike,
  onDislike,
  userLiked,
  userDisliked,
  likeCount,
  dislikeCount,
}: DiscussionDetailProps) {
  const { user } = useApp();
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      toast.error("Please enter your reply");
      return;
    }

    if (!user) {
      toast.error("Please log in to reply");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newReply: Reply = {
        id: Date.now().toString(),
        author: user.email?.split("@")[0] || "Anonymous",
        avatar: user.email?.[0].toUpperCase() || "A",
        content: replyContent.trim(),
        timestamp: "just now",
        likes: 0,
      };

      toast.success("Reply posted successfully!");
      onReplyAdded(newReply);
      setReplyContent("");
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Error posting reply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="bg-background rounded-lg shadow-xl overflow-hidden flex flex-col pointer-events-auto w-full sm:w-1/2 sm:h-5/6 max-w-2xl max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
            <h2 className="text-base font-bold text-foreground flex-1 pr-4 line-clamp-1">
              {discussion.title}
            </h2>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="w-full px-4 py-4 space-y-4">
              {/* Original Discussion */}
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary-foreground">
                        {discussion.avatar}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-foreground">
                        {discussion.author}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {discussion.lastActive}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Full Content */}
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                    {discussion.content.split("\n\n").map((paragraph, idx) => (
                      <div key={idx}>
                        {paragraph.split("\n").map((line, lineIdx) => {
                          if (line.startsWith("**") && line.endsWith(":**")) {
                            return (
                              <h4 key={lineIdx} className="font-semibold text-foreground mt-2 mb-1 text-sm">
                                {line.replace(/\*\*/g, "")}
                              </h4>
                            );
                          }
                          if (line.startsWith("- ")) {
                            return (
                              <div key={lineIdx} className="ml-3 text-foreground/90 text-xs">
                                {line}
                              </div>
                            );
                          }
                          if (line.startsWith("1. ") || line.match(/^\d+\. /)) {
                            return (
                              <div key={lineIdx} className="ml-3 text-foreground/90 text-xs">
                                {line}
                              </div>
                            );
                          }
                          return (
                            <p key={lineIdx} className="text-foreground/90 leading-relaxed text-xs">
                              {line}
                            </p>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-border text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{discussion.views} views</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageCircle className="h-3 w-3" />
                      <span>{replies.length} replies</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{likeCount} likes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Replies */}
              {replies.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-sm">
                    Replies ({replies.length})
                  </h3>
                  {replies.map((reply) => (
                    <motion.div
                      key={reply.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-border/50">
                        <CardContent className="pt-3 pb-3">
                          <div className="flex items-start gap-3">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-secondary-foreground">
                                {reply.avatar}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h5 className="font-semibold text-foreground text-xs">
                                  {reply.author}
                                </h5>
                                <span className="text-xs text-muted-foreground">
                                  {reply.timestamp}
                                </span>
                              </div>
                              <p className="text-xs text-foreground/90 mt-1 leading-relaxed">
                                {reply.content}
                              </p>
                              <div className="mt-2 text-xs text-muted-foreground">
                                <button className="hover:text-primary transition-colors">
                                  👍 {reply.likes}
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {replies.length === 0 && (
                <div className="text-center py-6">
                  <MessageCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No replies yet. Be the first to reply!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Footer Section - Reply Form and Like/Dislike */}
          <div className="border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3 space-y-3">
            {/* Reply Form */}
            <form onSubmit={handleAddReply} className="space-y-2">
              <textarea
                placeholder="Share your thoughts..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full px-2 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-xs h-16 resize-none"
                disabled={loading}
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || !replyContent.trim() || !user}
                  className="text-xs h-7"
                >
                  {loading ? "Posting..." : "Reply"}
                </Button>
              </div>
              {!user && (
                <p className="text-xs text-muted-foreground">
                  Log in to post a reply
                </p>
              )}
            </form>

            {/* Like/Dislike Buttons */}
            <div className="space-y-2 border-t border-border pt-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onLike(discussion.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                    userLiked
                      ? "bg-green-500/20 text-green-600 border border-green-500/30 hover:bg-green-500/10 cursor-pointer"
                      : "bg-muted text-foreground hover:bg-muted/80 cursor-pointer"
                  }`}
                >
                  <ThumbsUp className="h-3 w-3" />
                  <span>{userLiked ? "Liked" : "Like"}</span>
                </button>
                <button
                  onClick={() => onDislike(discussion.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                    userDisliked
                      ? "bg-red-500/20 text-red-600 border border-red-500/30 hover:bg-red-500/10 cursor-pointer"
                      : "bg-muted text-foreground hover:bg-muted/80 cursor-pointer"
                  }`}
                >
                  <ThumbsUp className="h-3 w-3 rotate-180" />
                  <span>{userDisliked ? "Disliked" : "Dislike"}</span>
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{likeCount} liked</span>
                <span>{dislikeCount} disliked</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
