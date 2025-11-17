
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    // Add comprehensive SEO meta tags
    document.title = "FAQ - Frequently Asked Questions | Soundope Music Feedback Platform";

    const metaTags = [
      { type: 'name', key: 'description', content: "Get answers to common questions about Soundope. Learn about credits, feedback quality, promotion, and how our music platform works." },
      { type: 'name', key: 'keywords', content: "soundope faq, music feedback questions, how to earn credits, music promotion help, platform guide, artist questions" },
      { type: 'name', key: 'robots', content: 'index, follow' },

      // Open Graph
      { type: 'property', key: 'og:title', content: 'FAQ - Soundope Music Feedback Platform' },
      { type: 'property', key: 'og:description', content: 'Frequently asked questions about music feedback, credits, and promotion' },
      { type: 'property', key: 'og:type', content: 'website' },
      { type: 'property', key: 'og:url', content: window.location.href },

      // Twitter
      { type: 'name', key: 'twitter:card', content: 'summary' },
      { type: 'name', key: 'twitter:title', content: 'Soundope FAQ' },
      { type: 'name', key: 'twitter:description', content: 'Common questions about music feedback and promotion on Soundope' },

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
        // For meta tags, 'property' is used for Open Graph, 'name' for standard
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

    // Add JSON-LD Schema for FAQPage
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';

    // Flatten the FAQs for the schema structure
    const schemaQuestions = faqs.flatMap(category =>
      category.questions.map(qa => ({
        "@type": "Question",
        "name": qa.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": qa.a
        }
      }))
    );

    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": schemaQuestions
    });

    // Remove old schema if exists, to prevent duplicates on re-renders
    const oldSchema = document.querySelector('script[type="application/ld+json"][data-faq-schema]');
    if (oldSchema) {
      oldSchema.remove();
    }
    // Add a unique identifier to the script for easier removal
    schemaScript.setAttribute('data-faq-schema', 'true');
    document.head.appendChild(schemaScript);

    return () => {
      // Clean up the dynamically added schema script when the component unmounts
      if (schemaScript.parentNode) {
        schemaScript.parentNode.removeChild(schemaScript);
      }
      // Note: Meta tags are often left alone as they might be default or cached by crawlers.
      // If removal is strictly necessary for this page only, each added tag would need a unique identifier
      // to be removed specifically, similar to the schemaScript.
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  // Load Adsterra Banner Ad
  useEffect(() => {
    const loadAdsterraAd = () => {
      const adContainer = document.getElementById('container-faq-banner-763b8c85de11ad1c95d4275c8cb17af7');
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

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "What is Soundope and how does this music feedback platform work?",
          a: "Soundope is a free music feedback platform where independent artists can submit music for review and receive quality feedback from real listeners. You earn credits by reviewing other artists' music, then use those credits to promote your own tracks. It's a community-driven music promotion system that helps artists grow without spending money."
        },
        {
          q: "How do I submit music for review?",
          a: "To submit music for review, sign up for a free account, click 'Upload' in the navigation menu, and fill out the track details including audio file, cover art, genre tags, and streaming platform links. Your track will enter the discovery queue where real listeners can find and review it."
        },
        {
          q: "Is Soundope really free? Are there any hidden costs?",
          a: "Yes, Soundope is 100% free to start. You can submit music for review without paying anything. Unlike SubmitHub or Groover that charge $1-3 per review, Soundope uses a credit system where you earn credits by leaving quality feedback for others. There's no subscription fee or mandatory payments."
        },
        {
          q: "How is this different from SubmitHub, Groover, or other music promotion platforms?",
          a: "Soundope is completely free and community-driven. While platforms like SubmitHub charge per review, Soundope lets you earn credits by participating in the community. Every review is AI-validated for quality, and our two-way feedback system builds real connections between artists rather than one-way transactions."
        }
      ]
    },
    {
      category: "Credits & Points System",
      questions: [
        {
          q: "How do I earn credits on this music feedback platform?",
          a: "You earn credits by leaving quality feedback on other artists' tracks. The better and more detailed your review, the more credits you earn. Credits are used to promote your own music, boost track visibility, or unlock exclusive content. You must listen to at least 75% of a track to give feedback."
        },
        {
          q: "What are standard credits vs premium credits?",
          a: "Standard credits are earned through reviewing music and platform activity. Premium credits can be purchased with real money. Both types work the same way and can be used to submit music for review, boost tracks, or unlock features. Premium credits just give you more flexibility if you want to promote more without reviewing."
        },
        {
          q: "How many credits do I need to submit music for review?",
          a: "Currently, submitting music for review is free! The platform is in its growth phase, so you can upload tracks without spending credits. In the future, there may be a small credit cost for uploads, but reviewing other artists will always let you earn those credits back."
        },
        {
          q: "What are points and how do they help my independent artist promotion?",
          a: "Points track your reputation and activity level on the platform. You earn points by giving feedback, receiving praise, and engaging with the community. Points determine your reviewer tier (novice → contributor → critic → connoisseur → legend) and unlock perks like featured placement and priority visibility."
        }
      ]
    },
    {
      category: "Giving & Receiving Feedback",
      questions: [
        {
          q: "What makes quality music feedback on this platform?",
          a: "Quality feedback is detailed, specific, and helpful. Instead of just saying 'sounds good,' explain what works and what could improve. Mention specific elements like production, mixing, vocals, lyrics, energy, or structure. Our AI validates every review to ensure it's genuine and helpful."
        },
        {
          q: "How long do I need to listen before I can submit music feedback?",
          a: "You must listen to at least 75% of a track before you can give feedback. This ensures you actually heard the full song and can provide informed, quality feedback. Listeners who skip tracks frequently may see reduced visibility for their own music."
        },
        {
          q: "How do I get more feedback on my submitted music?",
          a: "To get more feedback, actively participate by reviewing others' music. The more quality reviews you give, the more credits you earn to boost your tracks. Also, make sure your track has good cover art, clear genre tags, and streaming links. Engaging tracks with good presentation naturally get more reviews."
        },
        {
          q: "What if I receive negative feedback on my music submission?",
          a: "Constructive feedback is valuable for growth! All feedback is AI-validated to ensure it's helpful, not just hateful. Use constructive criticism to improve your craft. Remember, even successful artists receive mixed reviews. Focus on common themes in feedback to identify real areas for improvement."
        },
        {
          q: "Can I choose what genres I review for independent artist promotion?",
          a: "Yes! In your settings, you can specify genres and motifs you DON'T want to see. The platform will match you with music that fits your preferences. This ensures you're reviewing music you actually enjoy, leading to better feedback quality for artists."
        }
      ]
    },
    {
      category: "Music Submission & Upload",
      questions: [
        {
          q: "What file formats can I use when I submit music for review?",
          a: "You can upload MP3, WAV, or M4A audio files for your music submission. For best quality, we recommend 320kbps MP3 or lossless WAV files. You'll also need a cover image (JPG or PNG) and at least one streaming platform link (Spotify, SoundCloud, YouTube, or Apple Music)."
        },
        {
          q: "Do I need to have my music on streaming platforms to submit?",
          a: "You need at least one streaming platform link to submit music for review. This helps verify your track is real and gives listeners multiple ways to support you. If your track isn't on streaming yet, you can still upload it with YouTube or SoundCloud links."
        },
        {
          q: "How many tracks can I submit to the music feedback platform?",
          a: "There's no hard limit on how many tracks you can submit! However, you'll need credits for each submission (or participate in the community to earn them). Focus on quality over quantity - submitting your best work will get better feedback and more engagement."
        },
        {
          q: "Can I delete or edit my submitted music after uploading?",
          a: "Yes, go to 'My Tracks' to manage your submissions. You can update track details, streaming links, or archive tracks that are no longer active. However, you cannot change the audio file itself once uploaded - you'd need to create a new submission."
        }
      ]
    },
    {
      category: "Independent Artist Promotion Features",
      questions: [
        {
          q: "How does the music discovery feed work for independent artist promotion?",
          a: "The discovery feed shows tracks based on engagement, boost credits, and user preferences. Songs with more positive feedback, votes, and boosts appear more frequently. Your detested genres/motifs are filtered out. This ensures you discover music you'll actually enjoy while helping artists get heard."
        },
        {
          q: "What are boosts and how do they help my music promotion?",
          a: "Boosts increase your track's visibility in the discovery feed. You can spend credits to boost your track for a set duration (e.g., 24 hours), giving it priority placement. This helps you reach more listeners faster, especially useful when releasing new music."
        },
        {
          q: "Can I collaborate with other artists through this music feedback platform?",
          a: "Yes! If an artist marks their track 'open for collab,' you can send them a collaboration request through the platform. Specify what type of collab you're interested in (remix, feature, production) and include a pitch message. It's a great way to network and find independent artists to work with."
        },
        {
          q: "How do leaderboards work for independent artist promotion?",
          a: "Monthly leaderboards rank the top tracks and reviewers. You can vote for tracks using your monthly vote allocation (10 votes per month). Top tracks get featured placement and increased visibility. This gamification helps great music rise to the top organically."
        }
      ]
    },
    {
      category: "Platform Features & Technical",
      questions: [
        {
          q: "What is AI validation on this music feedback platform?",
          a: "Our AI analyzes every review to ensure it's genuine, detailed, and helpful. It checks for spam, bots, generic responses, and validates that the reviewer actually listened to the track. Only quality feedback passes validation, ensuring you get real music feedback that helps you grow."
        },
        {
          q: "Is there a mobile app for submitting music for review?",
          a: "Currently Soundope is web-based and mobile-optimized. You can use it on any device through your browser. A dedicated mobile app may come in the future, but the responsive design works great on phones and tablets for reviewing music on the go."
        },
        {
          q: "Can I message other artists directly on this music promotion platform?",
          a: "Yes! You can send direct messages to other artists through the platform. Click on any artist's profile and use the message feature. This helps build real connections, discuss collaborations, or just network with fellow independent artists."
        },
        {
          q: "How do I report spam or inappropriate content?",
          a: "If you encounter spam, inappropriate feedback, or rule violations, use the report feature available on tracks and comments. Our moderation team reviews reports quickly. You can also block users to prevent seeing their content in your feed."
        }
      ]
    },
    {
      category: "Account & Settings",
      questions: [
        {
          q: "How do I set up my independent artist profile?",
          a: "Go to Settings to complete your profile. Add your artist name, bio, profile picture, and social media links. Also set your genre preferences and detested genres/motifs to customize your feed. A complete profile helps you get discovered and builds credibility when giving feedback."
        },
        {
          q: "Can I have multiple artist accounts on this music feedback platform?",
          a: "Each user should have one account. However, if you produce under multiple aliases, you can mention that in your bio and tag tracks accordingly. Keeping one account helps maintain your reputation score and reviewer tier across all your work."
        },
        {
          q: "Is my data and music safe when I submit music for review?",
          a: "Yes, Soundope takes security seriously. Your audio files are stored on secure cloud storage. We don't claim any rights to your music. Your email and personal data are never sold to third parties. Read our full privacy policy for details on data protection."
        },
        {
          q: "How do I delete my account on this music promotion platform?",
          a: "To delete your account, go to Settings → Account and look for the delete option. Note that this will remove all your tracks, feedback, and credits. Make sure to download any important data before deletion as this action cannot be undone."
        }
      ]
    },
    {
      category: "Music Promotion Strategy",
      questions: [
        {
          q: "What's the best strategy for independent artist promotion on Soundope?",
          a: "1) Complete your profile fully, 2) Upload your best tracks with quality cover art, 3) Actively review others' music to earn credits and build reputation, 4) Engage with feedback you receive, 5) Use earned credits to boost your best tracks, 6) Connect and collaborate with other artists. Consistency is key!"
        },
        {
          q: "How long does it take to see results from submitting music for review?",
          a: "Most tracks start receiving feedback within 24-48 hours. Building a following takes longer - expect 2-4 weeks of consistent participation to see significant traction. The more you engage by reviewing others, the faster your music gets discovered. This isn't instant fame, it's community-driven growth."
        },
        {
          q: "Should I boost my tracks or save credits for the music feedback platform?",
          a: "Use boosts strategically for your best tracks or new releases. Regular participation (reviewing others) gives you steady visibility without spending credits. Save boosts for when you have fresh content and want to maximize initial impact. Don't boost every track - be selective."
        },
        {
          q: "How can I turn this music promotion into actual fans and streams?",
          a: "Soundope helps you get discovered and receive feedback, but converting to fans requires: 1) Actually great music (use feedback to improve), 2) Consistent releases, 3) Engaging with your reviewers and building relationships, 4) Making sure streaming links work, 5) Cross-promoting on social media. Use Soundope as part of a broader music promotion strategy."
        }
      ]
    }
  ];

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="neuro-base w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center">
            <HelpCircle className="w-12 h-12 text-[#a0a0a0]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-light mb-6 text-[#d0d0d0]">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-[#808080] max-w-2xl mx-auto">
            Everything you need to know about our music feedback platform, submitting music for review, and independent artist promotion
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="neuro-base rounded-3xl p-6">
              <h2 className="text-2xl font-light text-[#d0d0d0] mb-6">
                {category.category}
              </h2>

              <div className="space-y-3">
                {category.questions.map((faq, qIndex) => {
                  const globalIndex = `${categoryIndex}-${qIndex}`;
                  const isOpen = openIndex === globalIndex;

                  return (
                    <div
                      key={qIndex}
                      className="neuro-flat rounded-2xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleQuestion(globalIndex)}
                        className="w-full p-4 flex items-center justify-between text-left smooth-transition hover:scale-[1.01]"
                      >
                        <h3 className="text-sm font-medium text-[#d0d0d0] pr-4">
                          {faq.q}
                        </h3>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-[#808080] flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[#808080] flex-shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4">
                          <p className="text-sm text-[#909090] leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions CTA */}
        <div className="neuro-base rounded-3xl p-12 mt-12 text-center">
          <h2 className="text-3xl font-light text-[#d0d0d0] mb-4">
            Still Have Questions About Our Music Feedback Platform?
          </h2>
          <p className="text-base text-[#808080] mb-8 max-w-2xl mx-auto">
            Join thousands of independent artists using Soundope for free music promotion.
            Start submitting music for review today and get quality feedback to grow your career.
          </p>
          <Button
            onClick={() => navigate(createPageUrl("Upload"))}
            className="neuro-base active:neuro-pressed rounded-3xl px-16 py-8 text-xl smooth-transition hover:scale-105"
          >
            <span className="text-[#b0b0b0]">Submit Your Music Free</span>
          </Button>
        </div>
      </div>

    </div>
  );
}
