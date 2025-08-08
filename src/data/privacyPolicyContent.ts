// Privacy Policy Content for OhmS-44 Website
// This file contains the comprehensive privacy policy content

export interface PrivacySection {
  id: string;
  title: string;
  content: string[];
  lastUpdated?: string;
}

export const privacyPolicyData: PrivacySection[] = [
  {
    id: "introduction",
    title: "Introduction",
    content: [
      "Welcome to OhmS-44 ('we', 'our', or 'us'). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website https://ohms-44.web.app and use our Progressive Web Application (PWA).",
      "Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access or use our services.",
      "We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the 'Last Updated' date of this Privacy Policy."
    ]
  },
  {
    id: "information-collection",
    title: "Information We Collect",
    content: [
      "We may collect information about you in a variety of ways. The information we may collect includes:",
      "",
      "**Personal Data:**",
      "• Name and contact information when you voluntarily provide it",
      "• Email address for authentication purposes (Google Sign-In)",
      "• Profile information from your Google account (if you choose to sign in)",
      "",
      "**Usage Data:**",
      "• Information about your device, browser, and operating system",
      "• IP address and general location information",
      "• Pages visited, time spent on pages, and navigation patterns",
      "• App usage statistics and performance metrics",
      "",
      "**Technical Data:**",
      "• Browser type and version",
      "• Device identifiers and characteristics",
      "• Screen resolution and device capabilities",
      "• Service worker and PWA installation data"
    ]
  },
  {
    id: "firebase-usage",
    title: "Firebase and Data Storage",
    content: [
      "Our application uses Google Firebase services for data storage and functionality:",
      "",
      "**Firebase Realtime Database:**",
      "• Stores class schedules, attendance records, notices, and classmate information",
      "• Data is stored in the Asia Southeast region for optimal performance",
      "• Public read access is enabled for all users to view shared information",
      "• Write access is restricted to authorized administrators only",
      "",
      "**Firebase Authentication:**",
      "• Manages user sign-in through Google OAuth",
      "• Stores authentication tokens and user session data",
      "• Enables secure access to admin features for authorized users",
      "",
      "**Firebase Analytics:**",
      "• Collects anonymous usage statistics and app performance data",
      "• Helps us understand user behavior and improve our services",
      "• Data is processed according to Google's Privacy Policy",
      "",
      "**Firebase Cloud Messaging:**",
      "• Enables push notifications for important updates and announcements",
      "• Requires user consent before sending notifications",
      "• Users can disable notifications at any time through browser settings"
    ]
  },
  {
    id: "data-usage",
    title: "How We Use Your Information",
    content: [
      "We use the information we collect for various purposes:",
      "",
      "**Service Provision:**",
      "• To provide and maintain our educational platform",
      "• To display class schedules, attendance records, and notices",
      "• To enable user authentication and access control",
      "",
      "**Communication:**",
      "• To send important notifications about schedule changes",
      "• To provide updates about new features or maintenance",
      "• To respond to user inquiries and support requests",
      "",
      "**Improvement and Analytics:**",
      "• To analyze usage patterns and improve user experience",
      "• To monitor app performance and fix technical issues",
      "• To develop new features based on user needs",
      "",
      "**Legal and Security:**",
      "• To comply with legal obligations and regulations",
      "• To protect against fraud, abuse, and security threats",
      "• To enforce our terms of service and policies"
    ]
  },
  {
    id: "data-sharing",
    title: "Information Sharing and Disclosure",
    content: [
      "We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:",
      "",
      "**Service Providers:**",
      "• Google Firebase for data storage and authentication",
      "• Google Analytics for usage statistics and performance monitoring",
      "• These providers are bound by strict data protection agreements",
      "",
      "**Legal Requirements:**",
      "• When required by law, regulation, or legal process",
      "• To protect our rights, property, or safety",
      "• To protect the rights, property, or safety of our users",
      "",
      "**Business Transfers:**",
      "• In connection with any merger, sale, or transfer of assets",
      "• Users will be notified of any such changes via email or website notice",
      "",
      "**Public Information:**",
      "• Class schedules, general notices, and non-personal academic information",
      "• This information is publicly accessible as part of our educational mission"
    ]
  }
];

