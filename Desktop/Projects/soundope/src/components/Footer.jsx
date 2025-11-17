
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Footer() {
  return (
    <footer className="border-t border-[#1f1f1f] bg-[#0a0a0a] py-8 px-4 mt-12">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69083db69ccd1df29c9359c8/75bae40a0_soundopepngnoname.jpg"
                alt="Soundope Skull Logo"
                className="h-10 w-10 object-contain logo-blend"
              />
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/41568faaa_Screenshot2025-11-02at23401PM.png"
                alt="Soundope"
                className="h-8 object-contain logo-blend"
              />
            </div>
            <p className="text-xs text-[#707070] leading-relaxed">
              Free music feedback platform for independent artists. Get discovered, earn credits, grow your career.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-medium text-[#d0d0d0] mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to={createPageUrl("Discover")} className="text-xs text-[#808080] hover:text-[#a0a0a0]">
                  Discover Music
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Upload")} className="text-xs text-[#808080] hover:text-[#a0a0a0]">
                  Upload Track
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Leaderboard")} className="text-xs text-[#808080] hover:text-[#a0a0a0]">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("SpotifyPlaylists")} className="text-xs text-[#808080] hover:text-[#a0a0a0]">
                  Spotify Playlists
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-medium text-[#d0d0d0] mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to={createPageUrl("HowItWorks")} className="text-xs text-[#808080] hover:text-[#a0a0a0]">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("ForArtists")} className="text-xs text-[#808080] hover:text-[#a0a0a0]">
                  For Artists
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("FAQ")} className="text-xs text-[#808080] hover:text-[#a0a0a0]">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Report")} className="text-xs text-[#808080] hover:text-[#a0a0a0]">
                  Report an Issue
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-medium text-[#d0d0d0] mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to={createPageUrl("EULA")} className="text-xs text-[#808080] hover:text-[#a0a0a0]">
                  End User License Agreement
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("TOS")} className="text-xs text-[#808080] hover:text-[#a0a0a0]">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("PrivacyPolicy")} className="text-xs text-[#808080] hover:text-[#a0a0a0]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("CookiePolicy")} className="text-xs text-[#808080] hover:text-[#a0a0a0]">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Disclaimer")} className="text-xs text-[#808080] hover:text-[#a0a0a0]">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("AcceptableUsePolicy")} className="text-xs text-[#808080] hover:text-[#a0a0a0]">
                  Acceptable Use Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#1f1f1f] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#606060]">
            © 2025 Dead Entertainment. All rights reserved.
          </p>
          <p className="text-xs text-[#606060]">
            Made with ♥ for independent artists
          </p>
        </div>
      </div>
    </footer>
  );
}
