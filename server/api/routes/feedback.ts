import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('⚠️ Supabase not configured. Feedback features unavailable.');
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        }),
      }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      eq: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
      }),
      order: () => ({
        eq: () => ({
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  };
}

export async function getFeedback(req: Request, res: Response) {
  try {
    const { location } = req.query;

    let query = supabase.from('feedback').select('*').order('created_at', { ascending: false });

    if (location) {
      query = query.eq('location', location);
    }

    const { data, error } = await query.limit(50);

    if (error) throw error;

    res.json(data || []);
  } catch (error: any) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: error.message || 'Failed to get feedback' });
  }
}

export async function submitFeedback(req: Request, res: Response) {
  try {
    const { user_id, title, description, tags, location } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          user_id,
          title,
          description,
          tags: tags || [],
          location,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: data,
    });
  } catch (error: any) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit feedback' });
  }
}

export async function deleteFeedback(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('feedback').delete().eq('id', id);

    if (error) throw error;

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error: any) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete feedback' });
  }
}
