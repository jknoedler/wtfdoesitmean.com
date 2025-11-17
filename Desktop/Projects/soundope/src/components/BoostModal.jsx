import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { X, Zap, Loader2 } from "lucide-react";

export default function BoostModal({ track, onBoost, onClose, standardCredits = 0, premiumCredits = 0 }) {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [useStandardCredits, setUseStandardCredits] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const boostPlans = [
    { 
      premiumCredits: 3, 
      standardCredits: 100,
      hours: 24, 
      multiplier: 1.5, 
      label: "24h Boost" 
    },
    { 
      premiumCredits: 8, 
      standardCredits: 275,
      hours: 72, 
      multiplier: 2, 
      label: "3 Day Boost" 
    },
    { 
      premiumCredits: 15, 
      standardCredits: 500,
      hours: 168, 
      multiplier: 3, 
      label: "Week Boost" 
    }
  ];

  const handleBoost = async () => {
    if (!selectedPlan) return;
    
    const creditsNeeded = useStandardCredits ? selectedPlan.standardCredits : selectedPlan.premiumCredits;
    const availableCredits = useStandardCredits ? standardCredits : premiumCredits;
    
    if (availableCredits < creditsNeeded) {
      alert("Not enough credits!");
      return;
    }

    setIsProcessing(true);
    try {
      await onBoost({ 
        ...selectedPlan, 
        useStandardCredits,
        creditsToSpend: creditsNeeded
      });
    } catch (error) {
      console.error("Boost error:", error);
      alert("Failed to apply boost. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const canAfford = (plan) => {
    if (useStandardCredits) {
      return standardCredits >= plan.standardCredits;
    } else {
      return premiumCredits >= plan.premiumCredits;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="neuro-base rounded-3xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-light text-[#d0d0d0]">Boost Track</h2>
          <button onClick={onClose} className="neuro-flat rounded-xl p-2">
            <X className="w-5 h-5 text-[#808080]" />
          </button>
        </div>

        {track && (
          <div className="neuro-pressed rounded-2xl p-4 mb-6 flex gap-3">
            <img
              src={track.cover_image_url}
              alt={track.title}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div>
              <p className="text-sm font-medium text-[#d0d0d0]">{track.title}</p>
              <p className="text-xs text-[#808080]">{track.artist_name}</p>
            </div>
          </div>
        )}

        {/* Credit Type Toggle */}
        <div className="neuro-pressed rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs text-[#808080] mb-1">Standard Credits (Earned)</p>
              <p className="text-lg text-[#a0a0a0]">{standardCredits}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#808080] mb-1">Premium Credits (Purchased)</p>
              <p className="text-lg text-[#a0a0a0]">{premiumCredits}</p>
            </div>
          </div>
          
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setUseStandardCredits(true)}
              className={`flex-1 rounded-xl px-3 py-2 text-xs smooth-transition ${
                useStandardCredits ? 'neuro-base text-[#a0a0a0]' : 'neuro-flat text-[#707070]'
              }`}
            >
              Use Standard
            </button>
            <button
              onClick={() => setUseStandardCredits(false)}
              className={`flex-1 rounded-xl px-3 py-2 text-xs smooth-transition ${
                !useStandardCredits ? 'neuro-base text-[#a0a0a0]' : 'neuro-flat text-[#707070]'
              }`}
            >
              Use Premium
            </button>
          </div>
          
          <button
            onClick={() => {
              onClose();
              navigate(createPageUrl("BuyCredits"));
            }}
            className="w-full neuro-flat rounded-xl px-4 py-2 text-xs text-[#909090] hover:text-[#b0b0b0] smooth-transition hover:scale-[1.02]"
          >
            <Zap className="w-3 h-3 inline mr-2" />
            Buy Premium Credits
          </button>
        </div>

        {/* Boost Plans */}
        <div className="mb-6">
          <div className="space-y-3">
            {boostPlans.map((plan, idx) => {
              const affordable = canAfford(plan);
              
              return (
                <button
                  key={idx}
                  onClick={() => affordable && setSelectedPlan(plan)}
                  disabled={!affordable}
                  className={`w-full neuro-base rounded-2xl p-4 text-left smooth-transition ${
                    selectedPlan === plan ? 'neuro-pressed' : ''
                  } ${!affordable ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#a0a0a0]" />
                      <span className="text-sm font-medium text-[#d0d0d0]">{plan.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#808080]">
                        {plan.standardCredits} standard
                      </div>
                      <div className="text-base font-medium text-[#90b090]">
                        {plan.premiumCredits} premium!
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-[#808080]">
                    <span>{plan.multiplier}x visibility</span>
                    <span>{plan.hours} hours</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <Button
          onClick={handleBoost}
          disabled={!selectedPlan || !canAfford(selectedPlan) || isProcessing}
          className="w-full neuro-base active:neuro-pressed rounded-2xl py-4"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-[#a0a0a0] mr-2" />
              <span className="text-[#a0a0a0]">Processing...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 text-[#a0a0a0] mr-2" />
              <span className="text-[#a0a0a0]">
                {selectedPlan 
                  ? `Boost for ${useStandardCredits ? selectedPlan.standardCredits + ' Standard' : selectedPlan.premiumCredits + ' Premium'} Credits` 
                  : 'Select a Plan'}
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}