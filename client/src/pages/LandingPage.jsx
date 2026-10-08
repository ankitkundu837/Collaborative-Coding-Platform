import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import "./LandingPage.css";

// Clean Lucide-standard SVG Icons
function ArrowRight({ size = 16, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}

function Check({ size = 16, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}

function TerminalIcon({ size = 18, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
    );
}

function CodeIcon({ size = 18, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
        </svg>
    );
}

function UsersIcon({ size = 18, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function PlayIcon({ size = 18, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
    );
}

function LayersIcon({ size = 18, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
        </svg>
    );
}

// Native IntersectionObserver Hook
function useInView({ once = true, threshold = 0.1 } = {}) {
    const [isInView, setIsInView] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    if (once) {
                        observer.disconnect();
                    }
                } else if (!once) {
                    setIsInView(false);
                }
            },
            { threshold }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [once, threshold]);

    return [ref, isInView];
}

// WordsPullUp Component - Staggered Word Entrance Animation
function WordsPullUp({ text, className = "", delay = 0, showAsterisk = false }) {
    const [ref, isInView] = useInView({ once: true });
    const words = text.split(" ");

    return (
        <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
            {words.map((word, i) => (
                <span
                    key={i}
                    style={{
                        transform: isInView ? "translateY(0)" : "translateY(24px)",
                        opacity: isInView ? 1 : 0,
                        transition: `transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${delay + i * 0.08}s, opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${delay + i * 0.08}s`,
                        display: "inline-block",
                        marginRight: "0.22em",
                        position: "relative"
                    }}
                >
                    {word}
                    {showAsterisk && i === words.length - 1 && (
                        <span className="prisma-asterisk" aria-hidden="true">
                            *
                        </span>
                    )}
                </span>
            ))}
        </span>
    );
}

// WordsPullUpMultiStyle Component - Multi-Styled Segment Entrance
function WordsPullUpMultiStyle({ segments, className = "" }) {
    const [ref, isInView] = useInView({ once: true });

    const allWords = [];
    segments.forEach((seg, segIdx) => {
        const words = seg.text.split(" ");
        words.forEach((word) => {
            if (word.length > 0) {
                allWords.push({
                    text: word,
                    className: seg.className || "",
                    isSerif: seg.isSerif || false,
                    segIdx
                });
            }
        });
    });

    return (
        <span ref={ref} className={`inline-flex flex-wrap justify-center ${className}`}>
            {allWords.map((item, i) => (
                <span
                    key={i}
                    style={{
                        transform: isInView ? "translateY(0)" : "translateY(24px)",
                        opacity: isInView ? 1 : 0,
                        transition: `transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.08}s, opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.08}s`,
                        display: "inline-block",
                        marginRight: "0.24em"
                    }}
                    className={`${item.className} ${item.isSerif ? "font-serif-accent italic" : ""}`}
                >
                    {item.text}
                </span>
            ))}
        </span>
    );
}

// Scroll-Linked Text Reveal Paragraph
function ScrollLinkedParagraph({ text }) {
    const containerRef = useRef(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        function handleScroll() {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;

            // Start reading around 85% from top, fully revealed around 30% from top
            const startY = windowHeight * 0.85;
            const endY = windowHeight * 0.3;

            let p = (startY - rect.top) / (startY - endY);
            if (p < 0) p = 0;
            if (p > 1) p = 1;

            setProgress(p);
        }

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const characters = Array.from(text);

    return (
        <p ref={containerRef} className="prisma-about-body">
            {characters.map((char, index) => {
                const charProgress = index / characters.length;
                let charOpacity = 0.2;
                if (progress > charProgress) {
                    charOpacity = Math.min(1, 0.2 + ((progress - charProgress) / 0.15) * 0.8);
                }

                return (
                    <span
                        key={index}
                        style={{
                            opacity: charOpacity,
                            transition: "opacity 0.1s ease"
                        }}
                        className="animated-letter"
                    >
                        {char}
                    </span>
                );
            })}
        </p>
    );
}

// Feature Card Wrapper with Staggered Entrance
function FeatureCard({ delay = 0, children, className = "" }) {
    const [ref, isInView] = useInView({ once: true, threshold: 0.1 });

    return (
        <div
            ref={ref}
            style={{
                transform: isInView ? "scale(1)" : "scale(0.95)",
                opacity: isInView ? 1 : 0,
                transition: `transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`
            }}
            className={className}
        >
            {children}
        </div>
    );
}

function LandingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { error: showError } = useToast();
    const [quickRoomId, setQuickRoomId] = useState("");
    const [activeDemoTab, setActiveDemoTab] = useState("editor");
    const [selectedTriageProblem, setSelectedTriageProblem] = useState("B");

    const triageProblems = [
        {
            letter: "A",
            title: "Prefix XOR Parity",
            rating: 800,
            limits: "1.0s / 256MB",
            status: "Accepted",
            points: 100,
            assignee: "Charlie",
            lang: "C++20",
            tags: ["bitmasks", "math"],
            description: "Given an array of size n, determine if all prefix bitwise XOR sums are even under parity invariants.",
            sampleInput: "4\n1 3 2 4",
            sampleOutput: "YES\n2 0",
            verdict: "✓ Accepted (00:08:14) · Passed 48/48 test cases",
            color: "#10b981"
        },
        {
            letter: "B",
            title: "Segment Range Inversions",
            rating: 1400,
            limits: "2.0s / 512MB",
            status: "Testing",
            points: 250,
            assignee: "Alice & Bob",
            lang: "C++20",
            tags: ["data structures", "lazy propagation"],
            description: "Maintain a dynamic segment tree for range updates and inversion counts modulo 998244353.",
            sampleInput: "5 3\n1 2 3 4 5\n1 3 10\n2 4",
            sampleOutput: "15\n27\nPASSED",
            verdict: "▶ Running Sample Case 2/3 in Monaco (14ms)",
            color: "#DEDBC8"
        },
        {
            letter: "C",
            title: "Centroid Tree Coloring",
            rating: 1900,
            limits: "2.5s / 256MB",
            status: "Drafting",
            points: 400,
            assignee: "Bob",
            lang: "Python 3.12",
            tags: ["trees", "dp", "centroid"],
            description: "Find maximum monochromatic component size in weighted tree where node distances satisfy invariants.",
            sampleInput: "6\n1 2 2 3 3 4\n1 2 1 3 2 4",
            sampleOutput: "4\nPATH_OK",
            verdict: "✎ Drafting state transitions · Complexity O(N log² N)",
            color: "#f59e0b"
        },
        {
            letter: "D",
            title: "Shortest XOR Basis Cycles",
            rating: 2300,
            limits: "3.0s / 512MB",
            status: "Queued",
            points: 600,
            assignee: "Unassigned",
            lang: "C++20",
            tags: ["graphs", "linear algebra"],
            description: "Construct minimal cycle basis on undirected graph under bitwise linear independence constraints.",
            sampleInput: "7 9\n1 2 4\n2 3 8\n...",
            sampleOutput: "MIN_CYCLE: 14",
            verdict: "⏸ Queued for team triage after Problem B submission",
            color: "#9CA3AF"
        }
    ];

    function handleQuickJoin(e) {
        e.preventDefault();
        const clean = quickRoomId.trim();
        if (!clean) {
            showError("Please enter a valid room ID");
            return;
        }
        navigate(`/room/${clean}`);
    }

    return (
        <div className="prisma-page">
            {/* =================================================================
               SECTION 1 — HERO (Prisma Cinematic Frame & Single Unified Header)
               ================================================================= */}
            <section className="prisma-hero-container">
                <div className="prisma-hero-frame">
                    {/* Background Cinematic Video */}
                    <video
                        className="prisma-hero-video"
                        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />

                    {/* Noise & Gradient Overlays */}
                    <div className="noise-overlay" aria-hidden="true" />
                    <div className="prisma-hero-gradient" aria-hidden="true" />

                    {/* SINGLE UNIFIED TOP NAVIGATION (Brand + Section Anchors + Auth Actions) */}
                    <header className="prisma-hero-nav">
                        <Link to="/" className="prisma-nav-brand">
                            <div className="prisma-nav-logo-icon">&lt;/&gt;</div>
                            <span>CodeSync</span>
                            <span style={{ color: "#DEDBC8", fontSize: "14px", fontWeight: 700 }}>*</span>
                        </Link>

                        <nav className="prisma-nav-items">
                            <a href="#about" className="prisma-nav-link">Mission Control</a>
                            <a href="#features" className="prisma-nav-link">Room Capabilities</a>
                            <a href="#simulator" className="prisma-nav-link">Live IDE</a>
                            <a href="#runtimes" className="prisma-nav-link">Compilers</a>
                            <a href="#compare" className="prisma-nav-link">Why CodeSync</a>
                        </nav>

                        <div className="prisma-nav-actions">
                            {user ? (
                                <Link to="/dashboard" className="prisma-nav-cta-btn">
                                    <span>Dashboard</span>
                                    <ArrowRight size={14} />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="prisma-nav-login-link">
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="prisma-nav-cta-btn">
                                        <span>Launch Room</span>
                                        <ArrowRight size={14} />
                                    </Link>
                                </>
                            )}
                        </div>
                    </header>

                    {/* Hero Content (Anchored to Bottom, 12-Column Grid) */}
                    <div className="prisma-hero-content">
                        <div className="prisma-hero-grid">
                            {/* Left: Giant CodeSync Title */}
                            <div className="prisma-hero-left">
                                <div className="prisma-title-wrap">
                                    <h1 className="prisma-title">
                                        <WordsPullUp
                                            text="CodeSync"
                                            showAsterisk={true}
                                        />
                                    </h1>
                                </div>
                            </div>

                            {/* Right: Authentic Contest Mission Description & CTA */}
                            <div className="prisma-hero-right">
                                <p
                                    style={{
                                        animation: "fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both"
                                    }}
                                    className="prisma-hero-desc"
                                >
                                    Mission control for competitive programming teams. Split problems A through H, collaborate in synchronized Monaco editors, test against contest sample cases with zero latency, and coordinate team strategy in real time.
                                </p>

                                <div
                                    style={{
                                        animation: "fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.7s both",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "14px"
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                        <Link
                                            to={user ? "/dashboard" : "/register"}
                                            className="prisma-pill-btn group"
                                        >
                                            <span>{user ? "Open Workspace" : "Launch Contest Room"}</span>
                                            <div className="prisma-btn-circle">
                                                <ArrowRight size={18} />
                                            </div>
                                        </Link>
                                        {!user && (
                                            <Link to="/login" className="prisma-hero-ghost-btn">
                                                Sign In
                                            </Link>
                                        )}
                                    </div>

                                    {/* Direct Room Code Joiner */}
                                    <form onSubmit={handleQuickJoin} className="prisma-quick-input-wrap">
                                        <input
                                            type="text"
                                            placeholder="Enter room ID or invite code..."
                                            value={quickRoomId}
                                            onChange={(e) => setQuickRoomId(e.target.value)}
                                            className="prisma-quick-input"
                                            aria-label="Room ID input"
                                        />
                                        <button type="submit" className="prisma-quick-btn">
                                            Join Room
                                        </button>
                                    </form>

                                    {/* Live Telemetry Pills */}
                                    <div className="prisma-hero-badges">
                                        <div className="prisma-badge">
                                            <span className="prisma-badge-dot" />
                                            <span>Sub-50ms Yjs CRDT Sync</span>
                                        </div>
                                        <div className="prisma-badge">
                                            <span>C++20 · Python 3.12 · Java 21 · Rust</span>
                                        </div>
                                        <div className="prisma-badge">
                                            <span>Codeforces & ICPC Ready</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
               SECTION 2 — ABOUT / THE TEAM MANIFESTO (#101010 Card)
               ================================================================= */}
            <section id="about" className="prisma-about-section">
                <div className="prisma-about-card">
                    {/* About Label */}
                    <div className="prisma-about-label">
                        Mission Control Architecture
                    </div>

                    {/* About Main Statement (Multi-Style WordsPullUp with Serif Italic) */}
                    <div className="prisma-about-heading">
                        <WordsPullUpMultiStyle
                            segments={[
                                { text: "Built for contest teams,", className: "text-[#E1E0CC]", isSerif: false },
                                { text: "where penalty minutes decide the scoreboard.", className: "text-[#DEDBC8]", isSerif: true },
                                { text: "One tactical room to triage, solve, test, and pass every sample.", className: "text-[#E1E0CC]", isSerif: false }
                            ]}
                        />
                    </div>

                    {/* About Scroll-Linked Paragraph Reveal */}
                    <ScrollLinkedParagraph
                        text="When the contest clock starts on Codeforces, ICPC, or AtCoder, generic collaborative tools crumble under syntax lag, lack of sample judges, and chaotic file management. CodeSync gives your team a private tactical workspace: isolate problems A through H into dedicated tabs, code simultaneously with live multi-cursor Monaco editors, test your algorithms against sample inputs with automated diffing, and coordinate strategy in real-time contest chat. Divide problems, verify edge cases together, and submit with total confidence."
                    />
                </div>
            </section>

            {/* =================================================================
               SECTION 3 — FEATURES (4-Card Grid in Prisma Design, #212121)
               ================================================================= */}
            <section id="features" className="prisma-features-section">
                {/* Subtle Fractal Noise Texture */}
                <div className="bg-noise" aria-hidden="true" />

                <div className="prisma-features-container">
                    {/* Features Header */}
                    <div className="prisma-features-header">
                        <h2 className="prisma-features-h1">
                            <WordsPullUp text="Purpose-built for competitive programming rounds." delay={0.1} />
                        </h2>
                        <h3 className="prisma-features-h2">
                            <WordsPullUp text="No bloat. No generic templates. Pure algorithmic throughput." delay={0.25} />
                        </h3>
                    </div>

                    {/* 4 Feature Card Grid */}
                    <div className="prisma-features-grid">
                        {/* Card 1 — Cinematic Video Card */}
                        <FeatureCard delay={0.05} className="prisma-card-video">
                            <video
                                className="prisma-card-video-bg"
                                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                            <div className="prisma-card-video-gradient" aria-hidden="true" />
                            <div className="prisma-card-video-content">
                                <div style={{ fontSize: "11px", color: "#DEDBC8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px", fontWeight: 600 }}>
                                    REAL-TIME SYNC
                                </div>
                                <div className="prisma-card-video-title">
                                    Sub-50ms Multi-Cursor Synchronization.
                                </div>
                                <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "6px" }}>
                                    Conflict-free Yjs CRDT real-time typing across teammates.
                                </div>
                            </div>
                        </FeatureCard>

                        {/* Card 2 — Contest Problem Triage (#212121) */}
                        <FeatureCard delay={0.2} className="prisma-feature-card">
                            <div>
                                <div className="prisma-card-top">
                                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#171717", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#DEDBC8" }}>
                                        <LayersIcon size={20} />
                                    </div>
                                    <span className="prisma-card-num">01</span>
                                </div>

                                <h4 className="prisma-card-title">Contest Problem Triage.</h4>

                                <div className="prisma-checklist">
                                    <div className="prisma-checklist-item">
                                        <Check size={16} className="prisma-check-icon" />
                                        <span>Organize problems A through H in one room</span>
                                    </div>
                                    <div className="prisma-checklist-item">
                                        <Check size={16} className="prisma-check-icon" />
                                        <span>Teammates solve different problems simultaneously</span>
                                    </div>
                                    <div className="prisma-checklist-item">
                                        <Check size={16} className="prisma-check-icon" />
                                        <span>Instant tab switching with zero lost editor state</span>
                                    </div>
                                    <div className="prisma-checklist-item">
                                        <Check size={16} className="prisma-check-icon" />
                                        <span>Status markers: Drafting, Reviewing, AC Passed</span>
                                    </div>
                                </div>
                            </div>

                            <Link to={user ? "/dashboard" : "/register"} className="prisma-learn-more">
                                <span>Try problem triage</span>
                                <ArrowRight size={14} className="prisma-arrow-rotated" />
                            </Link>
                        </FeatureCard>

                        {/* Card 3 — Sample Judge & Diff (#212121) */}
                        <FeatureCard delay={0.35} className="prisma-feature-card">
                            <div>
                                <div className="prisma-card-top">
                                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#171717", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#DEDBC8" }}>
                                        <PlayIcon size={20} />
                                    </div>
                                    <span className="prisma-card-num">02</span>
                                </div>

                                <h4 className="prisma-card-title">Sample Case Judge.</h4>

                                <div className="prisma-checklist">
                                    <div className="prisma-checklist-item">
                                        <Check size={16} className="prisma-check-icon" />
                                        <span>Paste problem sample input & expected output</span>
                                    </div>
                                    <div className="prisma-checklist-item">
                                        <Check size={16} className="prisma-check-icon" />
                                        <span>Multi-language compilation (C++20, Py, Java)</span>
                                    </div>
                                    <div className="prisma-checklist-item">
                                        <Check size={16} className="prisma-check-icon" />
                                        <span>Automated visual diff highlighting matches</span>
                                    </div>
                                    <div className="prisma-checklist-item">
                                        <Check size={16} className="prisma-check-icon" />
                                        <span>Instant TLE, MLE, and Runtime Error capture</span>
                                    </div>
                                </div>
                            </div>

                            <Link to={user ? "/dashboard" : "/register"} className="prisma-learn-more">
                                <span>Explore sample runner</span>
                                <ArrowRight size={14} className="prisma-arrow-rotated" />
                            </Link>
                        </FeatureCard>

                        {/* Card 4 — Tactical Team Chat (#212121) */}
                        <FeatureCard delay={0.5} className="prisma-feature-card">
                            <div>
                                <div className="prisma-card-top">
                                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#171717", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#DEDBC8" }}>
                                        <UsersIcon size={20} />
                                    </div>
                                    <span className="prisma-card-num">03</span>
                                </div>

                                <h4 className="prisma-card-title">Tactical Contest Chat.</h4>

                                <div className="prisma-checklist">
                                    <div className="prisma-checklist-item">
                                        <Check size={16} className="prisma-check-icon" />
                                        <span>Docked team chat alongside the code editor</span>
                                    </div>
                                    <div className="prisma-checklist-item">
                                        <Check size={16} className="prisma-check-icon" />
                                        <span>Coordinate who is drafting or debugging</span>
                                    </div>
                                    <div className="prisma-checklist-item">
                                        <Check size={16} className="prisma-check-icon" />
                                        <span>Share corner cases, invariants, and complexities</span>
                                    </div>
                                    <div className="prisma-checklist-item">
                                        <Check size={16} className="prisma-check-icon" />
                                        <span>Persistent room history saved across disconnects</span>
                                    </div>
                                </div>
                            </div>

                            <Link to={user ? "/dashboard" : "/register"} className="prisma-learn-more">
                                <span>Join team room</span>
                                <ArrowRight size={14} className="prisma-arrow-rotated" />
                            </Link>
                        </FeatureCard>
                    </div>
                </div>
            </section>

            {/* =================================================================
               SECTION 4 — INTERACTIVE CONTEST ROOM SIMULATOR (#101010 Card)
               ================================================================= */}
            <section id="simulator" className="prisma-showcase-section">
                <div className="prisma-showcase-container">
                    <div style={{ textAlign: "center", marginBottom: "40px" }}>
                        <div style={{ color: "#DEDBC8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", fontWeight: 600 }}>
                            Tactical Interface
                        </div>
                        <h3 style={{ fontSize: "32px", color: "#E1E0CC", fontWeight: 600, letterSpacing: "-0.02em", marginBottom: "12px" }}>
                            Inside a Live Contest Room.
                        </h3>
                        <p style={{ color: "#9CA3AF", fontSize: "15px", maxWidth: "560px", margin: "0 auto" }}>
                            Explore how serious teams divide contest problems, sync live code, and verify edge cases before submitting.
                        </p>
                    </div>

                    <div className="prisma-showcase-card">
                        {/* Interactive Tabs */}
                        <div className="prisma-showcase-tabs">
                            <button
                                onClick={() => setActiveDemoTab("editor")}
                                className={`prisma-showcase-tab ${activeDemoTab === "editor" ? "active" : ""}`}
                            >
                                <CodeIcon size={14} />
                                <span>01. Synchronized Monaco IDE</span>
                            </button>
                            <button
                                onClick={() => setActiveDemoTab("triage")}
                                className={`prisma-showcase-tab ${activeDemoTab === "triage" ? "active" : ""}`}
                            >
                                <LayersIcon size={14} />
                                <span>02. Multi-Problem Triage</span>
                            </button>
                            <button
                                onClick={() => setActiveDemoTab("judge")}
                                className={`prisma-showcase-tab ${activeDemoTab === "judge" ? "active" : ""}`}
                            >
                                <PlayIcon size={14} />
                                <span>03. Sample Runner & Diff</span>
                            </button>
                            <button
                                onClick={() => setActiveDemoTab("chat")}
                                className={`prisma-showcase-tab ${activeDemoTab === "chat" ? "active" : ""}`}
                            >
                                <UsersIcon size={14} />
                                <span>04. Tactical Contest Chat</span>
                            </button>
                        </div>

                        {/* Interactive Body */}
                        <div className="prisma-showcase-body">
                            {activeDemoTab === "editor" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <span style={{ fontFamily: "JetBrains Mono", fontSize: "13px", color: "#DEDBC8", fontWeight: 600 }}>
                                                solution_B_segment_tree.cpp
                                            </span>
                                            <span style={{ fontSize: "11px", padding: "2px 8px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", borderRadius: "4px", fontFamily: "JetBrains Mono" }}>
                                                C++20 (GCC 13.2)
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: "#9CA3AF" }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#DEDBC8" }} />
                                                Alice (Editing L42)
                                            </span>
                                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }} />
                                                Bob (Viewing L18)
                                            </span>
                                        </div>
                                    </div>

                                    {/* Mock Monaco Editor Block */}
                                    <pre style={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontSize: "13px",
                                        lineHeight: 1.6,
                                        color: "#E1E0CC",
                                        background: "#080808",
                                        padding: "20px",
                                        borderRadius: "10px",
                                        border: "1px solid rgba(255, 255, 255, 0.04)",
                                        overflowX: "auto"
                                    }}>
{`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

// Fast I/O for live contest rounds
void solve() {
    int n, q;
    cin >> n >> q;
    vector<ll> tree(4 * n, 0);
    
    // Alice [editing]: Range update with lazy propagation
    auto update = [&](auto& self, int node, int l, int r, int ql, int qr, ll val) -> void {
        if (ql <= l && r <= qr) {
            tree[node] += val;
            return;
        }
        int mid = (l + r) / 2;
        if (ql <= mid) self(self, 2 * node, l, mid, ql, qr, val);
        if (qr > mid)  self(self, 2 * node + 1, mid + 1, r, ql, qr, val);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    };
    
    cout << "PASSED ALL LOCAL SAMPLE CASES" << "\\n";
}`}
                                    </pre>
                                </div>
                            )}

                            {activeDemoTab === "triage" && (() => {
                                const activeProblem = triageProblems.find((p) => p.letter === selectedTriageProblem) || triageProblems[1];
                                return (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                                        {/* Contest Header HUD */}
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            flexWrap: "wrap",
                                            gap: "12px",
                                            background: "#0a0a0a",
                                            padding: "14px 20px",
                                            borderRadius: "12px",
                                            border: "1px solid rgba(255, 255, 255, 0.08)"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#E1E0CC", fontWeight: 600 }}>
                                                    Codeforces Round 994 (Div. 1 + 2)
                                                </span>
                                                <span style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>
                                                    · Clock: 01:42:15 remaining
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "14px", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>
                                                <span style={{ color: "#9CA3AF" }}>Team Score: <strong style={{ color: "#DEDBC8" }}>3,450 pts</strong></span>
                                                <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
                                                <span style={{ color: "#9CA3AF" }}>Rank: <strong style={{ color: "#DEDBC8" }}>#18 / 2,840</strong></span>
                                                <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "9999px", background: "rgba(222, 219, 200, 0.12)", color: "#DEDBC8" }}>
                                                    Click row to inspect
                                                </span>
                                            </div>
                                        </div>

                                        {/* Triage Split View: Problem Rows (Left) & Inspector (Right) */}
                                        <div className="prisma-triage-layout">
                                            {/* Left: Problem Selection Matrix */}
                                            <div className="prisma-triage-matrix">
                                                {triageProblems.map((prob) => {
                                                    const isSelected = selectedTriageProblem === prob.letter;
                                                    return (
                                                        <div
                                                            key={prob.letter}
                                                            onClick={() => setSelectedTriageProblem(prob.letter)}
                                                            className={`prisma-triage-item ${isSelected ? "active" : ""}`}
                                                        >
                                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                                <div style={{
                                                                    width: "32px",
                                                                    height: "32px",
                                                                    borderRadius: "8px",
                                                                    background: isSelected ? "#DEDBC8" : "#1e1e1e",
                                                                    color: isSelected ? "#000000" : "#E1E0CC",
                                                                    fontWeight: 800,
                                                                    fontFamily: "'JetBrains Mono', monospace",
                                                                    fontSize: "13px",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    border: `1px solid ${isSelected ? "#DEDBC8" : "rgba(255,255,255,0.1)"}`
                                                                }}>
                                                                    {prob.letter}
                                                                </div>
                                                                <div>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                        <span style={{ fontSize: "14px", fontWeight: 600, color: isSelected ? "#ffffff" : "#E1E0CC" }}>
                                                                            {prob.title}
                                                                        </span>
                                                                        <span style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>
                                                                            {prob.rating} · {prob.limits}
                                                                        </span>
                                                                    </div>
                                                                    <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>
                                                                        Assigned: <strong style={{ color: "#E1E0CC" }}>{prob.assignee}</strong> ({prob.lang})
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                <span style={{
                                                                    fontSize: "11px",
                                                                    padding: "3px 10px",
                                                                    borderRadius: "9999px",
                                                                    fontFamily: "'JetBrains Mono', monospace",
                                                                    fontWeight: 600,
                                                                    background: prob.status === "Accepted"
                                                                        ? "rgba(16, 185, 129, 0.15)"
                                                                        : prob.status === "Testing"
                                                                        ? "rgba(222, 219, 200, 0.15)"
                                                                        : prob.status === "Drafting"
                                                                        ? "rgba(245, 158, 11, 0.15)"
                                                                        : "rgba(255, 255, 255, 0.06)",
                                                                    color: prob.color,
                                                                    border: `1px solid ${prob.color}40`
                                                                }}>
                                                                    {prob.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Right: Live Triage Inspector */}
                                            <div className="prisma-triage-inspector">
                                                <div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                                        <div>
                                                            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#DEDBC8", fontWeight: 700, fontFamily: "JetBrains Mono" }}>
                                                                Problem {activeProblem.letter} Inspector · {activeProblem.points} Pts
                                                            </div>
                                                            <h4 style={{ fontSize: "18px", color: "#E1E0CC", fontWeight: 600, marginTop: "4px" }}>
                                                                {activeProblem.title}
                                                            </h4>
                                                        </div>
                                                        <span style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px", background: "rgba(255, 255, 255, 0.06)", color: "#9CA3AF", fontFamily: "JetBrains Mono" }}>
                                                            {activeProblem.limits}
                                                        </span>
                                                    </div>

                                                    <p style={{ fontSize: "13px", color: "#9CA3AF", lineHeight: 1.5, marginBottom: "16px" }}>
                                                        {activeProblem.description}
                                                    </p>

                                                    <div style={{ background: "#060606", padding: "12px 14px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.05)", marginBottom: "14px" }}>
                                                        <div style={{ fontSize: "10px", color: "#9CA3AF", textTransform: "uppercase", fontFamily: "JetBrains Mono", marginBottom: "4px" }}>
                                                            Sample Input Preview:
                                                        </div>
                                                        <pre style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#E1E0CC", margin: 0 }}>
                                                            {activeProblem.sampleInput}
                                                        </pre>
                                                    </div>

                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: activeProblem.color, fontFamily: "JetBrains Mono" }}>
                                                        <span>{activeProblem.verdict}</span>
                                                    </div>
                                                </div>

                                                <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                                                        Solver: <strong style={{ color: "#E1E0CC" }}>{activeProblem.assignee}</strong>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveDemoTab("editor")}
                                                        style={{
                                                            background: "#DEDBC8",
                                                            color: "#000000",
                                                            border: "none",
                                                            borderRadius: "9999px",
                                                            padding: "6px 14px",
                                                            fontSize: "12px",
                                                            fontWeight: 600,
                                                            cursor: "pointer",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "6px"
                                                        }}
                                                    >
                                                        <span>Open in Monaco</span>
                                                        <ArrowRight size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom Team Footnote */}
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            fontSize: "12px",
                                            color: "#9CA3AF",
                                            padding: "8px 4px",
                                            borderTop: "1px solid rgba(255, 255, 255, 0.05)"
                                        }}>
                                            <span>Simultaneous multi-problem triage enables teammates to solve independently while maintaining shared context.</span>
                                            <span style={{ color: "#DEDBC8", fontFamily: "'JetBrains Mono', monospace" }}>3 Active Solvers Connected</span>
                                        </div>
                                    </div>
                                );
                            })()}

                            {activeDemoTab === "judge" && (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                                    <div style={{ background: "#0a0a0a", padding: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                                        <div style={{ fontSize: "11px", color: "#9CA3AF", textTransform: "uppercase", marginBottom: "8px", fontWeight: 600 }}>
                                            Sample Input
                                        </div>
                                        <pre style={{ fontFamily: "JetBrains Mono", fontSize: "12px", color: "#E1E0CC", lineHeight: 1.5 }}>
{`5 3
1 2 3 4 5
1 3 10
2 4
1 5 2`}
                                        </pre>
                                    </div>

                                    <div style={{ background: "#0a0a0a", padding: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                                        <div style={{ fontSize: "11px", color: "#9CA3AF", textTransform: "uppercase", marginBottom: "8px", fontWeight: 600 }}>
                                            Expected Output
                                        </div>
                                        <pre style={{ fontFamily: "JetBrains Mono", fontSize: "12px", color: "#E1E0CC", lineHeight: 1.5 }}>
{`15
27
PASSED ALL CASES`}
                                        </pre>
                                    </div>

                                    <div style={{ background: "#0a0a0a", padding: "16px", borderRadius: "10px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                            <span style={{ fontSize: "11px", color: "#10b981", textTransform: "uppercase", fontWeight: 700 }}>
                                                Actual Output
                                            </span>
                                            <span style={{ fontSize: "10px", color: "#10b981", background: "rgba(16, 185, 129, 0.2)", padding: "2px 6px", borderRadius: "4px" }}>
                                                ✓ Match (14ms)
                                            </span>
                                        </div>
                                        <pre style={{ fontFamily: "JetBrains Mono", fontSize: "12px", color: "#10b981", lineHeight: 1.5 }}>
{`15
27
PASSED ALL CASES`}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {activeDemoTab === "chat" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "#080808", padding: "20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)" }}>
                                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#DEDBC8", color: "#000", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>A</div>
                                        <div>
                                            <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "2px" }}><strong style={{ color: "#E1E0CC" }}>Alice</strong> · 18:24:10</div>
                                            <div style={{ fontSize: "13px", color: "#E1E0CC" }}>Problem B sample 2 passes! Range queries are O(log N). Submitting now.</div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#f59e0b", color: "#000", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>B</div>
                                        <div>
                                            <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "2px" }}><strong style={{ color: "#E1E0CC" }}>Bob</strong> · 18:24:45</div>
                                            <div style={{ fontSize: "13px", color: "#E1E0CC" }}>Nice! Problem C has N ≤ 200,000, so we can't use O(N²) Floyd-Warshall. I'm coding Dijkstra with a priority queue in Python.</div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#10b981", color: "#000", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>C</div>
                                        <div>
                                            <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "2px" }}><strong style={{ color: "#E1E0CC" }}>Charlie</strong> · 18:25:02</div>
                                            <div style={{ fontSize: "13px", color: "#E1E0CC" }}>Problem A is Accepted! +100 points on the scoreboard. Reviewing Bob's Dijkstra now.</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
               SECTION 5 — EXECUTION MATRIX & COMPILERS
               ================================================================= */}
            <section id="runtimes" className="prisma-runtimes-section">
                <div style={{ maxWidth: "1240px", margin: "0 auto", marginBottom: "32px", textAlign: "left" }}>
                    <div style={{ color: "#DEDBC8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontWeight: 600 }}>
                        Sandboxed Runtimes
                    </div>
                    <h3 style={{ fontSize: "28px", color: "#E1E0CC", fontWeight: 600, letterSpacing: "-0.02em" }}>
                        Execution Engines for Serious Speed.
                    </h3>
                </div>

                <div className="prisma-runtimes-grid">
                    <div className="prisma-runtime-pill">
                        <div>
                            <div className="prisma-runtime-lang">
                                <TerminalIcon size={16} />
                                <span>C++20</span>
                            </div>
                            <p className="prisma-runtime-flags" style={{ marginTop: "8px" }}>
                                g++ 13.2.0<br />
                                -O2 -std=c++20 -Wall
                            </p>
                        </div>
                        <span className="prisma-runtime-badge">Fast I/O &lt; 0.05s</span>
                    </div>

                    <div className="prisma-runtime-pill">
                        <div>
                            <div className="prisma-runtime-lang">
                                <TerminalIcon size={16} />
                                <span>Python 3.12</span>
                            </div>
                            <p className="prisma-runtime-flags" style={{ marginTop: "8px" }}>
                                CPython 3.12 &amp; PyPy3<br />
                                Recursion limit tuned
                            </p>
                        </div>
                        <span className="prisma-runtime-badge">High Limit</span>
                    </div>

                    <div className="prisma-runtime-pill">
                        <div>
                            <div className="prisma-runtime-lang">
                                <TerminalIcon size={16} />
                                <span>Java 21</span>
                            </div>
                            <p className="prisma-runtime-flags" style={{ marginTop: "8px" }}>
                                OpenJDK LTS 21<br />
                                Fast Scanner enabled
                            </p>
                        </div>
                        <span className="prisma-runtime-badge">64-Bit VM</span>
                    </div>

                    <div className="prisma-runtime-pill">
                        <div>
                            <div className="prisma-runtime-lang">
                                <TerminalIcon size={16} />
                                <span>Rust 1.78</span>
                            </div>
                            <p className="prisma-runtime-flags" style={{ marginTop: "8px" }}>
                                rustc 2021 edition<br />
                                --release optimizations
                            </p>
                        </div>
                        <span className="prisma-runtime-badge">Zero Overhead</span>
                    </div>

                    <div className="prisma-runtime-pill">
                        <div>
                            <div className="prisma-runtime-lang">
                                <TerminalIcon size={16} />
                                <span>Go 1.22</span>
                            </div>
                            <p className="prisma-runtime-flags" style={{ marginTop: "8px" }}>
                                Go 1.22 Runtime<br />
                                -ldflags="-s -w"
                            </p>
                        </div>
                        <span className="prisma-runtime-badge">Micro-sandbox</span>
                    </div>
                </div>
            </section>

            {/* =================================================================
               SECTION 6 — WHY CODESYNC VS GENERIC TOOLS (#101010 Card)
               ================================================================= */}
            <section id="compare" className="prisma-compare-section">
                <div style={{ maxWidth: "1140px", margin: "0 auto", textAlign: "center", marginBottom: "40px" }}>
                    <div style={{ color: "#DEDBC8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", fontWeight: 600 }}>
                        Engineered for Contests
                    </div>
                    <h3 style={{ fontSize: "32px", color: "#E1E0CC", fontWeight: 600, letterSpacing: "-0.02em", marginBottom: "12px" }}>
                        Why Competitive Programmers Choose CodeSync.
                    </h3>
                    <p style={{ color: "#9CA3AF", fontSize: "15px", maxWidth: "600px", margin: "0 auto" }}>
                        Generic collaboration apps are built for text essays or web apps. CodeSync is built specifically for algorithmic competition teams.
                    </p>
                </div>

                <div className="prisma-compare-card">
                    <table className="prisma-compare-table">
                        <thead>
                            <tr>
                                <th style={{ width: "38%" }}>Capability</th>
                                <th style={{ width: "32%", color: "#DEDBC8" }}>CodeSync</th>
                                <th style={{ width: "30%" }}>Generic SaaS / Live Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div className="prisma-compare-feature">Multi-Problem Triage Tabs</div>
                                    <div className="prisma-compare-sub">Organize problems A through H inside one room</div>
                                </td>
                                <td className="prisma-compare-codesync">
                                    <span style={{ color: "#10b981", marginRight: "6px" }}>✓</span> Dedicated contest tabs
                                </td>
                                <td className="prisma-compare-generic">Single file or clumsy folder trees</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="prisma-compare-feature">Sample Input/Output Judge</div>
                                    <div className="prisma-compare-sub">Run code against contest sample cases</div>
                                </td>
                                <td className="prisma-compare-codesync">
                                    <span style={{ color: "#10b981", marginRight: "6px" }}>✓</span> Built-in side-by-side diff
                                </td>
                                <td className="prisma-compare-generic">Manual terminal copy-paste only</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="prisma-compare-feature">Sub-50ms Editor Latency</div>
                                    <div className="prisma-compare-sub">Real-time CRDT peer typing without collision</div>
                                </td>
                                <td className="prisma-compare-codesync">
                                    <span style={{ color: "#10b981", marginRight: "6px" }}>✓</span> Sub-50ms Yjs Engine
                                </td>
                                <td className="prisma-compare-generic">Laggy sync, cursor jumping</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="prisma-compare-feature">Zero-Setup Web IDE</div>
                                    <div className="prisma-compare-sub">Works instantly in browser for all teammates</div>
                                </td>
                                <td className="prisma-compare-codesync">
                                    <span style={{ color: "#10b981", marginRight: "6px" }}>✓</span> Instant room link launch
                                </td>
                                <td className="prisma-compare-generic">Heavy desktop installs &amp; plugins</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="prisma-compare-feature">Contest Tactical Chat</div>
                                    <div className="prisma-compare-sub">Coordinate problem handoffs and corner cases</div>
                                </td>
                                <td className="prisma-compare-codesync">
                                    <span style={{ color: "#10b981", marginRight: "6px" }}>✓</span> Docked beside Monaco IDE
                                </td>
                                <td className="prisma-compare-generic">Switching between external apps</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* =================================================================
               SECTION 7 — DIRECT ROOM LAUNCH CTA
               ================================================================= */}
            <section id="inquiries" style={{ backgroundColor: "#000000", borderTop: "1px solid rgba(255, 255, 255, 0.06)", padding: "90px 24px 100px" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
                    <div style={{ color: "#DEDBC8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", fontWeight: 600 }}>
                        Contest Mission Ready
                    </div>
                    <h3 style={{ fontSize: "40px", color: "#E1E0CC", fontWeight: 500, letterSpacing: "-0.03em", marginBottom: "16px" }}>
                        Launch your team room in 3 seconds.
                    </h3>
                    <p style={{ color: "#9CA3AF", fontSize: "16px", lineHeight: 1.6, maxWidth: "560px", margin: "0 auto 36px" }}>
                        Zero configuration. Create a private room, share the 10-character code with your teammates, and start solving immediately.
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
                        <Link to={user ? "/dashboard" : "/register"} className="prisma-pill-btn group">
                            <span>{user ? "Open Dashboard" : "Launch Contest Room"}</span>
                            <div className="prisma-btn-circle">
                                <ArrowRight size={18} />
                            </div>
                        </Link>
                        {!user && (
                            <Link to="/login" className="prisma-hero-ghost-btn">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* =================================================================
               SECTION 8 — DEDICATED PRODUCTION FOOTER (Prisma Palette & Architecture)
               ================================================================= */}
            <footer className="prisma-footer">
                <div className="prisma-footer-container">
                    <div className="prisma-footer-top">
                        {/* Column 1: Brand & Status */}
                        <div className="prisma-footer-brand-col">
                            <div className="prisma-footer-brand">
                                <div className="prisma-nav-logo-icon">&lt;/&gt;</div>
                                <span>CodeSync</span>
                                <span style={{ color: "#DEDBC8", fontSize: "16px" }}>*</span>
                            </div>
                            <p className="prisma-footer-desc">
                                Mission control for competitive programming teams during live contests. Synchronized multi-problem rooms, live Monaco IDE, instant team chat, sample test runner, and side-by-side diff viewer.
                            </p>
                            <div className="prisma-footer-status">
                                <span className="prisma-badge-dot" />
                                <span>Execution Sandboxes Operational</span>
                            </div>
                        </div>

                        {/* Column 2: Contest Workflow */}
                        <div className="prisma-footer-col">
                            <h5>Workflow</h5>
                            <ul className="prisma-footer-links">
                                <li><a href="#about" className="prisma-footer-link">Mission Control</a></li>
                                <li><a href="#features" className="prisma-footer-link">Problem Triage</a></li>
                                <li><a href="#simulator" className="prisma-footer-link">Monaco Editor</a></li>
                                <li><a href="#simulator" className="prisma-footer-link">Sample Diff Judge</a></li>
                                <li><a href="#features" className="prisma-footer-link">Tactical Chat</a></li>
                            </ul>
                        </div>

                        {/* Column 3: Compilers */}
                        <div className="prisma-footer-col">
                            <h5>Compilers</h5>
                            <ul className="prisma-footer-links">
                                <li><span className="prisma-footer-link">C++20 (GCC 13.2)</span></li>
                                <li><span className="prisma-footer-link">Python 3.12 &amp; PyPy3</span></li>
                                <li><span className="prisma-footer-link">Java 21 (OpenJDK)</span></li>
                                <li><span className="prisma-footer-link">Rust 1.78 (Release)</span></li>
                                <li><span className="prisma-footer-link">Go 1.22 Runtime</span></li>
                            </ul>
                        </div>

                        {/* Column 4: Supported Contests */}
                        <div className="prisma-footer-col">
                            <h5>Contest Formats</h5>
                            <ul className="prisma-footer-links">
                                <li><span className="prisma-footer-link">Codeforces Rounds</span></li>
                                <li><span className="prisma-footer-link">ICPC Regionals &amp; Finals</span></li>
                                <li><span className="prisma-footer-link">AtCoder Contests</span></li>
                                <li><span className="prisma-footer-link">CSES Problem Set</span></li>
                                <li><span className="prisma-footer-link">LeetCode Weekly</span></li>
                            </ul>
                        </div>
                    </div>

                    <div className="prisma-footer-bottom">
                        <div className="prisma-footer-copy">
                            © 2026 CodeSync. All rights reserved. Purpose-built for serious competitive programming teams.
                        </div>
                        <div className="prisma-footer-subcopy">
                            Designed with Prisma Visual Standards · Dark Moody Palette · Sub-50ms Sync
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
