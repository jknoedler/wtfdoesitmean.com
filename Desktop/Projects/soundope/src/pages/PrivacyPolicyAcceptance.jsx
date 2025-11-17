
import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle } from "lucide-react";

export default function PrivacyPolicyAcceptance() {
  const navigate = useNavigate();
  // Removed: const [hasReadToBottom, setHasReadToBottom] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  // Removed: handleScroll function
  // const handleScroll = (e) => {
  //   const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;
  //   if (bottom) {
  //     setHasReadToBottom(true);
  //   }
  // };

  const handleAccept = async () => {
    if (!hasAccepted) {
      alert("Please check the box to confirm you've read and accept the Privacy Policy");
      return;
    }

    setIsAccepting(true);
    try {
      await api.auth.updateMe({
        has_accepted_privacy: true,
        privacy_accepted_date: new Date().toISOString()
      });
      
      // Redirect to Cookie Policy acceptance
      navigate(createPageUrl("PolicyAcceptance"));
    } catch (error) {
      alert("Failed to save. Please try again.");
      setIsAccepting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 flex items-center justify-center">
      <div className="max-w-3xl w-full">
        <div className="neuro-base rounded-3xl p-8">
          {/* Header with Branding */}
          <div className="text-center mb-8">
            <Link to={createPageUrl("Home")} className="flex items-center justify-center gap-2 mb-4">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69083db69ccd1df29c9359c8/75bae40a0_soundopepngnoname.jpg"
                alt="Soundope Skull Logo"
                className="h-16 w-16 object-contain logo-blend"
              />
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/41568faaa_Screenshot2025-11-02at23401PM.png"
                alt="Soundope"
                className="h-10 object-contain logo-blend"
              />
            </Link>
            <div className="neuro-pressed w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-10 h-10 text-[#a0a0a0]" />
            </div>
            <h1 className="text-3xl font-light text-[#d0d0d0] mb-3">Welcome to Soundope!</h1>
            <p className="text-sm text-[#808080]">
              Please review and accept our Privacy Policy
            </p>
          </div>

          {/* Scrollable Privacy Policy Content */}
          <div 
            className="neuro-pressed rounded-2xl p-6 mb-6 max-h-96 overflow-y-auto"
            // Removed: onScroll={handleScroll}
          >
            <h2 className="text-xl font-medium text-[#d0d0d0] mb-4">Privacy Notice</h2>
            <p className="text-xs text-[#707070] mb-6">Last updated: November 03, 2025</p>

            <div className="space-y-4 text-xs text-[#909090] leading-relaxed">
              <p>
                This Privacy Notice describes how we collect, store, use, and share your personal information when you 
                use our Services at https://soundope.com.
              </p>

              <div>
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">What We Collect</h3>
                <p className="mb-2">
                  We collect personal information you provide (name, email, profile data) and information collected 
                  automatically (IP address, device info, usage data).
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">How We Use Your Information</h3>
                <p>
                  We process your information to provide, improve, and administer our Services, communicate with you, 
                  for security and fraud prevention, and to comply with law.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">Information Sharing</h3>
                <p className="mb-1">We may share information:</p>
                <ul className="space-y-1 ml-4 text-[10px]">
                  <li>• In business transfers (mergers, acquisitions)</li>
                  <li>• With affiliates and business partners</li>
                  <li>• When required by law</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">Cookies & Tracking</h3>
                <p>
                  We use cookies and similar technologies to collect and store information. See our Cookie Policy for details.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">Your Rights</h3>
                <p className="mb-1">You have the right to:</p>
                <ul className="space-y-1 ml-4 text-[10px]">
                  <li>• Access your personal information</li>
                  <li>• Request corrections or deletions</li>
                  <li>• Withdraw consent at any time</li>
                  <li>• Terminate your account</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">Data Retention</h3>
                <p>
                  We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice, 
                  unless a longer retention period is required by law.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">Minors</h3>
                <p>
                  We do not knowingly collect data from children under 18. If we learn such data has been collected, 
                  we will promptly delete it.
                </p>
              </div>

              <div className="neuro-flat rounded-xl p-4 mt-6">
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">Contact Us</h3>
                <p className="text-[10px] mb-2">For privacy questions or concerns, contact:</p>
                <div className="space-y-1 text-[10px] text-[#a0a0a0]">
                  <p><strong>Dead Entertainment</strong></p>
                  <p>6431 Old Hwy 99 S, Yreka CA. 96097, United States</p>
                  <p className="mt-2">Email: jknoedler@soundope.com</p>
                </div>
              </div>

              {/* Removed: Scroll indicator at bottom */}
              {/* {!hasReadToBottom && (
                <div className="text-center pt-4 pb-2">
                  <p className="text-xs text-[#606060] animate-pulse">
                    ↓ Scroll to bottom to continue ↓
                  </p>
                </div>
              )} */}
            </div>
          </div>

          {/* Acceptance Checkbox */}
          <div className="mb-6">
            <button
              onClick={() => setHasAccepted(!hasAccepted)}
              // Removed: disabled={!hasReadToBottom}
              className={`w-full neuro-flat rounded-2xl p-4 flex items-start gap-3 text-left smooth-transition hover:scale-[1.01] cursor-pointer`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                hasAccepted ? 'neuro-pressed' : 'neuro-base'
              }`}>
                {hasAccepted && <CheckCircle className="w-4 h-4 text-[#90b090]" />}
              </div>
              <div>
                <p className="text-sm text-[#d0d0d0] mb-1">
                  I have read and accept the Privacy Policy
                </p>
                <p className="text-xs text-[#707070]">
                  By checking this box, you agree to how we collect, use, and protect your information
                </p>
              </div>
            </button>
          </div>

          {/* Accept Button */}
          <Button
            onClick={handleAccept}
            disabled={!hasAccepted || isAccepting}
            className={`w-full rounded-2xl py-6 text-lg ${
              hasAccepted && !isAccepting
                ? 'neuro-base active:neuro-pressed hover:scale-[1.02] cursor-pointer text-[#b0b0b0]'
                : 'neuro-pressed opacity-40 cursor-not-allowed text-[#606060]'
            }`}
          >
            {isAccepting ? 'Accepting...' : 'Accept & Continue'}
          </Button>

          {/* Removed: explanatory text */}
          {/* {!hasReadToBottom && (
            <p className="text-xs text-[#606060] text-center mt-4">
              Please scroll through and read the entire policy to continue
            </p>
          )} */}
        </div>
      </div>
    </div>
  );
}
