import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { reviewsAPI } from '../services/api';
import {
  HiOutlineLightningBolt,
  HiOutlineShieldCheck,
  HiOutlineCurrencyRupee,
  HiOutlineSupport,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineGlobe,
} from 'react-icons/hi';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { settings } = useSiteSettings();
  const [reviews, setReviews] = useState([]);
  const [activeReview, setActiveReview] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getAll();
      setReviews(response.data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleReviewScroll = useCallback(() => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveReview(index);
  }, []);

  const scrollToReview = (index) => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const cardWidth = container.offsetWidth;
    container.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
  };

  const features = [
    {
      icon: HiOutlineLightningBolt,
      title: 'Instant Delivery',
      description: 'Get your orders delivered instantly with our automated system.',
    },
    {
      icon: HiOutlineShieldCheck,
      title: 'High Quality',
      description: 'Premium quality services that help grow your social presence.',
    },
    {
      icon: HiOutlineCurrencyRupee,
      title: 'Affordable Prices',
      description: 'Competitive pricing with the best rates in the market.',
    },
    {
      icon: HiOutlineSupport,
      title: '24/7 Support',
      description: 'Round the clock customer support for all your queries.',
    },
    {
      icon: HiOutlineChartBar,
      title: 'Real-time Tracking',
      description: 'Track your orders in real-time with detailed status updates.',
    },
    {
      icon: HiOutlineUserGroup,
      title: 'Trusted by Thousands',
      description: 'Join thousands of satisfied customers growing their presence.',
    },
  ];

  const services = [
    { name: 'Instagram Followers', price: 'PKR 10', per: '1000', color: 'from-pink-500 to-purple-600' },
    { name: 'YouTube Views', price: 'PKR 15', per: '1000', color: 'from-red-500 to-red-600' },
    { name: 'Facebook Likes', price: 'PKR 8', per: '1000', color: 'from-blue-500 to-blue-600' },
    { name: 'Twitter Followers', price: 'PKR 12', per: '1000', color: 'from-gray-800 to-black' },
    { name: 'Telegram Members', price: 'PKR 20', per: '1000', color: 'from-blue-400 to-blue-500' },
    { name: 'TikTok Followers', price: 'PKR 14', per: '1000', color: 'from-cyan-400 to-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Home</Link>
              <Link to="/services" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Services</Link>
            </div>
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/login"
                    className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Dark Theme */}
      <section className="relative bg-[#0a0e27] overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-white/80 text-sm font-medium">Trusted SMM Panel</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Grow Your Social Media
                <span className="block bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                  Faster
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
                High-quality social media services at competitive prices. 
                From Instagram followers to YouTube views, we've got you covered. 
                Boost your online presence today with <span className="text-primary-400 font-medium">{settings.siteName} Panel</span>.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to={isAuthenticated ? '/new-order' : '/login'}
                  className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all hover:shadow-lg hover:shadow-primary-600/25 text-center"
                >
                  Get Started
                </Link>
                <Link
                  to="/services"
                  className="border border-white/20 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/5 transition-all text-center"
                >
                  View Services
                </Link>
              </div>
            </div>

            {/* Right Content - Phone Mockup with Floating Icons */}
            <div className="flex-1 relative hidden lg:block">
              <div className="relative w-72 mx-auto">
                {/* Phone Frame */}
                <div className="bg-[#131836] rounded-[2.5rem] p-3 border border-white/10 shadow-2xl shadow-primary-600/10">
                  <div className="bg-gradient-to-b from-[#1a2040] to-[#0f1328] rounded-[2rem] p-6 min-h-[380px]">
                    {/* Phone Header */}
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-primary-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">N</span>
                      </div>
                      <div className="text-white font-semibold text-sm">{settings.siteName} Panel</div>
                      <div className="text-gray-500 text-xs">Dashboard</div>
                    </div>
                    {/* Phone Stats */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-4">
                      <div className="text-gray-400 text-xs mb-1">Total Orders</div>
                      <div className="text-white text-2xl font-bold">+2,483</div>
                      <div className="text-green-400 text-xs mt-1">+12.5% this month</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="text-gray-400 text-xs">Active</div>
                        <div className="text-white font-bold">156</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="text-gray-400 text-xs">Completed</div>
                        <div className="text-white font-bold">2,327</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Social Icons */}
                {/* Instagram */}
                <div className="absolute -top-4 -left-8 w-14 h-14 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </div>

                {/* TikTok */}
                <div className="absolute top-20 -left-14 w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.28 8.28 0 005.58 2.15v-3.44a4.85 4.85 0 01-3.59-1.63V6.69h3.59z"/></svg>
                </div>

                {/* YouTube */}
                <div className="absolute -top-6 right-0 w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </div>

                {/* Facebook */}
                <div className="absolute bottom-24 -right-10 w-13 h-13 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.2s' }}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </div>

                {/* X/Twitter */}
                <div className="absolute bottom-10 -left-6 w-11 h-11 bg-black rounded-xl flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.3s' }}>
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </div>

                {/* Telegram */}
                <div className="absolute top-40 -right-12 w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '3.1s' }}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar - Dark */}
      <section className="bg-[#0d1230] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/5">
            <div className="flex items-center gap-3 py-5 px-4 justify-center">
              <HiOutlineLightningBolt className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <div className="text-left">
                <div className="text-white font-semibold text-sm">Instant Delivery</div>
                <div className="text-gray-500 text-xs">Fast processing</div>
              </div>
            </div>
            <div className="flex items-center gap-3 py-5 px-4 justify-center">
              <HiOutlineSupport className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <div className="text-left">
                <div className="text-white font-semibold text-sm">24/7 Support</div>
                <div className="text-gray-500 text-xs">Always available</div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 py-5 px-4 justify-center">
              <HiOutlineCheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <div className="text-left">
                <div className="text-white font-semibold text-sm">850K+ Orders</div>
                <div className="text-gray-500 text-xs">Completed</div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 py-5 px-4 justify-center">
              <HiOutlineGlobe className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <div className="text-left">
                <div className="text-white font-semibold text-sm">Worldwide</div>
                <div className="text-gray-500 text-xs">Services</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Numbers */}
      <section className="bg-[#0a0e27] py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            <div>
              <div className="text-2xl md:text-4xl font-bold text-white">50K+</div>
              <div className="text-gray-500 mt-1 text-sm">Happy Customers</div>
            </div>
            <div>
              <div className="text-2xl md:text-4xl font-bold text-white">850K+</div>
              <div className="text-gray-500 mt-1 text-sm">Orders Completed</div>
            </div>
            <div>
              <div className="text-2xl md:text-4xl font-bold text-white">4.8/5</div>
              <div className="text-gray-500 mt-1 text-sm">Customer Rating</div>
            </div>
            <div>
              <div className="text-2xl md:text-4xl font-bold text-white">99%</div>
              <div className="text-gray-500 mt-1 text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Dark */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#0a0e27]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Us?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
              We provide the best SMM services with instant delivery and 24/7 support.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/5 p-6 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all group"
              >
                <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section - Dark */}
      {reviews.length > 0 && (
        <section className="py-12 sm:py-16 md:py-20 bg-[#0d1230]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                What Our Customers Say
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
                Don't know what to expect? See our customers' reviews below!
              </p>
            </div>

            {/* Mobile: Full-width slider | Desktop: Grid */}
            <div
              ref={sliderRef}
              onScroll={handleReviewScroll}
              className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory md:snap-none scrollbar-hide"
              style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
            >
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="min-w-[70%] sm:min-w-[60%] md:min-w-0 bg-white/5 backdrop-blur-sm border border-white/5 p-4 md:p-6 rounded-2xl flex-shrink-0 snap-center hover:bg-white/10 transition-all flex flex-col"
                  style={{ scrollSnapAlign: 'center' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {review.avatar ? (
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white/10 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary-600/30 rounded-full flex items-center justify-center border-2 border-white/10 flex-shrink-0">
                        <span className="text-primary-300 font-bold text-sm">
                          {review.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-semibold text-white text-sm truncate">{review.name}</h4>
                      <div className="text-yellow-500 text-xs">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 whitespace-pre-line">{review.text}</p>
                </div>
              ))}
            </div>

            {/* Dots - Mobile only */}
            <div className="flex md:hidden justify-center gap-2 mt-4">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToReview(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeReview === index ? 'bg-primary-400 w-6' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Preview - Dark */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#0a0e27]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Our Most Popular Services
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
              Choose from a wide range of social media services to grow your audience and boost your online presence with real engagement.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all group"
              >
                <div className={`h-1.5 bg-gradient-to-r ${service.color}`}></div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {service.name}
                  </h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-2xl font-bold text-primary-400">
                      Starting from {service.price}
                    </span>
                    <span className="text-gray-500 ml-1 text-sm">/ {service.per}</span>
                  </div>
                  <Link
                    to={isAuthenticated ? '/new-order' : '/login'}
                    className="block text-center bg-white/5 border border-white/10 text-white py-2.5 rounded-xl font-medium hover:bg-primary-600 hover:border-primary-600 transition-all text-sm"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/services"
              className="inline-flex items-center text-primary-400 font-medium hover:text-primary-300 transition-colors text-sm"
            >
              View All Services
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Dark */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#0d1230]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Grow Your Social Media?
          </h2>
          <p className="text-gray-400 mb-8 text-sm sm:text-base">
            Join thousands of satisfied customers and start growing today.
          </p>
          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all hover:shadow-lg hover:shadow-primary-600/25"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#060920] text-gray-400 py-8 sm:py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-xl font-bold text-white">Nawaz<span className="text-primary-400">SMM</span>Panel</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              Access Instagram, YouTube, TikTok, Facebook, Telegram and other social media services through one dashboard, with transparent pricing, local payment options and reseller tools for customers in Pakistan and worldwide.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Platforms</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/services" className="hover:text-white transition-colors">Instagram</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">YouTube</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Facebook</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">TikTok</Link></li>
              </ul>
            </div>
          </div>
          <div className="mb-8">
            <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div className="border-t border-white/5 pt-6 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
