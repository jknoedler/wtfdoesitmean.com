
import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle } from "lucide-react";

export default function TOSAcceptance() {
  const navigate = useNavigate();
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  // Removed handleScroll and hasReadToBottom state as per outline
  // const [hasReadToBottom, setHasReadToBottom] = useState(false);
  // const handleScroll = (e) => {
  //   const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;
  //   if (bottom) {
  //     setHasReadToBottom(true);
  //   }
  // };

  const handleAccept = async () => {
    if (!hasAccepted) {
      alert("Please check the box to confirm you've read and accept the Terms of Service");
      return;
    }

    setIsAccepting(true);
    try {
      await api.auth.updateMe({
        has_accepted_tos: true,
        tos_accepted_date: new Date().toISOString()
      });
      
      // Redirect to Privacy Policy acceptance
      navigate(createPageUrl("PrivacyPolicyAcceptance"));
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
              Please review and accept our Terms of Service
            </p>
          </div>

          {/* Scrollable TOS Content */}
          <div 
            className="neuro-pressed rounded-2xl p-6 mb-6 max-h-96 overflow-y-auto"
            // onScroll={handleScroll} // Removed as per outline
          >
            <h2 className="text-xl font-medium text-[#d0d0d0] mb-4">Terms of Service</h2>
            <p className="text-xs text-[#707070] mb-6">Last updated: November 03, 2025</p>

            <div className="space-y-4 text-xs text-[#909090] leading-relaxed">
              <p>
                We are Dead Entertainment, doing business as Soundope. We operate https://soundope.com and related services. 
                By accessing the Services, you agree to be bound by these Legal Terms.
              </p>

              <div>
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">User Representations</h3>
                <p className="mb-2">By using the Services, you represent that:</p>
                <ul className="space-y-1 ml-4 text-[10px]">
                  <li>• All information you submit is true, accurate, and complete</li>
                  <li>• You have the legal capacity to comply with these Terms</li>
                  <li>• You are not under the age of 13</li>
                  <li>• You will not use the Services for illegal purposes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">User-Generated Content</h3>
                <p>
                  When you submit content (music, reviews, comments), you represent that you own or have rights to use it, 
                  it doesn't infringe third-party rights, and it's not false, misleading, or spam.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">Prohibited Activities</h3>
                <p className="mb-1">You agree not to:</p>
                <ul className="space-y-1 ml-4 text-[10px]">
                  <li>• Trick, defraud, or mislead us or other users</li>
                  <li>• Circumvent security features of the Services</li>
                  <li>• Upload viruses or malicious material</li>
                  <li>• Use the Services for illegal activities</li>
                  <li>• Harass, abuse, or harm other users</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">Refunds & Payments</h3>
                <p>
                  All sales are final. No refunds will be issued. We accept Visa, Mastercard, and PayPal. 
                  Prices are in US dollars and subject to change at any time.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">Disclaimer & Liability</h3>
                <p>
                  The Services are provided "AS-IS" and "AS-AVAILABLE." We are not liable for indirect, incidental, 
                  or consequential damages. Your use is at your sole risk.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">Governing Law</h3>
                <p>
                  These Terms are governed by the laws of the State of California. Disputes will be resolved through 
                  binding arbitration in California.
                </p>
              </div>

              <div className="neuro-flat rounded-xl p-4 mt-6">
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">Contact Us</h3>
                <p className="text-[10px] mb-2">For questions or concerns, contact:</p>
                <div className="space-y-1 text-[10px] text-[#a0a0a0]">
                  <p><strong>Dead Entertainment</strong></p>
                  <p>6431 Old Hwy 99 S, spc 24, Yreka CA. 96097, United States</p>
                  <p className="mt-2">Email: jknoedler@soundope.com</p>
                  <p>Phone: (+1)310-654-9172</p>
                </div>
              </div>

              {/* Scroll indicator at bottom - Removed as per outline */}
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
              // disabled={!hasReadToBottom} // Removed as per outline
              className={`w-full neuro-flat rounded-2xl p-4 flex items-start gap-3 text-left smooth-transition ${
                // hasReadToBottom ? 'hover:scale-[1.01] cursor-pointer' : 'opacity-40 cursor-not-allowed' // Simplified as per outline
                'hover:scale-[1.01] cursor-pointer'
              }`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                hasAccepted ? 'neuro-pressed' : 'neuro-base'
              }`}>
                {hasAccepted && <CheckCircle className="w-4 h-4 text-[#90b090]" />}
              </div>
              <div>
                <p className="text-sm text-[#d0d0d0] mb-1">
                  I have read and accept the Terms of Service
                </p>
                <p className="text-xs text-[#707070]">
                  By checking this box, you agree to the terms and conditions outlined above
                </p>
              </div>
            </button>
          </div>

          {/* Accept Button */}
          <Button
            onClick={handleAccept}
            // disabled={!hasReadToBottom || !hasAccepted || isAccepting} // Simplified as per outline
            disabled={!hasAccepted || isAccepting}
            className={`w-full rounded-2xl py-6 text-lg ${
              // hasReadToBottom && hasAccepted && !isAccepting // Simplified as per outline
              hasAccepted && !isAccepting
                ? 'neuro-base active:neuro-pressed hover:scale-[1.02] cursor-pointer text-[#b0b0b0]'
                : 'neuro-pressed opacity-40 cursor-not-allowed text-[#606060]'
            }`}
          >
            {isAccepting ? 'Accepting...' : 'Accept & Continue'}
          </Button>

          {/* Removed as per outline */}
          {/* {!hasReadToBottom && (
            <p className="text-xs text-[#606060] text-center mt-4">
              Please scroll through and read the entire agreement to continue
            </p>
          )} */}
        </div>
      </div>
    </div>
  );
}
