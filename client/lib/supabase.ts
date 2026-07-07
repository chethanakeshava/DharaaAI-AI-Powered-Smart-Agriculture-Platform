import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn("⚠️ Supabase not configured. Database features will be unavailable. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.");
  
  supabase = {
    from: (table: string) => ({
      select: (cols?: string) => Promise.resolve({ data: [], error: null }),
      insert: (data: any) => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        }),
      }),
      update: (data: any) => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      delete: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
    }),
  };
}

export { supabase };

export type Community = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  location?: string;
  created_by: string;
  member_count: number;
  post_count: number;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  community_id: string;
  author_id: string;
  title: string;
  content: string;
  like_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
};

export type Feedback = {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  tags: string[];
  location?: string;
  created_at: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  location?: string;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  like_count: number;
  created_at: string;
  updated_at: string;
};
