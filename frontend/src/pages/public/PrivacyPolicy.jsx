import { Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#0a0e27]">
      {/* Navbar */}
      <nav className="bg-[#0a0e27]/95 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-xl font-bold text-white">Nawaz<span className="text-primary-400">SMM</span>Panel</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Link to="/login" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Login</Link>
              <Link to="/login" className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-[#0d1230] border-b border-white/5 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-4 text-sm">
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Privacy Policy</h1>
          <p className="text-gray-500 mt-2">Last updated: December 4, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 legal-content">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, 
            place an order, or contact us for support. This may include:
          </p>
          <ul>
            <li>Name and email address</li>
            <li>Payment information</li>
            <li>Social media account URLs for order fulfillment</li>
            <li>Communication preferences</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process and fulfill your orders</li>
            <li>Send you order confirmations and updates</li>
            <li>Respond to your comments and questions</li>
            <li>Improve our services and develop new features</li>
            <li>Prevent fraudulent transactions and protect against illegal activities</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            except as necessary to provide our services. This includes sharing information with:
          </p>
          <ul>
            <li>Service providers who assist in order fulfillment</li>
            <li>Payment processors for secure transactions</li>
            <li>Law enforcement when required by law</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information from 
            unauthorized access, alteration, disclosure, or destruction. This includes encryption, 
            secure servers, and regular security audits.
          </p>

          <h2>5. Cookies</h2>
          <p>
            We use cookies and similar technologies to improve your experience on our website, 
            analyze site traffic, and personalize content. You can control cookie preferences 
            through your browser settings.
          </p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>

          <h2>7. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes 
            by posting the new policy on this page and updating the "Last updated" date.
          </p>

          <h2>8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <ul>
            <li>Email: support@smmpanel.com</li>
            <li>Phone: +91 9876543210</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#060920] text-gray-500 py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>&copy; 2025 Nawaz SMM Panel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
