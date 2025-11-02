import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  nome: string;
  telefone: string;
  cep?: string;
  estado?: string;
  bairro?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
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
      // Converter telefone para o formato de email usado no cadastro
      const email = `${telefone}@izi.com`;
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error: { message: 'Telefone ou senha incorretos' } };
      }

      return { error: null };
    } catch (error: any) {
      return { error: { message: 'Erro ao fazer login' } };
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
