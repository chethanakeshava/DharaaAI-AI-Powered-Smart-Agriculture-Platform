import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase not configured. Comments features unavailable.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function getComments(req: Request, res: Response) {
  try {
    const { postId } = req.params;

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error: any) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: error.message || 'Failed to get comments' });
  }
}

export async function createComment(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const { author_id, content } = req.body;

    if (!author_id || !content) {
      return res.status(400).json({ error: 'Author ID and content are required' });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          author_id,
          content,
          like_count: 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Update post reply count
    const { data: post } = await supabase
      .from('posts')
      .select('reply_count')
      .eq('id', postId)
      .single();

    if (post) {
      await supabase
        .from('posts')
        .update({ reply_count: (post.reply_count || 0) + 1 })
        .eq('id', postId);
    }

    res.status(201).json({
      message: 'Comment created successfully',
      comment: data,
    });
  } catch (error: any) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: error.message || 'Failed to create comment' });
  }
}

export async function deleteComment(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Get comment to update post count
    const { data: comment } = await supabase
      .from('comments')
      .select('post_id')
      .eq('id', id)
      .single();

    // Delete comment
    const { error } = await supabase.from('comments').delete().eq('id', id);

    if (error) throw error;

    // Update post reply count
    if (comment) {
      const { data: post } = await supabase
        .from('posts')
        .select('reply_count')
        .eq('id', comment.post_id)
        .single();

      if (post && post.reply_count > 0) {
        await supabase
          .from('posts')
          .update({ reply_count: post.reply_count - 1 })
          .eq('id', comment.post_id);
      }
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error: any) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete comment' });
  }
}
