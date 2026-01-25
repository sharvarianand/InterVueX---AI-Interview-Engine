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
        const syncUserProfile = async () => {
            if (clerkLoaded) {
                if (clerkUser) {
                    // User is logged in via Clerk - sync with Supabase
                    try {
                        // Check if profile exists in Supabase
                        const { data: profile, error } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', clerkUser.id)
                            .single();

                        if (error && error.code !== 'PGRST116') {
                            // PGRST116 = no rows returned (expected for new users)
                            console.error('Error fetching profile:', error);
                        }

                        if (profile) {
                            // Profile exists - use role from Supabase
                            const syncedUser = {
                                id: clerkUser.id,
                                email: clerkUser.primaryEmailAddress?.emailAddress,
                                name: clerkUser.fullName || clerkUser.firstName || profile.full_name || clerkUser.primaryEmailAddress?.emailAddress.split('@')[0],
                                role: profile.role,
                            };
                            setUser(syncedUser);
                            setIsAuthenticated(true);
                            localStorage.setItem('intervuex_user', JSON.stringify(syncedUser));
                        } else {
                            // No profile exists - create one
                            const newProfile = {
                                id: clerkUser.id,
                                email: clerkUser.primaryEmailAddress?.emailAddress,
                                full_name: clerkUser.fullName || clerkUser.firstName || clerkUser.primaryEmailAddress?.emailAddress.split('@')[0],
                                role: null,
                            };

                            const { error: insertError } = await supabase
                                .from('profiles')
                                .insert([newProfile]);

                            if (insertError) {
                                console.error('Error creating profile:', insertError);
                            }

                            const syncedUser = {
                                id: clerkUser.id,
                                email: newProfile.email,
                                name: newProfile.full_name,
                                role: null,
                            };
                            setUser(syncedUser);
                            setIsAuthenticated(true);
                            localStorage.setItem('intervuex_user', JSON.stringify(syncedUser));
                        }
                    } catch (err) {
                        console.error('Unexpected error syncing profile:', err);
                        // Fallback to local state
                        const syncedUser = {
                            id: clerkUser.id,
                            email: clerkUser.primaryEmailAddress?.emailAddress,
                            name: clerkUser.fullName || clerkUser.firstName || clerkUser.primaryEmailAddress?.emailAddress.split('@')[0],
                            role: null,
                        };
                        setUser(syncedUser);
                        setIsAuthenticated(true);
                    }
                } else {
                    // No Clerk user - check localStorage for demo/test accounts
                    const storedUser = localStorage.getItem('intervuex_user');
                    if (storedUser) {
                        const userData = JSON.parse(storedUser);
                        setUser(userData);
                        setIsAuthenticated(true);
                    } else {
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                }
                setIsLoading(false);
            }
        };

        syncUserProfile();
    }, [clerkUser, clerkLoaded]);

    const login = async (email, password) => {
        // Mock login - keep for local testing if needed
        const mockUser = {
            id: '1',
            email,
            name: email.split('@')[0],
            role: null,
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
            role: user?.role || null,
        };
        setUser(syncedUser);
        setIsAuthenticated(true);
        localStorage.setItem('intervuex_user', JSON.stringify(syncedUser));
    };

    const selectRole = async (role) => {
        const updatedUser = { ...user, role };
        setUser(updatedUser);
        localStorage.setItem('intervuex_user', JSON.stringify(updatedUser));

        // Persist role to Supabase
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role, updated_at: new Date().toISOString() })
                .eq('id', user.id);

            if (error) {
                console.error('Error updating role in Supabase:', error);
            }
        } catch (err) {
            console.error('Unexpected error updating role:', err);
        }
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
