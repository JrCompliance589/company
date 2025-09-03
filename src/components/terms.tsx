import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, FileText, AlertTriangle, Shield, CreditCard, Users, Globe, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from './AuthContext';
import Footer from './Footer';
import Breadcrumb from './Breadcrumb';

const TermsOfService: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [signUpMode, setSignUpMode] = React.useState(false);
  const lastUpdated = "January 15, 2025";

  const sections = [
    {
      title: "Acceptance of Terms",
      icon: CheckCircle,
      content:
        "By accessing and using VerifyVista ('Website' / 'Platform'), you agree to comply with these Terms & Conditions ('Terms'). If you do not agree, you must not use our services. These Terms constitute a legally binding agreement between you and VerifyVista (a brand of Complia Services Ltd.)."
    },
    {
      title: "Eligibility",
      icon: Lock,
      content:
        "Users must be 18 years or older. By using the Website, you confirm that you have the legal capacity to enter into binding agreements under Indian law."
    },
    {
      title: "Services",
      icon: Globe,
      content:
        "VerifyVista provides business information, compliance data, verification tools, and reports. Data is sourced from government databases, public records, and proprietary analysis. The platform aggregates and organizes information to help businesses make informed compliance and financial decisions."
    },
    {
      title: "User Obligations",
      icon: Users,
      content:
        "You agree to use the Website only for lawful purposes. You must not attempt to hack, copy, redistribute, resell, or misuse any data or reports. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account."
    },
    {
      title: "Payment & Subscription",
      icon: CreditCard,
      content:
        "Services may be free or paid (subscription or pay-per-report). Paid services are billed in advance on a monthly, annual, or per-use basis. Payments once made are non-refundable, except in cases of duplicate billing or technical error. Subscription users remain liable for payments until cancellation is confirmed."
    }
  ];

  const prohibitedUses = [
    "Violating any applicable laws or regulations",
    "Infringing on intellectual property rights",
    "Transmitting malicious code or viruses",
    "Attempting to gain unauthorized access to our systems",
    "Using automated tools to scrape or harvest data",
    "Reselling or redistributing our services without permission",
    "Using the service for illegal or fraudulent activities",
    "Interfering with other users' access to the service"
  ];

  const limitations = [
    "We provide information 'as is' without warranties of any kind",
    "We do not guarantee completeness, accuracy, or suitability of reports",
    "We are not liable for decisions made based on our information",
    "Our liability is limited to the amount you paid for our services",
    "We are not responsible for third-party content or services",
    "Service availability is not guaranteed 100% of the time"
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
              <a href="/" className="hover:opacity-90 transition-opacity duration-200">
                <img
                  src="/veri.png"
                  alt="VerifyVista"
                  style={{ height: "150px", width: "150px" }}
                  className="object-contain"
                />
              </a>
            </div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-white">User ID: {user.id}</span>
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
                onClick={() => navigate(signUpMode ? "/signin" : "/signin?mode=signup")}
                className="hidden sm:inline-flex bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 shadow-sm"
              >
                {signUpMode ? "Sign In" : "Sign Up"}
              </button>
            )}
          </div>
        </div>
      </header>
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Terms & Conditions' }]} />

      {/* Page Header */}
      <div className="text-white py-16" style={{ background: "linear-gradient(135deg, #1a1054, #255ff1)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Scale className="h-12 w-12 text-blue-400 mr-4" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Terms & Conditions</h1>
              <p className="text-xl text-gray-300">Last updated: {lastUpdated}</p>
            </div>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed">
            These Terms & Conditions govern your use of VerifyVista's platform and services. Please read them carefully before using our services.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Important Legal Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Important Legal Notice</h3>
              <p className="text-amber-800">
                By using VerifyVista's services, you agree to these Terms & Conditions. If you disagree with any part of these terms, you may not access or use our services.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Sections */}
        {sections.map((section, index) => (
          <section key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <section.icon className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">{section.content}</p>
          </section>
        ))}

        {/* Prohibited Uses */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Prohibited Uses</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            You may not use our service for any of the following purposes:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {prohibitedUses.map((use, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-600">{use}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Intellectual Property Rights</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            All reports, tools, designs, and data compilations are the intellectual property of Complia Services Ltd. Users may not copy, distribute, or use any material without prior written permission.
          </p>
        </section>

        {/* Data Accuracy & Limitation of Liability */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Data Accuracy & Limitation of Liability</h2>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              While we strive to provide accurate and up-to-date information, VerifyVista does not guarantee completeness, correctness, or suitability of any report. Information is sourced from public and proprietary records.
            </p>
            <p className="text-gray-600 leading-relaxed">
              VerifyVista is not liable for any direct, indirect, or consequential losses resulting from reliance on our data. Key limitations include:
            </p>
            <div className="space-y-3">
              {limitations.map((limitation, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600">{limitation}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Termination */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Termination</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We may suspend or terminate your account for violations of these Terms. Termination does not relieve you of obligations already accrued. You may also terminate your account at any time by contacting us. Upon termination, your right to use the service will cease immediately.
          </p>
        </section>

        {/* Governing Law */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Governing Law & Jurisdiction</h2>
          <p className="text-gray-600 leading-relaxed">
            These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.
          </p>
        </section>

        {/* Changes to Terms */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Changes to Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            We reserve the right to modify these Terms at any time. Users will be notified of material changes by updates on this page. Continued use of services constitutes acceptance of revised terms.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            If you have any questions about these Terms & Conditions, please contact us:
          </p>
          <div className="space-y-2 text-gray-600">
            <p><strong>Email:</strong> support@verifyvista.com</p>
            <p><strong>Phone:</strong> +91 11 430 22 315</p>
            <p><strong>Address:</strong> Third Floor, House No. 9, Paschim Vihar, Madipur Metro Station, Paschim Vihar Extension, West Delhi, Delhi-110063</p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;
