import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import Breadcrumb from './Breadcrumb';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email: string; full_name: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    const urlEmail = params.get('email');

    if (!urlToken || !urlEmail) {
      setError('Invalid verification link. Please request a new verification email.');
      setIsVerifying(false);
      return;
    }

    setToken(urlToken);
    setEmail(decodeURIComponent(urlEmail));

    // Verify token validity
    verifyEmailToken(urlToken, decodeURIComponent(urlEmail));
  }, [location]);

  const verifyEmailToken = async (verifyToken: string, verifyEmail: string) => {
    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: verifyToken,
          email: verifyEmail,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setTokenValid(true);
        setUserInfo(data.user);
        setSuccess('Email verified successfully! You can now sign in.');
        // Redirect to sign-in page after 3 seconds
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
      } else {
        setError(data.message || 'Invalid or expired verification token. Please request a new verification email.');
        setTokenValid(false);
      }
    } catch (err) {
      setError('Failed to verify email. Please try again.');
      setTokenValid(false);
      console.error('Email verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen gradient-secondary flex items-center justify-center">
        <div className="card-elevated p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
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
              <a href="/" className="hover:opacity-90 transition-opacity duration-200">
                <img
                  src="/veri.png"
                  alt="Veriffyvista"
                  style={{ height: '150px', width: '150px' }}
                  className="object-contain"
                />
              </a>
            </div>
            <button
              onClick={() => navigate('/signin')}
              className="hidden sm:inline-flex bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 shadow-sm"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </header>
      
      <Breadcrumb items={[
        { label: 'Home', href: '/' }, 
        { label: 'Sign In', href: '/signin' },
        { label: 'Verify Email' }
      ]} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Information */}
          <div className="card-elevated p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              {tokenValid ? 'Email Verification' : 'Verification Link Invalid'}
            </h2>
            
            {tokenValid ? (
              <>
                <p className="text-gray-600 mb-6">
                  Your email address has been verified. You can now sign in to your Verifyvista account.
                </p>
                
                {userInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Verified account for:</p>
                        <p className="text-sm text-blue-700">{userInfo.full_name} ({userInfo.email})</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center text-red-600 mb-4">
                  <AlertCircle className="h-6 w-6 mr-2" />
                  <span className="font-medium">Verification Link Problem</span>
                </div>
                <p className="text-gray-600 mb-6">
                  The email verification link you used is either invalid, expired, or has already been used. Verification links expire after 24 hours for security.
                </p>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">What you can do:</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Request a new verification email from the sign-in page</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Check your email for a more recent verification link</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Contact support if you continue having issues</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Right Column - Action */}
          <div className="card-elevated p-6 md:p-8 text-center">
            {tokenValid ? (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Email Verified</h3>
                {success && (
                  <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {success}
                    </div>
                    <p className="text-xs text-green-500 mt-1">Redirecting to sign-in page in 3 seconds...</p>
                  </div>
                )}
                <button
                  onClick={() => navigate('/signin')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200"
                >
                  Go to Sign In
                </button>
              </>
            ) : (
              <>
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Invalid Verification Link</h3>
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                    {error}
                  </div>
                )}
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/signin')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200"
                  >
                    Request New Verification Link
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold transition-all duration-200"
                  >
                    Go to Homepage
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmail;