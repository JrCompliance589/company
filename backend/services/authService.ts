import { supabase, supabaseAuth } from '../supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface GoogleSignInData {
  email: string;
  name: string;
  google_id: string;
  id_token?: string; // Add optional ID token field
}

export class AuthService {
  // Sign up with email and password
  async signUp(data: SignUpData): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      console.log('🔐 Attempting to sign up user:', data.email);
      
      // Use the main supabase client for auth operations
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
          }
        }
      });

      if (error) {
        console.log('❌ Supabase auth signUp error:', error);
        return { user: null, error: error.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to create user' };
      }

      console.log('✅ User created in auth:', authData.user.id);

      // Create user profile in profiles table using service role
      try {
        const { error: profileError } = await supabaseAuth
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.full_name,
            is_verified: false,
            is_admin: false,
            created_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('❌ Profile creation error:', profileError);
          // Don't return error here as user was created in auth
        } else {
          console.log('✅ Profile created successfully');
        }
      } catch (profileErr) {
        console.error('❌ Profile creation exception:', profileErr);
      }

      const user: AuthUser = {
        id: authData.user.id,
        email: data.email,
        full_name: data.full_name,
        is_verified: false,
        is_admin: false,
        created_at: new Date().toISOString()
      };

      return { user, error: null };
    } catch (error) {
      console.error('❌ Sign up service error:', error);
      return { user: null, error: error instanceof Error ? error.message : 'Internal server error' };
    }
  }

  // Sign in with email and password
  async signIn(data: SignInData): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      console.log('🔐 Attempting to sign in user:', data.email);
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) {
        console.log('❌ Supabase auth signIn error:', error);
        return { user: null, error: error.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to sign in' };
      }

      console.log('✅ User signed in to auth:', authData.user.id);

      // Get user profile from profiles table
      const { data: profile, error: profileError } = await supabaseAuth
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        
        // If profile doesn't exist, create it
        const { error: createError } = await supabaseAuth
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: authData.user.user_metadata?.full_name || 'User',
            is_verified: !!authData.user.email_confirmed_at,
            is_admin: false,
            created_at: new Date().toISOString()
          });

        if (createError) {
          console.error('❌ Profile creation error:', createError);
          return { user: null, error: 'User profile not found and could not be created' };
        }

        // Return user with default profile
        const user: AuthUser = {
          id: authData.user.id,
          email: data.email,
          full_name: authData.user.user_metadata?.full_name || 'User',
          is_verified: !!authData.user.email_confirmed_at,
          is_admin: false,
          created_at: new Date().toISOString()
        };

        return { user, error: null };
      }

      const user: AuthUser = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        is_verified: profile.is_verified,
        is_admin: profile.is_admin,
        created_at: profile.created_at
      };

      console.log('✅ User profile fetched successfully');
      return { user, error: null };
    } catch (error) {
      console.error('❌ Sign in service error:', error);
      return { user: null, error: error instanceof Error ? error.message : 'Internal server error' };
    }
  }

  // Google Sign In - Updated to handle both OAuth flow and manual user creation
  async googleSignIn(data: GoogleSignInData): Promise<{ user: AuthUser | null; session: Session | null; error: string | null; details?: any }> {
    try {
      console.log('🔐 Attempting Google sign-in for:', data.email);

      // Method 1: Try using ID token if provided
      if (data.id_token) {
        console.log('🔑 Using ID token for Google authentication');
        
        const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: data.id_token,
        });

        if (authError) {
          console.error('❌ Supabase signInWithIdToken error:', authError);
          // Fall back to manual method if ID token fails
        } else if (authData.user) {
          console.log('✅ User signed in via ID token:', authData.user.id);
          return await this.handleGoogleUserProfile(authData.user, authData.session, data);
        }
      }

      // Method 2: Manual user creation/lookup (fallback method)
      console.log('🔄 Falling back to manual Google user handling');
      
      // Check if user already exists in profiles table
      const { data: existingProfile, error: profileError } = await supabaseAuth
        .from('profiles')
        .select('*')
        .eq('email', data.email)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116: No rows found
        console.error('❌ Error checking existing profile:', profileError);
        return { user: null, session: null, error: 'Failed to check user profile', details: profileError };
      }

      if (existingProfile) {
        console.log('✅ Existing Google user found:', existingProfile.id);
        const authUser: AuthUser = {
          id: existingProfile.id,
          email: existingProfile.email,
          full_name: existingProfile.full_name,
          is_verified: existingProfile.is_verified,
          is_admin: existingProfile.is_admin,
          created_at: existingProfile.created_at,
        };
        return { user: authUser, session: null, error: null };
      }

      // Create new Google user profile
      console.log('🆕 Creating new Google user profile for:', data.email);
      
      // Generate a UUID for the new user
      const newUserId = uuidv4();
      
      const { data: newProfile, error: insertError } = await supabaseAuth
        .from('profiles')
        .insert({
          id: newUserId,
          email: data.email,
          full_name: data.name,
          google_id: data.google_id,
          is_verified: true, // Google accounts are pre-verified
          is_admin: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Google profile creation error:', insertError);
        return { user: null, session: null, error: 'Failed to create user profile', details: insertError };
      }

      console.log('✅ Google user profile created:', newProfile.id);

      const authUser: AuthUser = {
        id: newProfile.id,
        email: newProfile.email,
        full_name: newProfile.full_name,
        is_verified: newProfile.is_verified,
        is_admin: newProfile.is_admin,
        created_at: newProfile.created_at,
      };

      return { user: authUser, session: null, error: null };
    } catch (error) {
      console.error('❌ Google sign in service error:', error);
      return { user: null, session: null, error: error instanceof Error ? error.message : 'Internal server error', details: error };
    }
  }

  // Helper method to handle Google user profile after successful auth
  private async handleGoogleUserProfile(authUser: User, session: Session | null, data: GoogleSignInData): Promise<{ user: AuthUser | null; session: Session | null; error: string | null; details?: any }> {
    try {
      // Get user profile from profiles table
      const { data: profile, error: profileError } = await supabaseAuth
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116: No rows found
        console.error('❌ Error checking profile:', profileError);
        return { user: null, session: null, error: 'Failed to check user profile', details: profileError };
      }

      if (profile) {
        console.log('✅ Existing Google user profile found:', profile.id);
        const user: AuthUser = {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          is_verified: profile.is_verified,
          is_admin: profile.is_admin,
          created_at: profile.created_at,
        };
        return { user, session, error: null };
      }

      // Create new user profile
      console.log('🆕 Creating new Google user profile for:', data.email);
      const { data: newProfile, error: insertError } = await supabaseAuth
        .from('profiles')
        .insert({
          id: authUser.id,
          email: data.email,
          full_name: data.name,
          google_id: data.google_id,
          is_verified: true,
          is_admin: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Google profile creation error:', insertError);
        return { user: null, session: null, error: 'Failed to create user profile', details: insertError };
      }

      console.log('✅ Google user profile created:', newProfile.id);

      const user: AuthUser = {
        id: newProfile.id,
        email: newProfile.email,
        full_name: newProfile.full_name,
        is_verified: newProfile.is_verified,
        is_admin: newProfile.is_admin,
        created_at: newProfile.created_at,
      };

      return { user, session, error: null };
    } catch (error) {
      console.error('❌ Google user profile handling error:', error);
      return { user: null, session: null, error: error instanceof Error ? error.message : 'Internal server error', details: error };
    }
  }

  // Alternative Google OAuth method using provider redirect
  async initiateGoogleOAuth(): Promise<{ url: string | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ Google OAuth initiation error:', error);
        return { url: null, error: error.message };
      }

      return { url: data.url, error: null };
    } catch (error) {
      console.error('❌ Google OAuth service error:', error);
      return { url: null, error: error instanceof Error ? error.message : 'Internal server error' };
    }
  }

  // Sign out
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      return { error: error instanceof Error ? error.message : 'Internal server error' };
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: profile, error } = await supabaseAuth
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { user: null, error: error.message };
      }

      const user: AuthUser = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        is_verified: profile.is_verified,
        is_admin: profile.is_admin,
        created_at: profile.created_at
      };

      return { user, error: null };
    } catch (error) {
      console.error('❌ Get user error:', error);
      return { user: null, error: error instanceof Error ? error.message : 'Internal server error' };
    }
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<{ users: AuthUser[] | null; error: string | null }> {
    try {
      const { data: profiles, error } = await supabaseAuth
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { users: null, error: error.message };
      }

      const users: AuthUser[] = profiles.map(profile => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        is_verified: profile.is_verified,
        is_admin: profile.is_admin,
        created_at: profile.created_at
      }));

      return { users, error: null };
    } catch (error) {
      console.error('❌ Get all users error:', error);
      return { users: null, error: error instanceof Error ? error.message : 'Internal server error' };
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<AuthUser>): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: profile, error } = await supabaseAuth
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { user: null, error: error.message };
      }

      const user: AuthUser = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        is_verified: profile.is_verified,
        is_admin: profile.is_admin,
        created_at: profile.created_at
      };

      return { user, error: null };
    } catch (error) {
      console.error('❌ Update profile error:', error);
      return { user: null, error: error instanceof Error ? error.message : 'Internal server error' };
    }
  }

  // Delete user (admin only)
  async deleteUser(userId: string): Promise<{ error: string | null }> {
    try {
      // First delete from profiles table
      const { error: profileError } = await supabaseAuth
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('❌ Profile delete error:', profileError);
        return { error: profileError.message };
      }

      // Then delete from auth (if using service role)
      if (supabaseAuth !== supabase) {
        const { error: authError } = await supabaseAuth.auth.admin.deleteUser(userId);
        if (authError) {
          console.error('❌ Auth delete error:', authError);
          // Don't return error here as profile was already deleted
        }
      }

      return { error: null };
    } catch (error) {
      console.error('❌ Delete user error:', error);
      return { error: error instanceof Error ? error.message : 'Internal server error' };
    }
  }

  // Get admin stats
  async getAdminStats(): Promise<{ stats: any | null; error: string | null }> {
    try {
      const { data: profiles, error } = await supabaseAuth
        .from('profiles')
        .select('*');

      if (error) {
        return { stats: null, error: error.message };
      }

      const totalUsers = profiles.length;
      const verifiedUsers = profiles.filter(p => p.is_verified).length;
      const adminUsers = profiles.filter(p => p.is_admin).length;
      const recentUsers = profiles.filter(p => {
        const created = new Date(p.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return created >= weekAgo;
      }).length;

      const stats = {
        totalUsers,
        verifiedUsers,
        adminUsers,
        recentUsers,
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0
      };

      return { stats, error: null };
    } catch (error) {
      console.error('❌ Get admin stats error:', error);
      return { stats: null, error: error instanceof Error ? error.message : 'Internal server error' };
    }
  }
}

export const authService = new AuthService();