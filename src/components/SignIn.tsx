import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from './AuthContext';
import Breadcrumb from './Breadcrumb';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, logout } = useAuth();
  const [signUpMode, setSignUpMode] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('mode') === 'signup';
  });
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resendVerificationMode, setResendVerificationMode] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resendVerificationEmail, setResendVerificationEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Decode JWT payload (base64) 
  const decodeJwtPayload = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error('Failed to decode JWT:', err);
      return null;
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!(window as any).google || !GOOGLE_CLIENT_ID) {
        console.error('Google Sign-In script failed to load or GOOGLE_CLIENT_ID missing');
        setError('Google Sign-In is unavailable. Please try manual sign-in.');
        return;
      }
      const google = (window as any).google;
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          console.log('Google Sign-In response:', response);
          try {
            const payload = decodeJwtPayload(response.credential);
            if (!payload || !payload.email || !payload.sub) {
              setError('Invalid Google Sign-In response');
              return;
            }

            const res = await fetch('/api/signin/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                credential: {
                  email: payload.email,
                  name: payload.name,
                  sub: payload.sub,
                },
              }),
              credentials: 'include',
            });

            const text = await res.text();
            console.log('Google Sign-In raw response:', text, 'Status:', res.status);

            let data;
            try {
              data = text ? JSON.parse(text) : {};
            } catch (err) {
              setError(`Invalid server response: ${text || 'Empty response'}`);
              return;
            }

            if (!res.ok) {
              setError(data.message || `Google Sign-In failed: ${res.status} - ${res.statusText}`);
              return;
            }

            setSuccess('Google Sign-In successful! Welcome back.');
            setUser(data.user);
            setFormData({ fullName: '', email: '', password: '' });
            
            if (data.user.is_admin) {
              navigate('/admin');
            } else {
              navigate('/');
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to connect to the server.';
            setError(`Google Sign-In error: ${errorMessage}`);
            console.error('Google Sign-In fetch error:', err);
          }
        },
      });
      if (googleDivRef.current && !forgotPasswordMode && !resendVerificationMode) {
        google.accounts.id.renderButton(googleDivRef.current, {
          theme: 'filled',
          size: 'large',
          width: 280,
          text: 'signin_with',
          shape: 'pill',
        });
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [navigate, setUser, forgotPasswordMode, resendVerificationMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleForgotPasswordEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForgotPasswordEmail(e.target.value);
    setError('');
    setSuccess('');
  };

  const handleResendVerificationEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResendVerificationEmail(e.target.value);
    setError('');
    setSuccess('');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to send reset email. Please try again.');
        return;
      }

      setSuccess('If an account with that email exists, we have sent a password reset link. Please check your email.');
      setForgotPasswordEmail('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to the server.';
      setError(errorMessage);
      console.error('Forgot password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendVerificationEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resendVerificationEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendVerificationEmail }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to resend verification email. Please try again.');
        return;
      }

      setSuccess('Verification email sent successfully. Please check your inbox.');
      setResendVerificationEmail('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to the server.';
      setError(errorMessage);
      console.error('Resend verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('All fields are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
        credentials: 'include',
      });

      const text = await response.text();
      console.log('Raw response:', text, 'Status:', response.status);

      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        setError(`Invalid server response: ${text || 'Empty response'}`);
        return;
      }

      if (!response.ok) {
        setError(data.message || `Server error: ${response.status} - ${response.statusText}`);
        return;
      }

      setSuccess('Sign up successful! Please check your email to verify your account.');
      setFormData({ fullName: '', email: '', password: '' });
      setSignUpMode(false);
      setResendVerificationMode(true);
      setResendVerificationEmail(formData.email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to the server.';
      setError(errorMessage);
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Email and password are required.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: 'include',
      });

      const text = await response.text();
      console.log('Sign-in raw response:', text, 'Status:', response.status);

      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        setError(`Invalid server response: ${text || 'Empty response'}`);
        return;
      }

      if (!response.ok) {
        if (data.message.includes('Please verify your email')) {
          setResendVerificationMode(true);
          setResendVerificationEmail(formData.email);
          setError(data.message);
        } else {
          setError(data.message || `Server error: ${response.status} - ${response.statusText}`);
        }
        return;
      }

      setSuccess('Sign in successful! Welcome back.');
      setUser(data.user);
      setFormData({ fullName: '', email: '', password: '' });
      
      if (data.user.is_admin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to the server.';
      setError(errorMessage);
      console.error('Sign-in fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const googleDivRef = React.useRef<HTMLDivElement | null>(null);

  const switchMode = (newSignUpMode: boolean) => {
    setSignUpMode(newSignUpMode);
    setForgotPasswordMode(false);
    setResendVerificationMode(false);
    setError('');
    setSuccess('');
    setFormData({ fullName: '', email: '', password: '' });
    setForgotPasswordEmail('');
    setResendVerificationEmail('');
    navigate(newSignUpMode ? '/signin?mode=signup' : '/signin');
  };

  const switchToForgotPassword = () => {
    setForgotPasswordMode(true);
    setResendVerificationMode(false);
    setError('');
    setSuccess('');
    setForgotPasswordEmail(formData.email || '');
  };

  const switchToResendVerification = () => {
    setResendVerificationMode(true);
    setForgotPasswordMode(false);
    setError('');
    setSuccess('');
    setResendVerificationEmail(formData.email || '');
  };

  const backToSignIn = () => {
    setForgotPasswordMode(false);
    setResendVerificationMode(false);
    setError('');
    setSuccess('');
  };

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
                  alt="Verifyvista"
                  style={{ height: '150px', width: '150px' }}
                  className="object-contain"
                />
              </a>
            </div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-white">User ID: {user.id}</span>
                <button
                  onClick={async () => {
                    try {
                      await fetch('/api/logout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: user.email }),
                        credentials: 'include',
                      });
                      logout();
                      navigate('/signin');
                    } catch (err) {
                      console.error('Logout error:', err);
                    }
                  }}
                  className="hidden sm:inline-flex bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 shadow-sm"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => switchMode(!signUpMode)}
                className="hidden sm:inline-flex bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 shadow-sm"
              >
                {signUpMode ? 'Sign In' : 'Sign Up'}
              </button>
            )}
          </div>
        </div>
      </header>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          {
            label: forgotPasswordMode
              ? 'Forgot Password'
              : resendVerificationMode
              ? 'Resend Verification'
              : signUpMode
              ? 'Sign Up'
              : 'Sign In',
          },
        ]}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-elevated p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              {forgotPasswordMode
                ? 'Reset Your Password'
                : resendVerificationMode
                ? 'Resend Verification Email'
                : signUpMode
                ? 'Join Verifyvista!'
                : 'Welcome Back to Verifyvista!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {forgotPasswordMode
                ? 'Enter your email address and we\'ll send you a link to reset your password.'
                : resendVerificationMode
                ? 'Enter your email address to resend the verification email.'
                : signUpMode
                ? 'Create an account to access powerful business insights. Please verify your email after signing up.'
                : 'Sign in to access powerful business insights instantly.'}
            </p>
            {!forgotPasswordMode && !resendVerificationMode && (
              <ul className="space-y-4">
                {[
                  'Comprehensive Reports – View financial performance, credit ratings & more.',
                  'Stay Informed – Get alerts on company changes & key updates.',
                  'Your Data, Secured – We prioritize privacy and security.',
                  'Seamless Access – Pick up where you left off with real‑time updates.',
                ].map((text) => (
                  <li key={text} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
                    <span className="text-gray-700">{text}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 text-sm text-gray-600">
              {forgotPasswordMode ? (
                <span>
                  Remember your password?{' '}
                  <button onClick={backToSignIn} className="text-blue-600 hover:underline">
                    Back to Sign In
                  </button>
                </span>
              ) : resendVerificationMode ? (
                <span>
                  Already verified?{' '}
                  <button onClick={backToSignIn} className="text-blue-600 hover:underline">
                    Back to Sign In
                  </button>
                </span>
              ) : signUpMode ? (
                <span>
                  Already have an account?{' '}
                  <button onClick={() => switchMode(false)} className="text-blue-600 hover:underline">
                    Sign In
                  </button>
                </span>
              ) : (
                <>
                  <span>
                    Forgot your password?{' '}
                    <button onClick={switchToForgotPassword} className="text-blue-600 hover:underline">
                      Reset it
                    </button>{' '}
                    in seconds.
                  </span>
                  <br />
                  <span>
                    Need to verify your email?{' '}
                    <button onClick={switchToResendVerification} className="text-blue-600 hover:underline">
                      Resend verification email
                    </button>
                  </span>
                </>
              )}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {!signUpMode && !forgotPasswordMode && !resendVerificationMode && (
                <span>
                  New to Verifyvista?{' '}
                  <button onClick={() => switchMode(true)} className="text-blue-600 hover:underline">
                    Sign Up
                  </button>{' '}
                  now and start exploring!
                </span>
              )}
            </div>
          </div>

          <div className="card-elevated p-6 md:p-8">
            {(forgotPasswordMode || resendVerificationMode) && (
              <button
                onClick={backToSignIn}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </button>
            )}
            
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {forgotPasswordMode
                ? 'Reset Password'
                : resendVerificationMode
                ? 'Resend Verification Email'
                : signUpMode
                ? 'Sign Up'
                : 'Sign In'}
            </h3>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                {success}
              </div>
            )}

            {forgotPasswordMode ? (
              <form className="space-y-4" onSubmit={handleForgotPassword}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      className="input-professional pl-10"
                      placeholder="Enter your email address"
                      value={forgotPasswordEmail}
                      onChange={handleForgotPasswordEmailChange}
                      disabled={isLoading}
                    />
                    <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            ) : resendVerificationMode ? (
              <form className="space-y-4" onSubmit={handleResendVerification}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      className="input-professional pl-10"
                      placeholder="Enter your email address"
                      value={resendVerificationEmail}
                      onChange={handleResendVerificationEmailChange}
                      disabled={isLoading}
                    />
                    <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={signUpMode ? handleSignUp : handleSignIn}>
                {signUpMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      className="input-professional"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="input-professional"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="input-professional"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (signUpMode ? 'Creating Account...' : 'Signing In...') : (signUpMode ? 'Sign Up' : 'Sign In')}
                </button>
                {!signUpMode && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={switchToForgotPassword}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Forgot Password?
                    </button>
                    <br />
                    <button
                      type="button"
                      onClick={switchToResendVerification}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Resend Verification Email
                    </button>
                  </div>
                )}
              </form>
            )}

            {!forgotPasswordMode && !resendVerificationMode && (
              <>
                <div className="my-6 flex items-center">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="px-3 text-gray-500 text-sm">or</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {GOOGLE_CLIENT_ID ? (
                  <div ref={googleDivRef} className="flex justify-center" />
                ) : (
                  <div className="text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                    Sign <code className="font-mono">{signUpMode ? 'up' : 'in'}</code> with <code className="font-mono">Google</code>.
                  </div>
                )}

                <div className="mt-8 text-sm text-gray-600">
                  {signUpMode ? (
                    <span>
                      Already have an account?{' '}
                      <button
                        onClick={() => switchMode(false)}
                        className="text-blue-600 hover:underline"
                      >
                        Sign In
                      </button>
                    </span>
                  ) : (
                    <span>
                      New to Verifyvista?{' '}
                      <button
                        onClick={() => switchMode(true)}
                        className="text-blue-600 hover:underline"
                      >
                        Sign Up
                      </button>{' '}
                      now and start exploring!
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignIn;