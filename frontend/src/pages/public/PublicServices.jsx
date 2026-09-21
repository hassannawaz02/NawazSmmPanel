import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { servicesAPI } from '../../services/api';
import {
  HiOutlineSearch,
  HiOutlineShoppingCart,
  HiArrowLeft,
  HiOutlineChevronDown,
} from 'react-icons/hi';

const PublicServices = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchServices = async () => {
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        servicesAPI.getAll({ status: 'active' }),
        servicesAPI.getCategories(),
      ]);
      setServices(servicesRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOrder = (serviceId) => {
    if (isAuthenticated) {
      navigate(`/new-order?service=${serviceId}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      {/* Navbar */}
      <nav className="bg-[#0a0e27]/95 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <span className="text-xl font-bold text-white">Nawaz <span className="text-primary-400">SMM</span></span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
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

      {/* Header */}
      <div className="bg-[#0d1230] border-b border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white text-sm mb-4">
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">All Services</h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Browse our complete list of SMM services with competitive pricing.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Category Filter - Custom Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full md:w-64 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-left flex items-center justify-between focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <span className="truncate">{selectedCategory === 'all' ? 'All Categories' : selectedCategory}</span>
              <HiOutlineChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-[#131836] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                <button
                  onClick={() => { setSelectedCategory('all'); setDropdownOpen(false); }}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-white/10 transition-colors ${selectedCategory === 'all' ? 'text-primary-400 bg-primary-600/10' : 'text-white'}`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => { setSelectedCategory(category); setDropdownOpen(false); }}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-white/10 transition-colors ${selectedCategory === category ? 'text-primary-400 bg-primary-600/10' : 'text-white'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Services List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No services found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredServices.map((service) => (
              <div
                key={service._id}
                className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:bg-white/10 hover:border-white/10 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-primary-600/20 text-primary-300 text-xs font-medium rounded">
                        {service.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {service.title}
                    </h3>
                    <p className="text-gray-400 text-sm" style={{ whiteSpace: 'pre-line' }}>{service.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Min: {service.minQuantity ?? service.min}</span>
                      <span>Max: {service.maxQuantity ?? service.max}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-400">
                        PKR {service.pricePerUnit ?? service.rate}
                      </div>
                      <div className="text-gray-500 text-sm">per 1000</div>
                    </div>
                    <button
                      onClick={() => handleOrder(service._id)}
                      className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
                    >
                      <HiOutlineShoppingCart className="w-5 h-5" />
                      Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#060920] text-gray-500 py-8 border-t border-white/5 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Nawaz SMM Panel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicServices;
