import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('⚠️ Supabase not configured. Communities features unavailable.');
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
      }),
      ilike: () => ({
        eq: () => ({
          select: () => Promise.resolve({ data: [], error: null }),
        }),
        select: () => Promise.resolve({ data: [], error: null }),
      }),
      order: () => ({
        eq: () => Promise.resolve({ data: [], error: null }),
        ilike: () => ({
          select: () => Promise.resolve({ data: [], error: null }),
        }),
        select: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  };
}

export async function getCommunities(req: Request, res: Response) {
  try {
    const { search } = req.query;

    let query = supabase.from('communities').select('*').order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data || []);
  } catch (error: any) {
    console.error('Get communities error:', error);
    res.status(500).json({ error: error.message || 'Failed to get communities' });
  }
}

export async function createCommunity(req: Request, res: Response) {
  try {
    const { name, description, tags, location, created_by } = req.body;

    if (!name || !created_by) {
      return res.status(400).json({ error: 'Name and creator ID are required' });
    }

    const { data, error } = await supabase
      .from('communities')
      .insert([
        {
          name,
          description,
          tags: tags || [],
          location,
          created_by,
          member_count: 1,
          post_count: 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Community created successfully',
      community: data,
    });
  } catch (error: any) {
    console.error('Create community error:', error);
    res.status(500).json({ error: error.message || 'Failed to create community' });
  }
}

export async function getCommunityById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Community not found' });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Get community error:', error);
    res.status(500).json({ error: error.message || 'Failed to get community' });
  }
}

export async function updateCommunity(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, tags, location } = req.body;

    const { data, error } = await supabase
      .from('communities')
      .update({
        name: name || undefined,
        description: description || undefined,
        tags: tags || undefined,
        location: location || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Community updated successfully',
      community: data,
    });
  } catch (error: any) {
    console.error('Update community error:', error);
    res.status(500).json({ error: error.message || 'Failed to update community' });
  }
}

export async function deleteCommunity(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('communities').delete().eq('id', id);

    if (error) throw error;

    res.json({ message: 'Community deleted successfully' });
  } catch (error: any) {
    console.error('Delete community error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete community' });
  }
}

export async function joinCommunity(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Add member
    const { error: insertError } = await supabase
      .from('community_members')
      .insert([{ community_id: id, user_id }]);

    if (insertError) {
      if (insertError.code === '23505') {
        return res.status(409).json({ error: 'User already in community' });
      }
      throw insertError;
    }

    // Update member count
    const { data: community } = await supabase
      .from('communities')
      .select('member_count')
      .eq('id', id)
      .single();

    if (community) {
      await supabase
        .from('communities')
        .update({ member_count: (community.member_count || 0) + 1 })
        .eq('id', id);
    }

    res.json({ message: 'Joined community successfully' });
  } catch (error: any) {
    console.error('Join community error:', error);
    res.status(500).json({ error: error.message || 'Failed to join community' });
  }
}

export async function leaveCommunity(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Remove member
    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', id)
      .eq('user_id', user_id);

    if (error) throw error;

    // Update member count
    const { data: community } = await supabase
      .from('communities')
      .select('member_count')
      .eq('id', id)
      .single();

    if (community && community.member_count > 0) {
      await supabase
        .from('communities')
        .update({ member_count: community.member_count - 1 })
        .eq('id', id);
    }

    res.json({ message: 'Left community successfully' });
  } catch (error: any) {
    console.error('Leave community error:', error);
    res.status(500).json({ error: error.message || 'Failed to leave community' });
  }
}
