import React, { useEffect } from 'react';
import { CheckCircle2, Star, Zap, Shield, Download, Users, Clock, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const tiers = [
  {
    name: 'Single Company Report',
    price: '₹299',
    period: 'one-time',
    description: 'One-time access to a detailed report for any single company.',
    features: [
      'Full company profile & financial data',
      'Director information & shareholding',
      'Downloadable PDF report',
      '30-day access to data',
      'Email support'
    ],
    cta: 'Buy Now',
    popular: false,
    icon: Download
  },
  {
    name: 'Pro Plan',
    price: '₹1,999',
    period: 'per year',
    description: 'Access detailed reports for any 10 companies with premium features.',
    features: [
      'Everything in Single Report',
      'Priority email & phone support',
      'Unlimited downloads',
      'Advanced analytics & charts',
      'Peer comparison tools',
      'Real-time data updates',
      'API access (coming soon)'
    ],
    cta: 'Subscribe Now',
    popular: true,
    icon: Zap
  }
];

const Pricing: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Check if user came from a company profile page
    const searchParams = new URLSearchParams(location.search);
    const companyCIN = searchParams.get('cin');
    const companyName = searchParams.get('company');

    if (user && companyCIN && companyName) {
      // Create order when user visits pricing from company page
      createOrder(companyCIN, companyName);
    }
  }, [user, location]);

  const createOrder = async (companyCIN: string, companyName: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          user_email: user?.email,
          company_cin: companyCIN,
          company_name: companyName,
        }),
      });

      if (response.ok) {
        console.log('Order created successfully for company:', companyName);
      } else {
        console.error('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <div className="min-h-screen gradient-secondary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 mb-8">Flexible options crafted for individual and team needs.</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto"></div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`card-elevated p-8 flex flex-col relative ${
                tier.popular ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl mb-4">
                  <tier.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h2>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-gray-500 ml-2">/{tier.period}</span>
                </div>
                <p className="text-gray-600">{tier.description}</p>
              </div>

              {/* Features */}
              <div className="flex-1 mb-8">
                <ul className="space-y-4">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 p-1 bg-green-100 rounded-full">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Link
                to="/checkout"
                className={`inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                  tier.popular
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                <span>{tier.cta}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="card p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Verifyvista?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Trusted Data</h4>
                <p className="text-sm text-gray-600">Official sources and verified information</p>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Real-time Updates</h4>
                <p className="text-sm text-gray-600">Latest financial and company data</p>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Expert Support</h4>
                <p className="text-sm text-gray-600">Dedicated customer service team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
