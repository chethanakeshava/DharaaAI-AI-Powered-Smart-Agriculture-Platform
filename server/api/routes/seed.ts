import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function seedFirstAdmin(req: Request, res: Response) {
  try {
    const { email = 'admin@example.com', password = 'Admin@123456' } = req.body;

    // Check if any admin already exists
    const { data: existingAdmins } = await supabase
      .from('users')
      .select('id, role')
      .eq('role', 'admin');

    if (existingAdmins && existingAdmins.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'An admin user already exists in the system',
      });
    }

    // Create admin user via Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('❌ Supabase signup error:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Create user profile with admin role
    if (data.user) {
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        email,
        username: 'Admin',
        location: null,
        role: 'admin',
        is_blocked: false,
      });

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        return res.status(400).json({
          success: false,
          error: 'Failed to create admin profile',
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'First admin user created successfully',
      credentials: {
        email,
        password,
      },
      instructions: 'Use these credentials to login at /login/admin',
    });
  } catch (error: any) {
    console.error('Seed error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
