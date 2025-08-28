import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, FileText, AlertTriangle, Shield, CreditCard, Users, Globe, CheckCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import Footer from './Footer';

const TermsOfService: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [signUpMode, setSignUpMode] = React.useState(false);
  const lastUpdated = "January 15, 2025";

  const sections = [
    {
      title: "Acceptance of Terms",
      icon: CheckCircle,
      content: "By accessing and using Verifyvista's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service. These Terms of Service constitute a legally binding agreement between you and Verifyvista."
    },
    {
      title: "Description of Service",
      icon: Globe,
      content: "Verifyvista provides company intelligence and business information services, including but not limited to company profiles, financial reports, credit ratings, and compliance checks. Our platform aggregates publicly available information and provides analytical insights to help businesses make informed decisions."
    },
    {
      title: "User Accounts and Registration",
      icon: Users,
      content: "To access certain features of our service, you may be required to register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete. You are responsible for maintaining the confidentiality of your account credentials."
    },
    {
      title: "Payment Terms",
      icon: CreditCard,
      content: "Paid services are billed in advance on a monthly or annual basis. All fees are non-refundable except as expressly stated in our refund policy. We reserve the right to change our pricing at any time, with reasonable notice to existing subscribers. Failure to pay fees may result in service suspension or termination."
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
            <Scale className="h-12 w-12 text-blue-400 mr-4" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
              <p className="text-xl text-gray-300">Last updated: {lastUpdated}</p>
            </div>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed">
            These Terms of Service govern your use of Verifyvista's platform and services. 
            Please read these terms carefully before using our services.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-12">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Important Legal Notice</h3>
              <p className="text-amber-800">
                By using Verifyvista's services, you agree to these Terms of Service. If you disagree with any part of these terms, 
                you may not access or use our services. These terms constitute a binding legal agreement between you and Verifyvista.
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
              <h2 className="text-2xl font-bold text-gray-900">Intellectual Property</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                The Verifyvista service and its original content, features, and functionality are and will remain the exclusive 
                property of Verifyvista and its licensors. The service is protected by copyright, trademark, and other laws.
              </p>
              <p className="text-gray-600 leading-relaxed">
                You are granted a limited, non-exclusive, non-transferable license to access and use our services for your 
                business purposes in accordance with these Terms of Service.
              </p>
            </div>
          </section>

          {/* Data Accuracy and Disclaimers */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Data Accuracy and Disclaimers</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                While we strive to provide accurate and up-to-date information, we cannot guarantee the completeness, 
                accuracy, or reliability of the data provided through our services. Information is sourced from various 
                third-party providers and public records.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Users are responsible for verifying information independently before making business decisions. 
                Verifyvista is not responsible for any losses or damages resulting from reliance on our information.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To the maximum extent permitted by law, Verifyvista shall not be liable for any indirect, incidental, 
              special, or consequential damages. Our key limitations include:
            </p>
            <div className="space-y-3">
              {limitations.map((limitation, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600">{limitation}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Termination */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Termination</h2>
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                We may terminate or suspend your account and access to our services immediately, without prior notice, 
                for any reason, including but not limited to breach of these Terms of Service.
              </p>
              <p className="text-gray-600 leading-relaxed">
                You may terminate your account at any time by contacting us or using the account closure feature in our platform. 
                Upon termination, your right to use the service will cease immediately.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the laws of India. 
              Any disputes arising under or in connection with these Terms shall be subject to the exclusive 
              jurisdiction of the courts of New Delhi, India.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Changes to Terms</h2>
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. We will notify users of any material 
                changes by posting the updated terms on this page and updating the "Last updated" date.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Your continued use of our services after any changes constitutes acceptance of the new Terms of Service. 
                If you do not agree to the revised terms, you must stop using our services.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-gray-600">
              <p><strong>Email:</strong>support@verifyvista.com</p>
              <p><strong>Address:</strong>Third Floor ,House No.9 ,Paschim Vihar ,Madipur Metro Station ,Paschim Vihar Extension ,West Delhi ,Delhi-110063</p>
              <p><strong>Phone:</strong>+91 11 430 22 315</p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;