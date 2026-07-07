import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to verify JWT and extract user ID
export function verifyToken(req: Request, res: Response, next: Function) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const decoded: any = jwt.verify(token, JWT_SECRET);
    (req as any).userId = decoded.id;
    next();
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Middleware to check if user is admin
export async function isAdminMiddleware(req: Request, res: Response, next: Function) {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    next();
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to verify admin status' });
  }
}

// Get all users (admin only)
export async function getAllUsers(req: Request, res: Response) {
  try {
    const { search, status } = req.query;

    let query = supabase
      .from('users')
      .select('id, email, username, location, is_blocked, role, created_at')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`email.ilike.%${search}%,username.ilike.%${search}%`);
    }

    if (status === 'blocked') {
      query = query.eq('is_blocked', true);
    } else if (status === 'active') {
      query = query.eq('is_blocked', false);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      users: data || [],
      total: data?.length || 0,
    });
  } catch (error: any) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
}

// Get user details (admin only)
export async function getUserDetails(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch user details' });
  }
}

// Block a user (admin only)
export async function blockUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({
        is_blocked: true,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Log admin action
    const adminId = (req as any).userId;
    await supabase.from('admin_logs').insert({
      admin_id: adminId,
      action: 'block_user',
      target_user_id: userId,
      reason: reason || 'Blocked by admin',
      timestamp: new Date().toISOString(),
    }).catch((err) => console.warn('Failed to log admin action:', err));

    res.json({
      success: true,
      message: 'User blocked successfully',
      user: data,
    });
  } catch (error: any) {
    console.error('Block user error:', error);
    res.status(500).json({ error: error.message || 'Failed to block user' });
  }
}

// Unblock a user (admin only)
export async function unblockUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('users')
      .update({
        is_blocked: false,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Log admin action
    const adminId = (req as any).userId;
    await supabase.from('admin_logs').insert({
      admin_id: adminId,
      action: 'unblock_user',
      target_user_id: userId,
      timestamp: new Date().toISOString(),
    }).catch((err) => console.warn('Failed to log admin action:', err));

    res.json({
      success: true,
      message: 'User unblocked successfully',
      user: data,
    });
  } catch (error: any) {
    console.error('Unblock user error:', error);
    res.status(500).json({ error: error.message || 'Failed to unblock user' });
  }
}

// Make user admin (admin only)
export async function makeUserAdmin(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Log admin action
    const adminId = (req as any).userId;
    await supabase.from('admin_logs').insert({
      admin_id: adminId,
      action: 'promote_to_admin',
      target_user_id: userId,
      timestamp: new Date().toISOString(),
    }).catch((err) => console.warn('Failed to log admin action:', err));

    res.json({
      success: true,
      message: 'User promoted to admin successfully',
      user: data,
    });
  } catch (error: any) {
    console.error('Make user admin error:', error);
    res.status(500).json({ error: error.message || 'Failed to promote user' });
  }
}

// Remove admin role (admin only)
export async function removeAdminRole(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('users')
      .update({ role: 'user' })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Log admin action
    const adminId = (req as any).userId;
    await supabase.from('admin_logs').insert({
      admin_id: adminId,
      action: 'demote_from_admin',
      target_user_id: userId,
      timestamp: new Date().toISOString(),
    }).catch((err) => console.warn('Failed to log admin action:', err));

    res.json({
      success: true,
      message: 'Admin role removed successfully',
      user: data,
    });
  } catch (error: any) {
    console.error('Remove admin role error:', error);
    res.status(500).json({ error: error.message || 'Failed to remove admin role' });
  }
}

// Get admin dashboard stats
export async function getAdminStats(req: Request, res: Response) {
  try {
    const { data: users } = await supabase.from('users').select('id, is_blocked', { count: 'exact' });
    const { data: blockedUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('is_blocked', true);
    const { data: adminUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('role', 'admin');

    res.json({
      success: true,
      stats: {
        totalUsers: users?.length || 0,
        blockedUsers: blockedUsers?.length || 0,
        adminUsers: adminUsers?.length || 0,
        activeUsers: (users?.length || 0) - (blockedUsers?.length || 0),
      },
    });
  } catch (error: any) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch admin stats' });
  }
}
