import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function CookieBanner() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
    navigate(createPageUrl("CookiesRequired"));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-28 md:bottom-8 left-0 right-0 z-[200] p-4">
      <div className="max-w-4xl mx-auto neuro-base rounded-3xl p-6 shadow-2xl border border-[#2a2a2a]">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🍪</span>
              <h3 className="text-lg font-medium text-[#d0d0d0]">Soundope uses cookies</h3>
            </div>
            <p className="text-sm text-[#909090] leading-relaxed">
              We use cookies to improve your experience, analyze usage, and deliver personalized content. 
              By continuing, you agree to our{" "}
              <Link 
                to={createPageUrl("CookiePolicy")} 
                className="text-[#a0a0a0] hover:text-[#c0c0c0] underline"
                target="_blank"
              >
                Cookie Policy
              </Link>
              {" "}and{" "}
              <Link 
                to={createPageUrl("PrivacyPolicy")} 
                className="text-[#a0a0a0] hover:text-[#c0c0c0] underline"
                target="_blank"
              >
                Privacy Notice
              </Link>.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={handleDecline}
              className="neuro-flat rounded-2xl px-6 py-3 text-sm text-[#808080] hover:text-[#a0a0a0] smooth-transition"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="neuro-base active:neuro-pressed rounded-2xl px-6 py-3 text-sm text-[#b0b0b0] font-medium smooth-transition hover:scale-105"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}