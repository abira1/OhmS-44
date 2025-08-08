import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, ShieldIcon, FileTextIcon, InfoIcon, ExternalLinkIcon } from 'lucide-react';
import { RetroButton, RetroIconButton } from '../components/ui/RetroButton';
import { allPrivacySections, privacyPolicyMetadata } from '../data/privacyPolicyContent';
import { MobileContainer, MobileCard } from '../components/mobile/MobileLayout';

export const PrivacyPolicyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const [isScrolled, setIsScrolled] = useState(false);

  // Set document title and meta tags for SEO
  useEffect(() => {
    // Update document title
    document.title = privacyPolicyMetadata.title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', privacyPolicyMetadata.description);
    } else {
      const newMetaDescription = document.createElement('meta');
      newMetaDescription.name = 'description';
      newMetaDescription.content = privacyPolicyMetadata.description;
      document.head.appendChild(newMetaDescription);
    }

    // Add Open Graph meta tags
    const ogTags = [
      { property: 'og:title', content: privacyPolicyMetadata.title },
      { property: 'og:description', content: privacyPolicyMetadata.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://ohms-44.web.app/privacy-policy' },
      { property: 'og:site_name', content: 'OhmS-44' }
    ];

    ogTags.forEach(tag => {
      let ogTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (ogTag) {
        ogTag.setAttribute('content', tag.content);
      } else {
        ogTag = document.createElement('meta');
        ogTag.setAttribute('property', tag.property);
        ogTag.setAttribute('content', tag.content);
        document.head.appendChild(ogTag);
      }
    });

    // Add Twitter Card meta tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: privacyPolicyMetadata.title },
      { name: 'twitter:description', content: privacyPolicyMetadata.description }
    ];

    twitterTags.forEach(tag => {
      let twitterTag = document.querySelector(`meta[name="${tag.name}"]`);
      if (twitterTag) {
        twitterTag.setAttribute('content', tag.content);
      } else {
        twitterTag = document.createElement('meta');
        twitterTag.setAttribute('name', tag.name);
        twitterTag.setAttribute('content', tag.content);
        document.head.appendChild(twitterTag);
      }
    });

    // Add canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', 'https://ohms-44.web.app/privacy-policy');
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', 'https://ohms-44.web.app/privacy-policy');
      document.head.appendChild(canonicalLink);
    }

    // Add robots meta tag
    let robotsTag = document.querySelector('meta[name="robots"]');
    if (robotsTag) {
      robotsTag.setAttribute('content', 'index, follow');
    } else {
      robotsTag = document.createElement('meta');
      robotsTag.setAttribute('name', 'robots');
      robotsTag.setAttribute('content', 'index, follow');
      document.head.appendChild(robotsTag);
    }

    // Add structured data (JSON-LD)
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": privacyPolicyMetadata.title,
      "description": privacyPolicyMetadata.description,
      "url": "https://ohms-44.web.app/privacy-policy",
      "dateModified": privacyPolicyMetadata.lastUpdated,
      "datePublished": privacyPolicyMetadata.lastUpdated,
      "inLanguage": "en-US",
      "isPartOf": {
        "@type": "WebSite",
        "name": "OhmS-44",
        "url": "https://ohms-44.web.app"
      },
      "about": {
        "@type": "Thing",
        "name": "Privacy Policy",
        "description": "Data protection and privacy practices for OhmS-44 educational platform"
      },
      "mainEntity": {
        "@type": "Article",
        "headline": "Privacy Policy",
        "dateModified": privacyPolicyMetadata.lastUpdated,
        "datePublished": privacyPolicyMetadata.lastUpdated,
        "author": {
          "@type": "Organization",
          "name": "OhmS-44"
        }
      }
    };

    let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    if (structuredDataScript) {
      structuredDataScript.textContent = JSON.stringify(structuredData);
    } else {
      structuredDataScript = document.createElement('script');
      structuredDataScript.type = 'application/ld+json';
      structuredDataScript.textContent = JSON.stringify(structuredData);
      document.head.appendChild(structuredDataScript);
    }

    // Cleanup function to restore original title when component unmounts
    return () => {
      document.title = 'OhmS-44 - Where Energy Meets Excellence';
    };
  }, []);

  // Handle scroll for sticky navigation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll to section when activeSection changes
  useEffect(() => {
    const element = document.getElementById(activeSection);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeSection]);

  const handleBackClick = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  const formatContent = (content: string) => {
    // Handle markdown-style formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '&bull;');
  };

  return (
    <div className="min-h-screen bg-retro-cream dark:bg-retro-black text-gray-800 dark:text-retro-cream transition-colors duration-400">
      {/* Retro Background Effects */}
      <div className="retro-scanline"></div>
      <div className="retro-noise"></div>

      {/* Header */}
      <header className={`sticky top-0 z-30 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RetroIconButton
                icon={ArrowLeftIcon}
                onClick={handleBackClick}
                variant="secondary"
                size="md"
                aria-label="Go back"
                className="text-gray-600 dark:text-gray-300"
              />
              <div className="flex items-center gap-2">
                <ShieldIcon className="h-6 w-6 text-retro-purple dark:text-retro-teal" />
                <h1 className="text-xl sm:text-2xl font-vhs font-bold text-retro-purple dark:text-retro-teal">
                  Privacy Policy
                </h1>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-vhs">
              v{privacyPolicyMetadata.version}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <MobileCard className="p-4">
                <h2 className="text-lg font-vhs font-bold text-retro-purple dark:text-retro-teal mb-4 flex items-center gap-2">
                  <FileTextIcon className="h-5 w-5" />
                  Contents
                </h2>
                <nav className="space-y-2">
                  {allPrivacySections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-vhs transition-all duration-200 ${
                        activeSection === section.id
                          ? 'bg-retro-purple text-white dark:bg-retro-teal dark:text-black'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </MobileCard>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Policy Metadata */}
            <MobileCard className="p-6 mb-8 bg-gradient-to-r from-retro-purple/10 to-retro-teal/10 dark:from-retro-purple/20 dark:to-retro-teal/20">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-retro-purple/20 dark:bg-retro-teal/20 rounded-lg">
                  <InfoIcon className="h-6 w-6 text-retro-purple dark:text-retro-teal" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-vhs font-bold text-retro-purple dark:text-retro-teal mb-2">
                    OhmS-44 Privacy Policy
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    This Privacy Policy describes how we collect, use, and protect your information when you use the OhmS-44 educational platform.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">Effective Date:</span>
                      <br />
                      <span className="text-gray-600 dark:text-gray-300">{privacyPolicyMetadata.effectiveDate}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">Last Updated:</span>
                      <br />
                      <span className="text-gray-600 dark:text-gray-300">
                        {new Date(privacyPolicyMetadata.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </MobileCard>

            {/* Privacy Policy Sections */}
            <div className="space-y-8">
              {allPrivacySections.map((section) => (
                <MobileCard key={section.id} id={section.id} className="p-6">
                  <h2 className="text-2xl font-vhs font-bold text-retro-purple dark:text-retro-teal mb-4 retro-heading">
                    {section.title}
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    {section.content.map((paragraph, index) => {
                      if (paragraph === '') {
                        return <div key={index} className="h-4" />;
                      }
                      
                      if (paragraph.startsWith('**') && paragraph.endsWith(':**')) {
                        return (
                          <h3 key={index} className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3 font-vhs">
                            {paragraph.replace(/\*\*/g, '').replace(':', '')}
                          </h3>
                        );
                      }
                      
                      if (paragraph.startsWith('•')) {
                        return (
                          <div key={index} className="flex items-start gap-3 mb-2">
                            <span className="text-retro-purple dark:text-retro-teal mt-1">•</span>
                            <span 
                              className="text-gray-700 dark:text-gray-300 leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: formatContent(paragraph.substring(2)) }}
                            />
                          </div>
                        );
                      }
                      
                      return (
                        <p 
                          key={index} 
                          className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4"
                          dangerouslySetInnerHTML={{ __html: formatContent(paragraph) }}
                        />
                      );
                    })}
                  </div>
                </MobileCard>
              ))}
            </div>

            {/* Footer Actions */}
            <MobileCard className="p-6 mt-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <div className="text-center">
                <h3 className="text-lg font-vhs font-bold text-gray-800 dark:text-gray-200 mb-4">
                  Questions about this Privacy Policy?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  If you have any questions or concerns about our privacy practices, please don't hesitate to contact us.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <RetroButton
                    onClick={() => window.location.href = 'https://ohms-44.web.app'}
                    variant="primary"
                    icon={ExternalLinkIcon}
                    iconPosition="right"
                  >
                    Visit OhmS-44
                  </RetroButton>
                  <RetroButton
                    onClick={handleBackClick}
                    variant="secondary"
                  >
                    Back to App
                  </RetroButton>
                </div>
              </div>
            </MobileCard>
          </div>
        </div>
      </div>
    </div>
  );
};
