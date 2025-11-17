import Layout from "./Layout.jsx";

import Discover from "./Discover";

import Feedback from "./Feedback";

import Upload from "./Upload";

import Home from "./Home";

import Settings from "./Settings";

import Profile from "./Profile";

import Leaderboard from "./Leaderboard";

import Archive from "./Archive";

import Inbox from "./Inbox";

import Notifications from "./Notifications";

import MyTracks from "./MyTracks";

import MyReviews from "./MyReviews";

import Vote from "./Vote";

import ReceivedFeedback from "./ReceivedFeedback";

import BuyCredits from "./BuyCredits";

import AIAnalyzer from "./AIAnalyzer";

import TrackDetails from "./TrackDetails";

import PublicProfile from "./PublicProfile";

import Analytics from "./Analytics";

import SpotifyPlaylists from "./SpotifyPlaylists";

import CuratorSubmission from "./CuratorSubmission";

import CuratorDashboard from "./CuratorDashboard";

import DevDashboard from "./DevDashboard";

import AdminDashboard from "./AdminDashboard";

import Moderation from "./Moderation";

import HowItWorks from "./HowItWorks";

import ForArtists from "./ForArtists";

import FAQ from "./FAQ";

import CookiePolicy from "./CookiePolicy";

import PolicyAcceptance from "./PolicyAcceptance";

import EULA from "./EULA";

import EULAAcceptance from "./EULAAcceptance";

import TOS from "./TOS";

import TOSAcceptance from "./TOSAcceptance";

import PrivacyPolicy from "./PrivacyPolicy";

import PrivacyPolicyAcceptance from "./PrivacyPolicyAcceptance";

import Report from "./Report";

import Disclaimer from "./Disclaimer";

import AcceptableUsePolicy from "./AcceptableUsePolicy";

import CookiesRequired from "./CookiesRequired";

import ReviewerLeaderboard from "./ReviewerLeaderboard";

import ViewFeedback from "./ViewFeedback";

import FreshDopeSounds from "./FreshDopeSounds";

import UserExport from "./UserExport";

import Login from "./Login";

import ChangePassword from "./ChangePassword";

import Dashboard from "./Dashboard";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Discover: Discover,
    
    Feedback: Feedback,
    
    Upload: Upload,
    
    Home: Home,
    
    Settings: Settings,
    
    Profile: Profile,
    
    Leaderboard: Leaderboard,
    
    Archive: Archive,
    
    Inbox: Inbox,
    
    Notifications: Notifications,
    
    MyTracks: MyTracks,
    
    MyReviews: MyReviews,
    
    Vote: Vote,
    
    ReceivedFeedback: ReceivedFeedback,
    
    BuyCredits: BuyCredits,
    
    AIAnalyzer: AIAnalyzer,
    
    TrackDetails: TrackDetails,
    
    PublicProfile: PublicProfile,
    
    Analytics: Analytics,
    
    SpotifyPlaylists: SpotifyPlaylists,
    
    CuratorSubmission: CuratorSubmission,
    
    CuratorDashboard: CuratorDashboard,
    
    DevDashboard: DevDashboard,
    
    AdminDashboard: AdminDashboard,
    
    Moderation: Moderation,
    
    HowItWorks: HowItWorks,
    
    ForArtists: ForArtists,
    
    FAQ: FAQ,
    
    CookiePolicy: CookiePolicy,
    
    PolicyAcceptance: PolicyAcceptance,
    
    EULA: EULA,
    
    EULAAcceptance: EULAAcceptance,
    
    TOS: TOS,
    
    TOSAcceptance: TOSAcceptance,
    
    PrivacyPolicy: PrivacyPolicy,
    
    PrivacyPolicyAcceptance: PrivacyPolicyAcceptance,
    
    Report: Report,
    
    Disclaimer: Disclaimer,
    
    AcceptableUsePolicy: AcceptableUsePolicy,
    
    CookiesRequired: CookiesRequired,
    
    ReviewerLeaderboard: ReviewerLeaderboard,
    
    ViewFeedback: ViewFeedback,
    
    FreshDopeSounds: FreshDopeSounds,
    
    UserExport: UserExport,
    
    Login: Login,
    
    ChangePassword: ChangePassword,
    
    Dashboard: Dashboard,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || 'Home';
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Discover" element={<Discover />} />
                
                <Route path="/Feedback" element={<Feedback />} />
                
                <Route path="/Upload" element={<Upload />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Leaderboard" element={<Leaderboard />} />
                
                <Route path="/Archive" element={<Archive />} />
                
                <Route path="/Inbox" element={<Inbox />} />
                
                <Route path="/Notifications" element={<Notifications />} />
                
                <Route path="/MyTracks" element={<MyTracks />} />
                
                <Route path="/MyReviews" element={<MyReviews />} />
                
                <Route path="/Vote" element={<Vote />} />
                
                <Route path="/ReceivedFeedback" element={<ReceivedFeedback />} />
                
                <Route path="/BuyCredits" element={<BuyCredits />} />
                
                <Route path="/AIAnalyzer" element={<AIAnalyzer />} />
                
                <Route path="/TrackDetails" element={<TrackDetails />} />
                
                <Route path="/PublicProfile" element={<PublicProfile />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/SpotifyPlaylists" element={<SpotifyPlaylists />} />
                
                <Route path="/CuratorSubmission" element={<CuratorSubmission />} />
                
                <Route path="/CuratorDashboard" element={<CuratorDashboard />} />
                
                <Route path="/DevDashboard" element={<DevDashboard />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/Moderation" element={<Moderation />} />
                
                <Route path="/HowItWorks" element={<HowItWorks />} />
                
                <Route path="/ForArtists" element={<ForArtists />} />
                
                <Route path="/FAQ" element={<FAQ />} />
                
                <Route path="/CookiePolicy" element={<CookiePolicy />} />
                
                <Route path="/PolicyAcceptance" element={<PolicyAcceptance />} />
                
                <Route path="/EULA" element={<EULA />} />
                
                <Route path="/EULAAcceptance" element={<EULAAcceptance />} />
                
                <Route path="/TOS" element={<TOS />} />
                
                <Route path="/TOSAcceptance" element={<TOSAcceptance />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/PrivacyPolicyAcceptance" element={<PrivacyPolicyAcceptance />} />
                
                <Route path="/Report" element={<Report />} />
                
                <Route path="/Disclaimer" element={<Disclaimer />} />
                
                <Route path="/AcceptableUsePolicy" element={<AcceptableUsePolicy />} />
                
                <Route path="/CookiesRequired" element={<CookiesRequired />} />
                
                <Route path="/ReviewerLeaderboard" element={<ReviewerLeaderboard />} />
                
                <Route path="/ViewFeedback" element={<ViewFeedback />} />
                
                <Route path="/FreshDopeSounds" element={<FreshDopeSounds />} />
                
                <Route path="/UserExport" element={<UserExport />} />
                
                <Route path="/Login" element={<Login />} />
                
                <Route path="/login" element={<Login />} />
                
                <Route path="/ChangePassword" element={<ChangePassword />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}