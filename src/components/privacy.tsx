
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, Users, Database, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import Footer from './Footer';

const PrivacyPolicy: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [signUpMode, setSignUpMode] = useState(false);
  const [loading, setLoading] = useState(true); // ⬅️ loading state
  const lastUpdated = "January 15, 2025";

  // Always scroll to top when this page loads
  useEffect(() => {
    window.scrollTo(0, 0);
    // simulate loading effect
    const timer = setTimeout(() => setLoading(false), 1000); // adjust duration as needed
    return () => clearTimeout(timer);
  }, []);

  
  const sections = [
    {
      title: "Information We Collect",
      icon: Database,
      content: [
        {
          subtitle: "Personal Information",
          details: "We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us. This may include your name, email address, phone number, company name, and billing information."
        },
        {
          subtitle: "Usage Data",
          details: "We automatically collect information about how you use our services, including your IP address, browser type, operating system, pages viewed, time spent on pages, and other usage statistics."
        },
        {
          subtitle: "Company Search Data",
          details: "When you search for companies or access reports, we log these queries to improve our services and provide you with relevant recommendations."
        }
      ]
    },
    {
      title: "How We Use Your Information",
      icon: Eye,
      content: [
        {
          subtitle: "Service Provision",
          details: "We use your information to provide, maintain, and improve our company intelligence services, process transactions, and provide customer support."
        },
        {
          subtitle: "Communications",
          details: "We may use your contact information to send you service-related notifications, updates about our platform, and marketing communications (which you can opt out of)."
        },
        {
          subtitle: "Analytics and Improvements",
          details: "We analyze usage patterns to enhance user experience, develop new features, and optimize our platform performance."
        }
      ]
    },
    {
      title: "Information Sharing",
      icon: Users,
      content: [
        {
          subtitle: "Service Providers",
          details: "We may share your information with trusted third-party service providers who assist us in operating our platform, processing payments, or providing customer support."
        },
        {
          subtitle: "Legal Compliance",
          details: "We may disclose your information if required by law, regulation, legal process, or governmental request, or to protect our rights and the safety of our users."
        },
        {
          subtitle: "Business Transfers",
          details: "In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction."
        }
      ]
    }
  ];

  const rights = [
    "Access and receive a copy of your personal data",
    "Request correction of inaccurate personal data",
    "Request deletion of your personal data",
    "Object to or restrict processing of your personal data",
    "Request data portability",
    "Withdraw consent at any time"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation Header */}
      <header
        className="sticky top-0 w-full text-white shadow-xl border-b border-slate-700/50 z-50"
        style={{ background: "linear-gradient(45deg, #1a1054, #255ff1)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a
                href="/"
                className="hover:opacity-90 transition-opacity duration-200"
              >
                <img
                  src="/veri.png"
                  alt="Veriffyvista"
                  style={{ height: "150px", width: "150px" }}
                  className="object-contain"
                />
              </a>
            </div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-white">
                  User ID: {user.id}
                </span>
                <button
                  onClick={() => {
                    logout();
                    navigate("/signin");
                  }}
                  className="hidden sm:inline-flex bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 shadow-sm"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() =>
                  navigate(signUpMode ? "/signin" : "/signin?mode=signup")
                }
                className="hidden sm:inline-flex bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 shadow-sm"
              >
                {signUpMode ? "Sign In" : "Sign Up"}
              </button>
            )}
          </div>
        </div>
      </header>
      
      {/* Page Header */}
      <div className="text-white py-16" style={{ background: "linear-gradient(135deg, #1a1054, #255ff1)" }} >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Shield className="h-12 w-12 text-blue-400 mr-4" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
              <p className="text-xl text-gray-300">Last updated: {lastUpdated}</p>
            </div>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed">
            At Verifyvista, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, and safeguard your data when you use our services.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Overview */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-12">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Important Notice</h3>
              <p className="text-blue-800">
                This Privacy Policy applies to all users of Verifyvista's platform and services. By using our services, 
                you agree to the collection and use of information in accordance with this policy.
              </p>
            </div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="space-y-12">
          {sections.map((section, index) => (
            <section key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center mb-6">
                <section.icon className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>
              
              <div className="space-y-6">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.subtitle}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.details}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Data Security */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <Lock className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and audits</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection practices</li>
                <li>Incident response procedures</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {rights.map((right, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{right}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Cookies and Tracking */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Cookies and Tracking Technologies</h2>
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience on our platform. 
                These technologies help us:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Remember your preferences and settings</li>
                <li>Analyze site traffic and usage patterns</li>
                <li>Provide personalized content and recommendations</li>
                <li>Improve our services and user experience</li>
              </ul>
              <p className="text-gray-600 leading-relaxed">
                You can control cookies through your browser settings. However, disabling cookies may affect 
                the functionality of our services.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-2 text-gray-600">
              <p><strong>Email:</strong> support@verifyvista.com</p>
              <p><strong>Address:</strong>Third Floor ,House No.9 ,Paschim Vihar ,Madipur Metro Station ,Paschim Vihar Extension ,West Delhi ,Delhi-110063</p>
              <p><strong>Phone:</strong> +91 11 430 22 315</p>
            </div>
          </section>

          {/* Updates */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Policy Updates</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other 
              operational, legal, or regulatory reasons. We will notify you of any material changes by posting the 
              updated policy on this page and updating the "Last updated" date. We encourage you to review this 
              Privacy Policy periodically to stay informed about how we protect your information.
            </p>
          </section>
        </div>
      </div>
        {/* Add Footer here - after the floating CTA */}
        <Footer />
    </div>
  );
};


export default PrivacyPolicy;