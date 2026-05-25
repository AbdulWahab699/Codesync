import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, Copy, Check, ChevronDown, Code, Terminal, LogOut } from "lucide-react";

function Toolbar({ roomId, language, onLanguageChange, onRun, running, onLogout, roomName }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  // Close the language selection dropdown gracefully if user clicks anywhere outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text sequence to clipboard buffer: ", err);
    }
  };

  // Language display mapping definitions
  const languageLabels = {
    javascript: "JavaScript",
    python: "Python 3.x",
    cpp: "C++ (GCC)"
  };

  return (
    <div className="bg-[#0c0c0c] border-b border-zinc-800/80 px-6 py-3.5 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.4)] relative z-50 select-none font-sans antialiased">
      
      {/* LEFT SECTION: ROOM IDENTITY BRAND & DETAILS */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/25 flex items-center justify-center">
            <Terminal size={15} className="text-[#F48C06]" />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-xs font-bold tracking-wide">
              {roomName || "Development Node"}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium font-mono uppercase tracking-widest">
              Live Environment
            </span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block" />

        {/* PILL PATTERN: COPY ROOM IDENTITY CONTROL LINK */}
        <motion.button
          onClick={copyRoomId}
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.04)", borderColor: "rgba(255, 255, 255, 0.12)" }}
          whileTap={{ scale: 0.98 }}
          className="bg-zinc-900/40 border border-zinc-800/60 text-zinc-300 hover:text-white px-4 py-2 rounded-full text-xs font-semibold tracking-wide flex items-center gap-2 cursor-pointer transition-colors duration-200"
        >
          {copied ? (
            <Check size={13} className="text-emerald-400" />
          ) : (
            <Copy size={13} className="text-zinc-400" />
          )}
          <span className="font-mono text-zinc-400 font-normal">
            {copied ? "Copied Node!" : "Copy Session ID"}
          </span>
        </motion.button>
      </div>

      {/* RIGHT SECTION: LANGUAGE ENVIRONMENT & LIVE EXECUTION TRIGGERS */}
      <div className="flex items-center gap-3">
        
        {/* CUSTOM ANIMATED EXPANDABLE PILL DROPDOWN PANEL CONTAINER */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            whileHover={{ scale: 1.02, borderColor: "rgba(244, 140, 6, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="bg-zinc-900/50 border border-zinc-800/80 text-zinc-200 px-4 py-2 rounded-full text-xs font-bold tracking-wide flex items-center gap-2.5 cursor-pointer transition-all duration-200 shadow-sm min-w-[130px] justify-between"
          >
            <div className="flex items-center gap-2">
              <Code size={13} className="text-[#F48C06]" />
              <span>{languageLabels[language] || "Language"}</span>
            </div>
            <motion.div
              animate={{ rotate: dropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-zinc-500"
            >
              <ChevronDown size={13} />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-48 bg-[#0c0c0c]/95 backdrop-blur-xl border border-zinc-800/80 rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)] p-1"
              >
                {Object.entries(languageLabels).map(([key, label]) => {
                  const isSelected = language === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        onLanguageChange(key);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 flex items-center justify-between cursor-pointer ${
                        isSelected 
                          ? "bg-orange-500/10 text-[#F48C06] border border-orange-500/20" 
                          : "text-zinc-400 hover:text-white hover:bg-zinc-900/50 border border-transparent"
                      }`}
                    >
                      {label}
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#F48C06]" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* COMPILER EXECUTION ACTION RUN TRIGGER CONTROL BUTTON */}
        <motion.button
          onClick={onRun}
          disabled={running}
          whileHover={!running ? { scale: 1.03, boxShadow: "0 0 20px rgba(244,140,6,0.3)" } : {}}
          whileTap={!running ? { scale: 0.97 } : {}}
          className="bg-gradient-to-r from-[#E85D04] to-[#F48C06] disabled:from-zinc-800 disabled:to-zinc-800 text-white font-bold px-6 py-2 rounded-full text-xs tracking-wider uppercase flex items-center gap-2 shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {running ? (
            <Loader2 size={13} className="animate-spin text-zinc-400" />
          ) : (
            <Play size={11} fill="currentColor" className="text-white translate-x-[0.5px]" />
          )}
          <span>{running ? "Compiling..." : "Run Code"}</span>
        </motion.button>

        {/* LOGOUT APP TRIGGER ELEMENT OVERRIDE CONTROL LINK */}
        {onLogout && (
          <>
            <div className="h-4 w-[1px] bg-zinc-800 ml-1" />
            <motion.button
              onClick={onLogout}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.08)" }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-full bg-zinc-900/30 border border-zinc-800/60 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:border-red-500/20 cursor-pointer transition-colors duration-200"
              title="Terminate Connection Node"
            >
              <LogOut size={13} />
            </motion.button>
          </>
        )}

      </div>
    </div>
  );
}

export default Toolbar;