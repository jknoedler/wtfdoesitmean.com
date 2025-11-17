
import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function Report() {
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await api.auth.me();
      setCurrentUser(user);
      setReporterEmail(user.email);
    } catch (error) {
      // User not logged in
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reportType || !description || !reporterEmail) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save report to database
      await api.entities.Report.create({
        reporter_id: currentUser?.id || null,
        reporter_email: reporterEmail,
        report_type: reportType,
        description: description,
        target_type: "general",
        status: "pending"
      });

      // Try to send email notifications (but don't fail if this doesn't work)
      try {
        const emailContent = `
New Report Submitted

Type: ${reportType}
Submitted by: ${reporterEmail}
User ID: ${currentUser?.id || "Not logged in"}

Description:
${description}

---
Submitted at: ${new Date().toLocaleString()}
View in Moderation Dashboard: ${window.location.origin}/moderation
        `;

        await Promise.all([
          api.integrations.Core.SendEmail({
            to: "jknoedler@soundope.com",
            subject: `[REPORT] ${reportType} - Soundope`,
            body: emailContent
          }),
          api.integrations.Core.SendEmail({
            to: "k.debey@soundope.com",
            subject: `[REPORT] ${reportType} - Soundope`,
            body: emailContent
          })
        ]);
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        // Don't fail the whole operation if email fails
      }

      // Report was successfully saved, show success
      setSubmitted(true);
      setDescription("");
      setReportType("");
    } catch (error) {
      console.error("Report submission error:", error);
      alert("Failed to submit report. Please try again or email us directly at jknoedler@soundope.com or k.debey@soundope.com");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen px-4 py-16 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="neuro-base rounded-3xl p-8 text-center">
            <div className="neuro-pressed w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[#90b090]" />
            </div>
            <h1 className="text-2xl font-light text-[#d0d0d0] mb-3">Report Submitted</h1>
            <p className="text-sm text-[#808080] mb-6">
              Thank you for your report. We'll review it and take appropriate action.
            </p>
            <Button
              onClick={() => setSubmitted(false)}
              className="neuro-base active:neuro-pressed rounded-2xl px-8 py-3 text-[#a0a0a0]"
            >
              Submit Another Report
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="neuro-base rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="neuro-pressed w-16 h-16 rounded-3xl flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-[#b09090]" />
            </div>
            <div>
              <h1 className="text-3xl font-light text-[#d0d0d0]">Report an Issue</h1>
              <p className="text-sm text-[#707070]">Help us keep Soundope safe and functional</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-[#a0a0a0] mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-2xl p-3 text-sm"
                required
              >
                <option value="">Select a type...</option>
                <option value="Inappropriate Content">Inappropriate Content</option>
                <option value="Copyright Violation">Copyright Violation</option>
                <option value="Harassment">Harassment</option>
                <option value="Spam">Spam</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#a0a0a0] mb-2">Your Email</label>
              <Input
                type="email"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-2xl"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[#a0a0a0] mb-2">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide details about what you're reporting. Include any relevant URLs, usernames, or track names."
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-2xl min-h-[200px] resize-none"
                required
              />
              <p className="text-xs text-[#606060] mt-2">
                Please be as specific as possible. We review all reports within 24-48 hours.
              </p>
            </div>

            <div className="neuro-flat rounded-2xl p-4">
              <h3 className="text-sm font-medium text-[#d0d0d0] mb-2">Important Notes</h3>
              <ul className="space-y-2 text-xs text-[#808080]">
                <li>• False reports may result in account suspension</li>
                <li>• For urgent safety concerns, contact us at jknoedler@soundope.com or k.debey@soundope.com</li>
                <li>• Reports are confidential and handled by our moderation team</li>
                <li>• You may be contacted for additional information</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full neuro-base active:neuro-pressed rounded-2xl py-4 text-[#b0b0b0]"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
