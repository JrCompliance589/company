import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  Eye,
  Users,
  Database,
  FileText,
  AlertCircle,
  CheckCircle,
  Globe,
  Clock
} from "lucide-react";
import { useAuth } from "./AuthContext";
import Footer from "./Footer";

const PrivacyPolicy: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [signUpMode, setSignUpMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastUpdated = "January 15, 2025"; // 🔹 Replace with actual effective date

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const sections = [
    {
      title: "Information We Collect",
      icon: Database,
      content: [
        {
          subtitle: "Personal Information",
          details:
            "Name, email, phone number, billing details provided during account creation or transactions."
        },
        {
          subtitle: "Business Information",
          details:
            "Company details sourced from government or public records as part of our reporting services."
        },
        {
          subtitle: "Technical Data",
          details:
            "IP address, device type, browser details, location data, and cookies."
        },
        {
          subtitle: "Usage Data",
          details:
            "Pages visited, searches made, and reports accessed on the platform."
        }
      ]
    },
    {
      title: "How We Use Your Information",
      icon: Eye,
      content: [
        {
          subtitle: "Service Delivery",
          details:
            "To provide services, generate business reports, and process secure payments."
        },
        {
          subtitle: "Platform Improvements",
          details:
            "To analyze user behavior, enhance performance, and strengthen security."
        },
        {
          subtitle: "Communications",
          details:
            "To send account updates, confirmations, support responses, and (if opted in) marketing materials."
        },
        {
          subtitle: "Legal Compliance",
          details:
            "To comply with laws, detect fraud, and meet regulatory obligations."
        }
      ]
    },
    {
      title: "Information Sharing",
      icon: Users,
      content: [
        {
          subtitle: "Third-Party Providers",
          details:
            "We may share data with trusted partners (e.g., payment gateways, hosting, analytics)."
        },
        {
          subtitle: "Regulatory Bodies",
          details:
            "Data may be disclosed if required by regulators or law enforcement."
        },
        {
          subtitle: "No Sale of Data",
          details:
            "We never sell your personal data to third parties."
        }
      ]
    }
  ];

  const rights = [
    "Access your personal data",
    "Request correction or deletion (subject to legal obligations)",
    "Withdraw consent for marketing communications",
    "Object to or restrict certain processing activities"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header
        className="sticky top-0 w-full text-white shadow-xl border-b border-slate-700/50 z-50"
        style={{ background: "linear-gradient(45deg, #1a1054, #255ff1)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="hover:opacity-90">
              <img
                src="/veri.png"
                alt="VerifyVista"
                style={{ height: "150px", width: "150px" }}
                className="object-contain"
              />
            </a>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">User ID: {user.id}</span>
                <button
                  onClick={() => {
                    logout();
                    navigate("/signin");
                  }}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() =>
                  navigate(signUpMode ? "/signin" : "/signin?mode=signup")
                }
                className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
              >
                {signUpMode ? "Sign In" : "Sign Up"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div
        className="text-white py-16"
        style={{ background: "linear-gradient(135deg, #1a1054, #255ff1)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Shield className="h-12 w-12 text-blue-400 mr-4" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
              <p className="text-xl text-gray-300">Effective Date: {lastUpdated}</p>
            </div>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed">
            VerifyVista (a brand of Complia Services Ltd.) values your privacy. This
            policy explains how we collect, use, and protect your data.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Intro Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-12">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-blue-600 mt-1" />
            <p className="text-blue-800">
              By using VerifyVista’s platform, you agree to the terms outlined in this
              Privacy Policy.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section, i) => (
            <section
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
            >
              <div className="flex items-center mb-6">
                <section.icon className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-6">
                {section.content.map((item, j) => (
                  <div key={j}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.subtitle}
                    </h3>
                    <p className="text-gray-600">{item.details}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Data Retention */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <Clock className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Data Retention</h2>
            </div>
            <p className="text-gray-600">
              Personal data is retained as long as your account is active or as required
              by law. Business/public records may be stored indefinitely as part of
              reports.
            </p>
          </section>

          {/* User Rights */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {rights.map((right, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="text-gray-600">{right}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Cookies */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Cookies & Tracking
            </h2>
            <p className="text-gray-600 mb-4">
              We use cookies for authentication, analytics, personalization, and
              improving services. You can manage cookies in your browser settings, but
              disabling them may limit functionality.
            </p>
          </section>

          {/* Data Security */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <Lock className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
            </div>
            <p className="text-gray-600">
              We use industry-standard safeguards such as SSL encryption, firewalls, and
              restricted access to protect your data. However, no system is completely
              secure, and data is shared at the user’s own risk.
            </p>
          </section>

          {/* International Transfers */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <Globe className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">
                International Data Transfers
              </h2>
            </div>
            <p className="text-gray-600">
              Data may be stored or processed outside India when handled by our trusted
              third-party providers.
            </p>
          </section>

          {/* Updates */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Policy Updates</h2>
            <p className="text-gray-600">
              We may revise this Privacy Policy from time to time. Continued use of our
              platform after changes means you accept the updated terms.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              For questions about this Privacy Policy or data handling practices:
            </p>
            <div className="space-y-2 text-gray-600">
              <p><strong>Email:</strong> support@verifyvista.com</p>
              <p><strong>Phone:</strong> +91 11 430 22 315</p>
              <p>
                <strong>Address:</strong> Third Floor, House No.9, Paschim Vihar,
                Madipur Metro Station, Paschim Vihar Extension, West Delhi,
                Delhi-110063
              </p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
