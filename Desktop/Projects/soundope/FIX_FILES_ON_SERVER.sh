#!/bin/bash
cd /var/www/soundope

echo "=== Fixing Layout.jsx file structure ==="

# Find the correct end of the component (where it should close properly)
# The last part should be:
# </nav>
# )}

#   {/* Bottom Navigation */}
#   {location.pathname !== createPageUrl("Login") &&
#    location.pathname !== "/Login" &&
#    location.pathname !== "/login" && (
#     <nav className="fixed bottom-0 left-0 right-0 h-20 neuro-base z-[250] border-t border-[#1f1f1f] safe-area-inset-bottom">
#       {/* navigation items */}
#     </nav>
#   )}

#   {/* Login Modal */}
#   {showLoginModal && (
#     <div>{/* modal content */}</div>
#   )}
# </div>
# </>
# );
# }

# But we have issues with unmatched tags. Let me create a clean copy of the nav section

cat > /tmp/layout_fixed_nav.jsx << 'EOF'
      {/* Bottom Navigation - Home, Discover, Leaderboard, Profile, Playlist Submissions */}
      {location.pathname !== createPageUrl("Login") &&
       location.pathname !== "/Login" &&
       location.pathname !== "/login" && (
        <nav className="fixed bottom-0 left-0 right-0 h-20 neuro-base z-[250] border-t border-[#1f1f1f] safe-area-inset-bottom">
          <div className="h-full max-w-screen-xl mx-auto px-2 sm:px-6 flex items-center justify-around">
            <Link
              to={createPageUrl("Dashboard")}
              className={`flex flex-col items-center gap-1 smooth-transition ${
                isActive(createPageUrl("Dashboard")) ? 'neuro-pressed text-glow' : 'neuro-flat'
              } px-2 sm:px-4 py-2 rounded-2xl min-w-[56px] sm:min-w-[64px]`}
            >
              <Home className={`w-5 h-5 sm:w-6 sm:h-6 smooth-transition ${
                isActive(createPageUrl("Dashboard")) ? 'text-[#a0a0a0]' : 'text-[#707070]'
              }`} />
              <span className={`text-[9px] sm:text-[10px] font-medium tracking-wide smooth-transition ${
                isActive(createPageUrl("Dashboard")) ? 'text-[#a0a0a0]' : 'text-[#606060]'
              }`}>
                Home
              </span>
            </Link>

            <Link
              to={createPageUrl("Discover")}
              className={`flex flex-col items-center gap-1 smooth-transition ${
                isActive(createPageUrl("Discover")) ? 'neuro-pressed text-glow' : 'neuro-flat'
              } px-2 sm:px-4 py-2 rounded-2xl min-w-[56px] sm:min-w-[64px]`}
            >
              <Disc className={`w-5 h-5 sm:w-6 sm:h-6 smooth-transition ${
                isActive(createPageUrl("Discover")) ? 'text-[#a0a0a0]' : 'text-[#707070]'
              }`} />
              <span className={`text-[9px] sm:text-[10px] font-medium tracking-wide smooth-transition ${
                isActive(createPageUrl("Discover")) ? 'text-[#a0a0a0]' : 'text-[#606060]'
              }`}>
                Discover
              </span>
            </Link>

            <Link
              to={createPageUrl("Leaderboard")}
              className={`flex flex-col items-center gap-1 smooth-transition ${
                isActive(createPageUrl("Leaderboard")) ? 'neuro-pressed text-glow' : 'neuro-flat'
              } px-2 sm:px-4 py-2 rounded-2xl min-w-[56px] sm:min-w-[64px]`}
            >
              <TrendingUp className={`w-5 h-5 sm:w-6 sm:h-6 smooth-transition ${
                isActive(createPageUrl("Leaderboard")) ? 'text-[#a0a0a0]' : 'text-[#707070]'
              }`} />
              <span className={`text-[9px] sm:text-[10px] font-medium tracking-wide smooth-transition ${
                isActive(createPageUrl("Leaderboard")) ? 'text-[#a0a0a0]' : 'text-[#606060]'
              }`}>
                Leaderboard
              </span>
            </Link>

            <Link
              to={createPageUrl("Profile")}
              className={`flex flex-col items-center gap-1 smooth-transition ${
                isActive(createPageUrl("Profile")) ? 'neuro-pressed text-glow' : 'neuro-flat'
              } px-2 sm:px-4 py-2 rounded-2xl min-w-[56px] sm:min-w-[64px]`}
            >
              <User className={`w-5 h-5 sm:w-6 sm:h-6 smooth-transition ${
                isActive(createPageUrl("Profile")) ? 'text-[#a0a0a0]' : 'text-[#707070]'
              }`} />
              <span className={`text-[9px] sm:text-[10px] font-medium tracking-wide smooth-transition ${
                isActive(createPageUrl("Profile")) ? 'text-[#a0a0a0]' : 'text-[#606060]'
              }`}>
                Profile
              </span>
            </Link>

            <Link
              to={createPageUrl("SpotifyPlaylists")}
              className={`flex flex-col items-center gap-1 smooth-transition ${
                isActive(createPageUrl("SpotifyPlaylists")) ? 'neuro-pressed text-glow' : 'neuro-flat'
              } px-2 sm:px-4 py-2 rounded-2xl min-w-[56px] sm:min-w-[64px]`}
            >
              <Music className={`w-5 h-5 sm:w-6 sm:h-6 smooth-transition ${
                isActive(createPageUrl("SpotifyPlaylists")) ? 'text-[#a0a0a0]' : 'text-[#707070]'
              }`} />
              <span className={`text-[9px] sm:text-[10px] font-medium tracking-wide smooth-transition ${
                isActive(createPageUrl("SpotifyPlaylists")) ? 'text-[#a0a0a0]' : 'text-[#606060]'
              }`}>
                Playlists
              </span>
            </Link>

            <Link
              to={createPageUrl("FreshDopeSounds")}
              className={`flex flex-col items-center gap-1 smooth-transition ${
                isActive(createPageUrl("FreshDopeSounds")) ? 'neuro-pressed text-glow' : 'neuro-flat'
              } px-2 sm:px-4 py-2 rounded-2xl min-w-[56px] sm:min-w-[64px]`}
            >
              <Zap className={`w-5 h-5 sm:w-6 sm:h-6 smooth-transition ${
                isActive(createPageUrl("FreshDopeSounds")) ? 'text-[#a0a0a0]' : 'text-[#707070]'
              }`} />
              <span className={`text-[9px] sm:text-[10px] font-medium tracking-wide smooth-transition ${
                isActive(createPageUrl("FreshDopeSounds")) ? 'text-[#a0a0a0]' : 'text-[#606060]'
              }`}>
                Fresh
              </span>
            </Link>
          </div>
        </nav>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="neuro-base rounded-3xl p-8 w-full max-w-md relative">
            <button
              onClick={() => {
                setShowLoginModal(false);
                setLoginError("");
                setLoginEmail("");
                setLoginPassword("");
              }}
              className="absolute top-4 right-4 text-[#808080] hover:text-[#d0d0d0] smooth-transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-6">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69083db69ccd1df29c9359c8/75bae40a0_soundopepngnoname.jpg"
                alt="Soundope Logo"
                width="80"
                height="80"
                className="h-20 w-20 object-contain logo-blend"
              />
            </div>

            <h2 className="text-2xl font-light text-[#d0d0d0] text-center mb-2">
              Welcome Back
            </h2>
            <p className="text-sm text-[#808080] text-center mb-6">
              Sign in to continue discovering music
            </p>

            {loginError && (
              <div className="mb-4 neuro-pressed rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#b09090] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#b09090] flex-1">{loginError}</p>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="modal-email" className="text-xs text-[#a0a0a0]">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606060]" />
                  <Input
                    id="modal-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={isLoggingIn}
                    className="pl-10 bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#606060] neuro-pressed rounded-xl h-11 text-sm"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="modal-password" className="text-xs text-[#a0a0a0]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606060]" />
                  <Input
                    id="modal-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoggingIn}
                    className="pl-10 bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#606060] neuro-pressed rounded-xl h-11 text-sm"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full neuro-base active:neuro-pressed rounded-xl h-11 text-sm text-[#d0d0d0] font-medium smooth-transition hover:scale-[1.02] disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2a2a2a]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-[#141414] text-[#707070]">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => {
                  const redirectUrl = window.location.pathname;
                  window.location.href = `/api/auth/google?state=${encodeURIComponent(redirectUrl)}`;
                }}
                disabled={isLoggingIn}
                className="w-full mt-3 neuro-flat rounded-xl h-11 text-sm text-[#d0d0d0] font-medium smooth-transition hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-[#707070]">
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate(createPageUrl("Home"));
                  }}
                  className="text-[#a0a0a0] hover:text-[#d0d0d0] smooth-transition underline"
                >
                  Get Started
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  </>
  );
}
EOF

echo "=== Finding the correct section to replace ==="
# Find where the component ends incorrectly
LAST_GOOD_LINE=$(grep -n "Footer />" src/pages/Layout.jsx | tail -1 | cut -d: -f1)
echo "Last good line with Footer: $LAST_GOOD_LINE"

# Find where the broken nav starts
BROKEN_NAV_START=$(grep -n "Bottom Navigation" src/pages/Layout.jsx | tail -1 | cut -d: -f1)
echo "Broken nav starts at: $BROKEN_NAV_START"

# Replace everything from the broken nav to the end with the correct version
head -n $((BROKEN_NAV_START - 1)) src/pages/Layout.jsx > /tmp/layout_start.jsx
cat /tmp/layout_fixed_nav.jsx >> /tmp/layout_start.jsx
mv /tmp/layout_start.jsx src/pages/Layout.jsx

echo "=== Layout.jsx fixed - checking syntax ==="
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Layout.jsx build successful!"
else
    echo "❌ Layout.jsx still has issues"
    exit 1
fi
