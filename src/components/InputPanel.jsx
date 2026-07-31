import { useState, useMemo, useRef, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Calendar, Compass, ArrowRight, AlertCircle, CheckCircle2, Building2, Search, ChevronDown, Check, Globe, Filter, Navigation, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Database: 31 Gujarat Cities + ALL 28 Official Indian States + Global Metros
const CITIES = [
  // GUJARAT (31 Major Cities/Districts)
  { name: 'Ahmedabad', state: 'Gujarat', country: 'India', lat: '23.0225', lon: '72.5714' },
  { name: 'Surat', state: 'Gujarat', country: 'India', lat: '21.1702', lon: '72.8311' },
  { name: 'Vadodara', state: 'Gujarat', country: 'India', lat: '22.3072', lon: '73.1812' },
  { name: 'Rajkot', state: 'Gujarat', country: 'India', lat: '22.3039', lon: '70.8022' },
  { name: 'Gandhinagar', state: 'Gujarat', country: 'India', lat: '23.2156', lon: '72.6369' },
  { name: 'Bhavnagar', state: 'Gujarat', country: 'India', lat: '21.7645', lon: '72.1519' },
  { name: 'Jamnagar', state: 'Gujarat', country: 'India', lat: '22.4707', lon: '70.0577' },
  { name: 'Junagadh', state: 'Gujarat', country: 'India', lat: '21.5222', lon: '70.4579' },
  { name: 'Anand', state: 'Gujarat', country: 'India', lat: '22.5645', lon: '72.9289' },
  { name: 'Bharuch', state: 'Gujarat', country: 'India', lat: '21.7051', lon: '72.9959' },
  { name: 'Bhuj', state: 'Gujarat', country: 'India', lat: '23.2420', lon: '69.6669' },
  { name: 'Porbandar', state: 'Gujarat', country: 'India', lat: '21.6417', lon: '69.6293' },
  { name: 'Navsari', state: 'Gujarat', country: 'India', lat: '20.9500', lon: '72.9333' },
  { name: 'Mehsana', state: 'Gujarat', country: 'India', lat: '23.6000', lon: '72.4000' },
  { name: 'Patan', state: 'Gujarat', country: 'India', lat: '23.8500', lon: '72.1167' },
  { name: 'Amreli', state: 'Gujarat', country: 'India', lat: '21.6000', lon: '71.2167' },
  { name: 'Nadiad', state: 'Gujarat', country: 'India', lat: '22.6900', lon: '72.8600' },
  { name: 'Valsad', state: 'Gujarat', country: 'India', lat: '20.6100', lon: '72.9300' },
  { name: 'Vapi', state: 'Gujarat', country: 'India', lat: '20.3700', lon: '72.9000' },
  { name: 'Godhra', state: 'Gujarat', country: 'India', lat: '22.7750', lon: '73.6140' },
  { name: 'Veraval', state: 'Gujarat', country: 'India', lat: '20.9000', lon: '70.3700' },
  { name: 'Morbi', state: 'Gujarat', country: 'India', lat: '22.8200', lon: '70.8300' },
  { name: 'Botad', state: 'Gujarat', country: 'India', lat: '22.1700', lon: '71.6700' },
  { name: 'Surendranagar', state: 'Gujarat', country: 'India', lat: '22.7200', lon: '71.6300' },
  { name: 'Palanpur', state: 'Gujarat', country: 'India', lat: '24.1700', lon: '72.4300' },
  { name: 'Himatnagar', state: 'Gujarat', country: 'India', lat: '23.6000', lon: '72.9500' },
  { name: 'Dahod', state: 'Gujarat', country: 'India', lat: '22.8300', lon: '74.2500' },
  { name: 'Dwarka', state: 'Gujarat', country: 'India', lat: '22.2400', lon: '68.9700' },
  { name: 'Somnath', state: 'Gujarat', country: 'India', lat: '20.8880', lon: '70.4010' },
  { name: 'Ankleshwar', state: 'Gujarat', country: 'India', lat: '21.6300', lon: '73.0000' },
  { name: 'Gandhidham', state: 'Gujarat', country: 'India', lat: '23.0800', lon: '70.1300' },

  // ALL 28 OFFICIAL INDIAN STATES COVERAGE
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', lat: '17.6868', lon: '83.2185' },
  { name: 'Itanagar', state: 'Arunachal Pradesh', country: 'India', lat: '27.0844', lon: '93.6053' },
  { name: 'Guwahati', state: 'Assam', country: 'India', lat: '26.1445', lon: '91.7362' },
  { name: 'Patna', state: 'Bihar', country: 'India', lat: '25.5941', lon: '85.1376' },
  { name: 'Raipur', state: 'Chhattisgarh', country: 'India', lat: '21.2514', lon: '81.6296' },
  { name: 'Panaji', state: 'Goa', country: 'India', lat: '15.4909', lon: '73.8278' },
  { name: 'Gurugram', state: 'Haryana', country: 'India', lat: '28.4595', lon: '77.0266' },
  { name: 'Shimla', state: 'Himachal Pradesh', country: 'India', lat: '31.1048', lon: '77.1734' },
  { name: 'Ranchi', state: 'Jharkhand', country: 'India', lat: '23.3441', lon: '85.3096' },
  { name: 'Bengaluru', state: 'Karnataka', country: 'India', lat: '12.9716', lon: '77.5946' },
  { name: 'Thiruvananthapuram', state: 'Kerala', country: 'India', lat: '8.5241', lon: '76.9366' },
  { name: 'Bhopal', state: 'Madhya Pradesh', country: 'India', lat: '23.2599', lon: '77.4126' },
  { name: 'Mumbai', state: 'Maharashtra', country: 'India', lat: '19.0760', lon: '72.8777' },
  { name: 'Imphal', state: 'Manipur', country: 'India', lat: '24.8170', lon: '93.9368' },
  { name: 'Shillong', state: 'Meghalaya', country: 'India', lat: '25.5788', lon: '91.8933' },
  { name: 'Aizawl', state: 'Mizoram', country: 'India', lat: '23.7271', lon: '92.7176' },
  { name: 'Kohima', state: 'Nagaland', country: 'India', lat: '25.6751', lon: '94.1086' },
  { name: 'Bhubaneswar', state: 'Odisha', country: 'India', lat: '20.2961', lon: '85.8245' },
  { name: 'Amritsar', state: 'Punjab', country: 'India', lat: '31.6340', lon: '74.8723' },
  { name: 'Jaipur', state: 'Rajasthan', country: 'India', lat: '26.9124', lon: '75.7873' },
  { name: 'Gangtok', state: 'Sikkim', country: 'India', lat: '27.3389', lon: '88.6065' },
  { name: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: '13.0827', lon: '80.2707' },
  { name: 'Hyderabad', state: 'Telangana', country: 'India', lat: '17.3850', lon: '78.4867' },
  { name: 'Agartala', state: 'Tripura', country: 'India', lat: '23.8315', lon: '91.2868' },
  { name: 'Lucknow', state: 'Uttar Pradesh', country: 'India', lat: '26.8467', lon: '80.9462' },
  { name: 'Dehradun', state: 'Uttarakhand', country: 'India', lat: '30.3165', lon: '78.0322' },
  { name: 'Kolkata', state: 'West Bengal', country: 'India', lat: '22.5726', lon: '88.3639' },
  { name: 'New Delhi', state: 'Delhi NCT', country: 'India', lat: '28.6139', lon: '77.2090' },

  // GLOBAL METROS
  { name: 'New York', state: 'New York', country: 'USA', lat: '40.7128', lon: '-74.0060' },
  { name: 'London', state: 'Greater London', country: 'United Kingdom', lat: '51.5074', lon: '-0.1278' },
  { name: 'Tokyo', state: 'Kanto', country: 'Japan', lat: '35.6762', lon: '139.6503' },
  { name: 'Dubai', state: 'Dubai Emirate', country: 'UAE', lat: '25.2048', lon: '55.2708' },
  { name: 'Paris', state: 'Île-de-France', country: 'France', lat: '48.8566', lon: '2.3522' },
  { name: 'Sydney', state: 'New South Wales', country: 'Australia', lat: '-33.8688', lon: '151.2093' },
];

const InputPanel = ({ onFileCreated, darkMode = true }) => {
  const [formData, setFormData] = useState({
    latitude: '23.0225',
    longitude: '72.5714',
    start_date: '2024-01-01',
    end_date: '2024-01-10'
  });
  
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('ALL');
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');
  
  const [selectedCity, setSelectedCity] = useState(CITIES[0]); // Ahmedabad default
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSelectedCity(null);
  };

  const handleSelectCity = (city) => {
    setSelectedCity(city);
    setSearchQuery('');
    setFormData(prev => ({
      ...prev,
      latitude: city.lat,
      longitude: city.lon
    }));
    setDropdownOpen(false);
    setHighlightedIndex(0);
  };

  const applyDateDays = (days) => {
    const end = new Date();
    end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(start.getDate() - days + 1);

    const fmt = (d) => d.toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      start_date: fmt(start),
      end_date: fmt(end)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        throw new Error("End date cannot be earlier than start date.");
      }
      
      const diffTime = Math.abs(new Date(formData.end_date) - new Date(formData.start_date));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays > 31) {
        throw new Error("Date range cannot exceed 31 days.");
      }

      const response = await axios.post(`${API_BASE_URL}/store-weather-data`, {
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        start_date: formData.start_date,
        end_date: formData.end_date
      });

      setSuccess(`Dataset saved: ${response.data.file}`);
      if (onFileCreated) {
        onFileCreated(response.data.file);
      }
    } catch (err) {
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        setError(typeof detail === 'string' ? detail : detail[0]?.msg || "Invalid input parameters.");
      } else if (err.code === 'ERR_NETWORK') {
        setError("Network error. Backend FastAPI server is not responding.");
      } else {
        setError(err.message || "An error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const availableCountries = useMemo(() => {
    return ['ALL', ...Array.from(new Set(CITIES.map(c => c.country)))];
  }, []);

  const availableStates = useMemo(() => {
    let list = CITIES;
    if (selectedCountryFilter !== 'ALL') {
      list = list.filter(c => c.country === selectedCountryFilter);
    }
    return ['ALL', ...Array.from(new Set(list.map(c => c.state))).sort()];
  }, [selectedCountryFilter]);

  const filteredCities = useMemo(() => {
    return CITIES.filter(c => {
      const matchCountry = selectedCountryFilter === 'ALL' || c.country === selectedCountryFilter;
      const matchState = selectedStateFilter === 'ALL' || c.state === selectedStateFilter;
      
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchCountry && matchState;

      const matchName = c.name.toLowerCase().includes(q);
      const matchSt = c.state.toLowerCase().includes(q);
      const matchCo = c.country.toLowerCase().includes(q);
      const matchLat = c.lat.includes(q);
      const matchLon = c.lon.includes(q);

      return matchCountry && matchState && (matchName || matchSt || matchCo || matchLat || matchLon);
    });
  }, [selectedCountryFilter, selectedStateFilter, searchQuery]);

  const handleKeyDown = (e) => {
    if (!dropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setDropdownOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % Math.max(1, filteredCities.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + filteredCities.length) % Math.max(1, filteredCities.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCities[highlightedIndex]) {
        handleSelectCity(filteredCities[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
  };

  const labelClass = `flex items-center gap-1 text-[11px] font-medium mb-1 ${
    darkMode ? 'text-slate-300' : 'text-slate-700'
  }`;

  const optionClass = darkMode ? "bg-slate-900 text-slate-200" : "bg-white text-slate-800";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* Responsive Cascading Filter Section */}
      <div className="space-y-2.5">
        <div className={`flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider ${
          darkMode ? 'text-slate-300' : 'text-slate-700'
        }`}>
          <span className="flex items-center gap-1">
            <Filter size={12} className="text-blue-500" />
            Location Filters
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {filteredCities.length} Cities
          </span>
        </div>

        {/* Responsive Country & State Filter Dropdowns (1-col on mobile, 2-col on sm) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          
          {/* Country Filter */}
          <div>
            <label className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mb-1">
              <Globe size={11} className="text-slate-400" />
              Country
            </label>
            <select
              value={selectedCountryFilter}
              onChange={(e) => {
                setSelectedCountryFilter(e.target.value);
                setSelectedStateFilter('ALL');
                setHighlightedIndex(0);
              }}
              className="w-full input-apple px-2 py-1.5 rounded-md text-xs cursor-pointer"
            >
              {availableCountries.map(country => (
                <option key={country} value={country} className={optionClass}>
                  {country === 'ALL' ? 'All Countries' : country}
                </option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div>
            <label className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mb-1">
              <MapPin size={11} className="text-slate-400" />
              State / Region
            </label>
            <select
              value={selectedStateFilter}
              onChange={(e) => {
                setSelectedStateFilter(e.target.value);
                setHighlightedIndex(0);
              }}
              className="w-full input-apple px-2 py-1.5 rounded-md text-xs cursor-pointer"
            >
              {availableStates.map(state => (
                <option key={state} value={state} className={optionClass}>
                  {state === 'ALL' ? 'All States' : state}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Smart City Search Combobox */}
        <div className="relative" ref={dropdownRef}>
          <label className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mb-1">
            <Building2 size={11} className="text-slate-400" />
            Smart City Search
          </label>

          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`w-full input-apple px-3 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer border select-none ${
              dropdownOpen ? 'ring-2 ring-blue-500/40 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={selectedCity ? `${selectedCity.name}, ${selectedCity.state}` : "Search city, state or lat..."}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDropdownOpen(true);
                  setHighlightedIndex(0);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(true);
                }}
                className={`bg-transparent outline-none w-full text-xs placeholder:text-slate-400 ${
                  darkMode ? 'text-slate-100' : 'text-slate-900'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                  }}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ml-1 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Floating Dropdown Results Menu */}
          {dropdownOpen && (
            <div className={`absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border shadow-2xl overflow-hidden max-h-56 overflow-y-auto ${
              darkMode 
                ? 'bg-[#0f172a] border-slate-700 text-slate-100 shadow-black/80' 
                : 'bg-white border-slate-300 text-slate-900 shadow-slate-400/40'
            }`}>
              {filteredCities.length === 0 ? (
                <div className="p-3 text-center text-slate-400 text-xs">
                  No cities match &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="py-1 divide-y divide-slate-800/40 dark:divide-slate-800/20">
                  {filteredCities.map((city, idx) => {
                    const isSelected = selectedCity?.name === city.name;
                    const isHighlighted = highlightedIndex === idx;
                    return (
                      <div
                        key={city.name}
                        onClick={() => handleSelectCity(city)}
                        className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          isHighlighted 
                            ? darkMode ? 'bg-blue-600/40 text-white font-semibold' : 'bg-blue-100 text-blue-900 font-semibold'
                            : isSelected
                              ? darkMode ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'bg-blue-50 text-blue-700 font-semibold'
                              : darkMode ? 'hover:bg-slate-800/80 text-slate-100' : 'hover:bg-slate-100 text-slate-900'
                        }`}
                      >
                        <div className="flex flex-col min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <Navigation size={11} className={isSelected ? "text-blue-500 shrink-0" : "text-slate-400 shrink-0"} />
                            <span className={`font-semibold truncate ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{city.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">({city.lat}, {city.lon})</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium pl-4 truncate">
                            {city.state}, <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{city.country}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${
                            darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}>
                            {city.state}
                          </span>
                          {isSelected && <Check size={14} className="text-blue-500" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Responsive Lat & Long Inputs (1-col on xs, 2-col on sm) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className={labelClass}>
            <Compass size={12} className="text-slate-400" />
            Latitude
          </label>
          <input
            type="number"
            step="0.0001"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="-90 to 90"
            className="w-full input-apple px-2.5 py-1.5 rounded-lg text-xs font-mono"
            required
            min="-90"
            max="90"
          />
        </div>

        <div>
          <label className={labelClass}>
            <MapPin size={12} className="text-slate-400" />
            Longitude
          </label>
          <input
            type="number"
            step="0.0001"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="-180 to 180"
            className="w-full input-apple px-2.5 py-1.5 rounded-lg text-xs font-mono"
            required
            min="-180"
            max="180"
          />
        </div>
      </div>

      {/* Responsive Date Controls */}
      <div>
        <div className={`flex items-center justify-between text-[11px] font-medium mb-1 ${
          darkMode ? 'text-slate-300' : 'text-slate-700'
        }`}>
          <span className="flex items-center gap-1">
            <Calendar size={12} className="text-slate-400" />
            Date Span
          </span>
          <div className="flex gap-1">
            {['7', '14', '30'].map(days => (
              <button
                key={days}
                type="button"
                onClick={() => applyDateDays(Number(days))}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition ${
                  darkMode 
                    ? 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800' 
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-300'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="input-apple px-2.5 py-1.5 rounded-lg text-xs w-full font-mono"
            required
          />
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="input-apple px-2.5 py-1.5 rounded-lg text-xs w-full font-mono"
            required
          />
        </div>
      </div>

      {/* Full-width Responsive Action Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs mt-1"
      >
        {loading ? (
          <span>Querying Open-Meteo...</span>
        ) : (
          <>
            <span>Query & Store Data</span>
            <ArrowRight size={14} />
          </>
        )}
      </button>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-[11px]">
          <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
          <span className="break-all">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[11px] truncate">
          <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
          <span className="truncate">{success}</span>
        </div>
      )}
    </form>
  );
};

export default InputPanel;
