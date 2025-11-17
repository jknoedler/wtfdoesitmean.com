import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/apiClient";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, AlertCircle, CheckCircle } from "lucide-react";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    document.title = "Change Password - Soundope";
    
    const loadUser = async () => {
      try {
        const user = await api.auth.me();
        if (!user) {
          navigate(createPageUrl("Login"));
          return;
        }
        setCurrentUser(user);
      } catch (error) {
        navigate(createPageUrl("Login"));
      }
    };
    
    loadUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setIsLoading(true);

    try {
      // First verify current password by attempting login
      try {
        const loginResponse = await api.auth.login(currentUser.email, currentPassword);
        
        if (!loginResponse || !loginResponse.token) {
          setError("Current password is incorrect");
          setIsLoading(false);
          return;
        }
      } catch (loginError) {
        setError("Current password is incorrect");
        setIsLoading(false);
        return;
      }

      // Update password via API
      const response = await api.auth.updateMe({
        password: newPassword
      });

      if (response) {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate(createPageUrl("Dashboard"));
        }, 2000);
      }
    } catch (error) {
      console.error("Change password error:", error);
      setError(error.message || "Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pt-24">
      <div className="w-full max-w-md">
        <div className="neuro-base rounded-3xl p-8 md:p-10">
          <h1 className="text-2xl md:text-3xl font-light text-[#d0d0d0] text-center mb-2">
            Change Password
          </h1>
          <p className="text-sm text-[#808080] text-center mb-8">
            Please set a new password for your account
          </p>

          {error && (
            <div className="mb-6 neuro-pressed rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#b09090] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#b09090] flex-1">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 neuro-pressed rounded-xl p-4 flex items-start gap-3 bg-[#1a2a1a]">
              <CheckCircle className="w-5 h-5 text-[#90b090] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-[#90b090] font-medium">Password changed successfully!</p>
                <p className="text-xs text-[#707070] mt-1">Redirecting to dashboard...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm text-[#a0a0a0]">
                Current Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#606060]" />
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  disabled={isLoading || success}
                  className="pl-11 bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#606060] neuro-pressed rounded-xl h-12"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm text-[#a0a0a0]">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#606060]" />
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 8 characters)"
                  required
                  disabled={isLoading || success}
                  className="pl-11 bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#606060] neuro-pressed rounded-xl h-12"
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm text-[#a0a0a0]">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#606060]" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  disabled={isLoading || success}
                  className="pl-11 bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#606060] neuro-pressed rounded-xl h-12"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || success}
              className="w-full neuro-base active:neuro-pressed rounded-xl h-12 text-[#d0d0d0] font-medium smooth-transition hover:scale-[1.02] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Changing password...
                </>
              ) : success ? (
                "Password Changed!"
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

