import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal as TerminalIcon, Loader2, Sparkles, AlertCircle, ChevronRight } from "lucide-react";

function Terminal({ output = [], isRunning }) {
  const bottomRef = useRef(null);

  // Smooth-scrolling hook to keep viewport anchored at the latest execution stream line
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  return (
    <div className="h-full bg-[#080808] flex flex-col font-mono select-none antialiased border border-zinc-900/60 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      
      {/* TERMINAL GLASSMORPHIC HEADER LAYER */}
      <div className="bg-[#0c0c0c] px-4 py-2.5 flex items-center justify-between border-b border-zinc-900/80">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <TerminalIcon size={11} className="text-[#F48C06]" />
          </div>
          <span className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
            Console Output
          </span>
        </div>

        {/* LIVE STATE STATUS PILL BADGE */}
        <AnimatePresence mode="wait">
          {isRunning ? (
            <motion.div
              key="running"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-orange-500/10 border border-orange-500/20 text-[#F48C06] text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 uppercase tracking-wide"
            >
              <Loader2 size={11} className="animate-spin" />
              <span>Executing</span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-900/50 border border-zinc-800 text-zinc-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 uppercase tracking-wide"
            >
              <div className="w-1 h-1 rounded-full bg-zinc-600" />
              <span>Idle</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* STREAM OUTPUT STENCIL VIEWER CANVAS */}
      <div className="flex-1 overflow-y-auto p-5 font-mono text-xs leading-relaxed selection:bg-[#F48C06]/20 selection:text-white">
        {output.length === 0 ? (
          /* EMPTY FALLBACK GLASS LAYOUT */
          <div className="h-full flex flex-col items-center justify-center text-center gap-2.5 opacity-40">
            <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
              <Sparkles size={14} className="text-zinc-500" />
            </div>
            <p className="text-zinc-500 text-[11px] max-w-[200px]">
              Awaiting execution runtime. Trigger "Run Code" above to view stream outputs...
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {output.map((line, index) => {
              // Configure color styling parameters based on individual execution system response states
              let textClass = "text-zinc-300";
              let bgClass = "bg-transparent";
              let BorderIcon = null;

              if (line.type === "error") {
                textClass = "text-red-400 font-semibold";
                bgClass = "bg-red-500/5 border border-red-500/10 rounded px-2 py-1 flex items-start gap-2";
                BorderIcon = <AlertCircle size={13} className="text-red-400 mt-0.5 shrink-0" />;
              } else if (line.type === "system") {
                textClass = "text-amber-400 font-medium";
              } else {
                textClass = "text-emerald-400";
              }

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`${bgClass} text-[13px]`}
                >
                  {BorderIcon}
                  <div className="flex-1 whitespace-pre-wrap break-all">
                    {line.type === "system" && (
                      <span className="text-zinc-600 font-bold mr-1.5 inline-flex items-center select-none">
                        <ChevronRight size={12} className="inline tracking-tight text-zinc-600" />
                      </span>
                    )}
                    <span className={textClass}>{line.text}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

    </div>
  );
}

export default Terminal;