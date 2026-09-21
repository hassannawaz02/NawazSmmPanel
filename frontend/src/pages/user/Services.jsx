import { useState, useEffect, useRef } from 'react';
import { servicesAPI } from '../../services/api';
import { Card, PageLoader } from '../../components/ui';
import { HiOutlineSearch, HiOutlineChevronDown } from 'react-icons/hi';

const Services = () => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [groupedServices, setGroupedServices] = useState({});
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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
      const response = await servicesAPI.getAll();
      setServices(response.data.data);
      setGroupedServices(response.data.grouped);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = Object.keys(groupedServices);

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <p className="text-gray-500 mt-1">Browse all available SMM services</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>
        <div className="relative min-w-[200px]" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <span className={`truncate ${selectedCategory === 'all' ? 'text-gray-400' : 'text-gray-900'}`}>
              {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
            </span>
            <HiOutlineChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => { setSelectedCategory('all'); setDropdownOpen(false); }}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-primary-50 transition-colors ${selectedCategory === 'all' ? 'text-primary-600 bg-primary-50 font-medium' : 'text-gray-900'}`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => { setSelectedCategory(category); setDropdownOpen(false); }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-primary-50 transition-colors ${selectedCategory === category ? 'text-primary-600 bg-primary-50 font-medium' : 'text-gray-900'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid gap-4">
        {filteredServices.map((service) => (
          <Card key={service.id} className="hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                    {service.category}
                  </span>
                  <span className="text-xs text-gray-500">ID: {service.id.slice(-6)}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{service.title}</h3>
                {service.description && (
                  <p className="text-sm text-gray-500 mt-1" style={{ whiteSpace: 'pre-line' }}>{service.description}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Rate</p>
                  <p className="font-bold text-primary-600">
                    {service.min === service.max
                      ? `PKR ${service.rate}`
                      : `PKR ${service.rate}/1000`}
                  </p>
                  {service.min !== service.max && (
                    <p className="text-xs text-gray-400">per 1000</p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Min</p>
                  <p className="font-semibold">{service.min}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Max</p>
                  <p className="font-semibold">{service.max}</p>
                </div>
                <a
                  href={`/new-order?service=${service.id}`}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Order
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No services found matching your criteria
        </div>
      )}
    </div>
  );
};

export default Services;
