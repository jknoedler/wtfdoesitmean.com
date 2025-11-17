import React, { useEffect } from "react";

export default function CookiePolicy() {
  useEffect(() => {
    document.title = "Cookie Policy - Soundope";
  }, []);

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="neuro-base rounded-3xl p-8">
          <h1 className="text-3xl font-light text-[#d0d0d0] mb-6">Cookie Policy</h1>
          <p className="text-sm text-[#808080] mb-8">Updated: November 03, 2025</p>

          <div className="space-y-6 text-sm text-[#909090] leading-relaxed">
            <p>
              This Cookie Policy explains how Dead Entertainment ("Company," "we," "us," and "our") uses cookies 
              and similar technologies to recognize you when you visit https://soundope.com ("Website"). It explains 
              what these technologies are, why we use them, and your rights to control our use of them. In some cases, 
              cookies may collect personal information or be combined with other data to identify you. This policy 
              applies to all users, including those in the European Union.
            </p>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">What Are Cookies?</h2>
              <p>
                Cookies are small data files placed on your computer or mobile device when you visit a website. They 
                are widely used to make websites work, improve efficiency, and provide reporting information. Cookies 
                set by Dead Entertainment are called "first-party cookies." Cookies set by other parties are "third-party 
                cookies," used for advertising, analytics, and embedded services.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">Why We Use Cookies</h2>
              <p className="mb-3">We use cookies for several reasons:</p>
              <ul className="space-y-2 ml-6">
                <li>
                  <strong className="text-[#a0a0a0]">Essential Cookies</strong> are required for core functionality 
                  such as login, session management, and security.
                </li>
                <li>
                  <strong className="text-[#a0a0a0]">Performance Cookies</strong> help us understand how users 
                  interact with the site (e.g., page load times, navigation patterns).
                </li>
                <li>
                  <strong className="text-[#a0a0a0]">Functionality Cookies</strong> enable enhanced features like 
                  saved preferences, language settings, and personalized layouts.
                </li>
                <li>
                  <strong className="text-[#a0a0a0]">Targeting Cookies</strong> are used by us or third-party 
                  partners to deliver relevant ads and measure campaign effectiveness.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">Your Cookie Choices</h2>
              <p>
                When you visit our site, you may be presented with a cookie banner or consent manager that allows 
                you to accept or reject non-essential cookies. You can modify your preferences at any time through 
                your browser settings or the consent tool (if available).
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">Cookie Duration</h2>
              <p>
                Cookies may remain on your device for varying durations. Session cookies expire when you close your 
                browser. Persistent cookies remain until manually deleted or after a set expiration (e.g., 30 minutes 
                to 2 years). Specific cookie durations are listed in our internal cookie registry and may be disclosed 
                upon request.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">Your Rights (EU Users)</h2>
              <p>
                If you are located in the European Union, you have the right to access your personal data, request 
                deletion or correction, withdraw consent for non-essential cookies, and file a complaint with your 
                local data protection authority. For more details, please refer to our Privacy Policy or contact us 
                directly.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">Policy Updates</h2>
              <p>
                We may update this Cookie Policy to reflect changes in technology, legal requirements, or our practices. 
                The date at the top indicates the latest revision.
              </p>
            </div>

            <div className="neuro-flat rounded-2xl p-6 mt-8">
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">Contact Us</h2>
              <p className="mb-3">For questions about cookies or your data rights, contact:</p>
              <div className="space-y-1 text-[#a0a0a0]">
                <p><strong>Dead Entertainment</strong></p>
                <p>6431 Old Hwy 99 S</p>
                <p>Yreka CA. 96097</p>
                <p>United States</p>
                <p className="mt-3">Email: jknoedler@soundope.come</p>
                <p>Phone: (+1)360-547-1912</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}