import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import Homepage from './components/Homepage';
import CompanyProfile from './components/CompanyProfile';
import Pricing from './components/Pricing';
import SignIn from './components/SignIn';
import PrivacyPolicy from './components/privacy';
import TermsOfService from './components/terms';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/company" element={<CompanyProfile />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
      
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;