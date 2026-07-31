import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FileCode, RefreshCw, Search, HardDrive, ChevronRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const FileList = ({ selectedFile, onSelectFile, darkMode = true }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/list-weather-files`);
      const sortedFiles = (response.data.files || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setFiles(sortedFiles);
    } catch (err) {
      setError("Failed to fetch stored weather files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [selectedFile]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const q = searchQuery.toLowerCase();
    return files.filter(f => f.name.toLowerCase().includes(q));
  }, [files, searchQuery]);

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="flex flex-col h-[340px]">
      {/* Search Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-grow">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full input-apple pl-7 pr-2.5 py-1 rounded-lg text-xs"
          />
        </div>
        <button 
          onClick={fetchFiles}
          disabled={loading}
          className={`p-1 rounded-lg border transition disabled:opacity-50 ${
            darkMode 
              ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200' 
              : 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
          }`}
          title="Refresh List"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-blue-500" : ""} />
        </button>
      </div>

      {loading && files.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner text="Scanning Storage..." />
        </div>
      ) : error ? (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-[11px]">
          {error}
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-slate-400 text-xs py-8">
          <HardDrive size={20} className="opacity-40 mb-1.5" />
          <span>{searchQuery ? "No matching files" : "No stored files found"}</span>
        </div>
      ) : (
        <div className="overflow-y-auto flex-grow pr-1 space-y-1.5">
          {filteredFiles.map((file) => {
            const isSelected = selectedFile === file.name;
            const parts = file.name.replace('.json', '').split('_');
            const hasParsedInfo = parts.length >= 5;
            const lat = hasParsedInfo ? parts[1] : null;
            const lon = hasParsedInfo ? parts[2] : null;
            const range = hasParsedInfo ? `${parts[3]} → ${parts[4]}` : null;

            return (
              <button
                key={file.name}
                onClick={() => onSelectFile(file.name)}
                className={`w-full text-left p-2.5 rounded-lg border transition-all duration-150 group ${
                  isSelected 
                    ? 'bg-blue-600/15 border-blue-500/40 text-blue-600 dark:text-slate-100 font-semibold shadow-sm' 
                    : darkMode 
                      ? 'bg-slate-900/60 border-white/[0.05] hover:bg-slate-800/60 hover:border-white/[0.1]' 
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCode size={15} className={isSelected ? 'text-blue-500' : 'text-slate-400'} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium truncate ${darkMode ? 'text-slate-200' : 'text-slate-800'}`} title={file.name}>
                        {hasParsedInfo ? `Coordinates: ${lat}, ${lon}` : file.name}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                        {range && <span>{range}</span>}
                        <span>•</span>
                        <span>{formatSize(file.size)}</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight size={13} className={`shrink-0 transition-transform ${
                    isSelected ? 'text-blue-500 translate-x-0.5' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileList;
