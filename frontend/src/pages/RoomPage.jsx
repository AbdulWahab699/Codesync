import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  LogIn,
  Code2,
  Terminal as TerminalIcon,
  LogOut,
  Globe,
  AlertCircle,
  ChevronDown,
  Check,
} from "lucide-react";
import socket from "../socket/socket";
import Editor from "../components/Editor";
import Toolbar from "../components/Toolbar";
import Terminal from "../components/Terminal";
import UserPresence from "../components/UserPresence";
import ErrorBoundary from "../components/ErrorBoundary";

const API_URL = import.meta.env.VITE_API_URL;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const containerStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function RoomPage({ user, onLogout }) {
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [activeRoom, setActiveRoom] = useState(() => {
    const stored = localStorage.getItem("activeRoom");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const codeRef = useRef("");
  const saveTimeoutRef = useRef(null);

  const token = localStorage.getItem("token");
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languageOptions = [
    { value: "javascript", label: "JavaScript", detail: "(NodeJS Node)", code: "01" },
    { value: "python", label: "Python", detail: "(3.x Sandbox)", code: "02" },
    { value: "cpp", label: "C++", detail: "(GCC Binaries Container)", code: "03" },
  ];

  const currentSelectedLang =
    languageOptions.find((opt) => opt.value === language) || languageOptions[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch fresh room data on reload + reconnect socket
  useEffect(() => {
    if (!activeRoom) return

    const fetchFreshRoom = async () => {
      try {
        const res = await fetch(`${API_URL}/v1/rooms/${activeRoom.roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.room) {
          setActiveRoom(data.room)
          setLanguage(data.room.language)
          localStorage.setItem('activeRoom', JSON.stringify(data.room))
        }
      } catch (err) {
        console.error('Failed to fetch fresh room:', err)
      }
    }

    fetchFreshRoom()
    socket.connect()
    socket.emit('join-room', {
      roomId: activeRoom.roomId,
      username: user.username
    })
  }, [])

  const createRoom = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/v1/rooms/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: roomName, language }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      joinSocketRoom(data.room);
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/v1/rooms/join/${roomId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      joinSocketRoom(data.room);
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const joinSocketRoom = (room) => {
    socket.connect();
    socket.emit("join-room", {
      roomId: room.roomId,
      username: user.username,
    });
    setActiveRoom(room);
    setLanguage(room.language);
    localStorage.setItem("activeRoom", JSON.stringify(room));
  };

  const saveCode = async (code) => {
    if (!activeRoom) return
    try {
      await fetch(`${API_URL}/v1/rooms/${activeRoom.roomId}/save`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });
    } catch (err) {
      console.error("Failed to save code:", err);
    }
  };

  useEffect(() => {
    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("user-joined", ({ username, socketId }) => {
      setOnlineUsers((prev) => {
        const exists = prev.find((u) => u.socketId === socketId);
        if (exists) return prev;
        return [...prev, { username, socketId }];
      });
    });

    socket.on("user-left", ({ socketId }) => {
      setOnlineUsers((prev) => prev.filter((u) => u.socketId !== socketId));
    });

    return () => {
      socket.off("online-users");
      socket.off("user-joined");
      socket.off("user-left");
    };
  }, []);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput([{ type: "system", text: `Running ${language} code...` }]);

    try {
      const res = await fetch(`${API_URL}/v1/execute/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: codeRef.current,
          language: language,
          roomId: activeRoom.roomId,
        }),
      });

      const data = await res.json();

      if (data.timedOut) {
        setOutput((prev) => [
          ...prev,
          { type: "error", text: "Execution timed out after 5 seconds" },
        ]);
        return;
      }

      if (data.output) {
        const lines = data.output.split("\n").filter(Boolean);
        setOutput((prev) => [
          ...prev,
          ...lines.map((line) => ({ type: "output", text: line })),
        ]);
      }

      if (data.error) {
        const lines = data.error.split("\n").filter(Boolean);
        setOutput((prev) => [
          ...prev,
          ...lines.map((line) => ({ type: "error", text: line })),
        ]);
      }
    } catch (err) {
      setOutput((prev) => [
        ...prev,
        { type: "error", text: "Something went wrong" },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  if (activeRoom) {
    return (
      <div className="min-h-screen md:h-screen bg-[#080808] flex flex-col selection:bg-orange-500/30 selection:text-white overflow-x-hidden">
        <Toolbar
  roomName={activeRoom.name}
  roomId={activeRoom.roomId}
  language={language}
  onLanguageChange={setLanguage}
  onRun={handleRun}
  isRunning={isRunning}
  onLogout={async () => {
    // Save immediately before leaving
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    await saveCode(codeRef.current)
    localStorage.removeItem("activeRoom")
    socket.disconnect()
    onLogout()
  }}
/>
        <UserPresence users={onlineUsers} currentUser={user.username} />

        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden w-full">
          <div className="w-full md:w-3/5 h-[50vh] md:h-full border-b border-zinc-800 md:border-b-0">
            <ErrorBoundary>
              <Editor
                roomId={activeRoom.roomId}
                language={language}
                username={user.username}
                initialCode={activeRoom.code || ""}
                onCodeChange={(code) => {
                  codeRef.current = code;
                  if (saveTimeoutRef.current)
                    clearTimeout(saveTimeoutRef.current);
                  saveTimeoutRef.current = setTimeout(() => {
                    saveCode(code);
                  }, 2000);
                }}
              />
            </ErrorBoundary>
          </div>
          <div className="w-full md:w-2/5 h-[40vh] md:h-full border-t md:border-t-0 md:border-l border-zinc-800 bg-[#0c0c0c]">
            <Terminal output={output} isRunning={isRunning} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center relative overflow-y-auto overflow-x-hidden font-sans antialiased text-white p-4 md:p-6">
      <style>{`
        .room-input:focus {
          outline: none !important;
          border-color: rgba(244, 140, 6, 0.6) !important;
          box-shadow: 0 0 14px rgba(244, 140, 6, 0.2) !important;
        }
      `}</style>

      <motion.button
        onClick={onLogout}
        whileHover={{
          scale: 1.05,
          backgroundColor: "rgba(239, 68, 68, 0.08)",
          borderColor: "rgba(239, 68, 68, 0.25)",
        }}
        whileTap={{ scale: 0.95 }}
        className="static mb-6 self-end md:absolute md:mb-0 md:top-6 md:right-6 flex items-center gap-2 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 text-zinc-400 hover:text-red-400 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide shadow-xl cursor-pointer transition-colors duration-200 z-50"
      >
        <LogOut size={14} />
        Sign Out
      </motion.button>

      <div
        className="absolute pointer-events-none z-1"
        style={{
          background: "radial-gradient(circle, rgba(244,140,6,0.06) 0%, transparent 70%)",
          width: "600px", height: "600px",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="w-full max-w-md bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-6 md:p-8 shadow-[0_0_80px_rgba(244,140,6,0.02),0_40px_80px_rgba(0,0,0,0.7)] relative z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 140 }}
          className="flex justify-center mb-5"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center shadow-inner">
            <Code2 size={22} className="text-[#F48C06]" />
          </div>
        </motion.div>

        <h2 className="text-xl md:text-2xl font-extrabold text-center tracking-tight mb-1 text-white">
          Welcome, <span className="text-[#F48C06]">{user.username}</span>
        </h2>
        <p className="text-zinc-500 text-xs text-center mb-6 max-w-xs mx-auto leading-relaxed">
          Initialize a sandbox network node environment or securely dial
          directly into an active cluster interface framework.
        </p>

        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="visible"
          className="space-y-5"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/25 text-red-300 p-3.5 rounded-lg flex items-center gap-2.5 text-xs font-medium"
            >
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span className="break-words">{error}</span>
            </motion.div>
          )}

          <motion.div
            variants={fadeUp}
            className="bg-zinc-900/30 border border-zinc-800/40 rounded-xl p-4 md:p-5 shadow-sm hover:border-zinc-800 transition-colors duration-200"
          >
            <div className="flex items-center gap-2 mb-3.5">
              <PlusCircle size={16} className="text-[#F48C06]" />
              <h3 className="text-zinc-200 font-bold text-sm tracking-wide">
                Create a Session Node
              </h3>
            </div>

            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter context or room designation name"
              className="room-input w-full bg-zinc-900/50 border border-zinc-800/80 text-white placeholder-zinc-600 px-3.5 py-2.5 rounded-lg mb-3 text-xs tracking-wide transition-all duration-200"
            />

            <div className="relative w-full mb-3.5" ref={dropdownRef} style={{ zIndex: 50 }}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  background: "rgba(20, 20, 20, 0.4)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: isDropdownOpen
                    ? "1px solid rgba(244, 140, 6, 0.4)"
                    : "1px solid rgba(255, 255, 255, 0.05)",
                  boxShadow: isDropdownOpen
                    ? "0 0 20px rgba(244, 140, 6, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.03)"
                    : "inset 0 1px 1px rgba(255, 255, 255, 0.02)",
                  transition: "border-color 0.3s, box-shadow 0.3s",
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs tracking-wide text-zinc-300 cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 select-none">
                  <Globe
                    size={14}
                    className={isDropdownOpen ? "text-[#F48C06]" : "text-zinc-500"}
                    style={{ transition: "color 0.3s" }}
                  />
                  <span>
                    {currentSelectedLang.label}{" "}
                    <span className="text-zinc-500 font-mono text-[10px] ml-1">
                      {currentSelectedLang.detail}
                    </span>
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="text-zinc-500"
                >
                  <ChevronDown size={14} />
                </motion.div>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 4, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    style={{
                      background: "rgba(15, 15, 15, 0.75)",
                      backdropFilter: "blur(25px)",
                      WebkitBackdropFilter: "blur(25px)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0px rgba(255, 255, 255, 0.05)",
                      borderRadius: "12px",
                    }}
                    className="absolute left-0 w-full overflow-hidden p-1.5 origin-top z-50"
                  >
                    {languageOptions.map((opt) => {
                      const isSelected = opt.value === language;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => {
                            setLanguage(opt.value);
                            setIsDropdownOpen(false);
                          }}
                          style={{ borderRadius: "8px" }}
                          className={`group relative flex items-center justify-between px-3 py-2 text-xs text-left mb-0.5 last:mb-0 cursor-pointer select-none transition-all duration-200 ${
                            isSelected
                              ? "bg-gradient-to-r from-zinc-800/60 to-zinc-800/30 text-white font-medium"
                              : "text-zinc-400 hover:bg-[#F48C06]/[0.06] hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 z-10">
                            <span>{opt.label}</span>
                            <span className={`text-[10px] font-mono transition-colors ${isSelected ? "text-[#F48C06]" : "text-zinc-500 group-hover:text-zinc-400"}`}>
                              {opt.detail}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 z-10 font-mono text-[10px] text-zinc-600">
                            <span className="group-hover:text-[#F48C06]/50 transition-colors">
                              0{opt.code}
                            </span>
                            {isSelected && (
                              <motion.div layoutId="activeCheckMark">
                                <Check size={12} className="text-[#F48C06]" />
                              </motion.div>
                            )}
                          </div>
                          {!isSelected && (
                            <div className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-[#F48C06] rounded-r opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              onClick={createRoom}
              disabled={loading || !roomName}
              whileHover={!(loading || !roomName) ? { scale: 1.015, boxShadow: "0 0 20px rgba(244,140,6,0.25)" } : {}}
              whileTap={!(loading || !roomName) ? { scale: 0.985 } : {}}
              className="w-full bg-gradient-to-r from-[#E85D04] to-[#F48C06] text-white font-semibold py-2.5 rounded-lg text-xs tracking-wide shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed select-none"
            >
              {loading ? "Allocating Resources..." : "Initialize Host Room"}
            </motion.button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="bg-zinc-900/30 border border-zinc-800/40 rounded-xl p-4 md:p-5 shadow-sm hover:border-zinc-800 transition-colors duration-200"
          >
            <div className="flex items-center gap-2 mb-3.5">
              <LogIn size={16} className="text-emerald-500" />
              <h3 className="text-zinc-200 font-bold text-sm tracking-wide">
                Connect to Endpoint Cluster
              </h3>
            </div>

            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Paste active room hash ID token"
              className="room-input w-full bg-zinc-900/50 border border-zinc-800/80 text-white placeholder-zinc-600 px-3.5 py-2.5 rounded-lg mb-3.5 text-xs tracking-wide transition-all duration-200"
            />

            <motion.button
              onClick={joinRoom}
              disabled={loading || !roomId}
              whileHover={!(loading || !roomId) ? { scale: 1.015, boxShadow: "0 0 20px rgba(16,185,129,0.2)" } : {}}
              whileTap={!(loading || !roomId) ? { scale: 0.985 } : {}}
              className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-bold py-2.5 rounded-lg text-xs tracking-wide shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed select-none"
            >
              {loading ? "Handshaking Gateway..." : "Join Cluster Pipeline"}
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default RoomPage;