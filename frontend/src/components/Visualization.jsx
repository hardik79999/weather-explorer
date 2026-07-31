import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Thermometer, AlertTriangle, CloudSun, Calendar, ArrowUpRight, ArrowDownRight, Layers, Table, Search, ChevronLeft, ChevronRight 
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const Visualization = ({ fileName, darkMode = true }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('area'); // 'line' or 'area'

  // Table State: Search, Page, Rows per Page
  const [tableSearch, setTableSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (!fileName) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/weather-file-content/${fileName}`);
        setData(response.data);
        setCurrentPage(1);
      } catch (err) {
        if (err.response?.data?.detail) {
          const detail = err.response.data.detail;
          setError(typeof detail === 'string' ? detail : detail.message || "Failed to load data.");
        } else {
          setError("Failed to fetch weather data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fileName]);

  // Format daily weather data for Recharts
  const chartData = useMemo(() => {
    if (!data || !data.daily) return [];
    
    return data.daily.time.map((timeStr, index) => {
      const maxTemp = data.daily.temperature_2m_max[index];
      const minTemp = data.daily.temperature_2m_min[index];
      const appMax = data.daily.apparent_temperature_max ? data.daily.apparent_temperature_max[index] : maxTemp;
      const appMin = data.daily.apparent_temperature_min ? data.daily.apparent_temperature_min[index] : minTemp;

      return {
        date: timeStr,
        maxTemp: maxTemp !== null ? maxTemp : 0,
        minTemp: minTemp !== null ? minTemp : 0,
        apparentMax: appMax !== null ? appMax : 0,
        apparentMin: appMin !== null ? appMin : 0,
      };
    });
  }, [data]);

  // Summary KPIs Calculation
  const summaryStats = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;

    let maxT = -Infinity;
    let minT = Infinity;
    let sumMax = 0;

    chartData.forEach(d => {
      if (d.maxTemp > maxT) maxT = d.maxTemp;
      if (d.minTemp < minT) minT = d.minTemp;
      sumMax += d.maxTemp;
    });

    const avgMax = (sumMax / chartData.length).toFixed(1);

    return {
      highest: maxT !== -Infinity ? maxT : 'N/A',
      lowest: minT !== Infinity ? minT : 'N/A',
      meanHigh: avgMax,
      totalDays: chartData.length
    };
  }, [chartData]);

  // Table Filter & Pagination Logic
  const filteredTableData = useMemo(() => {
    if (!chartData) return [];
    if (!tableSearch.trim()) return chartData;
    
    const q = tableSearch.toLowerCase().trim();
    return chartData.filter(row => 
      row.date.toLowerCase().includes(q) ||
      row.maxTemp.toString().includes(q) ||
      row.minTemp.toString().includes(q)
    );
  }, [chartData, tableSearch]);

  const totalPages = Math.ceil(filteredTableData.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTableData.slice(start, start + pageSize);
  }, [filteredTableData, currentPage, pageSize]);

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="card-apple p-6 rounded-xl text-center">
        <AlertTriangle className="mx-auto text-amber-500 mb-2" size={32} />
        <h3 className="text-sm font-semibold text-rose-500 mb-1">Data Error</h3>
        <p className="text-xs text-slate-400">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const cardBorderClass = darkMode ? 'border-zinc-800 bg-[#09090b]' : 'border-slate-200 bg-white shadow-sm';
  const textPrimaryClass = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textMutedClass = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-5">
      
      {/* 4 Summary KPI Metric Cards (Responsive: 1-col on xs, 2-col on sm, 4-col on lg) */}
      {summaryStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Highest Temp */}
          <div className={`p-4 rounded-xl border ${cardBorderClass} flex items-center justify-between`}>
            <div>
              <span className={`text-[10px] uppercase font-semibold tracking-wider ${textMutedClass}`}>
                Highest Temp
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${textPrimaryClass}`}>
                  {summaryStats.highest}°C
                </span>
                <span className="text-emerald-500 text-[10px] font-semibold flex items-center">
                  <ArrowUpRight size={12} /> Peak
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Recorded Peak</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <Thermometer size={16} />
            </div>
          </div>

          {/* Lowest Temp */}
          <div className={`p-4 rounded-xl border ${cardBorderClass} flex items-center justify-between`}>
            <div>
              <span className={`text-[10px] uppercase font-semibold tracking-wider ${textMutedClass}`}>
                Lowest Temp
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${textPrimaryClass}`}>
                  {summaryStats.lowest}°C
                </span>
                <span className="text-blue-500 text-[10px] font-semibold flex items-center">
                  <ArrowDownRight size={12} /> Minimum
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Recorded Minimum</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Thermometer size={16} />
            </div>
          </div>

          {/* Mean High */}
          <div className={`p-4 rounded-xl border ${cardBorderClass} flex items-center justify-between`}>
            <div>
              <span className={`text-[10px] uppercase font-semibold tracking-wider ${textMutedClass}`}>
                Mean High Temp
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${textPrimaryClass}`}>
                  {summaryStats.meanHigh}°C
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Average High</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <CloudSun size={16} />
            </div>
          </div>

          {/* Duration */}
          <div className={`p-4 rounded-xl border ${cardBorderClass} flex items-center justify-between`}>
            <div>
              <span className={`text-[10px] uppercase font-semibold tracking-wider ${textMutedClass}`}>
                Duration
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${textPrimaryClass}`}>
                  {summaryStats.totalDays} Days
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Span Length</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Calendar size={16} />
            </div>
          </div>

        </div>
      )}

      {/* Main Recharts Container (Responsive Chart Height & Type Switcher) */}
      <div className={`p-4 sm:p-5 rounded-xl border ${cardBorderClass} relative`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b pb-3 border-zinc-800/40">
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${textPrimaryClass}`}>
              <Layers size={14} className="text-blue-500" />
              Temperature Analysis Chart
            </h3>
            <p className="text-[10px] font-mono text-slate-400 truncate max-w-xs sm:max-w-md">
              {fileName}
            </p>
          </div>

          {/* Chart View Toggle (Line vs Area) */}
          <div className="flex items-center gap-1 self-start sm:self-auto p-1 rounded-lg border border-zinc-800 bg-zinc-900/50">
            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                chartType === 'line' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Line Chart
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                chartType === 'area' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Area Chart
            </button>
          </div>
        </div>

        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="maxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255,255,255,0.06)" : "#f1f5f9"} />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} unit="°C" />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                <Area type="monotone" dataKey="maxTemp" name="Max Temp" stroke="#ef4444" fillOpacity={1} fill="url(#maxGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="minTemp" name="Min Temp" stroke="#3b82f6" fillOpacity={1} fill="url(#minGrad)" strokeWidth={2} />
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255,255,255,0.06)" : "#f1f5f9"} />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} unit="°C" />
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                <Line type="monotone" dataKey="maxTemp" name="Max Temp" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="minTemp" name="Min Temp" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Paginated Table View (Responsive Table with Horizontal Overflow Scroll) */}
      <div className={`p-4 sm:p-5 rounded-xl border ${cardBorderClass}`}>
        
        {/* Table Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${textPrimaryClass}`}>
            <Table size={14} className="text-emerald-500" />
            Dataset Table Records
          </h3>

          <div className="flex items-center gap-2">
            {/* Search filter in table */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${
              darkMode ? 'bg-black border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <Search size={12} className="text-slate-400" />
              <input
                type="text"
                placeholder="Filter date..."
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent outline-none text-xs w-24 sm:w-32 text-slate-200"
              />
            </div>

            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className={`px-2 py-1 rounded-lg border text-xs cursor-pointer ${
                darkMode ? 'bg-black border-zinc-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value={10}>10 rows</option>
              <option value={20}>20 rows</option>
              <option value={50}>50 rows</option>
            </select>
          </div>
        </div>

        {/* Scrollable Data Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b text-[10px] uppercase font-mono tracking-wider ${
                darkMode ? 'border-zinc-800 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Max (°C)</th>
                <th className="py-2.5 px-3">Min (°C)</th>
                <th className="py-2.5 px-3">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400">
                    No matching records found
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.date} className={darkMode ? 'hover:bg-zinc-900/50' : 'hover:bg-slate-50'}>
                    <td className={`py-2 px-3 font-mono font-medium ${textPrimaryClass}`}>{row.date}</td>
                    <td className="py-2 px-3 font-mono font-semibold text-rose-500">{row.maxTemp}°C</td>
                    <td className="py-2 px-3 font-mono font-semibold text-blue-500">{row.minTemp}°C</td>
                    <td className="py-2 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        row.maxTemp >= 35 
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                          : row.maxTemp >= 25 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {row.maxTemp >= 35 ? 'Hot Day' : row.maxTemp >= 25 ? 'Warm' : 'Moderate/Cool'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-zinc-800/40 text-xs">
          <span className="text-[11px] text-slate-400 font-mono">
            Showing {Math.min((currentPage - 1) * pageSize + 1, filteredTableData.length)} - {Math.min(currentPage * pageSize, filteredTableData.length)} of {filteredTableData.length} entries
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md border border-zinc-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 text-xs font-mono text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md border border-zinc-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

// Custom Glassmorphic Tooltip Component for Recharts
const CustomTooltip = ({ active, payload, label, darkMode }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 rounded-xl border shadow-xl text-xs backdrop-blur-xl ${
        darkMode ? 'bg-black/90 border-zinc-800 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-900'
      }`}>
        <p className="font-mono font-bold border-b pb-1 mb-2 border-zinc-800 text-blue-400">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1 text-[11px]" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}:
            </span>
            <span className="font-mono font-bold">{entry.value}°C</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default Visualization;
