import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('⚠️ Supabase not configured. Posts features unavailable.');
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        }),
      }),
      update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      eq: () => ({
        select: () => Promise.resolve({ data: null, error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
      order: () => ({
        eq: () => Promise.resolve({ data: [], error: null }),
        select: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  };
}

export async function getPosts(req: Request, res: Response) {
  try {
    const { community_id, author_id } = req.query;

    let query = supabase.from('posts').select('*').order('created_at', { ascending: false });

    if (community_id) {
      query = query.eq('community_id', community_id);
    }
    if (author_id) {
      query = query.eq('author_id', author_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data || []);
  } catch (error: any) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: error.message || 'Failed to get posts' });
  }
}

export async function createPost(req: Request, res: Response) {
  try {
    const { community_id, title, content, author_id } = req.body;

    if (!community_id || !title || !author_id) {
      return res.status(400).json({ error: 'Community ID, title, and author ID are required' });
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          community_id,
          title,
          content,
          author_id,
          like_count: 0,
          reply_count: 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Update community post count
    const { data: community } = await supabase
      .from('communities')
      .select('post_count')
      .eq('id', community_id)
      .single();

    if (community) {
      await supabase
        .from('communities')
        .update({ post_count: (community.post_count || 0) + 1 })
        .eq('id', community_id);
    }

    res.status(201).json({
      message: 'Post created successfully',
      post: data,
    });
  } catch (error: any) {
    console.error('Create post error:', error);
    res.status(500).json({ error: error.message || 'Failed to create post' });
  }
}

export async function getPostById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Get post error:', error);
    res.status(500).json({ error: error.message || 'Failed to get post' });
  }
}

export async function updatePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const { data, error } = await supabase
      .from('posts')
      .update({
        title: title || undefined,
        content: content || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Post updated successfully',
      post: data,
    });
  } catch (error: any) {
    console.error('Update post error:', error);
    res.status(500).json({ error: error.message || 'Failed to update post' });
  }
}

export async function deletePost(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Get post to update community count
    const { data: post } = await supabase.from('posts').select('community_id').eq('id', id).single();

    // Delete post
    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) throw error;

    // Update community post count
    if (post) {
      const { data: community } = await supabase
        .from('communities')
        .select('post_count')
        .eq('id', post.community_id)
        .single();

      if (community && community.post_count > 0) {
        await supabase
          .from('communities')
          .update({ post_count: community.post_count - 1 })
          .eq('id', post.community_id);
      }
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error: any) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete post' });
  }
}

export async function likePost(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { data: post } = await supabase.from('posts').select('like_count').eq('id', id).single();

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const { data, error } = await supabase
      .from('posts')
      .update({ like_count: (post.like_count || 0) + 1 })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Post liked successfully',
      post: data,
    });
  } catch (error: any) {
    console.error('Like post error:', error);
    res.status(500).json({ error: error.message || 'Failed to like post' });
  }
}
