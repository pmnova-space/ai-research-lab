"use client";

import { toPng } from "html-to-image";
import { useRef } from "react";

type ResearchCertificateProps = {
  name?: string;
  keywords?: string[];
  sessionId?: string;
};

export default function ResearchCertificate({
  name = "ARNAV SHARMA",
  keywords = ["Moon", "Lunar Water", "Space Exploration", "NASA"],
  sessionId,
}: ResearchCertificateProps) {
  const certificateRef = useRef<HTMLElement>(null);

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      const dataUrl = await toPng(certificateRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = "AI-Research-Lab-Certificate.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Certificate download failed:", error);
    }
  };

  return (
    <>
      <section
        ref={certificateRef}
        className="research-certificate"
      >
        <div className="certificate-inner">

          {/* Premium outer frame */}
          <div className="certificate-frame frame-top-left" />
          <div className="certificate-frame frame-top-right" />
          <div className="certificate-frame frame-bottom-left" />
          <div className="certificate-frame frame-bottom-right" />

          {/* Top center decorative notch */}
          <div className="certificate-top-notch">
            <span />
          </div>

          {/* Decorative side accents */}
          <div className="certificate-side-accent side-left">
            <span className="accent-teal" />
            <span className="accent-gold" />
            <span className="accent-blue" />
          </div>

          <div className="certificate-side-accent side-right">
            <span className="accent-teal" />
            <span className="accent-gold" />
            <span className="accent-blue" />
          </div>

          {/* Decorative dots */}
          <div className="certificate-decoration decoration-top-left" />
          <div className="certificate-decoration decoration-top-right" />

          {/* AI Research Lab */}
          <div className="certificate-brand">
            AI RESEARCH LAB
          </div>

          {/* Certificate Title */}
          <div className="certificate-title">
            RESEARCH PARTICIPATION CERTIFICATE
          </div>

          {/* Presented To */}
          <div className="certificate-presented">
            Presented to
          </div>

          {/* Participant Name */}
          <div className="certificate-name">
            {name}
          </div>

          {/* Short decorative line directly below name */}
          <div className="certificate-dots" />

          {/* Certificate Description */}
          <div className="certificate-description">
            For completing an AI-assisted research session.
          </div>

          {/* Dynamic Research Keywords */}
          <div className="certificate-keywords">
            {keywords.map((keyword, index) => (
              <span key={`${keyword}-${index}`}>
                {keyword}

                {index < keywords.length - 1 && (
                  <span className="keyword-separator">
                    •
                  </span>
                )}
              </span>
            ))}
          </div>

          {/* Bottom Information */}
          <div className="certificate-bottom">

            {/* Left Side */}
            <div className="certificate-meta">

              <div className="lab-name">
                AI Research Lab
              </div>

              <div className="session-id">
                Session ID: {sessionId}
              </div>

            </div>

            {/* AI Research Lab Seal */}
            <div className="certificate-seal">
              <div className="certificate-seal-icon">
                ✦
              </div>

              <div className="certificate-seal-title">
                AI RESEARCH LAB
              </div>

              <div className="certificate-seal-subtitle">
                RESEARCH • AI • DISCOVERY
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Download Button */}
      <div className="certificate-download-area">
        <button
          type="button"
          className="certificate-download-button"
          onClick={downloadCertificate}
        >
          ↓ Download Certificate
        </button>
      </div>
    </>
  );
}