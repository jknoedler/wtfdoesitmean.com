

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { api } from "@/api/apiClient";
import { Home, Upload, User, TrendingUp, Archive, Bell, Mail, Unlock, X, Send, MessageSquare, Search, Zap, Music, Loader2, Disc, Shield, Lock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDevModal, setShowDevModal] = useState(false);
  const [devPassword, setDevPassword] = useState("");
  const [devError, setDevError] = useState("");
  const [showProfileBanner, setShowProfileBanner] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dropdown states
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showMessagesDropdown, setShowMessagesDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [messageThreads, setMessageThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messageText, setMessageText] = useState("");

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], tracks: [] });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Prevent repeated API calls when not authenticated
  const isAuthenticatedRef = useRef(false);
  const isLoadingRef = useRef(false);

  const notifDropdownRef = useRef(null);
  const messagesDropdownRef = useRef(null);
  const searchDropdownRef = useRef(null);

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    if (!currentUser) return 100;

    const checks = [
      !!currentUser.artist_name,
      !!currentUser.bio && currentUser.bio.length > 20,
      !!currentUser.profile_image_url,
      currentUser.social_links && Object.values(currentUser.social_links).some(link => link && link.trim())
    ];

    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  const shouldShowProfileBanner = currentUser && profileCompletion < 100 && showProfileBanner &&
    location.pathname !== createPageUrl("Settings") &&
    location.pathname !== createPageUrl("Profile");



  useEffect(() => {
    if (isLoggingOut) return;

    // Initial load with a small delay to ensure token is available after redirect
    const timer = setTimeout(() => {
      loadCounts();
      loadNotifications();
      loadMessages();
      checkPolicyAcceptance();
    }, 100);

    // Reload user state when page becomes visible (e.g., after login redirect)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadCounts();
      }
    };

    // Reload user state when window gains focus (e.g., after login redirect)
    const handleFocus = () => {
      loadCounts();
    };

    // Listen for storage changes (token might be set in another tab/window)
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token' || e.key === null) {
        loadCounts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.pathname, isLoggingOut]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setShowNotificationsDropdown(false);
      }
      if (messagesDropdownRef.current && !messagesDropdownRef.current.contains(event.target)) {
        setShowMessagesDropdown(false);
        setSelectedThread(null);
      }
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
        setShowMobileSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load Side Banner Ads in Header (one on each side)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const waitForContainer = (containerId, callback, maxAttempts = 50) => {
      let attempts = 0;
      const checkContainer = () => {
        const container = document.getElementById(containerId);
        if (container) {
          callback();
        } else if (attempts < maxAttempts) {
          attempts++;
          requestAnimationFrame(checkContainer);
        }
      };
      checkContainer();
    };

    // Load left side ad (160x300)
    const loadLeftAd = () => {
      const containerId = 'atContainer-775cc79dc80b2e1db1aa0b012d7ce474';
      const container = document.getElementById(containerId);
      
      if (!container) {
        console.error('Ad container not found:', containerId);
          return;
        }
        
      if (!document.querySelector('script[src*="775cc79dc80b2e1db1aa0b012d7ce474"]')) {
        if (typeof atAsyncOptions !== 'object') var atAsyncOptions = [];
        atAsyncOptions.push({
          'key': '775cc79dc80b2e1db1aa0b012d7ce474',
          'format': 'js',
          'async': true,
          'container': containerId,
          'params': {}
        });

        const script = document.createElement('script');
        script.type = "text/javascript";
        script.async = true;
        script.src = 'http' + (location.protocol === 'https:' ? 's' : '') + '://laceokay.com/775cc79dc80b2e1db1aa0b012d7ce474/invoke.js';
        document.getElementsByTagName('head')[0].appendChild(script);
      }
    };

    // Load right side ad (160x600)
    const loadRightAd = () => {
      const containerId = 'atContainer-215659509a27d081b6414f8b8b557b3d';
      const container = document.getElementById(containerId);
      
      if (!container) {
        console.error('Ad container not found:', containerId);
        return;
      }

      if (!document.querySelector('script[src*="215659509a27d081b6414f8b8b557b3d"]')) {
        if (typeof atAsyncOptions !== 'object') var atAsyncOptions = [];
        atAsyncOptions.push({
          'key': '215659509a27d081b6414f8b8b557b3d',
          'format': 'js',
          'async': true,
          'container': containerId,
          'params': {}
        });

        const script = document.createElement('script');
        script.type = "text/javascript";
        script.async = true;
        script.src = 'http' + (location.protocol === 'https:' ? 's' : '') + '://laceokay.com/215659509a27d081b6414f8b8b557b3d/invoke.js';
        document.getElementsByTagName('head')[0].appendChild(script);
      }
    };

    // Wait for containers to exist before loading ads
    waitForContainer('atContainer-775cc79dc80b2e1db1aa0b012d7ce474', loadLeftAd);
    waitForContainer('atContainer-215659509a27d081b6414f8b8b557b3d', loadRightAd);
  }, []);

  const loadCounts = async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      const user = await api.auth.me();
      if (!user) {
        setCurrentUser(null);
        setUnreadNotifications(0);
        setUnreadMessages(0);
        isAuthenticatedRef.current = false;
        isLoadingRef.current = false;
        return;
      }
      isAuthenticatedRef.current = true;
      setCurrentUser(user);
      console.log('User loaded:', user?.email, 'Role:', user?.role);

      if (user && user.id) {
        const notifs = await api.entities.Notification.filter({
          recipient_id: user.id,
          is_read: false
        });
        setUnreadNotifications(notifs?.length || 0);

        const messages = await api.entities.Message.filter({
          recipient_id: user.id,
          is_read: false
        });
        setUnreadMessages(messages?.length || 0);
      } else {
        setUnreadNotifications(0);
        setUnreadMessages(0);
      }
    } catch (error) {
      setCurrentUser(null);
      setUnreadNotifications(0);
      setUnreadMessages(0);
      isAuthenticatedRef.current = false;
    } finally {
      isLoadingRef.current = false;
    }
  };

  const loadNotifications = async () => {
    // Skip if we know user is not authenticated (after initial check)
    if (isAuthenticatedRef.current === false && !isLoadingRef.current) return;
    try {
      const user = await api.auth.me();
      if (!user || !user.id) {
        setNotifications([]);
        isAuthenticatedRef.current = false;
        return;
      }
      isAuthenticatedRef.current = true;
      const notifs = await api.entities.Notification.filter(
        { recipient_id: user.id },
        '-created_date',
        20
      );
      setNotifications(notifs);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
    }
  };

  const loadMessages = async () => {
    // Skip if we know user is not authenticated (after initial check)
    if (isAuthenticatedRef.current === false && !isLoadingRef.current) return;
    try {
      const user = await api.auth.me();
      if (!user || !user.id) {
        setMessageThreads([]);
        isAuthenticatedRef.current = false;
        return;
      }
      isAuthenticatedRef.current = true;
      const sent = await api.entities.Message.filter({ sender_id: user.id });
      const received = await api.entities.Message.filter({ recipient_id: user.id });
      const allMessages = [...sent, ...received].sort((a, b) =>
        new Date(b.created_date) - new Date(a.created_date)
      );

      const threads = allMessages.reduce((acc, msg) => {
        const threadId = msg.thread_id || msg.id;
        if (!acc[threadId]) {
          acc[threadId] = [];
        }
        acc[threadId].push(msg);
        return acc;
      }, {});

      const threadList = Object.entries(threads).map(([threadId, msgs]) => {
        const sorted = msgs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        const latest = sorted[0];
        if (!latest) return null;
        const otherUserId = latest.sender_id === user.id ? latest.recipient_id : latest.sender_id;
        const otherUserName = latest.sender_id === user.id ? latest.recipient_name : latest.sender_name;
        const unreadCount = msgs.filter(m => !m.is_read && m.recipient_id === user.id).length;

        return {
          threadId,
          messages: sorted,
          otherUserId,
          otherUserName,
          latestMessage: latest.content,
          latestDate: latest.created_date,
          unreadCount
        };
      }).filter(thread => thread !== null).sort((a, b) => new Date(b.latestDate) - new Date(a.latestDate));

      setMessageThreads(threadList);
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessageThreads([]);
    }
  };

  // Perform search function
  const performSearch = async (query) => {
    if (!query || !query.trim()) {
      setSearchResults({ users: [], tracks: [] });
      setShowSearchDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowSearchDropdown(true);

    try {
      const normalizedQuery = query.toLowerCase().trim();

      // Fetch limited results with sort
      const [allUsers, allTracks] = await Promise.all([
        api.entities.User.list('-points', 50),
        api.entities.Track.list('-created_date', 100)
      ]);

      const matchedUsers = allUsers
        .filter(user => {
          if (user.id === currentUser?.id) return false;
          const artistName = (user.artist_name || '').toLowerCase();
          const fullName = (user.full_name || '').toLowerCase();
          return artistName.includes(normalizedQuery) || fullName.includes(normalizedQuery);
        })
        .slice(0, 5);

      const matchedTracks = allTracks
        .filter(track => {
          const title = (track.title || '').toLowerCase();
          const artist = (track.artist_name || '').toLowerCase();
          return title.includes(normalizedQuery) || artist.includes(normalizedQuery);
        })
        .slice(0, 5);

      setSearchResults({ users: matchedUsers, tracks: matchedTracks });
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults({ users: [], tracks: [] });
      setShowSearchDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search on typing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setSearchResults({ users: [], tracks: [] });
        setShowSearchDropdown(false);
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentUser]);

  const checkPolicyAcceptance = async () => {
    const publicPages = [
      createPageUrl("Home"),
      createPageUrl("HowItWorks"),
      createPageUrl("ForArtists"),
      createPageUrl("FAQ"),
      createPageUrl("CookiePolicy"),
      createPageUrl("TOS"),
      createPageUrl("EULA"),
      createPageUrl("PrivacyPolicy"),
      createPageUrl("Disclaimer"),
      createPageUrl("AcceptableUsePolicy"),
      createPageUrl("CookiesRequired"),
    ];

    if (publicPages.includes(location.pathname) || isLoggingOut) {
      return;
    }

    try {
      const user = await api.auth.me();

      if (!user.has_accepted_eula && location.pathname !== createPageUrl("EULAAcceptance") && location.pathname !== createPageUrl("TOSAcceptance") && location.pathname !== createPageUrl("PrivacyPolicyAcceptance") && location.pathname !== createPageUrl("PolicyAcceptance")) {
        navigate(createPageUrl("EULAAcceptance"));
        return;
      }

      if (user.has_accepted_eula && !user.has_accepted_tos && location.pathname !== createPageUrl("TOSAcceptance") && location.pathname !== createPageUrl("PrivacyPolicyAcceptance") && location.pathname !== createPageUrl("PolicyAcceptance")) {
        navigate(createPageUrl("TOSAcceptance"));
        return;
      }

      if (user.has_accepted_eula && user.has_accepted_tos && !user.has_accepted_privacy && location.pathname !== createPageUrl("PrivacyPolicyAcceptance") && location.pathname !== createPageUrl("PolicyAcceptance")) {
        navigate(createPageUrl("PrivacyPolicyAcceptance"));
        return;
      }

      if (user.has_accepted_eula && user.has_accepted_tos && user.has_accepted_privacy && !user.has_accepted_policies && location.pathname !== createPageUrl("PolicyAcceptance")) {
        navigate(createPageUrl("PolicyAcceptance"));
        return;
      }
    } catch (error) {
      // User not logged in, ignore
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await api.entities.Notification.update(notif.id, { is_read: true });
      loadCounts();
      loadNotifications();
    }
    if (notif.action_url) {
      setShowNotificationsDropdown(false);
      navigate(notif.action_url);
    }
  };

  const markAllNotificationsRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    for (const notif of unread) {
      await api.entities.Notification.update(notif.id, { is_read: true });
    }
    loadCounts();
    loadNotifications();
  };

  const handleThreadClick = async (thread) => {
    setSelectedThread(thread);
    const unreadInThread = thread.messages.filter(m => !m.is_read && m.recipient_id === currentUser.id);
    for (const msg of unreadInThread) {
      await api.entities.Message.update(msg.id, { is_read: true });
    }
    loadCounts();
    loadMessages();
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedThread) return;

    const thread = selectedThread.messages[0];
    const recipientId = thread.sender_id === currentUser.id ? thread.recipient_id : thread.sender_id;
    const recipientName = thread.sender_id === currentUser.id ? thread.recipient_name : thread.sender_name;

    await api.entities.Message.create({
      sender_id: currentUser.id,
      sender_name: currentUser.artist_name || currentUser.full_name,
      recipient_id: recipientId,
      recipient_name: recipientName,
      content: messageText,
      thread_id: selectedThread.threadId
    });

    setMessageText("");
    loadMessages();
    const updated = await api.entities.Message.filter({ thread_id: selectedThread.threadId });
    setSelectedThread({
      ...selectedThread,
      messages: updated.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    });
  };

  const handleSearchResultClick = (type, id) => {
    setSearchQuery("");
    setShowSearchDropdown(false);
    setShowMobileSearch(false);
    setSearchResults({ users: [], tracks: [] });
    
    if (type === 'user') {
      navigate(createPageUrl("PublicProfile") + `?userId=${id}`);
    } else if (type === 'track') {
      navigate(createPageUrl("TrackDetails") + `?trackId=${id}`);
    }
  };

  const handleSearchIconClick = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
      setShowSearchDropdown(true);
    }
  };

  const handleMobileSearchToggle = () => {
    setShowMobileSearch(!showMobileSearch);
    if (!showMobileSearch) {
      // Focus on input when opening
      setTimeout(() => {
        document.getElementById('mobile-search-input')?.focus();
      }, 100);
    } else {
      // Clear search when closing
      setSearchQuery("");
      setShowSearchDropdown(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      performSearch(searchQuery);
      setShowSearchDropdown(true);
    }
  };

  const handleDevUnlock = async () => {
    try {
      const response = await api.functions.invoke('validateDevPassword', {
        password: devPassword
      });

      if (response.data.success) {
        // Store dev access in localStorage (avoids caching issues)
        localStorage.setItem('has_dev_access', 'true');
        
        // Close modal
        setShowDevModal(false);
        setDevPassword("");
        setDevError("");
        
        // Navigate directly
        navigate(createPageUrl("Moderation"));
      } else {
        setDevError(response.data.error || "Incorrect password");
      }
    } catch (error) {
      console.error("Dev unlock error:", error);
      setDevError("Failed to unlock. Try again.");
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    localStorage.removeItem('hasSeenSkipWarning');
    api.auth.logout(window.location.origin + createPageUrl("Home"));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const response = await api.auth.login(loginEmail, loginPassword);

      if (response && response.token) {
        // Login successful - close modal and reload user data
        setShowLoginModal(false);
        setLoginEmail("");
        setLoginPassword("");
        setLoginError("");

        // Always reload user data to ensure currentUser is set
        await loadCounts();

        // Check if user is using default password "password"
        if (loginPassword === 'password') {
          // Redirect to change password page
          navigate(createPageUrl("ChangePassword"));
        }
        // Stay on current page, but wait for the authentication check to avoid redirects
      } else {
        setLoginError(response?.message || "Login failed. Please check your email and password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(error.message || "Invalid email or password");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const navItems = [
    { icon: Disc, label: "Discover", path: createPageUrl("Discover") },
    { icon: Upload, label: "Upload", path: createPageUrl("Upload") },
    { icon: TrendingUp, label: "Leaderboard", path: createPageUrl("Leaderboard") },
    { icon: Music, label: "Playlists", path: createPageUrl("SpotifyPlaylists") },
    { icon: User, label: "Profile", path: createPageUrl("Profile") },
  ];

  const isActive = (path) => location.pathname === path;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'feedback_received': return MessageSquare;
      case 'comment': return MessageSquare;
      default: return Bell;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0]">
        <style>{`
          html {
            background-color: #0a0a0a !important;
            margin: 0;
            padding: 0;
            width: 100vw;
            max-width: 100vw;
            overflow-x: hidden;
          }

          body {
            background-color: #0a0a0a !important;
            margin: 0;
            padding: 0;
            width: 100vw;
            max-width: 100vw;
            overflow-x: hidden;
            position: relative;
          }

          #root {
            background-color: #0a0a0a;
            min-height: 100vh;
            width: 100vw;
            max-width: 100vw;
            overflow-x: hidden;
          }

          * {
            -webkit-tap-highlight-color: transparent;
            box-sizing: border-box;
          }

          .neuro-base {
            background: #141414;
            box-shadow:
              6px 6px 12px #000000,
              -6px -6px 12px #1f1f1f;
            border: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .neuro-base:hover {
            box-shadow:
              8px 8px 16px #000000,
              -8px -8px 16px #1f1f1f;
          }

          .neuro-pressed {
            background: #141414;
            box-shadow:
              inset 4px 4px 8px #000000,
              inset -4px -4px 8px #1f1f1f;
          }

          .neuro-flat {
            background: #141414;
            box-shadow:
              3px 3px 6px #000000,
              -3px -3px 6px #1f1f1f;
          }

          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          ::-webkit-scrollbar-track {
            background: #0a0a0a;
          }

          ::-webkit-scrollbar-thumb {
            background: #1f1f1f;
            border-radius: 4px;
            box-shadow: inset 2px 2px 4px #000000;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #2a2a2a;
          }

          .smooth-transition {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .text-glow {
            text-shadow: 0 0 10px rgba(128, 128, 128, 0.3);
          }

          .logo-blend {
            mix-blend-mode: lighten;
            filter: brightness(1.1) contrast(1.05);
          }

          .dropdown-optimized {
            will-change: transform, opacity;
            transform: translateZ(0);
            backface-visibility: hidden;
          }

          @media (max-width: 768px) {
            html, body, #root {
              width: 100vw;
              max-width: 100vw;
              overflow-x: hidden;
            }
          }

          @media (min-width: 380px) {
            .xs\\:block {
              display: block !important;
            }
          }

          @supports (padding-bottom: env(safe-area-inset-bottom)) {
            .safe-area-inset-bottom {
              padding-bottom: env(safe-area-inset-bottom);
            }
          }
        `}</style>

        {/* Side Banner Ads - Fixed to viewport sides, below header */}
        <div className="block fixed left-0 top-16 md:top-32 w-[160px] h-[300px]" style={{ zIndex: 9997 }}>
          <div id="atContainer-775cc79dc80b2e1db1aa0b012d7ce474" className="w-full h-full"></div>
        </div>

        <div className="block fixed right-0 top-16 md:top-32 w-[160px] h-[300px]" style={{ zIndex: 9997 }}>
          <div id="atContainer-215659509a27d081b6414f8b8b557b3d" className="w-full h-full"></div>
        </div>

        {/* Top Bar with Notifications - Visible on Every Page */}
        <div className="fixed top-0 left-0 right-0 h-16 md:h-32 neuro-base border-b border-[#1f1f1f]" style={{ zIndex: 9999 }}>
          <div className="h-full max-w-screen-xl mx-auto px-0.5 md:px-6 flex items-center justify-between gap-0.5">
            {/* Soundope Logo with Skull Icon - Clickable, links to landing page */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 md:gap-3">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69083db69ccd1df29c9359c8/75bae40a0_soundopepngnoname.jpg"
                  alt="Soundope Skull Logo"
                  width="60"
                  height="60"
                  className="h-12 w-12 md:h-16 md:w-16 object-contain logo-blend"
                  style={{ objectPosition: 'center' }}
                  decoding="async"
                />
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/41568faaa_Screenshot2025-11-02at23401PM.png"
                  alt="Soundope - Free Music Feedback Platform for Independent Artists"
                  width="200"
                  height="100"
                  className="h-10 md:h-14 object-contain logo-blend cursor-pointer hover:opacity-80 transition-opacity"
                  decoding="async"
                />
            </Link>

            {/* Credits Display - Desktop Only (only if logged in) */}
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 neuro-pressed rounded-xl px-2 md:px-3 py-1 md:py-2">
                <div className="flex items-center gap-1">
                  <span className="text-base md:text-lg text-[#909090] font-medium">¢</span>
                  <span className="text-xs md:text-sm text-[#a0a0a0] font-medium">{currentUser.standard_credits || 0}</span>
                </div>
                <div className="w-px h-4 bg-[#2a2a2a]"></div>
                <div className="flex items-center gap-1">
                  <span className="text-base md:text-lg text-[#b0a090] font-medium">$</span>
                  <span className="text-xs md:text-sm text-[#b0a090] font-medium">{currentUser.premium_credits || 0}</span>
                </div>
              </div>
            )}

            {/* Top Navigation Links - Upload with Smartlink */}
            <div className="hidden md:flex items-center gap-3 flex-1 justify-center">
              {currentUser ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // Open smartlink ad
                    window.open('https://laceokay.com/f7b09ai72i?key=bc50502c646ed1518d50e071aa7bd157', '_blank');
                    // Then navigate to upload page
                    setTimeout(() => {
                      navigate('/upload');
                    }, 500);
                  }}
                  className={`text-sm font-medium smooth-transition px-3 py-2 rounded-xl flex items-center gap-1.5 ${
                    isActive(createPageUrl("Upload")) ? 'text-[#d0d0d0] neuro-pressed' : 'text-[#808080] hover:text-[#a0a0a0] neuro-flat'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
              ) : (
                <Link
                  to={createPageUrl("Login")}
                  className={`text-sm font-medium smooth-transition px-3 py-2 rounded-xl flex items-center gap-1.5 ${
                    isActive(createPageUrl("Upload")) ? 'text-[#d0d0d0] neuro-pressed' : 'text-[#808080] hover:text-[#a0a0a0] neuro-flat'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </Link>
              )}
            </div>

              {/* Search Bar & Buttons */}
              <div className="flex items-center gap-0.5 md:gap-3 flex-shrink-0 pr-0.5 md:pr-0">
                {/* Desktop Search Bar */}
                <div className="relative hidden md:block" ref={searchDropdownRef}>
                  <div className="relative">
                    <button
                      onClick={handleSearchIconClick}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 cursor-pointer hover:opacity-70 transition-opacity"
                      type="button"
                    >
                      <Search className="w-4 h-4 text-[#707070]" />
                    </button>
                    <Input
                      id="search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                      onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                      placeholder="Search"
                      className="w-48 bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#606060] neuro-pressed rounded-xl pl-10 pr-3 py-2 text-sm"
                    />
                  </div>
                </div>

                {/* Mobile Search Button */}
                <button
                  onClick={handleMobileSearchToggle}
                  className="md:hidden neuro-flat rounded-lg p-0.5 relative smooth-transition hover:scale-105 flex-shrink-0"
                >
                  <Search className="w-2.5 h-2.5 text-[#808080]" />
                </button>

                {/* Admin Dashboard Button (only if admin) */}
                {currentUser && currentUser.role === 'admin' && (
                  <Link
                    to={createPageUrl("AdminDashboard")}
                    className="hidden md:flex neuro-flat rounded-xl p-2 relative smooth-transition hover:scale-105 flex-shrink-0"
                    title="Admin Dashboard"
                  >
                    <Shield className="w-5 h-5 text-[#808080]" />
                  </Link>
                )}

                {/* Dev Unlock - Desktop Only (only if logged in and not admin) */}
                {currentUser && currentUser.role !== 'admin' && (
                  <button
                    onClick={() => setShowDevModal(true)}
                    className="hidden md:flex neuro-flat rounded-xl p-2 relative smooth-transition hover:scale-105 flex-shrink-0"
                  >
                    <Unlock className="w-5 h-5 text-[#808080]" />
                  </button>
                )}

                {/* Notifications Dropdown (only if logged in) */}
                {currentUser && (
                <div className="relative flex-shrink-0" ref={notifDropdownRef}>
                  <button
                    onClick={() => {
                      setShowNotificationsDropdown(!showNotificationsDropdown);
                      setShowMessagesDropdown(false);
                    }}
                    className="neuro-flat rounded-lg md:rounded-xl p-0.5 md:p-2 relative smooth-transition hover:scale-105"
                  >
                    <Bell className="w-2.5 h-2.5 md:w-5 md:h-5 text-[#808080]" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 md:w-5 md:h-5 rounded-full bg-[#505050] text-[#d0d0d0] text-[7px] md:text-xs flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </button>

                  {showNotificationsDropdown && (
                    <div className="absolute right-0 top-12 w-96 neuro-base rounded-2xl p-4 max-h-[500px] overflow-y-auto z-10 dropdown-optimized">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-[#d0d0d0]">Notifications</h3>
                        {unreadNotifications > 0 && (
                          <button
                            onClick={markAllNotificationsRead}
                            className="text-xs text-[#808080] hover:text-[#a0a0a0]"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 ? (
                        <p className="text-xs text-[#707070] text-center py-8">No notifications</p>
                      ) : (
                        <div className="space-y-2">
                          {notifications.map((notif) => {
                            const Icon = getNotificationIcon(notif.type);
                            return (
                              <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`w-full text-left rounded-xl p-3 smooth-transition hover:scale-[1.01] cursor-pointer ${
                                  notif.is_read ? 'neuro-flat' : 'neuro-pressed'
                                }`}
                              >
                                <div className="flex gap-3">
                                  <div className="neuro-flat w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-4 h-4 text-[#808080]" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-[#d0d0d0] mb-1">{notif.title}</p>
                                    <p className="text-xs text-[#808080] truncate">{notif.message}</p>
                                    <p className="text-xs text-[#606060] mt-1">
                                      {format(new Date(notif.created_date), 'MMM d, h:mm a')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                )}

                {/* Messages Dropdown (only if logged in) */}
                {currentUser && (
                <div className="relative flex-shrink-0" ref={messagesDropdownRef}>
                  <button
                    onClick={() => {
                      setShowMessagesDropdown(!showMessagesDropdown);
                      setShowNotificationsDropdown(false);
                      setSelectedThread(null);
                    }}
                    className="neuro-flat rounded-lg md:rounded-xl p-0.5 md:p-2 relative smooth-transition hover:scale-105"
                  >
                    <Mail className="w-2.5 h-2.5 md:w-5 md:h-5 text-[#808080]" />
                    {unreadMessages > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 md:w-5 md:h-5 rounded-full bg-[#505050] text-[#d0d0d0] text-[7px] md:text-xs flex items-center justify-center">
                        {unreadMessages}
                      </span>
                    )}
                  </button>

                  {showMessagesDropdown && (
                    <div className="absolute right-0 top-12 w-96 neuro-base rounded-2xl p-4 max-h-[500px] overflow-hidden flex flex-col z-10 dropdown-optimized">
                      {!selectedThread ? (
                        <>
                          <h3 className="text-sm font-medium text-[#d0d0d0] mb-4">Messages</h3>

                          {messageThreads.length === 0 ? (
                            <p className="text-xs text-[#707070] text-center py-8">No messages</p>
                          ) : (
                            <div className="space-y-2 overflow-y-auto">
                              {messageThreads.map((thread) => (
                                <button
                                  key={thread.threadId}
                                  onClick={() => handleThreadClick(thread)}
                                  className="w-full text-left neuro-flat rounded-xl p-3 smooth-transition hover:scale-[1.01]"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <p className="text-sm font-medium text-[#d0d0d0]">{thread.otherUserName}</p>
                                    <span className="text-xs text-[#707070]">
                                      {format(new Date(thread.latestDate), 'MMM d')}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <p className="text-xs text-[#808080] truncate flex-1">
                                      {thread.latestMessage}
                                    </p>
                                    {thread.unreadCount > 0 && (
                                      <span className="ml-2 w-5 h-5 rounded-full bg-[#505050] text-[#d0d0d0] text-xs flex items-center justify-center">
                                        {thread.unreadCount}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <button
                              onClick={() => setSelectedThread(null)}
                              className="text-xs text-[#808080] hover:text-[#a0a0a0]"
                            >
                              ← Back
                            </button>
                            <h3 className="text-sm font-medium text-[#d0d0d0]">{selectedThread.otherUserName}</h3>
                            <button
                              onClick={() => {
                                setShowMessagesDropdown(false);
                                setSelectedThread(null);
                              }}
                              className="neuro-flat rounded-lg p-1"
                            >
                              <X className="w-4 h-4 text-[#808080]" />
                            </button>
                          </div>

                            <div className="flex-1 overflow-y-auto space-y-3 mb-3 max-h-[300px]">
                              {selectedThread.messages.map((msg) => {
                                const isMine = msg.sender_id === currentUser.id;
                                return (
                                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] ${isMine ? 'neuro-pressed' : 'neuro-flat'} rounded-xl p-3`}>
                                      <p className="text-xs text-[#d0d0d0] mb-1">{msg.content}</p>
                                      <p className="text-xs text-[#707070]">
                                        {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="flex gap-2">
                              <Textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-xl min-h-[60px] text-xs resize-none"
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                              />
                              <Button
                                onClick={handleSendMessage}
                                disabled={!messageText.trim()}
                                className="neuro-base active:neuro-pressed rounded-xl px-3"
                              >
                                <Send className="w-4 h-4 text-[#a0a0a0]" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* User Menu (only if logged in) */}
                {currentUser ? (
                  <div className="relative flex-shrink-0">
                    <Link
                      to={createPageUrl("Profile")}
                      className="neuro-flat rounded-lg md:rounded-xl p-0.5 md:p-2 relative smooth-transition hover:scale-105"
                    >
                      {currentUser.profile_image_url ? (
                        <img
                          src={currentUser.profile_image_url}
                          alt={currentUser.artist_name || currentUser.full_name}
                          className="w-6 h-6 md:w-8 md:h-8 rounded-lg object-cover"
                          loading="lazy"
                          width="32"
                          height="32"
                        />
                      ) : (
                        <User className="w-2.5 h-2.5 md:w-5 md:h-5 text-[#808080]" />
                      )}
                    </Link>
                  </div>
                ) : null}

                {/* Login/Logout Button */}
                {!currentUser ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Login button clicked, opening modal');
                      setShowLoginModal(true);
                    }}
                    className="neuro-base active:neuro-pressed rounded-xl px-4 py-2 text-sm text-[#d0d0d0] font-medium smooth-transition hover:scale-105"
                  >
                    Login
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleLogout();
                    }}
                    disabled={isLoggingOut}
                    className="neuro-base active:neuro-pressed rounded-xl px-4 py-2 text-sm text-[#d0d0d0] font-medium smooth-transition hover:scale-105 disabled:opacity-50"
                  >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                )}
              </div>
            </div>
          </div>

        {/* Mobile Search Overlay */}
        {showMobileSearch && currentUser && (
          <div className="fixed top-16 left-0 right-0 z-[9998] neuro-base border-b border-[#1f1f1f] p-3 md:hidden" ref={searchDropdownRef}>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <button
                  onClick={handleSearchIconClick}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 cursor-pointer hover:opacity-70 transition-opacity"
                  type="button"
                >
                  <Search className="w-4 h-4 text-[#707070]" />
                </button>
                <Input
                  id="mobile-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Search artists and tracks..."
                  className="w-full bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#606060] neuro-pressed rounded-xl pl-10 pr-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={handleMobileSearchToggle}
                className="neuro-flat rounded-lg p-2 flex-shrink-0"
              >
                <X className="w-5 h-5 text-[#808080]" />
              </button>
            </div>
          </div>
        )}

        {/* Search Results Dropdown */}
        {showSearchDropdown && currentUser && (
          <div 
            className="fixed w-80 rounded-2xl p-4 max-h-[400px] overflow-y-auto shadow-2xl border-2 dropdown-optimized"
            style={{ 
              top: showMobileSearch ? '122px' : '122px',
              right: showMobileSearch ? '16px' : '280px',
              zIndex: 99999,
              backgroundColor: '#1f1f1f',
              borderColor: '#3a3a3a',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.9), 0 0 0 2px #3a3a3a'
            }}
          >
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#909090]" />
              </div>
            ) : !searchQuery.trim() ? (
              <p className="text-xs text-[#909090] text-center py-8">
                Type to search artists and tracks...
              </p>
            ) : searchResults.users.length === 0 && searchResults.tracks.length === 0 ? (
              <p className="text-xs text-[#909090] text-center py-8">
                No results found for "{searchQuery}"
              </p>
            ) : (
              <div className="space-y-4">
                {searchResults.users.length > 0 && (
                  <div>
                    <p className="text-xs text-[#808080] mb-2 font-medium">Artists</p>
                    <div className="space-y-2">
                      {searchResults.users.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleSearchResultClick('user', user.id)}
                          className="w-full rounded-xl p-3 flex items-center gap-3 smooth-transition hover:scale-[1.01]"
                          style={{ 
                            background: '#2a2a2a',
                            boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.5)'
                          }}
                        >
                          {user.profile_image_url ? (
                            <img
                              src={user.profile_image_url}
                              alt={user.artist_name || user.full_name}
                              className="w-10 h-10 rounded-xl object-cover neuro-pressed"
                              loading="lazy"
                              width="40"
                              height="40"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl neuro-pressed flex items-center justify-center">
                              <User className="w-5 h-5 text-[#808080]" />
                            </div>
                          )}
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-medium text-[#e0e0e0] truncate">
                              {user.artist_name || user.full_name}
                            </p>
                            <p className="text-xs text-[#909090]">
                              {user.review_tier || 'novice'} • {user.points || 0} pts
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.tracks.length > 0 && (
                  <div>
                    <p className="text-xs text-[#808080] mb-2 font-medium">Tracks</p>
                    <div className="space-y-2">
                      {searchResults.tracks.map((track) => (
                        <button
                          key={track.id}
                          onClick={() => handleSearchResultClick('track', track.id)}
                          className="w-full rounded-xl p-3 flex items-center gap-3 smooth-transition hover:scale-[1.01]"
                          style={{ 
                            background: '#2a2a2a',
                            boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.5)'
                          }}
                        >
                          <img
                            src={track.cover_image_url}
                            alt={track.title}
                            className="w-10 h-10 rounded-xl object-cover neuro-pressed"
                            loading="lazy"
                            width="40"
                            height="40"
                          />
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-medium text-[#e0e0e0] truncate">
                              {track.title}
                            </p>
                            <p className="text-xs text-[#909090] truncate">
                              {track.artist_name}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Profile Completion Banner */}
        {shouldShowProfileBanner && (
          <div className="fixed top-16 md:top-32 left-0 right-0 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border-b border-[#3a3a3a] z-40">
            <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="neuro-pressed w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-[#a0a0a0]">{profileCompletion}%</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#d0d0d0] font-medium">Complete your profile</p>
                  <p className="text-[10px] text-[#808080] truncate">Get more engagement and connect with artists</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate(createPageUrl("Settings"))}
                  className="neuro-base active:neuro-pressed rounded-xl px-3 py-1.5 text-xs text-[#a0a0a0] smooth-transition hover:scale-105"
                >
                  Complete
                </button>
                <button
                  onClick={() => setShowProfileBanner(false)}
                  className="neuro-flat rounded-lg p-1 text-[#606060] hover:text-[#808080]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Navigation Bar */}
        {currentUser && location.pathname === createPageUrl("Home") && (
          <div 
            className={`fixed left-0 right-0 h-14 border-b border-[#2a2a2a] ${
              shouldShowProfileBanner 
                ? 'top-[104px] md:top-[168px]' 
                : 'top-16 md:top-32'
            }`}
            style={{ 
              zIndex: 50, 
              backgroundColor: '#141414',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div className="max-w-screen-xl mx-auto h-full px-4 flex items-center justify-center gap-6 md:gap-8">
              <Link
                to={createPageUrl("FreshDopeSounds")}
                className={`text-sm font-medium smooth-transition py-2 px-4 rounded-xl flex items-center gap-2 ${
                  location.pathname === createPageUrl("FreshDopeSounds")
                    ? 'text-[#e0e0e0] neuro-pressed'
                    : 'text-[#a0a0a0] hover:text-[#d0d0d0] neuro-flat'
                }`}
              >
                <Zap className="w-4 h-4" />
                Fresh
              </Link>
              <Link
                to={createPageUrl("HowItWorks")}
                className={`text-sm font-medium smooth-transition py-2 px-4 rounded-xl ${
                  location.pathname === createPageUrl("HowItWorks")
                    ? 'text-[#e0e0e0] neuro-pressed'
                    : 'text-[#a0a0a0] hover:text-[#d0d0d0] neuro-flat'
                }`}
              >
                How It Works
              </Link>
              <Link
                to={createPageUrl("ForArtists")}
                className={`text-sm font-medium smooth-transition py-2 px-4 rounded-xl ${
                  location.pathname === createPageUrl("ForArtists")
                    ? 'text-[#e0e0e0] neuro-pressed'
                    : 'text-[#a0a0a0] hover:text-[#d0d0d0] neuro-flat'
                }`}
              >
                For Artists
              </Link>
              <Link
                to={createPageUrl("FAQ")}
                className={`text-sm font-medium smooth-transition py-2 px-4 rounded-xl ${
                  location.pathname === createPageUrl("FAQ")
                    ? 'text-[#e0e0e0] neuro-pressed'
                    : 'text-[#a0a0a0] hover:text-[#d0d0d0] neuro-flat'
                }`}
              >
                FAQ
              </Link>
            </div>
          </div>
        )}

        {/* Public Navigation Bar */}
        {(!currentUser && (
          location.pathname === createPageUrl("Home") || 
          location.pathname === "/" ||
          location.pathname === createPageUrl("Login") ||
          location.pathname === "/Login" ||
          location.pathname === "/login"
        )) && (
          <div className="fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a] border-b border-[#1f1f1f] z-50 overflow-hidden">
            <div className="max-w-screen-xl mx-auto h-full px-4 flex items-center justify-between">
              <Link to={createPageUrl("Home")} className="flex-shrink-0 flex items-center gap-3">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69083db69ccd1df29c9359c8/75bae40a0_soundopepngnoname.jpg"
                  alt="Soundope Skull Logo"
                  width="60"
                  height="60"
                  className="h-12 w-12 md:h-16 md:w-16 object-contain logo-blend"
                  style={{ objectPosition: 'center' }}
                  loading="eager"
                />
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/41568faaa_Screenshot2025-11-02at23401PM.png"
                  alt="Soundope"
                  width="200"
                  height="100"
                  className="h-10 md:h-14 object-contain logo-blend"
                  loading="eager"
                />
              </Link>

              <div className="flex items-center gap-6">
                <Link
                  to={createPageUrl("HowItWorks")}
                  className={`text-sm font-medium smooth-transition ${
                    location.pathname === createPageUrl("HowItWorks")
                      ? 'text-[#d0d0d0]'
                      : 'text-[#707070] hover:text-[#a0a0a0]'
                  }`}
                >
                  How It Works
                </Link>
                <Link
                  to={createPageUrl("ForArtists")}
                  className={`text-sm font-medium smooth-transition ${
                    location.pathname === createPageUrl("ForArtists")
                      ? 'text-[#d0d0d0]'
                      : 'text-[#707070] hover:text-[#a0a0a0]'
                  }`}
                >
                  For Artists
                </Link>
                <Link
                  to={createPageUrl("FAQ")}
                  className={`text-sm font-medium smooth-transition ${
                    location.pathname === createPageUrl("FAQ")
                      ? 'text-[#d0d0d0]'
                      : 'text-[#707070] hover:text-[#a0a0a0]'
                  }`}
                >
                  FAQ
                </Link>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="neuro-base active:neuro-pressed rounded-2xl px-6 py-2 text-sm font-medium text-[#a0a0a0] smooth-transition hover:scale-105"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dev Unlock Modal */}
        {showDevModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="neuro-base rounded-3xl p-6 max-w-sm w-full">
              <h2 className="text-xl font-light text-[#d0d0d0] mb-4 text-center">Dev Unlock</h2>
              <input
                type="password"
                value={devPassword}
                onChange={(e) => setDevPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleDevUnlock()}
                placeholder="Enter password"
                className="w-full bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl p-3 mb-4"
              />
              {devError && (
                <p className="text-xs text-[#b09090] text-center mb-4">{devError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDevModal(false);
                    setDevPassword("");
                    setDevError("");
                  }}
                  className="flex-1 neuro-flat rounded-2xl py-3 text-sm text-[#808080]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDevUnlock}
                  className="flex-1 neuro-base active:neuro-pressed rounded-2xl py-3 text-sm text-[#a0a0a0]"
                >
                  Unlock
                </button>
              </div>
            </div>
          </div>
        )}

        <main
          className={`pb-24 min-h-screen ${
            currentUser
              ? (shouldShowProfileBanner ? 'pt-36 md:pt-44' : 'pt-30 md:pt-36')
              : 'pt-16'
          }`}
          style={
            location.pathname !== createPageUrl("Home")
              ? {
                  backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69083db69ccd1df29c9359c8/4932177e6_ChatGPTImageNov32025at05_46_46PM.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundAttachment: 'fixed',
                  backgroundRepeat: 'repeat'
                }
              : {}
          }
        >
          {children}
        </main>

        <Footer />
        <CookieBanner />


        {/* Bottom Navigation - Home, Discover, Leaderboard, Profile, Playlist Submissions */}
        {location.pathname !== createPageUrl("Login") &&
         location.pathname !== "/Login" &&
         location.pathname !== "/login" && (
          <nav className="fixed bottom-0 left-0 right-0 h-20 neuro-base z-[500] border-t border-[#1f1f1f] safe-area-inset-bottom" style={{ boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.5)' }}>
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
                <Upload className={`w-5 h-5 sm:w-6 sm:h-6 smooth-transition ${
                  isActive(createPageUrl("SpotifyPlaylists")) ? 'text-[#a0a0a0]' : 'text-[#707070]'
                }`} />
                <span className={`text-[9px] sm:text-[10px] font-medium tracking-wide smooth-transition ${
                  isActive(createPageUrl("SpotifyPlaylists")) ? 'text-[#a0a0a0]' : 'text-[#606060]'
                }`}>
                  Submit
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
