import { useState } from "react";
import { Code2, Eye, EyeOff, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const API_URL = "https://codesync-production-cf26.up.railway.app";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const containerStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
};

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validate = () => {
    if (!email || !password) {
      setError("All fields are required")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Invalid email address")
      return false
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#080808", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "sans-serif", padding: "1rem", position: "relative", overflow: "hidden" }}>

      <style>{`
        .theme-input:focus {
          outline: none !important;
          border-color: rgba(244, 140, 6, 0.6) !important;
          box-shadow: 0 0 14px rgba(244, 140, 6, 0.25) !important;
        }
        .theme-checkbox {
          accent-color: #F48C06;
          cursor: pointer;
        }
      `}</style>

      <motion.button
        onClick={() => navigate("/")}
        whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.07)", borderColor: "rgba(255, 255, 255, 0.2)" }}
        whileTap={{ scale: 0.95 }}
        style={{ position: "absolute", top: "1.5rem", left: "1.5rem", display: "flex", alignItems: "center", gap: "8px", background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "rgba(255, 255, 255, 0.8)", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 500, transition: "color 0.2s ease, border-color 0.2s ease", zIndex: 20 }}
      >
        <Home size={16} color="#F48C06" />
        Home
      </motion.button>

      <div style={{ position: "absolute", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(244,140,6,0.07) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none", zIndex: 1 }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: "420px", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "2.5rem 2rem", boxShadow: "0 0 80px rgba(244,140,6,0.03), 0 40px 80px rgba(0,0,0,0.6)", position: "relative", zIndex: 10 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 150 }}
          style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}
        >
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(244,140,6,0.1)", border: "1px solid rgba(244,140,6,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Code2 size={24} color="#F48C06" />
          </div>
        </motion.div>

        <h2 style={{ fontSize: "28px", fontWeight: 800, textAlign: "center", marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>
          Welcome back!
        </h2>

        <p style={{ color: "rgba(255,255,255,0.45)", textAlign: "center", fontSize: "14px", lineHeight: 1.5, marginBottom: "2rem" }}>
          Sign in to resume real-time synchronizations, active rooms, and deployment sandboxes.
        </p>

        <motion.div variants={containerStagger} initial="hidden" animate="visible">

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", padding: "12px", borderRadius: "8px", marginBottom: "1.25rem", fontSize: "13px", textAlign: "center" }}
            >
              {error}
            </motion.div>
          )}

          <motion.div variants={fadeUp} style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 500, marginBottom: "0.5rem" }}>Email</label>
            <motion.input
              whileHover={{ borderColor: "rgba(255,255,255,0.25)" }}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
              placeholder="name@example.com"
              className="theme-input"
              style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "white", padding: "12px", borderRadius: "8px", fontSize: "14px", transition: "border-color 0.2s ease, box-shadow 0.2s ease" }}
            />
          </motion.div>

          <motion.div variants={fadeUp} style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 500, marginBottom: "0.5rem" }}>Password</label>
            <div style={{ position: "relative", width: "100%" }}>
              <motion.input
                whileHover={{ borderColor: "rgba(255,255,255,0.25)" }}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                placeholder="••••••••"
                className="theme-input"
                style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "white", padding: "12px", paddingRight: "40px", borderRadius: "8px", fontSize: "14px", transition: "border-color 0.2s ease, box-shadow 0.2s ease" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="theme-checkbox"
              />
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>Remember me</span>
            </label>
            <motion.button
              type="button"
              whileHover={{ color: "rgba(255,255,255,1)" }}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: "13px", cursor: "pointer", padding: 0 }}
            >
              Forgot password?
            </motion.button>
          </motion.div>

          <motion.button
            variants={fadeUp}
            onClick={handleSubmit}
            disabled={loading}
            whileHover={!loading ? { scale: 1.02, boxShadow: "0 0 24px rgba(244,140,6,0.4)" } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            style={{ width: "100%", background: "linear-gradient(135deg, #E85D04, #F48C06)", border: "none", color: "white", fontWeight: 600, padding: "12px 0", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, fontSize: "15px", transition: "box-shadow 0.2s ease, opacity 0.2s ease", marginBottom: "1.75rem" }}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>

          <motion.p variants={fadeUp} style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: 0 }}>
            Don't have an account?{" "}
            <motion.button
              type="button"
              onClick={() => navigate("/register")}
              whileHover={{ color: "#FFBA08", textDecoration: "underline" }}
              style={{ background: "none", border: "none", color: "#F48C06", padding: 0, cursor: "pointer", font: "inherit", fontWeight: 600, transition: "color 0.2s ease" }}
            >
              Sign Up
            </motion.button>
          </motion.p>

        </motion.div>
      </motion.div>
    </div>
  );
}

export default LoginPage;