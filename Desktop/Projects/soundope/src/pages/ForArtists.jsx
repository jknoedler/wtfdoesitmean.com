
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Music, MessageSquare, TrendingUp, Users, Zap, Shield, Award, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForArtists() {
  const navigate = useNavigate();

  useEffect(() => {
    // Add comprehensive SEO meta tags
    document.title = "For Independent Artists - Free Music Promotion & Feedback | Soundope";
    
    const metaTags = [
      { type: 'name', key: 'description', content: "Soundope helps independent artists get quality feedback, promote music for free, and build their fanbase. No bots, real listeners, AI-validated reviews." },
      { type: 'name', key: 'keywords', content: "independent artist promotion, free music marketing, artist feedback platform, unsigned artist tools, music career growth, DIY music promotion" },
      { type: 'name', key: 'robots', content: 'index, follow' },
      
      // Open Graph
      { type: 'property', key: 'og:title', content: 'For Independent Artists - Free Music Promotion | Soundope' },
      { type: 'property', key: 'og:description', content: 'Get quality feedback and promote your music for free. Join thousands of independent artists growing their careers.' },
      { type: 'property', key: 'og:type', content: 'website' },
      { type: 'property', key: 'og:url', content: window.location.href },
      
      // Twitter
      { type: 'name', key: 'twitter:card', content: 'summary_large_image' },
      { type: 'name', key: 'twitter:title', content: 'For Independent Artists - Soundope' },
      { type: 'name', key: 'twitter:description', content: 'Free music promotion platform built for independent artists' },
      
      // Canonical URL
      { type: 'link', key: 'canonical', content: window.location.origin + window.location.pathname },
    ];

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
        }
      } else {
        // For meta tags, distinguish between 'name' and 'property' attributes
        const selector = type === 'property' ? `meta[property="${key}"]` : `meta[name="${key}"]`;
        let tag = document.querySelector(selector);
        
        if (tag) {
          tag.setAttribute('content', content);
        } else {
          tag = document.createElement('meta');
          tag.setAttribute(type, key);
          tag.setAttribute('content', content);
          document.head.appendChild(tag);
        }
      }
    });
  }, []);

  // Load Adsterra Banner Ad
  useEffect(() => {
    const loadAdsterraAd = () => {
      const adContainer = document.getElementById('container-forartists-banner-763b8c85de11ad1c95d4275c8cb17af7');
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
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="neuro-base w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center">
            <Music className="w-12 h-12 text-[#a0a0a0]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-light mb-6 text-[#d0d0d0]">
            Music Promotion Platform
            <br />
            <span className="text-[#909090]">Built for Independent Artists</span>
          </h1>
          <p className="text-xl text-[#808080] max-w-3xl mx-auto mb-8">
            Get discovered by real listeners, receive quality feedback, and grow your music career - completely free to start
          </p>
          <Button
            onClick={() => navigate(createPageUrl("Upload"))}
            className="neuro-base active:neuro-pressed rounded-3xl px-12 py-6 text-lg"
          >
            <span className="text-[#b0b0b0]">Start Promoting Free</span>
          </Button>
        </div>

        {/* Adsterra Banner Ad */}
        <div className="flex justify-center mb-12">
          <div className="w-full max-w-4xl">
            <div id="container-forartists-banner-763b8c85de11ad1c95d4275c8cb17af7"></div>
          </div>
        </div>

        {/* Problem/Solution */}
        <div className="neuro-base rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-light text-[#d0d0d0] mb-6">The Problem with Traditional Music Promotion</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="neuro-pressed rounded-2xl p-6">
              <h3 className="text-lg font-medium text-[#b09090] mb-3">❌ Expensive Services</h3>
              <p className="text-sm text-[#808080] leading-relaxed">
                SubmitHub charges $1-3 per review. Playlist pitching services cost $50-200 per submission. 
                As an independent artist, these costs add up quickly.
              </p>
            </div>
            <div className="neuro-pressed rounded-2xl p-6">
              <h3 className="text-lg font-medium text-[#90b090] mb-3">✓ 100% Free on Soundope</h3>
              <p className="text-sm text-[#808080] leading-relaxed">
                Submit unlimited tracks for free. Earn credits by reviewing other artists. 
                Use credits to boost your music's visibility - no money required.
              </p>
            </div>

            <div className="neuro-pressed rounded-2xl p-6">
              <h3 className="text-lg font-medium text-[#b09090] mb-3">❌ Bot & Spam Responses</h3>
              <p className="text-sm text-[#808080] leading-relaxed">
                Many platforms have low-quality reviewers who give generic feedback or don't actually listen to your music.
              </p>
            </div>
            <div className="neuro-pressed rounded-2xl p-6">
              <h3 className="text-lg font-medium text-[#90b090] mb-3">✓ AI-Validated Quality</h3>
              <p className="text-sm text-[#808080] leading-relaxed">
                Every review is validated by AI. Reviewers must listen to 75%+ of your track. 
                Only detailed, helpful feedback gets through.
              </p>
            </div>

            <div className="neuro-pressed rounded-2xl p-6">
              <h3 className="text-lg font-medium text-[#b09090] mb-3">❌ No Real Community</h3>
              <p className="text-sm text-[#808080] leading-relaxed">
                Traditional promotion is one-way. You submit, they review, end of story. No connections, no support network.
              </p>
            </div>
            <div className="neuro-pressed rounded-2xl p-6">
              <h3 className="text-lg font-medium text-[#90b090] mb-3">✓ Artist Community</h3>
              <p className="text-sm text-[#808080] leading-relaxed">
                Connect with fellow independent artists. Find collaborators, support each other, 
                and grow together in a thriving music community.
              </p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-light text-center text-[#d0d0d0] mb-12">
            Everything Independent Artists Need to Grow
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="neuro-base rounded-3xl p-6">
              <div className="neuro-pressed w-14 h-14 rounded-2xl mb-4 flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-[#a0a0a0]" />
              </div>
              <h3 className="text-lg font-medium text-[#d0d0d0] mb-3">Quality Music Feedback</h3>
              <p className="text-sm text-[#808080] leading-relaxed">
                Get detailed, actionable feedback from real music lovers. Learn what works, what doesn't, 
                and how to improve your production, mixing, and songwriting.
              </p>
            </div>

            <div className="neuro-base rounded-3xl p-6">
              <div className="neuro-pressed w-14 h-14 rounded-2xl mb-4 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-[#a0a0a0]" />
              </div>
              <h3 className="text-lg font-medium text-[#d0d0d0] mb-3">Music Discovery Engine</h3>
              <p className="text-sm text-[#808080] leading-relaxed">
                Your tracks appear in our discovery feed where real listeners find new music. 
                The more engagement you get, the more visibility you earn.
              </p>
            </div>

            <div className="neuro-base rounded-3xl p-6">
              <div className="neuro-pressed w-14 h-14 rounded-2xl mb-4 flex items-center justify-center">
                <Users className="w-7 h-7 text-[#a0a0a0]" />
              </div>
              <h3 className="text-lg font-medium text-[#d0d0d0] mb-3">Artist Networking</h3>
              <p className="text-sm text-[#808080] leading-relaxed">
                Connect with other independent artists in your genre. Find collaborators, 
                exchange tips, and build a supportive network in the music industry.
              </p>
            </div>

            <div className="neuro-base rounded-3xl p-6">
              <div className="neuro-pressed w-14 h-14 rounded-2xl mb-4 flex items-center justify-center">
                <Zap className="w-7 h-7 text-[#a0a0a0]" />
              </div>
              <h3 className="text-lg font-medium text-[#d0d0d0] mb-3">Earn as You Go</h3>
              <p className="text-sm text-[#808080] leading-relaxed">
                Leave quality reviews for other artists and earn credits. Use credits to boost your tracks, 
                unlock features, or support artists you love.
              </p>
            </div>

            <div className="neuro-base rounded-3xl p-6">
              <div className="neuro-pressed w-14 h-14 rounded-2xl mb-4 flex items-center justify-center">
                <Target className="w-7 h-7 text-[#a0a0a0]" />
              </div>
              <h3 className="text-lg font-medium text-[#d0d0d0] mb-3">Smart Matching</h3>
              <p className="text-sm text-[#808080] leading-relaxed">
                Your music is matched with listeners who actually like your genre. 
                Set preferences to avoid genres and vibes you don't want to see.
              </p>
            </div>

            <div className="neuro-base rounded-3xl p-6">
              <div className="neuro-pressed w-14 h-14 rounded-2xl mb-4 flex items-center justify-center">
                <Award className="w-7 h-7 text-[#a0a0a0]" />
              </div>
              <h3 className="text-lg font-medium text-[#d0d0d0] mb-3">Leaderboards & Recognition</h3>
              <p className="text-sm text-[#808080] leading-relaxed">
                Top tracks and reviewers get featured on leaderboards. Build your reputation, 
                earn badges, and get discovered by more listeners.
              </p>
            </div>
          </div>
        </div>

        {/* How It Helps */}
        <div className="neuro-base rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-light text-[#d0d0d0] mb-6">
            How Soundope Helps Independent Artists Succeed
          </h2>
          
          <div className="space-y-6">
            <div className="neuro-flat rounded-2xl p-6">
              <h3 className="text-lg font-medium text-[#d0d0d0] mb-3 flex items-center gap-3">
                <Shield className="w-6 h-6 text-[#90b090]" />
                Learn and Improve Your Music
              </h3>
              <p className="text-sm text-[#808080] leading-relaxed">
                Get honest, constructive feedback on your production quality, mixing, vocals, songwriting, and more. 
                Understand what resonates with listeners and what needs improvement. Every review helps you grow as an artist.
              </p>
            </div>

            <div className="neuro-flat rounded-2xl p-6">
              <h3 className="text-lg font-medium text-[#d0d0d0] mb-3 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-[#90b090]" />
                Get Discovered by Real Fans
              </h3>
              <p className="text-sm text-[#808080] leading-relaxed">
                Your tracks appear in the discovery feed where thousands of music lovers find new artists every day. 
                The better your music and engagement, the more visibility you get. Real fans, not bots.
              </p>
            </div>

            <div className="neuro-flat rounded-2xl p-6">
              <h3 className="text-lg font-medium text-[#d0d0d0] mb-3 flex items-center gap-3">
                <Users className="w-6 h-6 text-[#90b090]" />
                Build Your Music Network
              </h3>
              <p className="text-sm text-[#808080] leading-relaxed">
                Connect with producers, vocalists, and artists in your genre. Find collaboration opportunities, 
                share knowledge, and support each other's growth in the independent music scene.
              </p>
            </div>

            <div className="neuro-flat rounded-2xl p-6">
              <h3 className="text-lg font-medium text-[#d0d0d0] mb-3 flex items-center gap-3">
                <Zap className="w-6 h-6 text-[#90b090]" />
                Promote Without Breaking the Bank
              </h3>
              <p className="text-sm text-[#808080] leading-relaxed">
                No need to spend hundreds on playlist pitching or promotion services. Earn credits by participating 
                in the community, then use those credits to boost your music's reach. Completely sustainable and free.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial/Social Proof */}
        <div className="neuro-pressed rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-light text-center text-[#d0d0d0] mb-8">
            Join Thousands of Independent Artists
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-light text-[#b0b0b0] mb-2">Free</p>
              <p className="text-xs text-[#707070] uppercase tracking-wide">Forever</p>
            </div>
            <div>
              <p className="text-4xl font-light text-[#b0b0b0] mb-2">1000s</p>
              <p className="text-xs text-[#707070] uppercase tracking-wide">Artists Growing</p>
            </div>
            <div>
              <p className="text-4xl font-light text-[#b0b0b0] mb-2">Real</p>
              <p className="text-xs text-[#707070] uppercase tracking-wide">Human Feedback</p>
            </div>
            <div>
              <p className="text-4xl font-light text-[#b0b0b0] mb-2">AI</p>
              <p className="text-xs text-[#707070] uppercase tracking-wide">Validated Quality</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center neuro-base rounded-3xl p-12">
          <h2 className="text-3xl font-light text-[#d0d0d0] mb-4">
            Ready to Grow Your Music Career?
          </h2>
          <p className="text-base text-[#808080] mb-8 max-w-2xl mx-auto">
            Join the #1 free music promotion platform for independent artists. 
            Submit your music, get quality feedback, and build your fanbase today.
          </p>
          <Button
            onClick={() => navigate(createPageUrl("Upload"))}
            className="neuro-base active:neuro-pressed rounded-3xl px-16 py-8 text-xl smooth-transition hover:scale-105"
          >
            <span className="text-[#b0b0b0]">Start Free Promotion</span>
          </Button>
          <p className="text-xs text-[#606060] mt-6">
            No credit card required • Upload your first track in 2 minutes
          </p>
        </div>
      </div>

    </div>
  );
}
