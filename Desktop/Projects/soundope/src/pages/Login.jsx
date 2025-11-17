import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { api } from "@/api/apiClient";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Login - Soundope";
    
    // Handle OAuth callback with token
    const token = searchParams.get('token');
    
    if (token) {
      // OAuth callback - set token and redirect
      api.setToken(token);
      const redirectUrl = searchParams.get('redirect') || createPageUrl("Dashboard");
      // Remove token from URL
      window.history.replaceState({}, '', window.location.pathname);
      navigate(redirectUrl);
      return;
    }
    
    // Handle OAuth errors
    const oauthError = searchParams.get('error');
    if (oauthError) {
      switch (oauthError) {
        case 'oauth_failed':
          setError("Google login failed. Please try again.");
          break;
        case 'no_email':
          setError("Google account doesn't have an email address.");
          break;
        case 'account_disabled':
          setError("Your account has been disabled.");
          break;
        case 'oauth_error':
          setError("An error occurred during Google login.");
          break;
        default:
          setError("Login failed. Please try again.");
      }
    }
    
    // Check if already logged in
    const checkAuth = async () => {
      try {
        const user = await api.auth.me();
        if (user) {
          // Already logged in, redirect
          const redirectUrl = searchParams.get('redirect') || createPageUrl("Dashboard");
          navigate(redirectUrl);
        }
      } catch (error) {
        // Not logged in, continue
      }
    };
    
    checkAuth();
  }, [navigate, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.auth.login(email, password);
      
      if (response && response.token) {
        // Check if user is using default password "password"
        if (password === 'password') {
          // Redirect to change password page
          window.location.href = createPageUrl("ChangePassword");
        } else {
          // Login successful, redirect
          const redirectUrl = searchParams.get('redirect') || createPageUrl("Dashboard");
          window.location.href = redirectUrl;
        }
      } else {
        setError(response?.message || "Login failed. Please check your email and password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pt-24">
      <div className="w-full max-w-md">
        <div className="neuro-base rounded-3xl p-8 md:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69083db69ccd1df29c9359c8/75bae40a0_soundopepngnoname.jpg"
              alt="Soundope Logo"
              width="120"
              height="120"
              className="h-24 w-24 object-contain logo-blend"
            />
          </div>

          <h1 className="text-2xl md:text-3xl font-light text-[#d0d0d0] text-center mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-[#808080] text-center mb-8">
            Sign in to continue discovering music
          </p>

          {error && (
            <div className="mb-6 neuro-pressed rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#b09090] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#b09090] flex-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-[#a0a0a0]">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#606060]" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                  className="pl-11 bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#606060] neuro-pressed rounded-xl h-12"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-[#a0a0a0]">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#606060]" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  className="pl-11 bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#606060] neuro-pressed rounded-xl h-12"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full neuro-base active:neuro-pressed rounded-xl h-12 text-[#d0d0d0] font-medium smooth-transition hover:scale-[1.02] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2a2a2a]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-[#141414] text-[#707070]">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => {
                const redirectUrl = searchParams.get('redirect') || createPageUrl("Dashboard");
                window.location.href = `/api/auth/google?state=${encodeURIComponent(redirectUrl)}`;
              }}
              disabled={isLoading}
              className="w-full mt-4 neuro-flat rounded-xl h-12 text-[#d0d0d0] font-medium smooth-transition hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#707070]">
              Don't have an account?{" "}
              <button
                onClick={() => navigate(createPageUrl("Home"))}
                className="text-[#a0a0a0] hover:text-[#d0d0d0] smooth-transition underline"
              >
                Get Started
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

