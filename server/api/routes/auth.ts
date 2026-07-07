import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not configured.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function registerUser(req: Request, res: Response) {
  try {
    const { email, password, username, location, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // ✅ Supabase Auth handles password hashing & storage
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('❌ Supabase registration error:', error);
      // Check if it's a connection error
      if (error.message?.includes('ENOTFOUND') || error.message?.includes('fetch failed')) {
        return res.status(503).json({
          error: 'Service unavailable: Cannot connect to authentication service. Please check your Supabase configuration.'
        });
      }
      return res.status(400).json({ error: error.message });
    }

    // ✅ Create user profile metadata (separate from auth)
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        username: username || '',
        location: location || null,
        role: role || 'user',
        is_blocked: false,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Check your email to confirm.',
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const start = Date.now();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    console.log('⏱️ Login attempt for:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log(`⏱️ Supabase response took ${Date.now() - start}ms`);

    if (error) {
      console.error('❌ Supabase login error:', error);
      // Check if it's a connection error
      if (error.message?.includes('ENOTFOUND') || error.message?.includes('fetch failed')) {
        return res.status(503).json({
          error: 'Service unavailable: Cannot connect to authentication service. Please check your Supabase configuration.'
        });
      }
      // Return generic error for auth failures to prevent email enumeration
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Fetch user profile to get role and blocked status
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, username, location, role, is_blocked')
      .eq('id', data.user.id)
      .single();

    if (userProfile?.is_blocked) {
      return res.status(403).json({ error: 'Your account has been blocked by an administrator' });
    }

    // Generate JWT token for session
    const token = jwt.sign(
      { id: data.user.id, email: data.user.email, role: userProfile?.role || 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
        username: userProfile?.username || '',
        location: userProfile?.location || '',
        role: userProfile?.role || 'user',
      },
    });
  } catch (error: any) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing password fields' });
    }

    // ✅ Update password via Supabase Auth (requires session)
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Change password error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function getUserProfile(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, location, role, is_blocked')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function updateUserProfile(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { username, location } = req.body;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ username, location })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (error: any) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
