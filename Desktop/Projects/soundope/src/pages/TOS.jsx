import React, { useEffect } from "react";

export default function TOS() {
  useEffect(() => {
    document.title = "Terms of Service - Soundope";
  }, []);

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="neuro-base rounded-3xl p-8">
          <h1 className="text-3xl font-light text-[#d0d0d0] mb-6">Terms of Service</h1>
          <p className="text-sm text-[#808080] mb-8">Last updated: November 03, 2025</p>

          <div className="space-y-6 text-sm text-[#909090] leading-relaxed">
            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">Agreement to Our Legal Terms</h2>
              <p>
                We are Dead Entertainment, doing business as Soundope ("Company," "we," "us," or "our"), 
                a company registered in California, United States at 6431 Old Hwy 99 S, spc 24, Yreka, CA 96097. 
                We operate the website https://soundope.com (the "Site"), the mobile application Soundope (the "App"), 
                as well as any other related products and services (the "Legal Terms"), collectively, the "Services."
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">1. User Representations</h2>
              <p className="mb-2">By using the Services, you represent and warrant that:</p>
              <ul className="space-y-2 ml-6">
                <li>• All registration information you submit will be true, accurate, current, and complete</li>
                <li>• You have the legal capacity and agree to comply with these Legal Terms</li>
                <li>• You are not under the age of 13</li>
                <li>• You will not access the Services through automated or non-human means</li>
                <li>• You will not use the Services for any illegal or unauthorized purpose</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">2. User Registration</h2>
              <p>
                You may be required to register to use the Services. You agree to keep your password confidential 
                and will be responsible for all use of your account and password. We reserve the right to remove, 
                reclaim, or change a username you select if we determine it is inappropriate, obscene, or otherwise objectionable.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">3. Products</h2>
              <p>
                All products are subject to availability. We reserve the right to discontinue any products at any time for any reason.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">4. Purchases and Payment</h2>
              <p>
                We accept the following forms of payment: Visa, Mastercard, PayPal. You agree to provide current, complete, 
                and accurate purchase and account information for all purchases made via the Services. Sales tax will be added 
                to the price of purchases as deemed required by us. We reserve the right to change prices at any time. 
                All payments shall be in US dollars.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">5. User-Generated Contributions</h2>
              <p className="mb-3">
                The Services may invite you to create, submit, post, display, transmit, perform, publish, distribute, 
                or broadcast content and materials ("Contributions"). When you create or make available any Contributions, 
                you represent and warrant that:
              </p>
              <ul className="space-y-2 ml-6">
                <li>• Your Contributions do not infringe on proprietary rights of any third party</li>
                <li>• You are the creator and owner or have the necessary licenses and permissions</li>
                <li>• You have consent from identifiable individuals in your Contributions</li>
                <li>• Your Contributions are not false, inaccurate, or misleading</li>
                <li>• Your Contributions are not spam, advertising, or solicitation</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">6. Contribution License</h2>
              <p>
                By submitting suggestions or other feedback regarding the Services, you agree that we can use and share 
                such feedback for any purpose without compensation to you. You grant us the license to use your Contributions. 
                You retain full ownership of all of your Contributions and any intellectual property rights associated with them. 
                You are solely responsible for your Contributions to the Services.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">7. Refunds Policy</h2>
              <p>
                All refunds are final and will not be issued.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">8. Prohibited Activities</h2>
              <p className="mb-2">As a user of the Services, you agree not to:</p>
              <ul className="space-y-2 ml-6">
                <li>• Systematically retrieve data to create or compile a database without written permission</li>
                <li>• Trick, defraud, or mislead us or other users</li>
                <li>• Circumvent, disable, or otherwise interfere with security-related features</li>
                <li>• Use any information obtained from the Services to harass, abuse, or harm another person</li>
                <li>• Upload or transmit viruses, Trojan horses, or other malicious material</li>
                <li>• Use the Services in a manner inconsistent with any applicable laws or regulations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">9. Guidelines for Reviews</h2>
              <p className="mb-2">When posting a review, you must comply with the following criteria:</p>
              <ul className="space-y-2 ml-6">
                <li>• You should have firsthand experience with the person/entity being reviewed</li>
                <li>• Your reviews should not contain offensive profanity or abusive language</li>
                <li>• Your reviews should not contain discriminatory references</li>
                <li>• You may not post any false or misleading statements</li>
                <li>• You may not organize a campaign encouraging others to post reviews</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">10. Mobile Application License</h2>
              <p>
                If you access the Services via the App, we grant you a revocable, non-exclusive, non-transferable, 
                limited right to install and use the App on wireless electronic devices owned or controlled by you. 
                You shall not decompile, reverse engineer, disassemble, modify, or make any derivative work from the App.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">11. Services Management</h2>
              <p>
                We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; 
                (2) take legal action against anyone who violates the law or these Legal Terms; (3) restrict access to or disable 
                any of your Contributions; and (4) manage the Services to protect our rights and ensure proper functionality.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">12. Privacy Policy</h2>
              <p>
                We care about data privacy and security. Please review our Privacy Policy posted on the Services. 
                By using the Services, you agree to be bound by our Privacy Policy.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">13. Term and Termination</h2>
              <p>
                These Legal Terms remain in effect while you use the Services. We reserve the right to deny access to 
                and use of the Services to any person for any reason, including breach of these Legal Terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">14. Governing Law</h2>
              <p>
                These Legal Terms are governed by the laws of the State of California. You and Dead Entertainment agree 
                to submit to the exclusive jurisdiction of the courts in California.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">15. Dispute Resolution</h2>
              <p>
                <strong className="text-[#a0a0a0]">Informal Negotiations:</strong> Parties agree to attempt to resolve 
                disputes informally for at least thirty (30) days before initiating arbitration.
              </p>
              <p className="mt-2">
                <strong className="text-[#a0a0a0]">Binding Arbitration:</strong> If unresolved, disputes will be settled 
                by binding arbitration under the Commercial Arbitration Rules of the American Arbitration Association.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">16. Disclaimer</h2>
              <p>
                The Services are provided "AS-IS" and "AS-AVAILABLE." Your use of the Services is at your sole risk. 
                We disclaim all warranties, express or implied, and are not responsible for damages resulting from use of the Services.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">17. Limitations of Liability</h2>
              <p>
                We are not liable for indirect, incidental, special, consequential, or punitive damages, including loss of 
                profits, data, or goodwill. Our total liability shall not exceed the amount paid by you in the six months 
                prior to the claim.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">18. Indemnification</h2>
              <p>
                You agree to indemnify and hold Dead Entertainment harmless from any claims, liabilities, damages, losses, 
                and expenses arising from your use of the Services or violation of these Legal Terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">19. California Users and Residents</h2>
              <p>
                If you are a California resident and have a complaint not satisfactorily resolved, you may contact the 
                Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs 
                at 1625 North Market Blvd., Suite N 112, Sacramento, CA 95834 or by phone at (800) 952-5210 or (916) 445-1254.
              </p>
            </div>

            <div className="neuro-flat rounded-2xl p-6 mt-8">
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">Contact Us</h2>
              <p className="mb-3">For questions about these Terms of Service, contact:</p>
              <div className="space-y-1 text-[#a0a0a0]">
                <p><strong>Dead Entertainment</strong></p>
                <p>6431 Old Hwy 99 S, spc 24</p>
                <p>Yreka, CA 96097</p>
                <p>United States</p>
                <p className="mt-3">Email: jknoedler@soundope.com</p>
                <p>Phone: (+1)310-654-9172</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}