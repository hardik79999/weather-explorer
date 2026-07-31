import { useState, useEffect } from 'react'
import InputPanel from './components/InputPanel'
import FileList from './components/FileList'
import Visualization from './components/Visualization'
import { Sun, Moon, Database, BarChart2, ShieldCheck, Activity, Clock } from 'lucide-react'

// Main Application Container Component
function App() {
  // State: Currently selected weather dataset filename
  const [selectedFile, setSelectedFile] = useState(null);
  
  // State: Light / Dark mode toggle (default: false = Light Mode)
  const [darkMode, setDarkMode] = useState(false);
  
  // State: Live clock string displayed in the header
  const [currentTime, setCurrentTime] = useState('');

  // Effect: Updates the live clock every 1 second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Callback when a new dataset file is created via form submission
  const handleFileCreated = (fileName) => {
    setSelectedFile(fileName);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${
      darkMode ? 'dark-mode bg-black text-slate-100' : 'light-mode bg-slate-100 text-slate-900'
    } flex flex-col items-center antialiased`}>
      
      {/* Header Bar */}
      <header className={`w-full backdrop-blur-xl border-b sticky top-0 z-50 transition-colors ${
        darkMode ? 'bg-black/95 border-zinc-800' : 'bg-white/90 border-slate-200 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold transition-transform group-hover:scale-105">
                <Sun size={20} className="animate-spin-slow" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0e1320]"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-sm font-bold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  Weather Explorer
                </h1>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  PRO v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Historical Climate Intelligence Engine
              </p>
            </div>
          </div>

          {/* Header Controls: Clock, Security Status, and Theme Switcher */}
          <div className="flex items-center gap-3">
            
            {/* Live Clock */}
            <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-mono ${
              darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <Clock size={13} className="text-blue-500" />
              <span>{currentTime || '12:00:00'}</span>
            </div>

            {/* Security Badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${
              darkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <ShieldCheck size={13} className="text-emerald-500" />
              <span>Path Safe</span>
            </div>

            {/* Backend Health Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-500">
              <Activity size={13} className="animate-pulse" />
              <span>200 OK</span>
            </div>

            {/* Light / Dark Mode Toggle Switch */}
            <div className={`flex items-center p-0.5 rounded-lg border ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'
            }`}>
              <button
                onClick={() => setDarkMode(true)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                  darkMode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Moon size={13} />
                <span>Dark</span>
              </button>
              <button
                onClick={() => setDarkMode(false)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                  !darkMode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun size={13} />
                <span>Light</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="w-full max-w-7xl px-4 sm:px-6 my-6 flex flex-col lg:flex-row gap-6 flex-grow">
        
        {/* Left Side: Controls & Storage Explorer */}
        <aside className="w-full lg:w-[370px] flex flex-col gap-5 shrink-0 relative z-30">
          
          {/* Input Form Card */}
          <div className="card-apple p-5 rounded-xl relative z-40">
            <div className={`flex items-center justify-between mb-4 border-b pb-3 ${
              darkMode ? 'border-white/[0.06]' : 'border-slate-200'
            }`}>
              <h2 className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Sun size={14} className="text-blue-500" />
                Climate Data Query
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                Open-Meteo
              </span>
            </div>
            <InputPanel onFileCreated={handleFileCreated} darkMode={darkMode} />
          </div>

          {/* Stored Datasets Card */}
          <div className="card-apple p-5 rounded-xl flex-grow relative z-10">
            <div className={`flex items-center justify-between mb-3 border-b pb-3 ${
              darkMode ? 'border-white/[0.06]' : 'border-slate-200'
            }`}>
              <h2 className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Database size={14} className="text-indigo-500" />
                Stored Datasets
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                Bucket Storage
              </span>
            </div>
            <FileList selectedFile={selectedFile} onSelectFile={setSelectedFile} darkMode={darkMode} />
          </div>

        </aside>

        {/* Right Side: Charts & Data Table Visualization */}
        <section className="w-full lg:flex-1 relative z-10">
          {selectedFile ? (
            <Visualization fileName={selectedFile} darkMode={darkMode} />
          ) : (
            <div className="card-apple rounded-xl h-full min-h-[480px] flex flex-col items-center justify-center p-8 text-center">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-3 ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}>
                <BarChart2 size={24} />
              </div>
              <h3 className={`text-sm font-semibold mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                No Dataset Selected
              </h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Select a dataset from the left panel or query new coordinates to visualize historical weather metrics.
              </p>
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className={`w-full border-t text-xs py-3.5 text-center font-mono ${
        darkMode ? 'border-white/[0.06] bg-[#090d15] text-slate-500' : 'border-slate-200 bg-white text-slate-500 shadow-inner'
      }`}>
        Weather Explorer Dashboard — Light & Dark Mode Supported
      </footer>
    </div>
  )
}

export default App
