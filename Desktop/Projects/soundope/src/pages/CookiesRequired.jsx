
import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { ShieldX, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookiesRequired() {
  const navigate = useNavigate();

  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    navigate(createPageUrl("Home"));
    window.location.reload(); // Reload to apply changes
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        <div className="neuro-base rounded-3xl p-8">
          {/* Icon with Branding */}
          <div className="text-center mb-6">
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
              <ShieldX className="w-10 h-10 text-[#a08080]" />
            </div>
            <h1 className="text-3xl font-light text-[#d0d0d0] mb-3">
              Cookies Required to Use Soundope
            </h1>
          </div>

          {/* Explanation */}
          <div className="space-y-4 mb-8 text-sm text-[#909090] leading-relaxed">
            <p>
              To protect your privacy and ensure platform integrity, Soundope requires cookie consent to operate. 
              Cookies help us manage login sessions, feedback tools, and supporter interactions. Without them, 
              the site cannot function properly.
            </p>

            <p>
              If you have questions about this requirement, please review our{" "}
              <Link 
                to={createPageUrl("CookiePolicy")} 
                className="text-[#a0a0a0] hover:text-[#c0c0c0] underline"
                target="_blank"
              >
                Cookie Policy
              </Link>,{" "}
              <Link 
                to={createPageUrl("PrivacyPolicy")} 
                className="text-[#a0a0a0] hover:text-[#c0c0c0] underline"
                target="_blank"
              >
                Privacy Notice
              </Link>, or contact us.
            </p>
          </div>

          {/* Accept Button */}
          <div className="mb-8">
            <Button
              onClick={handleAcceptCookies}
              className="w-full neuro-base active:neuro-pressed rounded-2xl py-6 text-base font-medium text-[#b0b0b0] smooth-transition hover:scale-[1.02]"
            >
              Accept All Cookies & Continue
            </Button>
          </div>

          {/* Contact Section */}
          <div className="neuro-flat rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-[#808080]" />
              <h3 className="text-sm font-medium text-[#d0d0d0]">Need Help or Have Questions?</h3>
            </div>
            
            <p className="text-xs text-[#808080] mb-4">
              For appeals, legal inquiries, or opt-out clarification, please contact us:
            </p>
            
            <div className="space-y-2">
              <a 
                href="mailto:jknoedler@soundope.com"
                className="block text-sm text-[#a0a0a0] hover:text-[#c0c0c0] smooth-transition"
              >
                jknoedler@soundope.com
              </a>
              <a 
                href="mailto:k.debey@soundope.com"
                className="block text-sm text-[#a0a0a0] hover:text-[#c0c0c0] smooth-transition"
              >
                k.debey@soundope.com
              </a>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="mt-6 pt-6 border-t border-[#1f1f1f]">
            <p className="text-xs text-[#707070] mb-3 text-center">Learn More About Our Policies</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to={createPageUrl("CookiePolicy")}
                target="_blank"
                className="neuro-flat rounded-xl px-4 py-2 text-xs text-[#808080] hover:text-[#a0a0a0] smooth-transition hover:scale-105"
              >
                <FileText className="w-3 h-3 inline mr-1" />
                Cookie Policy
              </Link>
              <Link
                to={createPageUrl("PrivacyPolicy")}
                target="_blank"
                className="neuro-flat rounded-xl px-4 py-2 text-xs text-[#808080] hover:text-[#a0a0a0] smooth-transition hover:scale-105"
              >
                <FileText className="w-3 h-3 inline mr-1" />
                Privacy Policy
              </Link>
              <Link
                to={createPageUrl("TOS")}
                target="_blank"
                className="neuro-flat rounded-xl px-4 py-2 text-xs text-[#808080] hover:text-[#a0a0a0] smooth-transition hover:scale-105"
              >
                <FileText className="w-3 h-3 inline mr-1" />
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
