
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Music, MessageSquare, Zap, TrendingUp, CheckCircle, DollarSign, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HowItWorks() {
  const navigate = useNavigate();

  useEffect(() => {
    // Add comprehensive SEO meta tags
    document.title = "How Soundope Works - Free Music Feedback Platform Guide | Step-by-Step Tutorial";
    
    const metaTags = [
      { type: 'name', key: 'description', content: "Learn how Soundope works. Step-by-step guide to getting music feedback, earning credits, and promoting your tracks. Free platform for independent artists." },
      { type: 'name', key: 'keywords', content: "how soundope works, music feedback guide, earn music credits, promote music free, independent artist tutorial, music review platform guide" },
      { type: 'name', key: 'robots', content: 'index, follow' },
      
      // Open Graph
      { type: 'property', key: 'og:title', content: 'How Soundope Works - Free Music Feedback Platform Guide' },
      { type: 'property', key: 'og:description', content: 'Learn how to get quality feedback and promote your music for free on Soundope' },
      { type: 'property', key: 'og:type', content: 'website' },
      { type: 'property', key: 'og:url', content: window.location.href },
      
      // Twitter
      { type: 'name', key: 'twitter:card', content: 'summary_large_image' },
      { type: 'name', key: 'twitter:title', content: 'How Soundope Works - Music Feedback Guide' },
      { type: 'name', key: 'twitter:description', content: 'Step-by-step guide to getting quality music feedback and promoting your tracks for free' },
      
      // Canonical URL
      { type: 'link', key: 'canonical', content: window.location.origin + window.location.pathname },
    ];

    const addedElements = [];

    metaTags.forEach(({ type, key, content }) => {
      if (type === 'link') {
        let tag = document.querySelector(`link[rel="${key}"]`);
        if (tag) {
          tag.setAttribute('href', content);
        } else {
          tag = document.createElement('link');
          tag.setAttribute('rel', key);
          tag.setAttribute('href', content);
          document.head.appendChild(tag);
          addedElements.push(tag);
        }
      } else {
        let tag = document.querySelector(`meta[${type}="${key}"]`);
        if (tag) {
          tag.setAttribute('content', content);
        } else {
          tag = document.createElement('meta');
          tag.setAttribute(type, key);
          tag.setAttribute('content', content);
          document.head.appendChild(tag);
          addedElements.push(tag);
        }
      }
    });

    // Add JSON-LD Schema for HowTo
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Use Soundope Music Feedback Platform",
      "description": "Step-by-step guide to submit music, get feedback, and promote tracks on Soundope",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Upload Your Music",
          "text": "Upload your track with genre tags and streaming links. Choose standard or premium feedback."
        },
        {
          "@type": "HowToStep",
          "name": "Get Real Feedback",
          "text": "Receive detailed, AI-validated reviews from engaged listeners who actually care about music."
        },
        {
          "@type": "HowToStep",
          "name": "Earn & Promote",
          "text": "Leave feedback for others to earn credits. Use credits to boost your tracks or unlock content."
        }
      ]
    });
    document.head.appendChild(schemaScript);
    addedElements.push(schemaScript); // Track schema script for cleanup

    return () => {
      // Clean up dynamic meta and link tags
      addedElements.forEach(tag => {
        if (tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });
    };
  }, []);

  // Load Adsterra Banner Ad
  useEffect(() => {
    const loadAdsterraAd = () => {
      const adContainer = document.getElementById('container-howitworks-banner-763b8c85de11ad1c95d4275c8cb17af7');
      if (!adContainer || adContainer.dataset.loaded === 'true') return;

      // Load script if not already loaded
      if (!document.querySelector('script[src*="763b8c85de11ad1c95d4275c8cb17af7"]')) {
        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = '//laceokay.com/763b8c85de11ad1c95d4275c8cb17af7/invoke.js';
        document.head.appendChild(script);
      }

      // Initialize ad container
      setTimeout(() => {
        if (adContainer && !adContainer.dataset.loaded) {
          adContainer.dataset.loaded = 'true';
          adContainer.innerHTML = '<div id="container-763b8c85de11ad1c95d4275c8cb17af7"></div>';
        }
      }, 300);
    };

    loadAdsterraAd();
  }, []);

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light mb-6 text-[#d0d0d0]">
            How to Get Music Feedback on Soundope
          </h1>
          <p className="text-lg text-[#808080] max-w-2xl mx-auto">
            Your complete guide to submitting music for review, earning credits, and growing your music career with quality feedback
          </p>
        </div>

        {/* Adsterra Banner Ad */}
        <div className="flex justify-center mb-12">
          <div className="w-full max-w-4xl">
            <div id="container-howitworks-banner-763b8c85de11ad1c95d4275c8cb17af7"></div>
          </div>
        </div>

        {/* Main Process */}
        <div className="neuro-base rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-light text-[#d0d0d0] mb-8">3 Simple Steps to Get Music Feedback</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="neuro-pressed w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Music className="w-8 h-8 text-[#a0a0a0]" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-[#d0d0d0] mb-3">1. Submit Your Music for Review</h3>
                <p className="text-sm text-[#909090] leading-relaxed mb-3">
                  Upload your track with cover art, select your genre and vibe tags, and add streaming platform links. 
                  Your music enters our discovery queue where real listeners can find it.
                </p>
                <ul className="text-sm text-[#808080] space-y-2 ml-4">
                  <li>• Supports MP3, WAV, and M4A formats</li>
                  <li>• Add Spotify, SoundCloud, YouTube, and Apple Music links</li>
                  <li>• Tag your genre and creative motifs for better matching</li>
                  <li>• 100% free to submit your first tracks</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="neuro-pressed w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-8 h-8 text-[#a0a0a0]" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-[#d0d0d0] mb-3">2. Get Quality Music Feedback</h3>
                <p className="text-sm text-[#909090] leading-relaxed mb-3">
                  Real music lovers and fellow artists listen to your track and provide detailed, AI-validated feedback. 
                  No bots, no generic responses - just honest insights to help you improve.
                </p>
                <ul className="text-sm text-[#808080] space-y-2 ml-4">
                  <li>• Reviewers must listen to 75%+ of your track</li>
                  <li>• AI validates feedback quality and authenticity</li>
                  <li>• Receive categorized feedback (production, vocals, mixing, etc.)</li>
                  <li>• Get praise, constructive criticism, and improvement suggestions</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="neuro-pressed w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-8 h-8 text-[#a0a0a0]" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-[#d0d0d0] mb-3">3. Earn Credits by Reviewing Others</h3>
                <p className="text-sm text-[#909090] leading-relaxed mb-3">
                  Support fellow artists by leaving thoughtful feedback on their music. 
                  Earn credits for every quality review you submit, then use those credits to promote your own tracks.
                </p>
                <ul className="text-sm text-[#808080] space-y-2 ml-4">
                  <li>• Earn 10+ credits per detailed review</li>
                  <li>• Build your reviewer reputation and unlock higher tiers</li>
                  <li>• Use credits to boost track visibility</li>
                  <li>• Connect with other artists and grow your network</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="neuro-base rounded-3xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <Shield className="w-8 h-8 text-[#90b090] flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-[#d0d0d0] mb-2">AI-Validated Feedback Quality</h3>
                <p className="text-sm text-[#808080] leading-relaxed">
                  Every review is analyzed by AI to ensure it's genuine, helpful, and detailed. We eliminate spam, 
                  bots, and low-effort responses so you only get valuable music feedback.
                </p>
              </div>
            </div>
          </div>

          <div className="neuro-base rounded-3xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <DollarSign className="w-8 h-8 text-[#90b090] flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-[#d0d0d0] mb-2">Completely Free to Start</h3>
                <p className="text-sm text-[#808080] leading-relaxed">
                  Unlike SubmitHub or Groover, you don't need to pay per submission. 
                  Earn credits by reviewing other artists, then use those credits to promote your music.
                </p>
              </div>
            </div>
          </div>

          <div className="neuro-base rounded-3xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <TrendingUp className="w-8 h-8 text-[#90b090] flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-[#d0d0d0] mb-2">Boost Your Music Discovery</h3>
                <p className="text-sm text-[#808080] leading-relaxed">
                  Use earned credits to boost your track's visibility in the discovery feed. 
                  Get more listens, more feedback, and connect with potential fans and collaborators.
                </p>
              </div>
            </div>
          </div>

          <div className="neuro-base rounded-3xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <Award className="w-8 h-8 text-[#90b090] flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-[#d0d0d0] mb-2">Level Up Your Music Career</h3>
                <p className="text-sm text-[#808080] leading-relaxed">
                  Build your reputation as a reviewer, earn badges and achievements, and climb the leaderboard. 
                  Top reviewers get featured and unlock exclusive perks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Better Than Alternatives */}
        <div className="neuro-base rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-light text-[#d0d0d0] mb-6">
            Why Soundope is Better Than SubmitHub & Other Music Feedback Platforms
          </h2>
          
          <div className="space-y-4">
            <div className="neuro-flat rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#90b090] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-medium text-[#d0d0d0] mb-1">No Pay-Per-Submission Model</h4>
                  <p className="text-sm text-[#808080]">
                    SubmitHub charges $1-3 per review. On Soundope, submit music for free and earn credits by participating in the community.
                  </p>
                </div>
              </div>
            </div>

            <div className="neuro-flat rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#90b090] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-medium text-[#d0d0d0] mb-1">Real Feedback, Not Generic Responses</h4>
                  <p className="text-sm text-[#808080]">
                    AI validates every review for quality. Reviewers must listen to 75%+ of your track and provide detailed, helpful feedback.
                  </p>
                </div>
              </div>
            </div>

            <div className="neuro-flat rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#90b090] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-medium text-[#d0d0d0] mb-1">Two-Way Community, Not One-Way Submission</h4>
                  <p className="text-sm text-[#808080]">
                    Help other artists and grow together. Build relationships, find collaborators, and support independent music.
                  </p>
                </div>
              </div>
            </div>

            <div className="neuro-flat rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#90b090] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-medium text-[#d0d0d0] mb-1">Transparent, Fair System</h4>
                  <p className="text-sm text-[#808080]">
                    No hidden algorithms or pay-to-win schemes. Your music's visibility is based on quality and engagement, not wallet size.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center neuro-base rounded-3xl p-12">
          <h2 className="text-3xl font-light text-[#d0d0d0] mb-4">
            Ready to Submit Your Music for Review?
          </h2>
          <p className="text-base text-[#808080] mb-8 max-w-2xl mx-auto">
            Join thousands of independent artists getting quality music feedback. 
            Start promoting your music for free today.
          </p>
          <Button
            onClick={() => navigate(createPageUrl("Upload"))}
            className="neuro-base active:neuro-pressed rounded-3xl px-16 py-8 text-xl smooth-transition hover:scale-105"
          >
            <span className="text-[#b0b0b0]">Get Started Free</span>
          </Button>
        </div>
      </div>

    </div>
  );
}
