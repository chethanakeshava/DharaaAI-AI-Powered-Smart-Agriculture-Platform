import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase not configured. Dashboard features unavailable.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function getDashboardData(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch user profile
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    // Fetch communities user is part of
    const { data: userCommunities } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('user_id', userId)
      .limit(5);

    // Fetch user's recent posts
    const { data: userPosts } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Fetch user's feedback
    const { data: userFeedback } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Fetch recent community activity
    const { data: recentActivity } = await supabase
      .from('posts')
      .select('*, communities(name), users(username)')
      .order('created_at', { ascending: false })
      .limit(10);

    // Aggregate statistics
    const stats = {
      totalCommunities: userCommunities?.length || 0,
      totalPosts: userPosts?.length || 0,
      totalFeedback: userFeedback?.length || 0,
      totalComments: 0,
    };

    // Get total comments from user's posts
    if (userPosts && userPosts.length > 0) {
      const postIds = userPosts.map((p) => p.id);
      const { data: comments, error: commentError } = await supabase
        .from('comments')
        .select('id')
        .in('post_id', postIds);

      if (!commentError) {
        stats.totalComments = comments?.length || 0;
      }
    }

    res.json({
      user: user || {},
      communities: userCommunities || [],
      posts: userPosts || [],
      feedback: userFeedback || [],
      recentActivity: recentActivity || [],
      stats,
    });
  } catch (error: any) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: error.message || 'Failed to get dashboard data' });
  }
}
