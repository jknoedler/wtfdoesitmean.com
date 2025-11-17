
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, Zap, CheckCircle, XCircle } from "lucide-react";

export default function BuyCredits() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [error, setError] = useState(""); // New state for error messages

  const creditPackages = [
    { credits: 5, price: "$5", best: false },
    { credits: 10, price: "$9", best: false },
    { credits: 20, price: "$15", best: false },
    { credits: 125, price: "$50", best: true, savings: "Save $75!" }
  ];

  useEffect(() => {
    // Add SEO meta tags
    document.title = "Buy Music Promotion Credits - Boost Your Tracks | Soundope";
    
    const metaTags = [
      { type: 'name', key: 'description', content: "Purchase credits to promote your music on Soundope. Boost your tracks, get more visibility, and reach more listeners. Affordable music promotion packages." },
      { type: 'name', key: 'keywords', content: "buy music credits, music promotion credits, boost music tracks, purchase promotion, music marketing credits, affordable music promotion" },
    ];

    metaTags.forEach(({ type, key, content }) => {
      let tag = document.querySelector(`meta[${type}="${key}"]`);
      if (tag) {
        tag.setAttribute('content', content);
      } else {
        tag = document.createElement('meta');
        tag.setAttribute(type, key);
        tag.setAttribute('content', content);
        document.head.appendChild(tag);
      }
    });

    loadUser();
    
    // Check for payment status in URL
    const params = new URLSearchParams(location.search);
    if (params.get('payment') === 'success') {
      setShowSuccess(true);
      setError(""); // Clear any previous errors on success
      setTimeout(() => {
        setShowSuccess(false);
        navigate(createPageUrl("BuyCredits"), { replace: true });
      }, 3000);
    } else if (params.get('payment') === 'cancelled') {
      setShowCancelled(true);
      setError(""); // Clear any previous errors on cancelled
      setTimeout(() => {
        setShowCancelled(false);
        navigate(createPageUrl("BuyCredits"), { replace: true });
      }, 3000);
    }
  }, [location]);

  const loadUser = async () => {
    try {
      const user = await api.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
      setError("Failed to load user data.");
    }
  };

  const handlePurchase = async (credits) => {
    try {
      setIsProcessing(true);
      setError(""); // Clear any previous errors
      
      const response = await api.functions.invoke('stripeCheckout', { credits });
      
      console.log('Checkout response:', response); // Debug log
      
      // Redirect to Stripe checkout - MUST use window.top to break out of iframe
      if (response.data && response.data.url) {
        window.top.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError(error.message || "Failed to start checkout. Please try again.");
      setIsProcessing(false);
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
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {showSuccess && (
          <div className="neuro-base rounded-3xl p-6 mb-8 flex items-center gap-4">
            <CheckCircle className="w-8 h-8 text-[#90b090]" />
            <div>
              <h3 className="text-lg font-medium text-[#d0d0d0] mb-1">Payment Successful!</h3>
              <p className="text-sm text-[#909090]">Your premium credits have been added to your account.</p>
            </div>
          </div>
        )}

        {showCancelled && (
          <div className="neuro-base rounded-3xl p-6 mb-8 flex items-center gap-4">
            <XCircle className="w-8 h-8 text-[#b09090]" />
            <div>
              <h3 className="text-lg font-medium text-[#d0d0d0] mb-1">Payment Cancelled</h3>
              <p className="text-sm text-[#909090]">Your payment was cancelled. No charges were made.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="neuro-base rounded-3xl p-6 mb-8 flex items-center gap-4 border-2 border-[#b09090]">
            <XCircle className="w-8 h-8 text-[#b09090]" />
            <div>
              <h3 className="text-lg font-medium text-[#d0d0d0] mb-1">Checkout Error</h3>
              <p className="text-sm text-[#909090]">{error}</p>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="neuro-base w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center">
            <Zap className="w-10 h-10 text-[#a0a0a0]" />
          </div>
          <h1 className="text-3xl font-light text-[#d0d0d0] mb-2">Buy Premium Credits</h1>
          <p className="text-sm text-[#808080]">
            Current Balance: <span className="text-[#a0a0a0] font-medium">{currentUser.premium_credits || 0}</span> premium credits
          </p>
        </div>

        <div className="neuro-base rounded-3xl p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {creditPackages.map((pkg) => (
              <div
                key={pkg.credits}
                className={`neuro-flat rounded-2xl p-6 relative ${
                  pkg.best ? 'ring-2 ring-[#505050]' : ''
                }`}
              >
                {pkg.best && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="neuro-base px-4 py-1 rounded-full text-xs text-[#a0a0a0]">
                      Best Value
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-[#a0a0a0]" />
                    <p className="text-3xl font-light text-[#d0d0d0]">{pkg.credits}</p>
                  </div>
                  <p className="text-sm text-[#808080]">Premium Credits</p>
                </div>

                <div className="mb-4">
                  <p className="text-2xl font-light text-center text-[#b0b0b0]">{pkg.price}</p>
                  {pkg.savings ? (
                    <p className="text-xs text-center text-[#90b090] mt-1 font-medium">
                      {pkg.savings}
                    </p>
                  ) : (
                    <p className="text-xs text-center text-[#707070] mt-1">
                      ${(parseFloat(pkg.price.replace('$', '')) / pkg.credits).toFixed(2)} per credit
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => handlePurchase(pkg.credits)}
                  disabled={isProcessing}
                  className="w-full neuro-base active:neuro-pressed rounded-2xl py-3"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#808080] mr-2" />
                      <span className="text-[#808080]">Processing...</span>
                    </>
                  ) : (
                    <span className="text-[#a0a0a0]">Purchase</span>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="neuro-pressed rounded-3xl p-6">
          <h3 className="text-sm font-medium text-[#d0d0d0] mb-3">What are Premium Credits?</h3>
          <ul className="space-y-2 text-sm text-[#909090]">
            <li>• Use premium credits to boost your tracks for increased visibility</li>
            <li>• Premium credits cost way less per boost than standard credits</li>
            <li>• 24h boost = 3 credits ($3) • 3 day boost = 8 credits ($8) • Week boost = 15 credits ($15)</li>
            <li>• Credits never expire and can be used anytime</li>
            <li>• Secure payment processing through Stripe</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
