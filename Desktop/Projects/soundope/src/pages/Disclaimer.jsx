import React, { useEffect } from "react";

export default function Disclaimer() {
  useEffect(() => {
    document.title = "Disclaimer - Soundope";
  }, []);

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="neuro-base rounded-3xl p-8">
          <h1 className="text-3xl font-light text-[#d0d0d0] mb-6">Disclaimer</h1>
          <p className="text-sm text-[#808080] mb-8">Last updated: November 03, 2025</p>

          <div className="space-y-6 text-sm text-[#909090] leading-relaxed">
            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">Website Disclaimer</h2>
              <p>
                The information provided by Soundope ("we," "us," or "our") on https://soundope.com (the "Site") 
                and our mobile application is for general informational purposes only. All information on the Site 
                and our mobile application is provided in good faith, however we make no representation or warranty 
                of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, or 
                completeness of any information on the Site or our mobile application.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">Limitation of Liability</h2>
              <p>
                UNDER NO CIRCUMSTANCE SHALL WE HAVE ANY LIABILITY TO YOU FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED 
                AS A RESULT OF THE USE OF THE SITE OR OUR MOBILE APPLICATION OR RELIANCE ON ANY INFORMATION PROVIDED 
                ON THE SITE AND OUR MOBILE APPLICATION. YOUR USE OF THE SITE AND OUR MOBILE APPLICATION AND YOUR 
                RELIANCE ON ANY INFORMATION ON THE SITE AND OUR MOBILE APPLICATION IS SOLELY AT YOUR OWN RISK.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">External Links Disclaimer</h2>
              <p>
                The Site and our mobile application may contain (or you may be sent through the Site or our mobile 
                application) links to other websites or content belonging to or originating from third parties or 
                links to websites and features in banners or other advertising. Such external links are not 
                investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, 
                or completeness by us.
              </p>
              <p className="mt-3">
                WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR THE ACCURACY OR RELIABILITY OF 
                ANY INFORMATION OFFERED BY THIRD-PARTY WEBSITES LINKED THROUGH THE SITE OR ANY WEBSITE OR FEATURE 
                LINKED IN ANY BANNER OR OTHER ADVERTISING.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">Professional Disclaimer</h2>
              <p>
                The Site cannot and does not contain professional music industry advice. The music industry 
                information is provided for general informational and educational purposes only and is not a 
                substitute for professional advice.
              </p>
              <p className="mt-3">
                Accordingly, before taking any actions based upon such information, we encourage you to consult 
                with the appropriate professionals. We do not provide any kind of professional advice. THE USE OR 
                RELIANCE OF ANY INFORMATION CONTAINED ON THE SITE OR OUR MOBILE APPLICATION IS SOLELY AT YOUR OWN RISK.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">Testimonials Disclaimer</h2>
              <p>
                The Site may contain testimonials by users of our products and/or services. These testimonials 
                reflect the real-life experiences and opinions of such users. However, the experiences are personal 
                to those particular users, and may not necessarily be representative of all users of our products 
                and/or services. We do not claim, and you should not assume, that all users will have the same 
                experiences.
              </p>
              <p className="mt-3">
                YOUR INDIVIDUAL RESULTS MAY VARY. The testimonials on the Site are submitted in various forms such 
                as text, audio and/or video, and are reviewed by us before being posted. They appear on the Site 
                verbatim as given by the users, except for the correction of grammar or typing errors.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">Errors and Omissions Disclaimer</h2>
              <p>
                While we have made every attempt to ensure that the information contained in the Site and our mobile 
                application has been obtained from reliable sources, Soundope is not responsible for any errors or 
                omissions or for the results obtained from the use of this information. All information in the Site 
                and our mobile application is provided "as is," with no guarantee of completeness, accuracy, 
                timeliness or of the results obtained from the use of this information, and without warranty of any 
                kind, express or implied, including, but not limited to warranties of performance, merchantability, 
                and fitness for a particular purpose.
              </p>
            </div>

            <div className="neuro-flat rounded-2xl p-6 mt-8">
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-3">Legal Address</h2>
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