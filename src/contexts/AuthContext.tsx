import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  nome: string;
  telefone: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  loading: boolean;
  signUp: (email: string, password: string, nome: string, telefone: string) => Promise<{ error: any }>;
  signIn: (telefone: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Load profile
          setTimeout(() => {
            loadProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data as Profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const signUp = async (email: string, password: string, nome: string, telefone: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          nome,
          telefone
        }
      }
    });
    
    return { error };
  };

  const signIn = async (telefone: string, password: string) => {
    try {
      // Buscar o email associado ao telefone
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('telefone', telefone)
        .single();

      if (profileError || !profileData) {
        return { error: { message: 'Telefone não encontrado' } };
      }

      // Buscar o email do usuário
      const { data: { user: authUser }, error: userError } = await supabase.auth.admin.getUserById(profileData.id);
      
      if (userError || !authUser?.email) {
        // Fallback: tentar login direto com telefone como email
        const emailAttempt = `${telefone}@izi.com`;
        const { error } = await supabase.auth.signInWithPassword({
          email: emailAttempt,
          password
        });
        return { error };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: authUser.email,
        password
      });

      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      session,
      profile,
      isAuthenticated: !!user,
      loading,
      signUp,
      signIn,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