export const additionalPrivacySections: PrivacySection[] = [
  {
    id: "data-security",
    title: "Data Security",
    content: [
      "We implement appropriate technical and organizational security measures to protect your personal information:",
      "",
      "**Technical Safeguards:**",
      "• HTTPS encryption for all data transmission",
      "• Firebase security rules to control data access",
      "• Regular security updates and monitoring",
      "• Secure authentication through Google OAuth",
      "",
      "**Access Controls:**",
      "• Administrative access limited to authorized personnel only",
      "• Role-based permissions for different user types",
      "• Regular review and audit of access permissions",
      "",
      "**Data Backup and Recovery:**",
      "• Regular automated backups of critical data",
      "• Disaster recovery procedures in place",
      "• Data integrity monitoring and validation",
      "",
      "However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security."
    ]
  },
  {
    id: "user-rights",
    title: "Your Privacy Rights",
    content: [
      "Depending on your location, you may have certain rights regarding your personal information:",
      "",
      "**Access and Portability:**",
      "• Right to access your personal data we hold",
      "• Right to receive a copy of your data in a portable format",
      "• Right to know how your data is being processed",
      "",
      "**Correction and Deletion:**",
      "• Right to correct inaccurate or incomplete personal data",
      "• Right to request deletion of your personal data",
      "• Right to withdraw consent for data processing",
      "",
      "**Control and Objection:**",
      "• Right to object to certain types of data processing",
      "• Right to restrict processing of your personal data",
      "• Right to opt-out of marketing communications",
      "",
      "**How to Exercise Your Rights:**",
      "• Contact us using the information provided in the 'Contact Us' section",
      "• We will respond to your request within 30 days",
      "• Some requests may require identity verification for security purposes"
    ]
  },
  {
    id: "cookies-tracking",
    title: "Cookies and Tracking Technologies",
    content: [
      "Our website and PWA use various tracking technologies to enhance user experience:",
      "",
      "**Essential Cookies:**",
      "• Authentication tokens and session management",
      "• User preferences and settings storage",
      "• PWA functionality and offline capabilities",
      "",
      "**Analytics Cookies:**",
      "• Google Analytics for usage statistics",
      "• Performance monitoring and error tracking",
      "• User behavior analysis for service improvement",
      "",
      "**Local Storage:**",
      "• Offline data caching for PWA functionality",
      "• User preferences and application state",
      "• Temporary data for improved performance",
      "",
      "**Managing Cookies:**",
      "• You can control cookies through your browser settings",
      "• Disabling certain cookies may affect app functionality",
      "• Clear browser data to remove stored information"
    ]
  },
  {
    id: "international-transfers",
    title: "International Data Transfers",
    content: [
      "Your information may be transferred to and processed in countries other than your own:",
      "",
      "**Firebase Data Centers:**",
      "• Primary data storage in Asia Southeast region",
      "• Google's global infrastructure for redundancy and performance",
      "• Data processing may occur in various Google data centers worldwide",
      "",
      "**Safeguards:**",
      "• Google Firebase complies with international data protection standards",
      "• Adequate protection measures in accordance with applicable laws",
      "• Standard contractual clauses for international transfers",
      "",
      "**Your Consent:**",
      "By using our services, you consent to the transfer of your information to these facilities and countries."
    ]
  },
  {
    id: "children-privacy",
    title: "Children's Privacy",
    content: [
      "Our service is designed for educational use and may be accessed by students of various ages:",
      "",
      "**Age Restrictions:**",
      "• We do not knowingly collect personal information from children under 13",
      "• Users under 18 should have parental consent before using our services",
      "• Educational institutions are responsible for ensuring appropriate consent",
      "",
      "**Parental Rights:**",
      "• Parents can request access to their child's information",
      "• Parents can request deletion of their child's personal data",
      "• Parents can contact us to discuss their child's privacy",
      "",
      "**Educational Context:**",
      "• Information is collected and used for legitimate educational purposes",
      "• Data sharing is limited to educational stakeholders only",
      "• We comply with applicable educational privacy laws (FERPA, COPPA, etc.)"
    ]
  },
  {
    id: "legal-compliance",
    title: "Legal Compliance",
    content: [
      "We are committed to complying with applicable privacy laws and regulations:",
      "",
      "**GDPR Compliance (EU Users):**",
      "• Lawful basis for processing personal data",
      "• Data protection impact assessments where required",
      "• Appointment of Data Protection Officer if necessary",
      "• Right to lodge complaints with supervisory authorities",
      "",
      "**CCPA Compliance (California Users):**",
      "• Disclosure of personal information categories collected",
      "• Right to know about personal information sales (we don't sell data)",
      "• Right to delete personal information",
      "• Non-discrimination for exercising privacy rights",
      "",
      "**Other Jurisdictions:**",
      "• We monitor and comply with emerging privacy regulations",
      "• Local data protection laws are respected where applicable",
      "• Regular review and updates to ensure ongoing compliance"
    ]
  },
  {
    id: "updates-changes",
    title: "Policy Updates and Changes",
    content: [
      "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements:",
      "",
      "**Notification of Changes:**",
      "• Material changes will be prominently posted on our website",
      "• Users will be notified via email if we have their contact information",
      "• Continued use of our services constitutes acceptance of changes",
      "",
      "**Version Control:**",
      "• Each version of this policy is dated and archived",
      "• Previous versions are available upon request",
      "• Change logs are maintained for transparency",
      "",
      "**Review Schedule:**",
      "• This policy is reviewed annually or as needed",
      "• Updates are made to reflect new features or legal requirements",
      "• User feedback is considered in policy revisions"
    ]
  },
  {
    id: "contact-information",
    title: "Contact Information",
    content: [
      "If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:",
      "",
      "**Primary Contact:**",
      "• Website: https://ohms-44.web.app",
      "• Project: OhmS-44 Educational Platform",
      "• Response Time: We aim to respond within 48 hours",
      "",
      "**Data Protection Inquiries:**",
      "• For privacy-related questions and requests",
      "• To exercise your privacy rights",
      "• To report privacy concerns or violations",
      "",
      "**Technical Support:**",
      "• For technical issues related to data access or deletion",
      "• For questions about PWA functionality and data storage",
      "• For assistance with account management",
      "",
      "**Mailing Address:**",
      "OhmS-44 Educational Platform",
      "Privacy Officer",
      "[Institution Address]",
      "[City, State, ZIP Code]",
      "",
      "**Last Updated:** " + new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    ]
  }
];

// Combine all sections
export const allPrivacySections = [...privacyPolicyData, ...additionalPrivacySections];

// Export metadata
export const privacyPolicyMetadata = {
  title: "Privacy Policy - OhmS-44",
  description: "Privacy Policy for OhmS-44 educational platform covering data collection, Firebase usage, user rights, and legal compliance.",
  lastUpdated: new Date().toISOString(),
  version: "1.0.0",
  effectiveDate: new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
};
