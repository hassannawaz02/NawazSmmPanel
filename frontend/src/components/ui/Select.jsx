import { useState, useRef, useEffect } from 'react';
import { HiOutlineChevronDown } from 'react-icons/hi';

const Select = ({ label, error, className = '', options = [], placeholder, value, onChange, ...props }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder || 'Select...';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    if (onChange) {
      onChange({ target: { value: val } });
    }
    setOpen(false);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full px-4 py-2.5 border rounded-lg text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-white ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
        >
          <span className={`truncate ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
            {displayText}
          </span>
          <HiOutlineChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {placeholder && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-400 hover:bg-gray-50 transition-colors"
              >
                {placeholder}
              </button>
            )}
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-primary-50 transition-colors ${
                  value === option.value ? 'text-primary-600 bg-primary-50 font-medium' : 'text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

Select.displayName = 'Select';

export default Select;
