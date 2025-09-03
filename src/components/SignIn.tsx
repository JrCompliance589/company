import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
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
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Decode JWT payload (base64) - for development only, not secure
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
          console.log('Google Sign-In response:', response); // Debug log
          try {
            // Decode the credential to extract email, name, and sub
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
            setUser(data.user); // Store user in context
            setFormData({ fullName: '', email: '', password: '' });
            
            // Redirect admin users to admin dashboard, others to homepage
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
      if (googleDivRef.current) {
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
  }, [navigate, setUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
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

      setSuccess('Sign up successful! Welcome to Verifyvista!');
      setFormData({ fullName: '', email: '', password: '' });
      setSignUpMode(false);
      
      // Automatically log the user in after successful signup
      try {
        const signInResponse = await fetch('/api/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
          credentials: 'include',
        });

        const signInData = await signInResponse.json();
        
        if (signInResponse.ok) {
          setUser(signInData.user); // Store user in context
          
          // Redirect based on user type
          if (signInData.user.is_admin) {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } else {
          // If auto-login fails, redirect to homepage anyway
          navigate('/');
        }
      } catch (err) {
        console.error('Auto-login after signup failed:', err);
        // Redirect to homepage even if auto-login fails
        navigate('/');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to the server.';
      setError(errorMessage);
      console.error('Fetch error:', err);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Email and password are required.');
      return;
    }

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
        setError(data.message || `Server error: ${response.status} - ${response.statusText}`);
        return;
      }

                  setSuccess('Sign in successful! Welcome back.');
            setUser(data.user); // Store user in context
            setFormData({ fullName: '', email: '', password: '' });
            
            // Redirect admin users to admin dashboard, others to homepage
            if (data.user.is_admin) {
              navigate('/admin');
            } else {
              navigate('/');
            }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to the server.';
      setError(errorMessage);
      console.error('Sign-in fetch error:', err);
    }
  };

  const googleDivRef = React.useRef<HTMLDivElement | null>(null);

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
                onClick={() => {
                  setSignUpMode(!signUpMode);
                  navigate(signUpMode ? '/signin' : '/signin?mode=signup');
                }}
                className="hidden sm:inline-flex bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 shadow-sm"
              >
                {signUpMode ? 'Sign In' : 'Sign Up'}
              </button>
            )}
          </div>
        </div>
      </header>
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: signUpMode ? 'Sign Up' : 'Sign In' }]} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-elevated p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              {signUpMode ? 'Join Verifyvista!' : 'Welcome Back to Verifyvista!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {signUpMode ? 'Create an account to access powerful business insights.' : 'Sign in to access powerful business insights instantly.'}
            </p>
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
            <div className="mt-6 text-sm text-gray-600">
              {signUpMode ? (
                <span>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setSignUpMode(false);
                      navigate('/signin');
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Forgot your password?{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Reset it
                  </a>{' '}
                  in seconds.
                </span>
              )}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {!signUpMode && (
                <span>
                  New to Verifyvista?{' '}
                  <button
                    onClick={() => {
                      setSignUpMode(true);
                      navigate('/signin?mode=signup');
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Sign Up
                  </button>{' '}
                  now and start exploring!
                </span>
              )}
            </div>
          </div>

          <div className="card-elevated p-6 md:p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">{signUpMode ? 'Sign Up' : 'Sign In'}</h3>
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
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                {signUpMode ? 'Sign Up' : 'Sign In'}
              </button>
              {!signUpMode && (
                <div className="text-right">
                  <a href="#" className="text-sm text-blue-600 hover:underline">Forgot Password?</a>
                </div>
              )}
            </form>

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
                    onClick={() => {
                      setSignUpMode(false);
                      navigate('/signin');
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  New to Verifyvista?{' '}
                  <button
                    onClick={() => {
                      setSignUpMode(true);
                      navigate('/signin?mode=signup');
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Sign Up
                  </button>{' '}
                  now and start exploring!
                </span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignIn;