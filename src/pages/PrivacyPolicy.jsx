import {
  Shield, List, Database, Share2, Lock,
  Camera, MapPin, Baby, Cookie, Bell, Mail, FileText
} from 'lucide-react';

const sections = [
  { id: 'overview',      icon: FileText,  title: '1. Overview & Introduction' },
  { id: 'data',          icon: Database,  title: '2. Data We Collect' },
  { id: 'usage',         icon: List,      title: '3. How We Use Your Data' },
  { id: 'sharing',       icon: Share2,    title: '4. Data Sharing' },
  { id: 'security',      icon: Lock,      title: '5. Storage & Security' },
  { id: 'rights',        icon: Shield,    title: '6. Your Rights' },
  { id: 'camera',        icon: Camera,    title: '7. Camera & Images' },
  { id: 'location',      icon: MapPin,    title: '8. Location Data' },
  { id: 'children',      icon: Baby,      title: '9. Children\'s Privacy' },
  { id: 'cookies',       icon: Cookie,    title: '10. Cookies & Analytics' },
  { id: 'changes',       icon: Bell,      title: '11. Changes to Policy' },
  { id: 'contact',       icon: Mail,      title: '12. Contact Us' },
];

const Section = ({ id, icon: Icon, title, children }) => (
  <div className="privacy-sec" id={id}>
    <h2><Icon size={18} /> {title}</h2>
    {children}
  </div>
);

