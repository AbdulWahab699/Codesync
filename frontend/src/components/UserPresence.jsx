import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Users, ChevronDown, ChevronUp, GripVertical } from "lucide-react";

function UserPresence({ users = [], currentUser }) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Constraints reference container to clip bounds inside the browser viewport screen frame
  const constraintsRef = useRef(null);

  if (!users || users.length === 0) return null;

  const me = users.find((u) => u.username === currentUser) || users[0];
  const otherUsers = users.filter((u) => u.username !== currentUser);
  const extraCount = otherUsers.length;

  return (
    <>
      {/* Invisible Full-Screen Drag Constraints Layout Layer Boundary Plane Track */}
      <div 
        ref={constraintsRef} 
        className="fixed inset-0 pointer-events-none z-50" 
        style={{ top: "4.5rem" }} // Prevents dragging completely behind your main master header toolbar
      />

      {/* DRAGGABLE ROOT LAYER WRAPPER */}
      <motion.div
        drag
        dragElastic={0.1}
        dragMomentum={false}
        dragConstraints={constraintsRef}
        layout="position"
        className="fixed top-24 right-4 sm:top-[5.5rem] sm:right-6 flex flex-col items-end gap-2 sm:gap-2.5 z-50 pointer-events-auto select-none font-sans antialiased"
      >
        
        {/* MASTER ACCORDION ACTION COLLAPSE CONTROLLER CONTAINER PILL */}
        <motion.div
          onClick={() => { if (extraCount > 0) setIsExpanded(!isExpanded); }}
          whileHover={{ borderColor: "rgba(255, 255, 255, 0.12)" }}
          whileTap={{ cursor: "grabbing" }}
          className="flex items-center gap-2 sm:gap-3.5 bg-zinc-900/75 backdrop-blur-xl border border-white/5 p-1.5 pr-3.5 sm:p-2.5 sm:pr-4.5 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.08)] min-w-[160px] sm:min-w-[230px] max-w-[240px] sm:max-w-[300px] cursor-grab transition-colors duration-200"
        >
          {/* Visual Grip Handle Indicator */}
          <div className="text-white/20 flex items-center shrink-0">
            <GripVertical size={14} className="sm:hidden" />
            <GripVertical size={16} className="hidden sm:block" />
          </div>

          {/* Left Segment Circular Vector Frame Gauge Component Ring */}
          <div className="relative flex items-center justify-center shrink-0">
            {/* Desktop Ring (sm and up) */}
            <div className="hidden sm:block">
              <svg width="42" height="42" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(244, 140, 6, 0.15)" strokeWidth="2.5" />
                <motion.circle 
                  cx="18" cy="18" r="16" fill="none" stroke="#F48C06" strokeWidth="2.5" 
                  strokeDasharray="100" initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 28 }} 
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </svg>
            </div>
            {/* Mobile Ring (under sm) */}
            <div className="block sm:hidden">
              <svg width="32" height="32" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(244, 140, 6, 0.15)" strokeWidth="3" />
                <motion.circle 
                  cx="18" cy="18" r="16" fill="none" stroke="#F48C06" strokeWidth="3" 
                  strokeDasharray="100" initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 28 }} 
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </svg>
            </div>
            <div className="absolute w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-black/20 flex items-center justify-center">
              <User size={10} className="text-orange-400 sm:hidden" />
              <User size={13} className="text-orange-400 hidden sm:block" />
            </div>
          </div>

          {/* Middle Identity Structural String Headers */}
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wide truncate">
              {me?.username}
            </span>
            <span className="text-[8px] sm:text-[10px] text-zinc-500 font-medium font-mono uppercase tracking-widest truncate">
              Host
            </span>
          </div>

          {/* Right Floating Incremental Status Badges */}
          {extraCount > 0 && (
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <motion.span 
                key={extraCount}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] sm:text-[11px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full"
              >
                +{extraCount}
              </motion.span>
              <div className="text-zinc-500 shrink-0">
                {isExpanded ? <ChevronUp size={12} className="sm:hidden" /> : <ChevronDown size={12} className="sm:hidden" />}
                {isExpanded ? <ChevronUp size={14} className="hidden sm:block" /> : <ChevronDown size={14} className="hidden sm:block" />}
              </div>
            </div>
          )}
        </motion.div>

        {/* BOTTOM ACCORDION PORTAL FOR EXTERNAL SYNCED USERS LOOP */}
        <div className="flex flex-col gap-1.5 sm:gap-2 w-full items-end">
          <AnimatePresence>
            {isExpanded && extraCount > 0 && (
              otherUsers.map((user, index) => (
                <motion.div
                  key={user.socketId || index}
                  initial={{ opacity: 0, y: -12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut", delay: index * 0.03 }}
                  whileHover={{ scale: 1.015, borderColor: "rgba(255, 255, 255, 0.1)" }}
                  className="flex items-center gap-2.5 sm:gap-3.5 bg-zinc-950/60 backdrop-blur-md border border-white/5 p-1.5 pr-4 sm:p-2 sm:pr-5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.4)] min-w-[140px] sm:min-w-[190px] max-w-[180px] sm:max-w-[260px] transition-colors duration-200"
                >
                  <div className="relative flex items-center justify-center shrink-0">
                    {/* Desktop Peer Ring */}
                    <div className="hidden sm:block">
                      <svg width="34" height="34" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="2.5" />
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#10B981" strokeWidth="2.5" strokeDasharray="100" strokeDashoffset="28" />
                      </svg>
                    </div>
                    {/* Mobile Peer Ring */}
                    <div className="block sm:hidden">
                      <svg width="26" height="26" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="3.5" />
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#10B981" strokeWidth="3.5" strokeDasharray="100" strokeDashoffset="28" />
                      </svg>
                    </div>
                    <div className="absolute w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-black/15 flex items-center justify-center">
                      <Users size={9} className="text-emerald-400 sm:hidden" />
                      <Users size={11} className="text-emerald-400 hidden sm:block" />
                    </div>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-white/90 text-[11px] sm:text-xs font-semibold truncate">
                      {user.username}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-zinc-500 font-medium font-mono uppercase tracking-wide truncate">
                      Peer
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </>
  );
}

export default UserPresence;