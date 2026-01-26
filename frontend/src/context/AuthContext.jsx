import { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
    const { signOut } = useClerk();

    // Sync with Clerk user and Supabase profile
    useEffect(() => {
        let isMounted = true;

        const syncUserProfile = async () => {
            if (!clerkLoaded) return;

            if (clerkUser) {
                // User is logged in via Clerk - sync with Supabase
                try {

                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', clerkUser.id)
                        .single();

                    if (error && error.code !== 'PGRST116') {
                        console.warn('Supabase sync warning (likely schema mismatch):', error.message);
                        // Proceed as student anyway - don't let DB error block the UI
                    }

                    if (profile) {
                        const syncedUser = {
                            id: clerkUser.id,
                            email: clerkUser.primaryEmailAddress?.emailAddress,
                            name: clerkUser.fullName || clerkUser.firstName || profile.full_name || clerkUser.primaryEmailAddress?.emailAddress.split('@')[0],
                            role: 'student',
                        };
                        setUser(syncedUser);
                        setIsAuthenticated(true);
                    } else {
                        // Try to create profile, but don't fail if it exists or schema is wrong
                        const newProfile = {
                            id: clerkUser.id,
                            email: clerkUser.primaryEmailAddress?.emailAddress,
                            full_name: clerkUser.fullName || clerkUser.firstName || clerkUser.primaryEmailAddress?.emailAddress.split('@')[0],
                            role: 'student',
                        };

                        const { error: insertError } = await supabase
                            .from('profiles')
                            .insert([newProfile]);

                        if (insertError) {
                            console.warn('Profile creation suppressed:', insertError.message);
                        }

                        const syncedUser = {
                            id: clerkUser.id,
                            email: newProfile.email,
                            name: newProfile.full_name,
                            role: 'student',
                        };
                        setUser(syncedUser);
                        setIsAuthenticated(true);
                    }
                } catch (err) {
                    console.error('Critical sync failure:', err);
                    // Fallback to local clerk state
                    setUser({
                        id: clerkUser.id,
                        email: clerkUser.primaryEmailAddress?.emailAddress,
                        name: clerkUser.fullName || clerkUser.firstName || clerkUser.primaryEmailAddress?.emailAddress.split('@')[0],
                        role: 'student',
                    });
                    setIsAuthenticated(true);
                }
            } else {

                // No Clerk user - check localStorage for demo/test accounts
                const storedUser = localStorage.getItem('intervuex_user');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    // Ensure role is student
                    userData.role = 'student';
                    setUser(userData);
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }
            setIsLoading(false);
        };

        syncUserProfile();
    }, [clerkUser, clerkLoaded]);



    const login = async (email, password) => {
        // Mock login - keep for local testing if needed
        const mockUser = {
            id: '1',
            email,
            name: email.split('@')[0],
            role: 'student',
        };
        setUser(mockUser);
        setIsAuthenticated(true);
        localStorage.setItem('intervuex_user', JSON.stringify(mockUser));
        return mockUser;
    };

    const loginWithClerk = (clerkUser) => {
        if (!clerkUser) return;
        const syncedUser = {
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            name: clerkUser.fullName || clerkUser.firstName || clerkUser.primaryEmailAddress?.emailAddress.split('@')[0],
            role: 'student',
        };
        setUser(syncedUser);
        setIsAuthenticated(true);
        localStorage.setItem('intervuex_user', JSON.stringify(syncedUser));
    };

    const selectRole = async (role) => {
        // No-op - we only have student role now
    };


    const logout = async () => {
        await signOut();
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('intervuex_user');
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoading,
            login,
            logout,
            selectRole,
            loginWithClerk,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