export default function PrivacyPolicy() {
  return (
    <>
      <div className="privacy-hero">
        <div className="privacy-hero-icon"><Shield size={32} /></div>
        <h1>Privacy Policy</h1>
        <p>Krushi Sathi — AI-Powered Smart Farming Assistant</p>
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--t5)' }}>
          Effective: January 1, 2025 &nbsp;·&nbsp; Last Updated: July 23, 2025
        </p>
      </div>

      <div className="privacy-body">
        {/* TOC */}
        <div className="privacy-toc">
          <h3><List size={15} /> Table of Contents</h3>
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`}>{s.title}</a>
          ))}
        </div>

        {/* Sections */}
        <Section id="overview" icon={FileText} title="1. Overview & Introduction">
          <p>
            Welcome to <strong>Krushi Sathi</strong> — an AI-powered smart farming assistant designed exclusively for Indian farmers. Krushi Sathi helps farmers identify crop diseases, get fertilizer recommendations, and connect with agricultural experts.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, store, and protect your personal information. By using Krushi Sathi, you agree to the practices described here.
          </p>
          <div className="privacy-hl">
            🌾 <strong>Our Commitment:</strong> Krushi Sathi is built for the benefit of Indian farmers. Your agricultural data is used solely to improve your farming outcomes — never for advertising.
          </div>
        </Section>

        <Section id="data" icon={Database} title="2. Data We Collect">
          <p><strong>2.1 Account Information</strong></p>
          <ul>
            <li>Full name</li>
            <li>Mobile phone number (primary identifier)</li>
            <li>Email address (optional)</li>
            <li>Password (hashed with bcrypt, never stored in plain text)</li>
          </ul>
          <p><strong>2.2 Farm Profile Data</strong></p>
          <ul>
            <li>Farm location / village / district</li>
            <li>Farm size (acres/bigha)</li>
            <li>Main crop types, soil type, sowing dates</li>
          </ul>
          <p><strong>2.3 Crop Scan Data</strong></p>
          <ul>
            <li>Photographs of crops captured via camera</li>
            <li>AI disease detection results (disease name, severity, confidence)</li>
            <li>Treatment and fertilizer recommendations</li>
            <li>Scan timestamps and history</li>
          </ul>
          <p><strong>2.4 Usage & Activity</strong></p>
          <ul>
            <li>Expert questions submitted</li>
            <li>Alerts received</li>
            <li>Anonymized app usage patterns</li>
          </ul>
        </Section>

        <Section id="usage" icon={List} title="3. How We Use Your Data">
          <ul>
            <li><strong>Disease Detection:</strong> Analyze crop photos using AI to identify diseases</li>
            <li><strong>Personalized Advice:</strong> Fertilizer recommendations based on your crop and soil</li>
            <li><strong>Expert Q&A:</strong> Connect questions with certified agricultural experts</li>
            <li><strong>Weather Alerts:</strong> Send regional weather warnings for your farming area</li>
            <li><strong>Account Management:</strong> Authentication, OTP password resets</li>
            <li><strong>Service Improvement:</strong> Anonymized analytics to improve AI models</li>
            <li><strong>Notifications:</strong> Spray reminders, irrigation alerts, disease warnings</li>
          </ul>
          <div className="privacy-hl">
            🚫 <strong>We do NOT sell your data or use it for advertising purposes.</strong>
          </div>
        </Section>

        <Section id="sharing" icon={Share2} title="4. Data Sharing & Disclosure">
          <p>We do not sell, trade, or rent your personal information. We may share data only in these circumstances:</p>
          <ul>
            <li><strong>Agricultural Experts:</strong> Questions shared with certified experts (with consent)</li>
            <li><strong>Service Providers:</strong> Trusted infrastructure providers under strict confidentiality</li>
            <li><strong>Legal Requirements:</strong> If required by Indian law or government authority</li>
            <li><strong>Anonymous Research:</strong> Aggregated, anonymous data for agricultural research only</li>
          </ul>
        </Section>

        <Section id="security" icon={Lock} title="5. Data Storage & Security">
          <ul>
            <li>Data stored on secure servers in India / compliant cloud infrastructure</li>
            <li>Passwords hashed with <strong>bcrypt (12 rounds)</strong> — never stored in plain text</li>
            <li>All API communications use <strong>HTTPS/TLS encryption</strong></li>
            <li>Authentication tokens (JWT) expire after <strong>7 days</strong></li>
            <li>Crop images stored securely, accessible only to you and our AI system</li>
            <li>Account deletion results in permanent data removal within 30 days</li>
          </ul>
          <div className="privacy-hl">
            🔐 We implement industry-standard security including encrypted storage, secure API authentication, and regular security audits.
          </div>
        </Section>

        <Section id="rights" icon={Shield} title="6. Your Rights & Controls">
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update your profile information anytime in app settings</li>
            <li><strong>Deletion:</strong> Request deletion of your account and all associated data</li>
            <li><strong>Data Portability:</strong> Request your scan history in a readable format</li>
            <li><strong>Withdraw Consent:</strong> Disable camera/location access in device settings</li>
            <li><strong>Notifications:</strong> Turn off push notifications in app or device settings</li>
          </ul>
          <p>Contact us at <strong style={{ color: 'var(--green-400)' }}>privacy@krushisathi.com</strong> to exercise any of these rights.</p>
        </Section>

        <Section id="camera" icon={Camera} title="7. Camera & Image Access">
          <ul>
            <li>Camera access is used <strong>only</strong> for crop scanning features</li>
            <li>Photos uploaded to our server for AI analysis only</li>
            <li>Images stored securely linked to your account</li>
            <li>You can delete any scan from your history at any time</li>
            <li>We do not access your device gallery without explicit action</li>
          </ul>
          <div className="privacy-hl">
            📸 Your crop photos are analyzed solely by our AI system. Images are never shared with or sold to any third party.
          </div>
        </Section>

        <Section id="location" icon={MapPin} title="8. Location Data">
          <ul>
            <li>Location used to fetch weather forecasts for your farming area</li>
            <li>Stored at village/district level in your farm profile</li>
            <li>NOT tracked in real-time or collected in the background</li>
            <li>Only collected when you explicitly provide it in your profile</li>
          </ul>
        </Section>

        <Section id="children" icon={Baby} title="9. Children's Privacy">
          <p>
            Krushi Sathi is designed for adult farmers aged 18 and above. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, contact us immediately.
          </p>
        </Section>

        <Section id="cookies" icon={Cookie} title="10. Cookies & Analytics">
          <p>The Krushi Sathi mobile app does not use browser cookies. Anonymous analytics may be collected to improve the app:</p>
          <ul>
            <li>Completely anonymized — not linked to your identity</li>
            <li>Used only for improving app performance and features</li>
            <li>Not shared with advertising networks</li>
          </ul>
        </Section>

        <Section id="changes" icon={Bell} title="11. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. When we make significant changes:</p>
          <ul>
            <li>We will notify you through the app or via SMS</li>
            <li>The "Last Updated" date at the top will be revised</li>
            <li>Continued use constitutes acceptance of the updated policy</li>
          </ul>
        </Section>

        <Section id="contact" icon={Mail} title="12. Contact Us">
          <p>Questions, concerns, or data requests:</p>
          <div className="privacy-hl">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>📧 <strong>Privacy:</strong> privacy@krushisathi.com</div>
              <div>📱 <strong>Support:</strong> support@krushisathi.com</div>
              <div>📍 <strong>Address:</strong> Krushi Sathi Technologies, Sangamner, Ahmednagar, Maharashtra — 422605</div>
              <div>⏰ <strong>Response Time:</strong> 2-3 business days</div>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, textAlign: 'center', color: 'var(--t5)', fontSize: 12 }}>
          <div style={{ marginBottom: 8, color: 'var(--green-500)' }}><Shield size={28} /></div>
          <p style={{ color: 'var(--green-400)', fontWeight: 600 }}>Krushi Sathi — Empowering Indian Farmers with AI</p>
          <p style={{ marginTop: 4 }}>© 2025 Krushi Sathi Technologies. All rights reserved.</p>
        </div>
      </div>
    </>
  );
}
