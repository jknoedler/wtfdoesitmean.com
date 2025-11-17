
import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle } from "lucide-react";

export default function EULAAcceptance() {
  const navigate = useNavigate();
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    if (!hasAccepted) {
      alert("Please check the box to confirm you've read and accept the End User License Agreement");
      return;
    }

    setIsAccepting(true);
    try {
      await api.auth.updateMe({
        has_accepted_eula: true,
        eula_accepted_date: new Date().toISOString()
      });
      
      // Redirect to Terms of Service acceptance
      navigate(createPageUrl("TOSAcceptance"));
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
              Before you begin, please review and accept our End User License Agreement
            </p>
          </div>

          {/* Scrollable EULA Content */}
          <div 
            className="neuro-pressed rounded-2xl p-6 mb-6 max-h-96 overflow-y-auto"
          >
            <h2 className="text-xl font-medium text-[#d0d0d0] mb-4">End User License Agreement</h2>
            <p className="text-xs text-[#707070] mb-6">Last updated: November 03, 2025</p>

            <div className="space-y-4 text-xs text-[#909090] leading-relaxed">
              <p>
                This Agreement is provided to You (End-User) by Soundope, located at 6431 Old Hwy 99 S, Yreka, CA 96097 
                ("Licensor"), for use only under the terms of this License Agreement.
              </p>

              <div>
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">The Application</h3>
                <p>
                  Soundope ("Licensed Application") is a piece of software created to facilitate music submission, feedback, 
                  and discovery. It is used to allow artists to submit original music for feedback and ranking, while 
                  supporters engage through listening, voting, and discovery.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">Scope of License</h3>
                <p>
                  You are given a non-transferable, non-exclusive, non-sublicensable license to install and use the Licensed 
                  Application on any Devices that You own or control.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">User-Generated Contributions</h3>
                <p className="mb-2">
                  When you create or make available any Contributions (music, text, comments), you represent and warrant that:
                </p>
                <ul className="space-y-1 ml-4 text-[10px]">
                  <li>• You own or have rights to use the content</li>
                  <li>• Your content does not infringe third-party rights</li>
                  <li>• Your contributions are not false, misleading, or spam</li>
                  <li>• You have consent from identifiable individuals in your content</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">Liability & Warranty</h3>
                <p>
                  Licensor warrants that the Licensed Application is free of malware at download. You use the application 
                  at your own risk. Dead Entertainment is not liable for damages beyond gross negligence or intent.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">Termination</h3>
                <p>
                  The license is valid until terminated by Dead Entertainment or by You. Your rights will terminate 
                  automatically if You fail to adhere to any terms.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">Governing Law</h3>
                <p>
                  This License Agreement is governed by the laws of the State of California, excluding its conflicts 
                  of law rules.
                </p>
              </div>

              <div className="neuro-flat rounded-xl p-4 mt-6">
                <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">Contact Us</h3>
                <p className="text-[10px] mb-2">For questions or concerns, contact:</p>
                <div className="space-y-1 text-[10px] text-[#a0a0a0]">
                  <p><strong>Dead Entertainment</strong></p>
                  <p>6431 Old Hwy 99 S, Yreka CA. 96097, United States</p>
                  <p className="mt-2">Email: jknoedler@soundope.com</p>
                  <p>Phone: (+1)360-547-1912</p>
                </div>
              </div>
            </div>
          </div>

          {/* Acceptance Checkbox */}
          <div className="mb-6">
            <button
              onClick={() => setHasAccepted(!hasAccepted)}
              className="w-full neuro-flat rounded-2xl p-4 flex items-start gap-3 text-left smooth-transition hover:scale-[1.01] cursor-pointer"
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                hasAccepted ? 'neuro-pressed' : 'neuro-base'
              }`}>
                {hasAccepted && <CheckCircle className="w-4 h-4 text-[#90b090]" />}
              </div>
              <div>
                <p className="text-sm text-[#d0d0d0] mb-1">
                  I have read and accept the End User License Agreement
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
            disabled={!hasAccepted || isAccepting}
            className={`w-full rounded-2xl py-6 text-lg ${
              hasAccepted && !isAccepting
                ? 'neuro-base active:neuro-pressed hover:scale-[1.02] cursor-pointer text-[#b0b0b0]'
                : 'neuro-pressed opacity-40 cursor-not-allowed text-[#606060]'
            }`}
          >
            {isAccepting ? 'Accepting...' : 'Accept & Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
