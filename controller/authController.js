import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../utils/api.js";
import toast from "react-hot-toast";
import axios from "axios";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      hasHydrated: false,
      isRefreshing: false,
      lastActivity: Date.now(),
      
      setHasHydrated: () => set({ hasHydrated: true }),

      setAccessToken: (token) => {
        set({ 
          accessToken: token, 
          isAuthenticated: !!token,
          lastActivity: Date.now()
        });
      },

      setUser: (userData) => {
        set({ 
          user: userData, 
          isAuthenticated: !!userData,
          lastActivity: Date.now()
        });
      },

      // Update last activity timestamp
      updateActivity: () => {
        set({ lastActivity: Date.now() });
      },

      // Enhanced token validation with better error handling
      isTokenValid: () => {
        const state = get();
        if (!state.accessToken || !state.isAuthenticated) {
          return false;
        }
        
        try {
          const tokenParts = state.accessToken.split('.');
          if (tokenParts.length !== 3) {
            console.warn('Invalid token format');
            return false;
          }
          
          const payload = JSON.parse(atob(tokenParts[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          
          // Check if token is expired (with 5 minute buffer for auto-refresh)
          const isValid = payload.exp && payload.exp > (currentTime + 300); // 5 minute buffer
          
          if (!isValid) {
            console.log('Token expired or about to expire');
          }
          
          return isValid;
        } catch (error) {
          console.error('Token validation error:', error);
          return false;
        }
      },
      
      // Enhanced auth status check with better flow
      checkAuthStatus: async () => {
        const state = get();
        
        if (!state.accessToken || !state.isAuthenticated) {
          console.log('No token or not authenticated');
          return false;
        }
        
        // If token is still valid, keep session alive
        if (state.isTokenValid()) {
          state.updateActivity();
          return true;
        }
        
        // Try to refresh token automatically
        try {
          console.log('Token needs refresh, attempting...');
          const result = await state.refreshAccessToken();
          return result.success;
        } catch (error) {
          console.warn('Auth status check failed:', error.message);
          // Clear invalid auth state
          state.clearAuthState();
          return false;
        }
      },

      // Helper to clear auth state
      clearAuthState: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          loading: false,
          error: null,
          isRefreshing: false,
          lastActivity: Date.now(),
        });
      },

      // Enhanced login with better error handling
      login: async (formdata) => {
        const { email, password, rememberMe = true } = formdata;
        
        try {
          set({ loading: true, error: null });
          
          const response = await api.post("/auth/login", { 
            email, 
            password, 
            rememberMe 
          });
          
          if (response.data.success) {
            const { user, accessToken, message } = response.data;
            
            // Fetch complete profile data with fallback
            let completeUser = { ...user };
            try {
              const profileResp = await api.get('/user/profile', {
                headers: { Authorization: `Bearer ${accessToken}` }
              });
              
              if (profileResp.data.success && profileResp.data.user) {
                completeUser = { ...completeUser, ...profileResp.data.user };
              }
            } catch (profileError) { 
              console.warn('Failed to fetch complete profile:', profileError.message);
              // Continue with basic user data
            }
            
            // Normalize user data structure
            const normalizedUser = {
              ...completeUser,
              name: completeUser.name || completeUser.fullName || '',
              email: completeUser.email || '',
              contact: completeUser.contact || completeUser.phone || '',
              bio: completeUser.bio || '',
              institute: completeUser.institute || '',
              designation: completeUser.designation || '',
              gender: completeUser.gender || '',
              expertise: completeUser.expertise || '',
              dateOfBirth: completeUser.dateOfBirth || completeUser.dob || '',
              linkedinUrl: completeUser.linkedinUrl || completeUser.linkedinProfile || '',
              isVerified: completeUser.isVerified || false
            };
            
            set({
              user: normalizedUser,
              accessToken,
              isAuthenticated: true,
              loading: false,
              error: null,
              lastActivity: Date.now(),
            });
            
            console.log('✅ LOGIN SUCCESSFUL');
            console.log('User:', normalizedUser.name, normalizedUser.email);
            console.log('Session will persist with auto-refresh');
            
            toast.success(message || "Welcome back! You're now logged in.");
            return { success: true, user: normalizedUser };
          }
          
          const errorMsg = response.data.message || 'Login failed';
          set({ loading: false, error: errorMsg });
          toast.error(errorMsg);
          return { success: false, error: errorMsg };
          
        } catch (error) {
          console.error('Login error:', error);
          
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              "Login failed. Please try again.";
          
          set({
            error: errorMessage,
            loading: false,
            isAuthenticated: false,
            user: null,
            accessToken: null,
          });
          
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Enhanced profile update with retry logic
      updateProfile: async (profileData) => {
        try {
          const state = get();
          const token = state.accessToken;
          
          if (!token) {
            throw new Error('No authentication token found');
          }
          
          console.log('Updating profile with token:', token ? 'Present' : 'Missing');
          
          const response = await api.put('/user/profile', profileData);
          
          if (response.data.success) {
            // Update user state with new data
            set({ 
              user: { 
                ...state.user, 
                ...response.data.user 
              } 
            });
            
            const message = response.data.message || 'Profile updated successfully';
            toast.success(message);
            return { success: true, user: response.data.user };
          }
          
          throw new Error(response.data.message || 'Profile update failed');
          
        } catch (error) {
          console.error('Profile update error:', error);
          
          // Handle token expiry with retry
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('Token expired, attempting refresh...');
            
            const refreshResult = await get().refreshAccessToken();
            if (refreshResult.success) {
              console.log('Token refreshed, retrying profile update...');
              try {
                return await get().updateProfile(profileData);
              } catch (retryError) {
                console.error('Retry failed:', retryError);
                throw retryError;
              }
            } else {
              // Refresh failed, redirect to login
              get().logout();
              throw new Error('Session expired. Please log in again.');
            }
          }
          
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              "Profile update failed";
          
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      },

      // Enhanced password update
      updatePassword: async (currentPassword, newPassword) => {
        console.log('Password update initiated');
        
        try {
          const response = await api.put('/user/password', {
            currentPassword,
            newPassword
          });
          
          if (response.data.success) {
            const message = response.data.message || 'Password updated successfully';
            console.log('Password update successful');
            
            // Dismiss any existing toasts
            toast.dismiss();
            toast.success(message, {
              id: 'password-update-success',
              duration: 4000,
            });
            
            return { success: true, message };
          }
          
          throw new Error(response.data.message || 'Password update failed');
          
        } catch (error) {
          console.error('Password update error:', error);
          
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              "Password update failed";
          
          toast.dismiss();
          toast.error(errorMessage, {
            id: 'password-update-error',
            duration: 4000,
          });
          
          throw new Error(errorMessage);
        }
      },

      // Enhanced registration
      register: async (formData) => {
        try {
          set({ loading: true, error: null });
          
          const response = await api.post("/auth/register", formData);
          const { success, message, regToken } = response.data;
          
          if (success && regToken) {
            set({ loading: false, error: null });
            toast.success(message || 'Registration successful! Please verify your email.');
            return { success: true, regToken, message };
          }
          
          const errorMsg = message || "Registration failed";
          set({ loading: false, error: errorMsg });
          toast.error(errorMsg);
          return { success: false, error: errorMsg };
          
        } catch (error) {
          console.error('Registration error:', error);
          
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              "Registration failed";
          
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Enhanced logout
      logout: async () => {
        try {
          console.log('🚪 Initiating logout...');
          
          // Call backend logout first (if possible)
          try {
            await api.post("/auth/logout");
            console.log('Backend logout successful');
          } catch (error) {
            console.warn("Backend logout failed:", error.message);
            // Continue with local logout
          }
          
          // Clear auth state
          get().clearAuthState();
          
          // Clear persisted storage
          localStorage.removeItem('auth-storage');
          sessionStorage.clear(); // Clear any session data
          
          console.log('✅ Logout completed successfully');
          toast.success("Logged out successfully");
          
          // Optional: Redirect to login page
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }, 1000);
          
        } catch (error) {
          console.error("Logout error:", error);
          
          // Force clear local state regardless
          get().clearAuthState();
          localStorage.removeItem('auth-storage');
          
          toast.error("Logout completed with errors");
        }
      },

      // Enhanced token refresh with better error handling
      refreshAccessToken: async () => {
        const state = get();
        
        // Prevent multiple refresh calls
        if (state.isRefreshing) {
          console.log('Token refresh already in progress');
          return { success: false, message: 'Already refreshing token' };
        }
        
        if (!state.accessToken && !state.isAuthenticated) {
          console.log('No token to refresh');
          return { success: false, message: 'No authentication token found' };
        }
        
        try {
          set({ isRefreshing: true });
          console.log('🔄 Refreshing access token...');
          
          // Create separate axios instance to avoid interceptor loops
          const refreshApi = axios.create({
            baseURL: api.defaults.baseURL,
            withCredentials: true,
            timeout: 10000, // 10 second timeout
          });
          
          const response = await refreshApi.get("/auth/refresh");
          
          if (response.data.success) {
            const { accessToken, user } = response.data;
            
            // Normalize user data
            const normalizedUser = {
              ...user,
              contact: user.contact || "",
              bio: user.bio || "",
              isVerified: user.isVerified || false
            };
            
            set({
              accessToken,
              user: normalizedUser,
              isAuthenticated: true,
              loading: false,
              error: null,
              isRefreshing: false,
              lastActivity: Date.now(),
            });
            
            console.log('🔄 Token refreshed successfully');
            return { success: true, token: accessToken };
          } else {
            throw new Error(response.data.message || 'Token refresh failed');
          }
          
        } catch (error) {
          console.error('Token refresh failed:', error);
          
          set({ isRefreshing: false });
          
          // Handle different error scenarios
          if (error.response?.status === 401) {
            console.log('🔒 Refresh token expired - clearing auth state');
            
            get().clearAuthState();
            localStorage.removeItem('auth-storage');
            
            toast.error('Your session has expired. Please log in again.');
            
            // Redirect to login after a delay
            setTimeout(() => {
              if (window.location.pathname !== '/login') {
                window.location.href = '/login';
              }
            }, 2000);
            
            return { success: false, message: 'Session expired' };
          }
          
          // For other errors, just return failure without clearing state
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'Token refresh failed';
          
          return { success: false, message: errorMessage };
        }
      },

      // Enhanced email verification
      verifyEmail: async (otp) => {
        try {
          const state = get();
          const userId = state.user?._id;
          
          if (!userId) {
            const errorMsg = "User not found. Please log in again.";
            toast.error(errorMsg);
            return { success: false, message: errorMsg };
          }
          
          set({ loading: true });
          
          const response = await api.post("/auth/verify-account", {
            userId,
            otp,
          });
          
          if (response.data.success) {
            // Update user verification status
            set((state) => ({
              user: {
                ...state.user,
                isVerified: true
              },
              loading: false
            }));
            
            const message = response.data.message || "Email verified successfully";
            toast.success(message);
            return { success: true, message };
          }
          
          set({ loading: false });
          const errorMsg = response.data.message || "Verification failed";
          toast.error(errorMsg);
          return { success: false, message: errorMsg };
          
        } catch (error) {
          console.error("Email verification error:", error);
          set({ loading: false });
          
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              "Verification failed";
          
          toast.error(errorMessage);
          return { success: false, message: errorMessage };
        }
      },

      // Enhanced send reset OTP
      sendResetOtp: async (email) => {
        try {
          set({ loading: true, error: null });
          
          const response = await api.post("/auth/send-reset-password", {
            email,
          });
          
          if (response.data.success) {
            const message = response.data.message || "Reset OTP sent successfully";
            toast.success(message);
            set({ loading: false, error: null });
            return { success: true, message };
          }
          
          const errorMsg = response.data.message || "Failed to send reset OTP";
          set({ loading: false, error: errorMsg });
          toast.error(errorMsg);
          return { success: false, message: errorMsg };
          
        } catch (error) {
          console.error("Send reset OTP error:", error);
          
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              "Failed to send reset OTP";
          
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          return { success: false, message: errorMessage };
        }
      },

      // Enhanced password reset
      resetPassword: async (formdata) => {
        try {
          set({ loading: true, error: null });
          
          const response = await api.post("/auth/reset-password", formdata);
          
          if (response.data.success) {
            const message = response.data.message || "Password reset successfully";
            toast.success(message);
            set({ loading: false, error: null });
            
            // Optional: Redirect to login
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
            
            return { success: true, message };
          }
          
          const errorMsg = response.data.message || "Password reset failed";
          set({ loading: false, error: errorMsg });
          toast.error(errorMsg);
          return { success: false, message: errorMsg };
          
        } catch (error) {
          console.error("Password reset error:", error);
          
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              "Password reset failed";
          
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          return { success: false, message: errorMessage };
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('🔄 Rehydrating auth state...');
          
          // Set hydration flag
          const store = get();
          store.setHasHydrated();
          
          // Check auth status after hydration
          if (state.isAuthenticated && state.accessToken) {
            console.log('🔄 Checking auth status after rehydration...');
            
            // Delay to ensure app is fully loaded
            setTimeout(() => {
              store.checkAuthStatus().then((isValid) => {
                if (isValid) {
                  console.log('✅ Auth state validated after rehydration');
                } else {
                  console.log('❌ Auth state invalid after rehydration');
                }
              });
            }, 1000);
          }
        }
      },
    }
  )
);

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = useAuthStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to check if user is authenticated
export const isUserAuthenticated = () => {
  const state = useAuthStore.getState();
  return state.isAuthenticated && state.accessToken && state.isTokenValid();
};

export default useAuthStore;
