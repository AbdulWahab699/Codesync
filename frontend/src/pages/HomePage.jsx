import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  Shield, 
  Users, 
  Save, 
  Play, 
  MousePointer2, 
  ArrowRight, 
  ChevronRight, 
  Code2, 
  Terminal, 
  Globe,
  Database,   // MongoDB
  Server,     // Node.js
  Cpu,        // Docker
  Radio,      // Socket.io
  GitMerge    // Yjs
} from 'lucide-react'

// Animation Configurations
const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
}

// Helper Custom Hook for Navbar styling state
function useScrolled() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])
  return scrolled
}

// Numbers Counting animation helper
function CountUp({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const isNum = !isNaN(parseInt(target))
    if (!isNum) { setCount(target); return }
    const end = parseInt(target)
    let start = 0
    const duration = 1500
    const step = Math.ceil(end / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function HomePage() {
  const navigate = useNavigate()
  const scrolled = useScrolled()
  const heroRef = useRef(null)
  
  // Parallax Scroll Offsets
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const blobY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const editorY = useTransform(scrollYProgress, [0, 1], ['0px', '80px'])

  // Interactive 3D Carousel Selected Index
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(2)

  // Marquee Track Core Tech Elements 
  const techStack = [
    { name: 'React', icon: <Code2 size={18} /> },
    { name: 'Node.js', icon: <Server size={18} /> },
    { name: 'MongoDB', icon: <Database size={18} /> },
    { name: 'Docker', icon: <Cpu size={18} /> },
    { name: 'Socket.io', icon: <Radio size={18} /> },
    { name: 'Yjs', icon: <GitMerge size={18} /> },
  ]

  // Feature Data structured seamlessly for the 3D Perspective layout
  const featuresList = [
    { 
      id: 1, 
      icon: <Zap size={24} color="#F48C06" />, 
      tag: "CRDT powered",
      title: 'Conflict-free Editing', 
      desc: 'Powered by Yjs CRDTs — two people can edit the same line simultaneously and nothing gets lost. Ever.' 
    },
    { 
      id: 2, 
      icon: <Terminal size={24} color="#F48C06" />, 
      tag: "Docker Isolated",
      title: 'Live Code Execution', 
      desc: 'Run JavaScript, Python, and C++ in isolated Docker containers with memory and CPU limits.' 
    },
    { 
      id: 3, 
      icon: <MousePointer2 size={24} color="#F48C06" />, 
      tag: "Core Engine",
      title: 'Live Cursors Engine', 
      desc: 'See exactly where your teammates are typing in real time with colored cursors and username labels.' 
    },
    { 
      id: 4, 
      icon: <Shield size={24} color="#F48C06" />, 
      tag: "Sandboxed",
      title: 'Secure by Default', 
      desc: 'JWT authentication, sandboxed execution, and zero outbound network access inside runtime containers.' 
    },
    { 
      id: 5, 
      icon: <Save size={24} color="#F48C06" />, 
      tag: "MongoDB Persistence",
      title: 'Real-time Auto-save', 
      desc: 'Code saves to MongoDB automatically. Rejoin any room and your work is exactly where you left it.' 
    },
    { 
      id: 6, 
      icon: <Users size={24} color="#F48C06" />, 
      tag: "Awareness Map",
      title: 'User Presence States', 
      desc: 'See who is online in your room in real time. Users appear and disappear seamlessly as they sync.' 
    },
  ]

  const handlePrevFeature = () => {
    setActiveFeatureIndex((prev) => (prev === 0 ? featuresList.length - 1 : prev - 1));
  }

  const handleNextFeature = () => {
    setActiveFeatureIndex((prev) => (prev === featuresList.length - 1 ? 0 : prev + 1));
  }

  return (
    <div style={{ background: '#080808', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', overflowX: 'hidden' }}>

      {/* Global CSS Injector */}
      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .nav-container { padding: 0 1rem !important; }
          .hero-buttons { flex-direction: column; width: 100%; max-width: 320px; margin: 0 auto 4rem !important; }
          .hero-buttons button { width: 100%; justify-content: center; }
          .editor-topbar-users { display: none !important; }
        }
        
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 25s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="nav-container"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled ? 'rgba(8,8,8,0.9)' : 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(16px)',
          borderBottom: scrolled ? '1px solid rgba(244,140,6,0.15)' : '1px solid rgba(255,255,255,0.06)',
          padding: '0 2rem', height: '64px',
          display: 'flex', alignItems: 'center', justifyBetween: 'space-between',
          justifyContent: 'space-between',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code2 size={22} color="#F48C06" />
          <span style={{ fontSize: '18px', fontWeight: 700 }}>CodeSync</span>
        </div>

        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          {['Features', 'Workflow', 'About'].map(link => (
            <motion.a
              key={link}
              href={`#${link.toLowerCase().replace(' ', '-')}`}
              whileHover={{ color: '#F48C06' }}
              style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
            >
              {link}
            </motion.a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05, color: '#F48C06' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login')}
            style={{ background: 'transparent', border: '1px solid rgba(244,140,6,0.4)', color: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}
          >
            Login
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 24px rgba(244,140,6,0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            style={{ background: 'linear-gradient(135deg, #E85D04, #F48C06)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
          >
            Get Started
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px', paddingBottom: '4rem', overflow: 'hidden' }}>
        <motion.div
          style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '120%', height: '75%', y: blobY,
            background: 'linear-gradient(180deg, #F48C06 0%, #E85D04 25%, #9a3412 55%, #080808 100%)',
            opacity: 0.12, filter: 'blur(60px)', pointerEvents: 'none'
          }}
        />

        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '65%',
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(244,140,6,0.025) 60px, rgba(244,140,6,0.025) 1px)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '860px', padding: '0 1.5rem', width: '100%' }}>
          
          {/* Live Cursor Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(244,140,6,0.1)', border: '1px solid rgba(244,140,6,0.3)', borderRadius: '100px', padding: '6px 16px', fontSize: '13px', color: '#F48C06', marginBottom: '2rem' }}
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F48C06', display: 'inline-block' }}
            />
            Now with live cursor support
          </motion.div>

          <motion.h1
            variants={stagger}
            initial="hidden"
            animate="visible"
            style={{ fontSize: 'clamp(2.5rem, 5.5vw, 5.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-2px' }}
          >
            {['Code', 'Together.'].map((word, i) => (
              <motion.span key={i} variants={fadeUp} style={{ display: 'inline-block', marginRight: '0.3em' }}>{word}</motion.span>
            ))}
            <br />
            {['Build', 'Faster.'].map((word, i) => (
              <motion.span
                key={i}
                variants={fadeUp}
                style={{
                  display: 'inline-block', marginRight: '0.3em',
                  background: 'linear-gradient(135deg, #F48C06, #FFBA08)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 2.5rem' }}
          >
            A real-time collaborative code editor with live cursors, multi-language execution, and conflict-free editing powered by CRDTs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="hero-buttons"
            style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 32px rgba(244,140,6,0.5)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/register')}
              style={{ background: 'linear-gradient(135deg, #E85D04, #F48C06)', border: 'none', color: 'white', padding: '14px 32px', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Get Started <ArrowRight size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.97 }}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '14px 32px', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Play size={16} fill="white" /> Watch Demo
            </motion.button>
          </motion.div>

          {/* Floating Editor Mockup Component */}
          <motion.div style={{ y: editorY }} initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8 }}>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px', overflow: 'hidden', textAlign: 'left',
                boxShadow: '0 0 80px rgba(244,140,6,0.12), 0 40px 80px rgba(0,0,0,0.6)'
              }}
            >
              <div style={{ background: 'rgba(0,0,0,0.5)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F57' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28CA41' }} />
                <span style={{ marginLeft: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>main.js — CodeSync</span>
                <div className="editor-topbar-users" style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  {[{ name: 'wahab', color: '#F87171' }, { name: 'ali', color: '#60A5FA' }].map(u => (
                    <motion.span
                      key={u.name}
                      animate={{ opacity: [1, 0.6, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: u.name === 'ali' ? 1 : 0 }}
                      style={{ background: `${u.color}22`, border: `1px solid ${u.color}66`, color: u.color, fontSize: '11px', padding: '2px 10px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: u.color, display: 'inline-block' }} />
                      {u.name}
                    </motion.span>
                  ))}
                </div>
              </div>

              <div style={{ padding: '20px 16px', fontFamily: 'monospace', fontSize: 'clamp(12px, 1.8vw, 14px)', lineHeight: 2.2, overflowX: 'auto' }}>
                {[
                  { num: 1, code: <><span style={{ color: '#60A5FA' }}>const</span><span style={{ color: 'white' }}> server </span><span style={{ color: '#F48C06' }}>=</span><span style={{ color: 'white' }}> require(</span><span style={{ color: '#34D399' }}>'express'</span><span style={{ color: 'white' }}>)()</span></> },
                  { num: 2, code: <span /> },
                  { num: 3, cursor: { color: '#F87171', name: 'wahab' }, code: <><span style={{ color: '#60A5FA' }}>function</span><span style={{ color: '#FFBA08' }}> collaborate</span><span style={{ color: 'white' }}>(users) {'{'}</span></> },
                  { num: 4, code: <><span style={{ color: 'white', paddingLeft: '20px' }}>return users.</span><span style={{ color: '#FFBA08' }}>map</span><span style={{ color: 'white' }}>(u =&gt; u.sync())</span></> },
                  { num: 5, cursor: { color: '#60A5FA', name: 'ali' }, code: <><span style={{ color: 'white' }}>{'}'}</span></> },
                ].map(line => (
                  <div key={line.num} style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                    <span style={{ color: 'rgba(255,255,255,0.2)', marginRight: '16px', minWidth: '16px', userSelect: 'none', fontSize: '12px' }}>{line.num}</span>
                    {line.code}
                    {line.cursor && (
                      <>
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          style={{ display: 'inline-block', width: '2px', height: '18px', background: line.cursor.color, verticalAlign: 'middle', marginLeft: '2px' }}
                        />
                        <motion.span
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.5 }}
                          style={{ background: line.cursor.color, color: 'white', fontSize: '10px', padding: '1px 6px', borderRadius: '4px', marginLeft: '4px', verticalAlign: 'middle', fontFamily: 'sans-serif' }}
                        >
                          {line.cursor.name}
                        </motion.span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* INFINITE MARQUEE LOGO LOOP SECTION */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        style={{ padding: '3rem 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}
      >
        <motion.p variants={fadeIn} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginBottom: '2rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Built with</motion.p>
        
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden', maskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)' }}>
          <div className="marquee-track">
            <div style={{ display: 'flex', gap: '4rem', paddingRight: '4rem' }}>
              {techStack.map((tech) => (
                <motion.div
                  key={`${tech.name}-primary`}
                  variants={fadeUp}
                  whileHover={{ color: '#F48C06', scale: 1.08 }}
                  style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px', fontWeight: 600, letterSpacing: '1px', cursor: 'default', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <span style={{ color: 'inherit', display: 'flex', alignItems: 'center' }}>{tech.icon}</span>
                  {tech.name}
                </motion.div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '4rem', paddingRight: '4rem' }}>
              {techStack.map((tech) => (
                <div
                  key={`${tech.name}-clone`}
                  style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px', fontWeight: 600, letterSpacing: '1px', cursor: 'default', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <span style={{ color: 'inherit', display: 'flex', alignItems: 'center' }}>{tech.icon}</span>
                  {tech.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section - UPDATED WITH PREMIUM 3D PERSPECTIVE CAROUSEL */}
      <section id="features" style={{ padding: '6rem 1.5rem', overflow: 'hidden', position: 'relative' }}>
        
        {/* Carousel Backdrop Radial Glows */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '500px', background: 'rgba(244,140,6,0.06)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />

        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
          <motion.p variants={fadeUp} style={{ textAlign: 'center', color: '#F48C06', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem' }}>Features</motion.p>
          <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-1px' }}>Everything you need to collaborate</motion.h2>
          <motion.p variants={fadeUp} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', marginBottom: '4rem', fontSize: '16px' }}>Built for developers who move fast and build together</motion.p>

          {/* 3D Carousel Layout Framework */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '1100px', height: '460px', margin: '0 auto' }}>
            
            {/* Left Control Navigation Trigger */}
            <button 
              onClick={handlePrevFeature}
              style={{ position: 'absolute', left: '10px', zIndex: 40, p: '12px', padding: '12px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', bg: 'rgba(15,15,15,0.7)', backgroundColor: 'rgba(15,15,15,0.7)', color: '#A1A1AA', backdropFilter: 'blur(12px)', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* 3D Scene Viewport Projection Mapping */}
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', perspective: '1200px', transformStyle: 'preserve-3d' }}>
              {featuresList.map((card, index) => {
                const offset = index - activeFeatureIndex;
                const absOffset = Math.abs(offset);
                
                // Hide side cards positioned too far out of viewport limits
                if (absOffset > 2) return null;

                // Physics Transformation Matrix calculations
                const rotateY = offset * -20; 
                const scale = 1 - absOffset * 0.14; 
                const translateZ = absOffset * -150; 
                const translateX = offset * 240; 
                const opacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.55 : 0.15;
                const isCenter = index === activeFeatureIndex;

                return (
                  <motion.div
                    key={card.title}
                    style={{ originX: 0.5, originY: 0.5, position: 'absolute', width: '310px', height: '390px', cursor: 'pointer', userSelect: 'none', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'border-color 0.4s, background-color 0.4s, box-shadow 0.4s' }}
                    animate={{
                      x: translateX,
                      scale: scale,
                      rotateY: rotateY,
                      z: translateZ,
                      opacity: opacity,
                      zIndex: 10 - absOffset,
                    }}
                    transition={{ type: "spring", stiffness: 240, damping: 24 }}
                    onClick={() => setActiveFeatureIndex(index)}
                    className={isCenter ? 'center-active' : ''}
                    style={{
                      position: 'absolute', width: '310px', height: '390px', cursor: 'pointer', userSelect: 'none', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      background: isCenter ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)',
                      border: isCenter ? '1px solid rgba(244,140,6,0.3)' : '1px solid rgba(255,255,255,0.06)',
                      backdropFilter: isCenter ? 'blur(20px)' : 'blur(8px)',
                      boxShadow: isCenter ? '0 25px 60px rgba(244,140,6,0.12)' : 'none'
                    }}
                    whileHover={{
                      scale: scale + 0.05,
                      y: -10,
                      borderColor: "rgba(244, 140, 6, 0.5)",
                      background: "rgba(255,255,255,0.05)",
                      boxShadow: "0 25px 50px rgba(244,140,6,0.2)"
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                          {card.icon}
                        </div>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', padding: '4px 10px', borderRadius: '100px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                          {card.tag}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '0.8rem', letterSpacing: '-0.3px' }}>
                        {card.title}
                      </h3>
                      
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13.5px', lineHeight: 1.65 }}>
                        {card.desc}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)' }}>0{card.id} // SEC_TRACE</span>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isCenter ? '#F48C06' : 'rgba(255,255,255,0.2)', boxShadow: isCenter ? '0 0 8px #F48C06' : 'none' }} />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Control Navigation Trigger */}
            <button 
              onClick={handleNextFeature}
              style={{ position: 'absolute', right: '10px', zIndex: 40, padding: '12px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(15,15,15,0.7)', color: '#A1A1AA', backdropFilter: 'blur(12px)', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Carousel Progress Navigation Dots Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justify: 'center', justifyContent: 'center', gap: '8px', marginTop: '2.5rem' }}>
            {featuresList.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveFeatureIndex(i)}
                style={{
                  height: '6px', borderRadius: '100px', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', outline: 'none',
                  width: i === activeFeatureIndex ? '28px' : '6px',
                  background: i === activeFeatureIndex ? '#F48C06' : 'rgba(255,255,255,0.15)'
                }}
              />
            ))}
          </div>

        </motion.div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" style={{ padding: '6rem 1.5rem', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', color: '#F48C06', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem' }}>Workflow</motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '4rem', letterSpacing: '-1px' }}>Start collaborating in 3 steps</motion.h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
              {[
                { step: '01', icon: <Code2 size={24} color="#F48C06" />, title: 'Create a Room', desc: 'Sign up and create a coding room. Choose your language and give it a name.' },
                { step: '02', icon: <Globe size={24} color="#F48C06" />, title: 'Share the ID', desc: 'Copy the Room ID and share it with your teammates. They join instantly.' },
                { step: '03', icon: <Users size={24} color="#F48C06" />, title: 'Code Together', desc: 'Edit simultaneously, run code, see live cursors. No setup, no friction.' },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  variants={fadeUp}
                  whileHover={{ y: -8, borderColor: 'rgba(244,140,6,0.3)' }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '16px', padding: '2.5rem 2rem',
                    transition: 'all 0.3s ease', cursor: 'default', textAlign: 'center'
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2, type: 'spring', stiffness: 200 }}
                    style={{ fontSize: '3.5rem', fontWeight: 800, color: 'rgba(244,140,6,0.15)', fontFamily: 'monospace', marginBottom: '1rem', lineHeight: 1 }}
                  >
                    {s.step}
                  </motion.div>
                  <div style={{ marginBottom: '1rem' }}>{s.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '0.75rem' }}>{s.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', lineHeight: 1.7 }}>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="about" style={{ padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', color: '#F48C06', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem' }}>By the numbers</motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '4rem', letterSpacing: '-1px' }}>Built for real collaboration</motion.h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              {[
                { number: '3', suffix: '', label: 'Languages Supported', sub: 'JS, Python, C++' },
                { number: '0', suffix: 'ms', label: 'Conflict Resolution', sub: 'CRDT powered' },
                { number: '100', suffix: '%', label: 'Sandboxed Execution', sub: 'Docker isolated' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  whileHover={{ y: -6, borderColor: 'rgba(244,140,6,0.3)', boxShadow: '0 20px 40px rgba(244,140,6,0.06)' }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '16px', padding: '2.5rem', textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ fontSize: '3.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #F48C06, #FFBA08)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: '0.5rem' }}>
                    <CountUp target={s.number} suffix={s.suffix} />
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '15px' }}>{s.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>{s.sub}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <motion.section
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        style={{ padding: '6rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.12, 0.18, 0.12] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(244,140,6,0.2) 0%, transparent 70%)', pointerEvents: 'none' }}
        />
        <div style={{ position: 'absolute', inset: 0, borderTop: '1px solid rgba(244,140,6,0.15)', borderBottom: '1px solid rgba(244,140,6,0.15)', background: 'rgba(244,140,6,0.03)' }} />
        <div style={{ position: 'relative', zIndex: 10 }}>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-1px' }}
          >
            Ready to code together?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '2.5rem', fontSize: '17px' }}
          >
            Create your first room in seconds. No credit card required.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.06, boxShadow: '0 0 40px rgba(244,140,6,0.5)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            style={{ background: 'linear-gradient(135deg, #E85D04, #F48C06)', border: 'none', color: 'white', padding: '16px 40px', borderRadius: '12px', cursor: 'pointer', fontSize: '18px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '10px' }}
          >
            Get Started  <ArrowRight size={20} />
          </motion.button>
        </div>
      </motion.section>

      {/* Footer Section */}
      <footer style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '5rem 1.5rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
            
            {/* Brand column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <Code2 size={22} color="#F48C06" />
                <span style={{ fontSize: '18px', fontWeight: 700 }}>CodeSync</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                Real-time collaborative code editor. Built for developers who build together.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[Globe, Terminal, Users].map((Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ color: '#F48C06', scale: 1.2 }}
                    style={{ color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}
                  >
                    <Icon size={18} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Links column */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>Product</h4>
              {['Features', 'Workflow', 'Changelog', 'Roadmap'].map(link => (
                <motion.a
                  key={link}
                  href="#"
                  whileHover={{ color: '#F48C06', x: 4 }}
                  style={{ display: 'block', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px', marginBottom: '0.8rem', transition: 'all 0.2s' }}
                >
                  {link}
                </motion.a>
              ))}
            </div>

          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', pt: '2rem', paddingTop: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
            <span>&copy; {new Date().getFullYear()} CodeSync. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
      

    </div>
  )
}