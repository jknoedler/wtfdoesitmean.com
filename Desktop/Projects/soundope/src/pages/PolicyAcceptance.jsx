
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle } from "lucide-react";

export default function PolicyAcceptance() {
  const navigate = useNavigate();
  // Removed hasReadToBottom state
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  // Removed handleScroll function

  const handleAccept = async () => {
    if (!hasAccepted) {
      alert("Please check the box to confirm you've read and accept the Cookie Policy");
      return;
    }

    setIsAccepting(true);
    try {
      await api.auth.updateMe({
        has_accepted_policies: true,
        policies_accepted_date: new Date().toISOString()
      });
      
      // Redirect to Settings to complete profile setup
      navigate(createPageUrl("Settings"));
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
              Before you begin, please review and accept our Cookie Policy
            </p>
          </div>

          {/* Scrollable Policy Content */}
          <div 
            className="neuro-pressed rounded-2xl p-6 mb-6 max-h-96 overflow-y-auto"
            // Removed onScroll={handleScroll}
          >
            <h2 className="text-xl font-medium text-[#d0d0d0] mb-4">Cookie Policy</h2>
            <p className="text-xs text-[#707070] mb-6">Updated: November 03, 2025</p>

            <div className="space-y-4 text-sm text-[#909090] leading-relaxed">
              <p>
                This Cookie Policy explains how Dead Entertainment ("Company," "we," "us," and "our") uses cookies 
                and similar technologies to recognize you when you visit https://soundope.com ("Website"). It explains 
                what these technologies are, why we use them, and your rights to control our use of them. In some cases, 
                cookies may collect personal information or be combined with other data to identify you. This policy 
                applies to all users, including those in the European Union.
              </p>

              <div>
                <h3 className="text-base font-medium text-[#d0d0d0] mb-2">What Are Cookies?</h3>
                <p>
                  Cookies are small data files placed on your computer or mobile device when you visit a website. They 
                  are widely used to make websites work, improve efficiency, and provide reporting information. Cookies 
                  set by Dead Entertainment are called "first-party cookies." Cookies set by other parties are "third-party 
                  cookies," used for advertising, analytics, and embedded services.
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium text-[#d0d0d0] mb-2">Why We Use Cookies</h3>
                <p className="mb-2">We use cookies for several reasons:</p>
                <ul className="space-y-2 ml-4 text-xs">
                  <li>
                    <strong className="text-[#a0a0a0]">Essential Cookies</strong> are required for core functionality 
                    such as login, session management, and security.
                  </li>
                  <li>
                    <strong className="text-[#a0a0a0]">Performance Cookies</strong> help us understand how users 
                    interact with the site (e.g., page load times, navigation patterns).
                  </li>
                  <li>
                    <strong className="text-[#a0a0a0]">Functionality Cookies</strong> enable enhanced features like 
                    saved preferences, language settings, and personalized layouts.
                  </li>
                  <li>
                    <strong className="text-[#a0a0a0]">Targeting Cookies</strong> are used by us or third-party 
                    partners to deliver relevant ads and measure campaign effectiveness.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-medium text-[#d0d0d0] mb-2">Your Cookie Choices</h3>
                <p>
                  When you visit our site, you may be presented with a cookie banner or consent manager that allows 
                  you to accept or reject non-essential cookies. You can modify your preferences at any time through 
                  your browser settings or the consent tool (if available).
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium text-[#d0d0d0] mb-2">Cookie Duration</h3>
                <p>
                  Cookies may remain on your device for varying durations. Session cookies expire when you close your 
                  browser. Persistent cookies remain until manually deleted or after a set expiration (e.g., 30 minutes 
                  to 2 years). Specific cookie durations are listed in our internal cookie registry and may be disclosed 
                  upon request.
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium text-[#d0d0d0] mb-2">Your Rights (EU Users)</h3>
                <p>
                  If you are located in the European Union, you have the right to access your personal data, request 
                  deletion or correction, withdraw consent for non-essential cookies, and file a complaint with your 
                  local data protection authority. For more details, please refer to our Privacy Policy or contact us 
                  directly.
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium text-[#d0d0d0] mb-2">Policy Updates</h3>
                <p>
                  We may update this Cookie Policy to reflect changes in technology, legal requirements, or our practices. 
                  The date at the top indicates the latest revision.
                </p>
              </div>

              <div className="neuro-flat rounded-xl p-4 mt-6">
                <h3 className="text-base font-medium text-[#d0d0d0] mb-2">Contact Us</h3>
                <p className="text-xs mb-2">For questions about cookies or your data rights, contact:</p>
                <div className="space-y-1 text-xs text-[#a0a0a0]">
                  <p><strong>Dead Entertainment</strong></p>
                  <p>6431 Old Hwy 99 S</p>
                  <p>Yreka CA. 96097</p>
                  <p>United States</p>
                  <p className="mt-2">Email: jknoedler@soundope.come</p>
                  <p>Phone: (+1)360-547-1912</p>
                </div>
              </div>

              {/* Removed Scroll indicator */}
            </div>
          </div>

          {/* Acceptance Checkbox */}
          <div className="mb-6">
            <button
              onClick={() => setHasAccepted(!hasAccepted)}
              // Removed disabled={!hasReadToBottom}
              className={`w-full neuro-flat rounded-2xl p-4 flex items-start gap-3 text-left smooth-transition hover:scale-[1.01] cursor-pointer`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                hasAccepted ? 'neuro-pressed' : 'neuro-base'
              }`}>
                {hasAccepted && <CheckCircle className="w-4 h-4 text-[#90b090]" />}
              </div>
              <div>
                <p className="text-sm text-[#d0d0d0] mb-1">
                  I have read and accept the Cookie Policy
                </p>
                <p className="text-xs text-[#707070]">
                  By checking this box, you agree to our use of cookies as described above
                </p>
              </div>
            </button>
          </div>

          {/* Accept Button */}
          <Button
            onClick={handleAccept}
            disabled={!hasAccepted || isAccepting} // Updated disabled prop
            className={`w-full rounded-2xl py-6 text-lg ${
              hasAccepted && !isAccepting // Updated className logic
                ? 'neuro-base active:neuro-pressed hover:scale-[1.02] cursor-pointer text-[#b0b0b0]'
                : 'neuro-pressed opacity-40 cursor-not-allowed text-[#606060]'
            }`}
          >
            {isAccepting ? 'Accepting...' : 'Accept & Continue'}
          </Button>

          {/* Removed bottom reminder */}
        </div>
      </div>
    </div>
  );
}
