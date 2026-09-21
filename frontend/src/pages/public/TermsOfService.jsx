import { Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';

const TermsOfService = () => {
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Terms of Service</h1>
          <p className="text-gray-500 mt-2">Last updated: December 4, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 legal-content">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Nawaz SMM Panel, you accept and agree to be bound by the terms and 
            provisions of this agreement. If you do not agree to these terms, please do not use 
            our services.
          </p>

          <h2>2. Description of Services</h2>
          <p>
            Nawaz SMM Panel provides social media marketing services including but not limited to 
            followers, likes, views, and engagement for various social media platforms. We act 
            as an intermediary between you and third-party service providers.
          </p>

          <h2>3. User Responsibilities</h2>
          <p>As a user of our services, you agree to:</p>
          <ul>
            <li>Provide accurate and complete information when creating an account</li>
            <li>Maintain the security of your account credentials</li>
            <li>Not use our services for any illegal or unauthorized purposes</li>
            <li>Comply with all applicable laws and social media platform terms of service</li>
            <li>Not resell our services without authorization</li>
          </ul>

          <h2>4. Orders and Payments</h2>
          <ul>
            <li>All orders are processed after payment confirmation</li>
            <li>Prices are subject to change without prior notice</li>
            <li>We accept payments through authorized payment gateways only</li>
            <li>Orders cannot be cancelled once processing has begun</li>
          </ul>

          <h2>5. Service Delivery</h2>
          <p>
            We strive to deliver all orders in a timely manner. However, delivery times may vary 
            based on order volume, service type, and third-party provider availability. We do not 
            guarantee specific delivery times unless explicitly stated.
          </p>

          <h2>6. No Guarantee Policy</h2>
          <p>While we strive to provide high-quality services, we cannot guarantee:</p>
          <ul>
            <li>Permanent retention of followers, likes, or views</li>
            <li>Specific results or outcomes from our services</li>
            <li>That services will meet your specific requirements</li>
            <li>Uninterrupted or error-free service</li>
          </ul>

          <h2>7. Limitation of Liability</h2>
          <p>
            Nawaz SMM Panel shall not be liable for any indirect, incidental, special, consequential, 
            or punitive damages resulting from your use of our services. Our total liability 
            shall not exceed the amount paid for the specific service in question.
          </p>

          <h2>8. Account Termination</h2>
          <p>
            We reserve the right to terminate or suspend your account at any time for violations 
            of these terms, fraudulent activity, or any other reason at our sole discretion.
          </p>

          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of our services 
            after changes constitutes acceptance of the modified terms.
          </p>

          <h2>10. Contact Information</h2>
          <p>For questions about these Terms of Service, contact us at:</p>
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

export default TermsOfService;
