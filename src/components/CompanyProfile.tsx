import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import CompanyHeader from "./CompanyHeader";
import SidebarNav, { SidebarItem } from "./SidebarNav";
import Footer from "./Footer";

import {
  Building2,
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  GitCompare,
  Scale,
  Award,
  Shield,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";
import AboutSection from "./AboutSection";
import CompanyDetails from "./CompanyDetails";
import KeyIndicators from "./KeyIndicators";
import Directors from "./Directors";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { meiliSearchService } from "../services/meiliSearch";
import { processCompanyData, ProcessedCompanyData } from "../utils/companyUtils";

const CompanyProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { companyName, cin } = useParams<{ companyName: string; cin: string }>();
  const [signUpMode, setSignUpMode] = React.useState(false);
  const [companyData, setCompanyData] = useState<ProcessedCompanyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch company data when CIN is available
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!cin) {
        // If no CIN, use default data (existing behavior)
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await meiliSearchService.getCompanyByCIN(cin);
        if (data) {
          const processedData = processCompanyData(data);
          setCompanyData(processedData);
          console.log('Fetched company data:', processedData);
          console.log('Raw MeiliSearch data:', data);
          console.log('Date of Incorporation:', data.dateOfIncorporation);
          console.log('State:', data.state);
          console.log('Country:', data.country);
        } else {
          setError('Company not found');
          console.log('Company not found for CIN:', cin);
        }
      } catch (err) {
        setError('Failed to fetch company data');
        console.error('Error fetching company data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [cin]);

  const sidebarItems: SidebarItem[] = [
    { label: "Overview", icon: Building2 },
    { label: "Key Indicators", icon: TrendingUp },
    { label: "Company Details", icon: FileText },
    { label: "Directors", icon: Users },
    { label: "Financial", icon: DollarSign, locked: true },
    { label: "Shareholding", icon: GitCompare, locked: true },
    { label: "Charges", icon: Scale, locked: true },
    { label: "Employees", icon: Users, locked: true },
    { label: "Credit Ratings", icon: Award, locked: true },
    { label: "Recent Activity", icon: TrendingUp, locked: true },
    { label: "Recent News", icon: FileText, locked: true },
    { label: "Financials", icon: DollarSign, locked: true },
    { label: "Peer Comparison", icon: GitCompare, locked: true },
    { label: "Compliance Check", icon: Shield, locked: true },
    { label: "Litigation & Alerts", icon: AlertTriangle, locked: true },
    { label: "Documents", icon: FolderOpen, locked: true },
  ];

  const [active, setActive] = React.useState<string>("Overview");

  const handleNavigate = (label: string) => {
    const el = document.getElementById(label.replace(/\s+/g, "-"));
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.getAttribute("data-section") || "");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    const sections = document.querySelectorAll<HTMLElement>("[data-section]");
    sections.forEach((sec) => observer.observe(sec));

    return () => {
      sections.forEach((sec) => observer.unobserve(sec));
    };
  }, []);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Company", href: "#" },
    { label: companyData?.companyName || companyName || "Jupiter Wagons Limited" },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen gradient-secondary">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading company data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen gradient-secondary">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Company</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-secondary">
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
      <Breadcrumb items={breadcrumbItems} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <CompanyHeader companyData={companyData} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="order-2 lg:order-1 lg:col-span-1">
            <SidebarNav
              items={sidebarItems}
              activeLabel={active}
              onNavigate={handleNavigate}
            />
          </div>

          {/* Main Content */}
          <div className="order-1 lg:order-2 lg:col-span-3 space-y-6 sm:space-y-8">
            <section
              id="Overview"
              data-section="Overview"
              className="scroll-mt-24"
            >
              <AboutSection companyData={companyData} />
            </section>

            <section className="space-y-6 sm:space-y-8">
              <div
                id="Key-Indicators"
                data-section="Key Indicators"
                className="scroll-mt-24"
              >
                <KeyIndicators companyData={companyData} />
              </div>
              <div
                id="Company-Details"
                data-section="Company Details"
                className="scroll-mt-24"
              >
                <CompanyDetails companyData={companyData} />
              </div>
              <div
                id="Directors"
                data-section="Directors"
                className="scroll-mt-24"
              >
                <Directors />
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Floating CTA: Restore enhanced mobile + desktop variants */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        {/* Mobile: Enhanced strip - curved top, gradient, arrow & shimmer */}
        <div className="block md:hidden">
          <div className="bg-gradient-to-r from-blue-50/95 to-indigo-50/95 backdrop-blur-lg border-t border-blue-200/20 shadow-xl rounded-t-3xl px-4 py-4">
            <div className="text-center mb-3">
              <p className="text-sm font-medium text-gray-700">
                Get Entire Report{" "}
                <span className="text-blue-600 font-bold">@₹499</span>
                <span className="text-gray-500 text-xs">+GST</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Complete Company Analysis & Financial Data
              </p>
            </div>
            <Link
              to="/pricing"
              className="relative w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3.5 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center group overflow-hidden"
            >
              <span className="relative z-10">Buy Now</span>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/80 group-hover:text-white transition-colors duration-200">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Link>
          </div>
        </div>

        {/* Desktop: Full strip with trust indicators */}
        <div className="hidden md:block bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div className="relative p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg text-gray-700 font-semibold">
                      Get Entire Report{" "}
                      <span className="text-blue-600 font-bold">@₹499</span>
                      <span className="text-gray-500 text-sm">+GST</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Complete company analysis & financial data
                    </p>
                  </div>
                </div>
                <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Compliance Info</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Secure Payment</span>
                  </div>
                </div>
              </div>
              <Link
                to="/pricing"
                className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group overflow-hidden whitespace-nowrap"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Buy Now</span>
                  <svg
                    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="absolute top-1 right-2 text-white/50 text-xs">
                  ✦
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Add Footer here - after the floating CTA */}
      <Footer />
    </div>
  );
};

export default CompanyProfile;