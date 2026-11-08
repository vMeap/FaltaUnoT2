function PitchBackground() {
    return (
        <div className="login-bg-decor" aria-hidden="true">
            <div className="stadium-light stadium-light-tl" />
            <div className="stadium-light stadium-light-br" />
            <svg
                className="pitch-lines-svg"
                viewBox="0 0 1600 1000"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
            >
                <rect x="80" y="60" width="1440" height="880" rx="16" stroke="currentColor" strokeWidth="2.5" />
                <line x1="800" y1="60" x2="800" y2="940" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="800" cy="500" r="150" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="800" cy="500" r="220" stroke="currentColor" strokeWidth="1.2" strokeDasharray="8 10" />
                <circle cx="800" cy="500" r="6" fill="currentColor" />
                <rect x="80" y="260" width="220" height="480" stroke="currentColor" strokeWidth="2.5" />
                <rect x="80" y="360" width="90" height="280" stroke="currentColor" strokeWidth="2" />
                <path d="M 300 400 A 110 110 0 0 1 300 600" stroke="currentColor" strokeWidth="2.5" />
                <rect x="1300" y="260" width="220" height="480" stroke="currentColor" strokeWidth="2.5" />
                <rect x="1430" y="360" width="90" height="280" stroke="currentColor" strokeWidth="2" />
                <path d="M 1300 400 A 110 110 0 0 0 1300 600" stroke="currentColor" strokeWidth="2.5" />
                <path d="M 80 100 A 40 40 0 0 0 120 60" stroke="currentColor" strokeWidth="2" />
                <path d="M 1480 60 A 40 40 0 0 0 1520 100" stroke="currentColor" strokeWidth="2" />
                <path d="M 80 900 A 40 40 0 0 1 120 940" stroke="currentColor" strokeWidth="2" />
                <path d="M 1480 940 A 40 40 0 0 1 1520 900" stroke="currentColor" strokeWidth="2" />
                <path
                    d="M 210 210 Q 340 130 470 220"
                    stroke="#fbbf24"
                    strokeWidth="2.5"
                    strokeDasharray="10 8"
                    strokeLinecap="round"
                />
                <circle cx="210" cy="210" r="10" stroke="#fbbf24" strokeWidth="2.5" />
                <path
                    d="M 1150 790 Q 1290 860 1390 730"
                    stroke="#fbbf24"
                    strokeWidth="2.5"
                    strokeDasharray="10 8"
                    strokeLinecap="round"
                />
                <circle cx="1150" cy="790" r="10" stroke="#fbbf24" strokeWidth="2.5" />
                <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="250" y1="770" x2="270" y2="790" />
                    <line x1="270" y1="770" x2="250" y2="790" />
                    <line x1="1330" y1="190" x2="1350" y2="210" />
                    <line x1="1350" y1="190" x2="1330" y2="210" />
                </g>
            </svg>
        </div>
    )
}

export default PitchBackground

