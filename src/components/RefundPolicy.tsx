import React, {useEffect , useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban, AlertTriangle, Scale } from 'lucide-react';
import { useAuth } from './AuthContext';
import Footer from './Footer';
import Breadcrumb from './Breadcrumb';

const RefundPolicy: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [signUpMode, setSignUpMode] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const lastUpdated = "January 15, 2025";

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

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

      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Refund & Cancellation Policy' }]} />

      {/* Page Header */}
      <div className="text-white py-16" style={{ background: "linear-gradient(135deg, #1a1054, #255ff1)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Scale className="h-12 w-12 text-blue-400 mr-4" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Refund & Cancellation Policy</h1>
              <p className="text-xl text-gray-300">Last updated: {lastUpdated}</p>
            </div>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed">
            Please review our Refund & Cancellation policy carefully before making a purchase on VerifyVista.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        
        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Important Notice</h3>
              <p className="text-amber-800">
                All purchases of digital products, reports, and services on VerifyVista are final and non-refundable.
              </p>
            </div>
          </div>
        </div>

        {/* No Refund Policy */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <Ban className="h-8 w-8 text-red-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">No Refunds on Digital Products</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Since our services involve instant access to digital content, including compliance data and reports, we do not offer refunds once a purchase is completed. 
            By proceeding with payment, you acknowledge and agree to this no-refund policy.
          </p>
        </section>

        {/* Exceptions */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Exceptions</h2>
          <p className="text-gray-600 leading-relaxed">
            Refunds may only be considered in cases of duplicate payment or proven technical errors on our platform. 
            Any such requests must be submitted to our support team within 7 days of the transaction, along with valid proof of the issue.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            For questions regarding this Refund & Cancellation Policy, please contact us:
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

export default RefundPolicy;
