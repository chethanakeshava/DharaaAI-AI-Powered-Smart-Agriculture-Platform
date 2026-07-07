import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase, Community, Post, Feedback, Comment } from "@/lib/supabase";
import { authService } from "@/services/authService";
import type { User } from "@/types/auth";

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  communities: Community[];
  setCommunities: (communities: Community[]) => void;
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  feedback: Feedback[];
  setFeedback: (feedback: Feedback[]) => void;
  comments: Comment[];
  setComments: (comments: Comment[]) => void;
  
  // Community functions
  createCommunity: (data: {
    name: string;
    description: string;
    tags: string[];
    location?: string;
  }) => Promise<Community | null>;
  joinCommunity: (communityId: string, userId: string) => Promise<void>;
  fetchCommunities: () => Promise<void>;
  
  // Post functions
  createPost: (data: {
    communityId: string;
    title: string;
    content: string;
    authorId: string;
  }) => Promise<Post | null>;
  fetchPosts: (communityId?: string) => Promise<void>;
  
  // Feedback functions
  submitFeedback: (data: {
    userId?: string;
    title: string;
    description: string;
    tags: string[];
    location?: string;
  }) => Promise<Feedback | null>;
  fetchFeedback: () => Promise<void>;
  
  // Comment functions
  createComment: (data: {
    postId: string;
    authorId: string;
    content: string;
  }) => Promise<Comment | null>;
  fetchComments: (postId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // Initialize user from auth service
  useEffect(() => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error("Error loading user from auth service:", error);
    }
  }, []);

  // Create a community (API call to backend)
  const createCommunity = async (data: {
    name: string;
    description: string;
    tags: string[];
    location?: string;
  }): Promise<Community | null> => {
    try {
      const response = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          tags: data.tags,
          location: data.location,
          created_by: user?.id,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create community";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const newCommunity = result.community || result;

      setCommunities([...communities, newCommunity]);
      return newCommunity;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error creating community:", message);
      throw error;
    }
  };

  // Join a community
  const joinCommunity = async (communityId: string, userId: string) => {
    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to join community";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      await fetchCommunities();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error joining community:", message);
      throw error;
    }
  };

  // Fetch all communities
  const fetchCommunities = async () => {
    try {
      const response = await fetch("/api/communities");
      if (!response.ok) {
        throw new Error(`Failed to fetch communities: ${response.status}`);
      }
      const data = await response.json();
      setCommunities(Array.isArray(data) ? data : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error fetching communities:", message);
    }
  };

  // Create a post
  const createPost = async (data: {
    communityId: string;
    title: string;
    content: string;
    authorId: string;
  }): Promise<Post | null> => {
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          community_id: data.communityId,
          title: data.title,
          content: data.content,
          author_id: data.authorId,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create post";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const newPost = await response.json();
      setPosts([newPost, ...posts]);
      return newPost;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error creating post:", message);
      return null;
    }
  };

  // Fetch posts
  const fetchPosts = async (communityId?: string) => {
    try {
      const url = communityId ? `/api/posts?community_id=${communityId}` : "/api/posts";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error fetching posts:", message);
    }
  };

  // Submit feedback
  const submitFeedback = async (data: {
    userId?: string;
    title: string;
    description: string;
    tags: string[];
    location?: string;
  }): Promise<Feedback | null> => {
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = "Failed to submit feedback";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const newFeedback = await response.json();
      setFeedback([newFeedback, ...feedback]);
      return newFeedback;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error submitting feedback:", message);
      return null;
    }
  };

  // Fetch feedback
  const fetchFeedback = async () => {
    try {
      const response = await fetch("/api/feedback");
      if (!response.ok) {
        throw new Error(`Failed to fetch feedback: ${response.status}`);
      }
      const data = await response.json();
      setFeedback(Array.isArray(data) ? data : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error fetching feedback:", message);
    }
  };

  // Create a comment
  const createComment = async (data: {
    postId: string;
    authorId: string;
    content: string;
  }): Promise<Comment | null> => {
    try {
      const response = await fetch(`/api/posts/${data.postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_id: data.authorId,
          content: data.content,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create comment";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const newComment = await response.json();
      setComments([newComment, ...comments]);
      return newComment;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error creating comment:", message);
      return null;
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }
      const data = await response.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error fetching comments:", message);
    }
  };

  const value: AppContextType = {
    user,
    setUser,
    communities,
    setCommunities,
    posts,
    setPosts,
    feedback,
    setFeedback,
    comments,
    setComments,
    createCommunity,
    joinCommunity,
    fetchCommunities,
    createPost,
    fetchPosts,
    submitFeedback,
    fetchFeedback,
    createComment,
    fetchComments,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
