'use client';

export default function QSentiaMotionBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(#e4e4e7 1.5px, transparent 1.5px), linear-gradient(90deg, #e4e4e7 1.5px, transparent 1.5px)',
          backgroundSize: '46px 46px',
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(75,63,209,0.16),transparent_30%),radial-gradient(circle_at_84%_72%,rgba(75,63,209,0.11),transparent_32%),radial-gradient(circle_at_12%_76%,rgba(0,0,0,0.06),transparent_28%)]" />

      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />

      <div className="shape shape-a" />
      <div className="shape shape-b" />
      <div className="shape shape-c" />
      <div className="shape shape-d" />
      <div className="shape shape-e" />
      <div className="shape shape-f" />
      <div className="shape shape-g" />
      <div className="shape shape-h" />
      <div className="shape shape-i" />

      <div className="line line-a" />
      <div className="line line-b" />
      <div className="line line-c" />
      <div className="line line-d" />
      <div className="line line-e" />
      <div className="line line-f" />

      <div className="dot dot-a" />
      <div className="dot dot-b" />
      <div className="dot dot-c" />
      <div className="dot dot-d" />
      <div className="dot dot-e" />
      <div className="dot dot-f" />
      <div className="dot dot-g" />
      <div className="dot dot-h" />

      <style jsx>{`
        .orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(34px);
          opacity: 0.34;
          animation: orbit 18s ease-in-out infinite;
        }

        .orb-a {
          width: 300px;
          height: 300px;
          left: 8%;
          top: 18%;
          background: rgba(75, 63, 209, 0.34);
        }

        .orb-b {
          width: 240px;
          height: 240px;
          right: 12%;
          bottom: 12%;
          background: rgba(75, 63, 209, 0.24);
          animation-delay: 4s;
        }

        .orb-c {
          width: 180px;
          height: 180px;
          left: 52%;
          top: 6%;
          background: rgba(0, 0, 0, 0.10);
          animation-delay: 7s;
        }

        .shape {
          position: absolute;
          width: 42px;
          height: 42px;
          border: 2px solid rgba(20, 20, 20, 0.55);
          transform: rotate(45deg);
          animation: float 8s ease-in-out infinite;
          background: rgba(255, 255, 255, 0.10);
          backdrop-filter: blur(2px);
        }

        .shape-a { left: 4%; top: 10%; animation-delay: 0s; }
        .shape-b { right: 8%; top: 13%; width: 56px; height: 56px; animation-delay: 1.5s; }
        .shape-c { left: 13%; bottom: 14%; animation-delay: 2.4s; }
        .shape-d { right: 11%; bottom: 16%; width: 34px; height: 34px; animation-delay: 3.6s; }
        .shape-e { left: 46%; top: 7%; width: 28px; height: 28px; border-color: rgba(75,63,209,0.72); animation-delay: 1.1s; }
        .shape-f { left: 58%; bottom: 9%; width: 32px; height: 32px; border-color: rgba(75,63,209,0.65); animation-delay: 2.8s; }
        .shape-g { left: 79%; top: 48%; width: 24px; height: 24px; border-color: rgba(75,63,209,0.58); animation-delay: 4.3s; }
        .shape-h { left: 27%; top: 69%; width: 30px; height: 30px; border-color: rgba(20,20,20,0.42); animation-delay: 5.4s; }
        .shape-i { left: 69%; top: 30%; width: 20px; height: 20px; border-color: rgba(75,63,209,0.70); animation-delay: 6.2s; }

        .line {
          position: absolute;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(20,20,20,0.50), transparent);
          animation: drift 11s ease-in-out infinite;
        }

        .line-a { left: 7%; top: 5%; width: 300px; }
        .line-b { right: 7%; top: 24%; width: 380px; animation-delay: 2s; }
        .line-c { left: 38%; bottom: 18%; width: 460px; animation-delay: 3.5s; }
        .line-d { left: 9%; bottom: 31%; width: 250px; animation-delay: 5s; }
        .line-e { right: 22%; bottom: 9%; width: 300px; animation-delay: 6.3s; }
        .line-f { left: 56%; top: 52%; width: 260px; animation-delay: 7.3s; }

        .dot {
          position: absolute;
          width: 11px;
          height: 11px;
          background: #111;
          border-radius: 999px;
          animation: pulse 3.8s ease-in-out infinite;
        }

        .dot-a { left: 4%; top: 8%; }
        .dot-b { left: 18%; top: 8%; animation-delay: 0.8s; }
        .dot-c { right: 10%; bottom: 27%; animation-delay: 1.5s; }
        .dot-d { right: 16%; bottom: 12%; animation-delay: 2.4s; }
        .dot-e { left: 52%; top: 17%; background: #4b3fd1; animation-delay: 1.2s; }
        .dot-f { left: 72%; bottom: 44%; background: #4b3fd1; animation-delay: 2.9s; }
        .dot-g { left: 36%; top: 42%; background: #111; animation-delay: 3.6s; }
        .dot-h { right: 37%; top: 71%; background: #4b3fd1; animation-delay: 4.4s; }

        @keyframes float {
          0% { transform: translate3d(0,0,0) rotate(45deg); }
          50% { transform: translate3d(24px,-28px,0) rotate(62deg); }
          100% { transform: translate3d(0,0,0) rotate(45deg); }
        }

        @keyframes drift {
          0% { transform: translateX(0); opacity: 0.36; }
          50% { transform: translateX(42px); opacity: 0.9; }
          100% { transform: translateX(0); opacity: 0.36; }
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.82; }
          50% { transform: scale(2.2); opacity: 0.24; }
          100% { transform: scale(1); opacity: 0.82; }
        }

        @keyframes orbit {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(40px, -28px, 0) scale(1.12); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
      `}</style>
    </div>
  );
}