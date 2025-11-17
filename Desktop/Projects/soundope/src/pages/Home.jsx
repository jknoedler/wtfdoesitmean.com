
import React, { useEffect, useState } from "react";
import { api } from "@/api/apiClient";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Music, Users, TrendingUp, Award, Zap, Shield, MessageSquare, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState([]);

  // Fetch blog posts
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await api.posts.getAll();
        setBlogPosts(response || []);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setBlogPosts([]); // Set empty array on error
      }
    };

    fetchBlogPosts();
  }, []);

  useEffect(() => {
    // SEO Meta tags
    document.title = "Soundope - Free Music Feedback Platform | Submit Music for Review | Independent Artist Promotion";
    
    // Use your new logo as the preview
    const previewImageUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/df45ac3bc_Screenshot2025-11-01at70542PM.png";
    
    const metaTags = [
      { type: 'name', key: 'description', content: "Free music feedback platform for independent artists. Submit music for review, get quality feedback from real listeners, earn credits by reviewing. Better than SubmitHub - no bots, just real music promotion. Join thousands of artists growing their careers." },
      { type: 'name', key: 'keywords', content: "submit music for review, music feedback platform, independent artist promotion, free music promotion, music curator feedback, submithub alternative, groover alternative, playlist submission, music discovery platform, artist feedback community, earn music credits, quality music reviews, spotify promotion free, soundcloud promotion, music marketing platform, unsigned artist promotion, demo submission platform" },
      
      // Open Graph
      { type: 'property', key: 'og:title', content: 'Soundope - Free Music Feedback Platform | Submit Music for Review' },
      { type: 'property', key: 'og:description', content: 'Submit music for review and get quality feedback from real listeners. Free music promotion platform for independent artists. Earn credits by reviewing, promote your tracks, grow your fanbase.' },
      { type: 'property', key: 'og:image', content: previewImageUrl },
      { type: 'property', key: 'og:image:width', content: '1200' },
      { type: 'property', key: 'og:image:height', content: '630' },
      { type: 'property', key: 'og:url', content: window.location.href },
      { type: 'property', key: 'og:type', content: 'website' },
      { type: 'property', key: 'og:site_name', content: 'Soundope' },
      
      // Twitter
      { type: 'name', key: 'twitter:card', content: 'summary_large_image' },
      { type: 'name', key: 'twitter:title', content: 'Soundope - Free Music Feedback Platform | Submit Music for Review' },
      { type: 'name', key: 'twitter:description', content: 'Submit music for review and get quality feedback. Free music promotion platform for independent artists. AI-validated reviews, no bots.' },
      { type: 'name', key: 'twitter:image', content: previewImageUrl },
      
      // Additional SEO
      { type: 'name', key: 'robots', content: 'index, follow' },
      { type: 'name', key: 'author', content: 'Soundope' },
      { type: 'name', key: 'language', content: 'English' },
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

    // Add JSON-LD Schema Markup
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": window.location.origin + "/#website",
          "url": window.location.origin,
          "name": "Soundope",
          "description": "Free music feedback platform for independent artists",
          "potentialAction": {
            "@type": "SearchAction",
            "target": window.location.origin + "/discover?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": "Organization",
          "@id": window.location.origin + "/#organization",
          "name": "Soundope",
          "url": window.location.origin,
          "logo": previewImageUrl,
          "description": "Music feedback and promotion platform for independent artists",
          "sameAs": []
        },
        {
          "@type": "WebApplication",
          "name": "Soundope",
          "url": window.location.origin,
          "applicationCategory": "MusicApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "500",
            "bestRating": "5",
            "worstRating": "1"
          },
          "description": "Submit music for review and get quality feedback from real listeners. Free music promotion platform with AI-validated reviews."
        }
      ]
    });
    
    // Remove old schema if exists
    const oldSchema = document.querySelector('script[type="application/ld+json"]');
    if (oldSchema) {
      oldSchema.remove();
    }
    document.head.appendChild(schemaScript);

    return () => {
      if (schemaScript.parentNode) {
        schemaScript.parentNode.removeChild(schemaScript);
      }
    };
  }, []);

  // Load Adsterra Banner Ad
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const loadAdsterraAd = () => {
      const adContainer = document.getElementById('container-home-banner-763b8c85de11ad1c95d4275c8cb17af7');
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
      }, 500);
    };

    loadAdsterraAd();
  }, []);

  const handleGetStarted = async () => {
    try {
      const isAuth = await api.auth.isAuthenticated();
      if (!isAuth) {
        api.auth.redirectToLogin(window.location.origin + createPageUrl("Settings"));
      } else {
        navigate(createPageUrl("Upload"));
      }
    } catch (error) {
      console.error("Get started error:", error);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 md:py-16 pb-32 md:pb-16 pt-24 md:pt-32">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="neuro-base w-24 h-24 rounded-[32px] mx-auto mb-8 flex items-center justify-center">
            <Music className="w-12 h-12 text-[#a0a0a0]" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extralight mb-6 text-[#d0d0d0] tracking-tight">
            Free Music Promotion
            <br />
            <span className="text-[#909090]">That Actually Works</span>
          </h1>
          
          <h2 className="text-xl md:text-2xl text-[#808080] max-w-3xl mx-auto mb-8 font-light">
            Get <span className="text-[#a0a0a0]">high-quality feedback</span> from real listeners. 
            Earn credits by reviewing others. <span className="text-[#a0a0a0]">100% free to start.</span>
          </h2>

          <p className="text-base text-[#707070] max-w-2xl mx-auto mb-12 font-light">
            Better than SubmitHub, Groover, or paid promotion services. 
            Real feedback from engaged music lovers, not bots. Promote your music, help others grow, and build your career.
          </p>

          <Button
            onClick={handleGetStarted}
            className="neuro-base active:neuro-pressed rounded-3xl px-16 py-8 text-xl smooth-transition hover:scale-105"
          >
            <span className="text-[#b0b0b0]">Start Promoting Free</span>
          </Button>

          <p className="text-sm text-[#606060] mt-4">No credit card required • Get started in 30 seconds</p>
        </div>

        {/* Curator Hiring Section */}
        <div className="neuro-base rounded-3xl p-8 md:p-12 mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="neuro-pressed w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Music className="w-8 h-8 text-[#a0a0a0]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-light text-[#d0d0d0] mb-4">
                We're Hiring Playlist Curators
              </h2>
              <p className="text-lg text-[#808080] max-w-2xl mx-auto">
                Join our team and help independent artists get discovered
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="neuro-flat rounded-2xl p-6">
                <h3 className="text-xl font-medium text-[#d0d0d0] mb-3">💰 Competitive Pay</h3>
                <p className="text-sm text-[#808080] leading-relaxed mb-4">
                  We pay <span className="text-[#a0a0a0] font-medium">double what SubmitHub pays</span> for playlist placements. 
                  Earn more while helping artists grow their careers.
                </p>
                <div className="flex items-center gap-2 text-sm text-[#707070]">
                  <span className="w-2 h-2 rounded-full bg-[#90b090]"></span>
                  Higher base rate per submission
                </div>
                <div className="flex items-center gap-2 text-sm text-[#707070] mt-2">
                  <span className="w-2 h-2 rounded-full bg-[#90b090]"></span>
                  Performance bonuses available
                </div>
              </div>

              <div className="neuro-flat rounded-2xl p-6">
                <h3 className="text-xl font-medium text-[#d0d0d0] mb-3">🎁 Sign-On Bonus</h3>
                <p className="text-sm text-[#808080] leading-relaxed mb-4">
                  Qualified curators receive a <span className="text-[#a0a0a0] font-medium">generous sign-on bonus</span> 
                  when they join our team. We value experienced playlist curators.
                </p>
                <div className="flex items-center gap-2 text-sm text-[#707070]">
                  <span className="w-2 h-2 rounded-full bg-[#90b090]"></span>
                  Bonus paid after first month
                </div>
                <div className="flex items-center gap-2 text-sm text-[#707070] mt-2">
                  <span className="w-2 h-2 rounded-full bg-[#90b090]"></span>
                  Based on experience and portfolio
                </div>
              </div>
            </div>

            <div className="neuro-pressed rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-medium text-[#d0d0d0] mb-3">What We're Looking For</h3>
              <ul className="space-y-2 text-sm text-[#808080]">
                <li className="flex items-start gap-2">
                  <span className="text-[#90b090] mt-1">✓</span>
                  <span>Experience curating Spotify playlists (minimum 1 year)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#90b090] mt-1">✓</span>
                  <span>Active playlists with engaged followers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#90b090] mt-1">✓</span>
                  <span>Passion for discovering and supporting independent artists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#90b090] mt-1">✓</span>
                  <span>Reliable and responsive communication</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#90b090] mt-1">✓</span>
                  <span>Ability to provide constructive feedback to artists</span>
                </li>
              </ul>
            </div>

            <div className="text-center">
              <Button
                onClick={() => {
                  // Open email client or contact form
                  window.location.href = 'mailto:curators@soundope.com?subject=Playlist Curator Application&body=Hi, I\'m interested in becoming a playlist curator for Soundope. Please find my application details below.';
                }}
                className="neuro-base active:neuro-pressed rounded-3xl px-12 py-6 text-lg smooth-transition hover:scale-105"
              >
                <span className="text-[#b0b0b0]">Apply Now</span>
              </Button>
              <p className="text-xs text-[#606060] mt-4">
                Email us at <span className="text-[#808080]">curators@soundope.com</span> with your portfolio
              </p>
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <div className="neuro-base rounded-3xl p-6 text-center smooth-transition hover:scale-105">
            <div className="neuro-pressed w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-[#90b090]" />
            </div>
            <h3 className="text-sm font-medium text-[#a0a0a0] mb-2">100% Free to Start</h3>
            <p className="text-xs text-[#707070] font-light">
              Upload tracks and get feedback without spending a dime. Earn credits by reviewing others.
            </p>
          </div>

          <div className="neuro-base rounded-3xl p-6 text-center smooth-transition hover:scale-105">
            <div className="neuro-pressed w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-[#808080]" />
            </div>
            <h3 className="text-sm font-medium text-[#a0a0a0] mb-2">AI-Validated Quality</h3>
            <p className="text-xs text-[#707070] font-light">
              Every review is validated by AI to ensure genuine, helpful feedback from real listeners.
            </p>
          </div>

          <div className="neuro-base rounded-3xl p-6 text-center smooth-transition hover:scale-105">
            <div className="neuro-pressed w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Zap className="w-8 h-8 text-[#808080]" />
            </div>
            <h3 className="text-sm font-medium text-[#a0a0a0] mb-2">Earn As You Go</h3>
            <p className="text-xs text-[#707070] font-light">
              Leave quality feedback to earn credits. Use them to boost your own music or boost visibility.
            </p>
          </div>

          <div className="neuro-base rounded-3xl p-6 text-center smooth-transition hover:scale-105">
            <div className="neuro-pressed w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-[#808080]" />
            </div>
            <h3 className="text-sm font-medium text-[#a0a0a0] mb-2">Grow Your Career</h3>
            <p className="text-xs text-[#707070] font-light">
              Connect with other artists, get discovered, and build your fanbase organically.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="neuro-base rounded-3xl p-12 mb-20">
          <h2 className="text-3xl font-light text-center text-[#d0d0d0] mb-12">
            How Free Music Promotion Works on Soundope
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="neuro-pressed w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-light text-[#a0a0a0]">1</span>
              </div>
              <h3 className="text-lg font-medium text-[#d0d0d0] mb-3">Upload Your Track</h3>
              <p className="text-sm text-[#808080] leading-relaxed">
                Upload your music with genre tags and motifs. Choose between standard or premium feedback options.
              </p>
            </div>

            <div className="text-center">
              <div className="neuro-pressed w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-light text-[#a0a0a0]">2</span>
              </div>
              <h3 className="text-lg font-medium text-[#d0d0d0] mb-3">Get Real Feedback</h3>
              <p className="text-sm text-[#808080] leading-relaxed">
                Receive detailed, AI-validated reviews from engaged listeners who actually care about music.
              </p>
            </div>

            <div className="text-center">
              <div className="neuro-pressed w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-light text-[#a0a0a0]">3</span>
              </div>
              <h3 className="text-lg font-medium text-[#d0d0d0] mb-3">Earn & Promote</h3>
              <p className="text-sm text-[#808080] leading-relaxed">
                Leave feedback for others to earn credits. Use credits to boost your tracks or unlock exclusive content.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Soundope */}
        <div className="mb-20">
          <h2 className="text-3xl font-light text-center text-[#d0d0d0] mb-12">
            Why Artists Choose Soundope Over SubmitHub & Other Platforms
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="neuro-base rounded-3xl p-8">
              <div className="flex items-start gap-4 mb-4">
                <MessageSquare className="w-8 h-8 text-[#90b090] flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-[#d0d0d0] mb-2">Real Feedback, Not Spam</h3>
                  <p className="text-sm text-[#808080] leading-relaxed">
                    Every review is AI-validated to ensure quality. No generic "sounds good" responses. 
                    Get actionable insights from listeners who genuinely engage with your music.
                  </p>
                </div>
              </div>
            </div>

            <div className="neuro-base rounded-3xl p-8">
              <div className="flex items-start gap-4 mb-4">
                <DollarSign className="w-8 h-8 text-[#90b090] flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-[#d0d0d0] mb-2">Free & Affordable</h3>
                  <p className="text-sm text-[#808080] leading-relaxed">
                    Unlike expensive promotion services, Soundope is 100% free to start. 
                    Earn credits by leaving feedback instead of paying hundreds for playlist placements.
                  </p>
                </div>
              </div>
            </div>

            <div className="neuro-base rounded-3xl p-8">
              <div className="flex items-start gap-4 mb-4">
                <Users className="w-8 h-8 text-[#808080] flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-[#d0d0d0] mb-2">Artist Community</h3>
                  <p className="text-sm text-[#808080] leading-relaxed">
                    Connect with other independent artists, collaborate, and support each other. 
                    Build genuine relationships, not just bot followers.
                  </p>
                </div>
              </div>
            </div>

            <div className="neuro-base rounded-3xl p-8">
              <div className="flex items-start gap-4 mb-4">
                <Award className="w-8 h-8 text-[#808080] flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-[#d0d0d0] mb-2">Earn While You Promote</h3>
                  <p className="text-sm text-[#808080] leading-relaxed">
                    Monetize your music knowledge. Leave quality reviews to earn credits and points. 
                    Level up your reviewer status and unlock exclusive perks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof / Stats */}
        <div className="neuro-pressed rounded-3xl p-12 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-light text-[#b0b0b0] mb-2">Free</p>
              <p className="text-xs text-[#707070] uppercase tracking-wide">To Start</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-light text-[#b0b0b0] mb-2">AI</p>
              <p className="text-xs text-[#707070] uppercase tracking-wide">Validated Reviews</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-light text-[#b0b0b0] mb-2">Real</p>
              <p className="text-xs text-[#707070] uppercase tracking-wide">Human Feedback</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-light text-[#b0b0b0] mb-2">Earn</p>
              <p className="text-xs text-[#707070] uppercase tracking-wide">As You Review</p>
            </div>
          </div>
        </div>

        {/* Keywords Section for SEO */}
        <div className="neuro-base rounded-3xl p-8 mb-20">
          <h2 className="text-2xl font-light text-center text-[#d0d0d0] mb-6">
            Best Free Music Promotion for Independent Artists
          </h2>
          <div className="max-w-4xl mx-auto text-sm text-[#808080] leading-relaxed space-y-4">
            <p>
              Looking for <strong className="text-[#a0a0a0]">free music promotion</strong> that actually helps small artists grow? 
              Soundope is the #1 alternative to SubmitHub, Groover, and expensive playlist promotion services. 
              Our platform offers <strong className="text-[#a0a0a0]">high-quality music feedback</strong> from real listeners who care about independent music.
            </p>
            <p>
              Unlike traditional music marketing platforms that charge $5-20 per submission, 
              Soundope lets you <strong className="text-[#a0a0a0]">promote your music for free</strong>. 
              Earn credits by leaving thoughtful feedback for other artists, then use those credits to promote your own tracks. 
              It's the perfect <strong className="text-[#a0a0a0]">earn as you go</strong> system for musicians on a budget.
            </p>
            <p>
              Every review on our platform is AI-validated to ensure authenticity and quality. 
              No more generic feedback or bot responses. Get <strong className="text-[#a0a0a0]">paid promotion quality</strong> without the premium price tag. 
              Whether you're looking for Spotify promotion, SoundCloud growth, or just honest feedback on your production, 
              Soundope is the <strong className="text-[#a0a0a0]">cheap music promotion</strong> solution that delivers results.
            </p>
            <p>
              Join thousands of independent artists using Soundope to grow their music careers. 
              Perfect for hip hop, electronic, indie, pop, and all genres. 
              Start your <strong className="text-[#a0a0a0]">free music marketing</strong> journey today and connect with a community that supports small artists.
            </p>
          </div>
        </div>

        {/* Blog Section */}
        <div className="mt-20 mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-[#d0d0d0] mb-3">Music Promotion Resources</h2>
            <p className="text-sm text-[#808080]">
              Learn how to grow your music career with our guides and tips
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {blogPosts.length === 0 ? (
              // Loading or empty state
              Array.from({ length: 6 }, (_, i) => (
                <article key={i} className="neuro-base rounded-3xl p-6 animate-pulse">
                  <div className="neuro-pressed rounded-2xl p-3 w-fit mb-4">
                    <div className="w-8 h-8 bg-[#2a2a2a] rounded"></div>
                  </div>
                  <div className="h-6 bg-[#2a2a2a] rounded mb-3"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-[#2a2a2a] rounded"></div>
                    <div className="h-4 bg-[#2a2a2a] rounded"></div>
                    <div className="h-4 bg-[#2a2a2a] rounded w-3/4"></div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="h-6 bg-[#2a2a2a] rounded-full w-20"></div>
                    <div className="h-6 bg-[#2a2a2a] rounded-full w-24"></div>
                  </div>
                  <div className="h-4 bg-[#2a2a2a] rounded w-32"></div>
                </article>
              ))
            ) : (
              blogPosts.map((post) => (
                <article
                  key={post.id}
                  className="neuro-base rounded-3xl p-6 smooth-transition hover:scale-[1.01]"
                  onClick={() => window.open(post.url, '_blank')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="neuro-pressed rounded-2xl p-3 w-fit mb-4">
                    {post.feature_image ? (
                      <img
                        src={post.feature_image}
                        alt={post.title}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <MessageSquare className="w-8 h-8 text-[#808080]" />
                    )}
                  </div>
                  <h3 className="text-xl font-medium text-[#d0d0d0] mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-[#808080] leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt || 'Read this article to learn more about growing your music career.'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags && post.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs px-3 py-1 rounded-full bg-[#1a1a1a] text-[#707070]"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-[#606060]">
                    {post.reading_time ? `${post.reading_time} min read` : '5 min read'} • {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Blog CTA */}
          <div className="neuro-base rounded-3xl p-8 mt-8 text-center">
            <h3 className="text-2xl font-light text-[#d0d0d0] mb-3">
              Want More Music Marketing Tips?
            </h3>
            <p className="text-sm text-[#808080] mb-6 max-w-2xl mx-auto">
              Join Soundope and connect with thousands of independent artists sharing strategies,
              tips, and supporting each other's growth. Learn from the community.
            </p>
            <Button
              onClick={handleGetStarted}
              className="neuro-base active:neuro-pressed rounded-3xl px-12 py-6 text-lg smooth-transition hover:scale-105"
            >
              <span className="text-[#b0b0b0]">Join Free Today</span>
            </Button>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center neuro-base rounded-3xl p-12">
          <h2 className="text-3xl font-light text-[#d0d0d0] mb-4">
            Ready to Promote Your Music for Free?
          </h2>
          <p className="text-base text-[#808080] mb-8 max-w-2xl mx-auto">
            Join the future of music promotion. No credit card required. Start getting real feedback in minutes.
          </p>
          <Button
            onClick={handleGetStarted}
            className="neuro-base active:neuro-pressed rounded-3xl px-16 py-8 text-xl smooth-transition hover:scale-105"
          >
            <span className="text-[#b0b0b0]">Get Started Free</span>
          </Button>
          <p className="text-xs text-[#606060] mt-6">
            Free forever • Earn credits by reviewing • No spam, just real music feedback
          </p>
        </div>

        {/* Minimal Adsterra Banner Ad - Bottom of page, subtle */}
        <div className="flex justify-center mt-12 mb-8">
          <div className="w-full max-w-3xl">
            <div id="container-home-banner-763b8c85de11ad1c95d4275c8cb17af7"></div>
          </div>
        </div>
      </div>

    </div>
  );
}
