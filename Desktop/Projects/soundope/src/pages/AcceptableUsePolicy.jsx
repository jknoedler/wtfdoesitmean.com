import React, { useEffect } from "react";

export default function AcceptableUsePolicy() {
  useEffect(() => {
    document.title = "Acceptable Use Policy - Soundope";
  }, []);

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="neuro-base rounded-3xl p-8">
          <h1 className="text-3xl font-light text-[#d0d0d0] mb-6">Acceptable Use Policy</h1>
          <p className="text-sm text-[#808080] mb-8">Last updated: November 03, 2025</p>

          <div className="space-y-6 text-sm text-[#909090] leading-relaxed">
            <p>
              This Acceptable Use Policy ("Policy") is part of our Legal Terms and should be read alongside them. 
              By using Soundope ("we," "us," or "our") and accessing our website at https://soundope.com or our 
              mobile application (collectively, the "Services"), you agree to comply with this Policy and all 
              applicable laws and regulations.
            </p>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">Who We Are</h2>
              <p>
                We are Soundope, a platform operated by Dead Entertainment, a company registered in California at 
                6431 Old Hwy 99 S, Yreka, CA 96097. We provide music feedback, discovery, and promotion tools 
                through our Services.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">Use of the Services</h2>
              <p className="mb-3">When using the Services, you agree not to:</p>
              <ul className="space-y-2 ml-6">
                <li>• Upload music without permission from the copyright holder or rights owner</li>
                <li>• Harass, threaten, or abuse other users in comments, messages, or feedback</li>
                <li>• Upload or promote pirated music or illegally obtained content</li>
                <li>• Use explicit, pornographic, or violent imagery in album covers or profile pictures</li>
                <li>• Impersonate other artists, supporters, or public figures</li>
                <li>• Spam, manipulate votes, or artificially inflate engagement metrics</li>
                <li>• Use automated systems (bots, scrapers, scripts) to access or interact with the Services</li>
                <li>• Attempt to bypass security features or gain unauthorized access to accounts or systems</li>
                <li>• Upload viruses, malware, or harmful code</li>
                <li>• Collect personal information from other users without consent</li>
                <li>• Use the Services for illegal, fraudulent, or misleading purposes</li>
                <li>• Disrupt or place undue burden on our infrastructure or networks</li>
                <li>• Use the Services to compete with or replicate Soundope's business model</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">Consequences of Breaching This Policy</h2>
              <p>
                Violations of this Policy may result in warnings, suspension, or permanent termination of access 
                to the Services. We reserve the right to take legal action if necessary. In some cases, breach of 
                this Policy may also constitute breach of our Terms of Service or other Legal Terms.
              </p>
            </div>

            <div className="neuro-flat rounded-2xl p-6 mt-8">
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">How Can You Contact Us About This Policy?</h2>
              <p className="mb-3">If you have any questions or comments about this Policy, contact:</p>
              <div className="space-y-1 text-[#a0a0a0]">
                <p><strong>Dead Entertainment</strong></p>
                <p>6431 Old Hwy 99 S</p>
                <p>Yreka, CA 96097</p>
                <p>United States</p>
                <p className="mt-3">Email: jknoedler@soundope.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}