import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';
import Breadcrumb from './Breadcrumb';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  
  // Extract token and email from URL parameters
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email: string; full_name: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    const urlEmail = params.get('email');

    if (!urlToken || !urlEmail) {
      setError('Invalid reset link. Please request a new password reset.');
      setIsVerifying(false);
      return;
    }

    setToken(urlToken);
    setEmail(decodeURIComponent(urlEmail));

    // Verify token validity
    verifyResetToken(urlToken, decodeURIComponent(urlEmail));
  }, [location]);

  const verifyResetToken = async (resetToken: string, resetEmail: string) => {
    try {
      const response = await fetch('/api/verify-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          email: resetEmail,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setTokenValid(true);
        setUserInfo(data.user);
      } else {
        setError(data.message || 'Invalid or expired reset token. Please request a new password reset.');
        setTokenValid(false);
      }
    } catch (err) {
      setError('Failed to verify reset token. Please try again.');
      setTokenValid(false);
      console.error('Token verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    setError('');
    setSuccess('');
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setError('');
    setSuccess('');
  };

  const validatePasswords = (): boolean => {
    if (!newPassword || !confirmPassword) {
      setError('Both password fields are required.');
      return false;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    return true;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswords()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token,
          newPassword,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to reset password. Please try again.');
        return;
      }

      setSuccess('Password reset successfully! You can now sign in with your new password.');
      setNewPassword('');
      setConfirmPassword('');
      
      // Redirect to sign-in page after 3 seconds
      setTimeout(() => {
        navigate('/signin');
      }, 3000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to the server.';
      setError(errorMessage);
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: string; color: string; percentage: number } => {
    if (password.length === 0) return { strength: '', color: '', percentage: 0 };
    if (password.length < 6) return { strength: 'Too short', color: 'text-red-500', percentage: 20 };
    if (password.length < 8) return { strength: 'Weak', color: 'text-orange-500', percentage: 40 };
    
    let score = 0;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score >= 3 && password.length >= 10) return { strength: 'Strong', color: 'text-green-600', percentage: 100 };
    if (score >= 2 && password.length >= 8) return { strength: 'Good', color: 'text-blue-500', percentage: 70 };
    return { strength: 'Fair', color: 'text-yellow-600', percentage: 50 };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  if (isVerifying) {
    return (
      <div className="min-h-screen gradient-secondary flex items-center justify-center">
        <div className="card-elevated p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Reset Link</h2>
            <p className="text-gray-600">Please wait while we verify your password reset link...</p>
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
        { label: 'Reset Password' }
      ]} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Information */}
          <div className="card-elevated p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              {tokenValid ? 'Create New Password' : 'Reset Link Invalid'}
            </h2>
            
            {tokenValid ? (
              <>
                <p className="text-gray-600 mb-6">
                  Create a strong new password for your Verifyvista account. Your new password will replace your old one immediately.
                </p>
                
                {userInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Resetting password for:</p>
                        <p className="text-sm text-blue-700">{userInfo.full_name} ({userInfo.email})</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4 text-sm text-gray-700">
                  <h3 className="font-semibold text-gray-900">Password Requirements:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span>At least 6 characters long</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Mix of letters, numbers, and symbols for better security</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Avoid using personal information</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Different from your previous password</span>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center text-red-600 mb-4">
                  <AlertCircle className="h-6 w-6 mr-2" />
                  <span className="font-medium">Reset Link Problem</span>
                </div>
                <p className="text-gray-600 mb-6">
                  The password reset link you used is either invalid, expired, or has already been used. Reset links expire after 1 hour for security.
                </p>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">What you can do:</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Request a new password reset from the sign-in page</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Check your email for a more recent reset link</span>
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

          {/* Right Column - Form */}
          <div className="card-elevated p-6 md:p-8">
            {tokenValid ? (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Set New Password
                </h3>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {success}
                    </div>
                    <p className="text-xs text-green-500 mt-1">Redirecting to sign-in page in 3 seconds...</p>
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleResetPassword}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="input-professional pr-10"
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={handlePasswordChange}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    
                    {newPassword && (
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600">Password strength:</span>
                          <span className={`text-xs ${passwordStrength.color}`}>{passwordStrength.strength}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                            style={{ width: `${passwordStrength.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="input-professional pr-10"
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    
                    {confirmPassword && newPassword && (
                      <div className="mt-1">
                        {newPassword === confirmPassword ? (
                          <p className="text-xs text-green-600 flex items-center">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Passwords match
                          </p>
                        ) : (
                          <p className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Passwords do not match
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !newPassword || !confirmPassword}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Invalid Reset Link</h3>
                <p className="text-gray-600 mb-6">This password reset link is no longer valid.</p>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/signin')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200"
                  >
                    Request New Reset Link
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold transition-all duration-200"
                  >
                    Go to Homepage
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;