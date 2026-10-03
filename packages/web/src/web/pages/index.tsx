import { useRef, useState } from "react";
import { useClaps } from "../queries/claps";
import { playClap } from "../lib/clap-sound";

const EMOJIS = ["👏", "✨", "⭐"];
type Particle = { id: number; e: string; x: number; y: number; r: number; s: number };

function Index() {
  const { count, clap } = useClaps();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [bounce, setBounce] = useState(0);
  const pid = useRef(0);

  const onTap = (ev: React.PointerEvent) => {
    ev.preventDefault();
    playClap();
    clap();
    setBounce((b) => b + 1);
    const burst: Particle[] = Array.from({ length: 6 }, () => {
      const a = Math.random() * Math.PI * 2;
      const d = 90 + Math.random() * 70;
      return {
        id: pid.current++,
        e: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        x: Math.cos(a) * d,
        y: Math.sin(a) * d,
        r: Math.random() * 80 - 40,
        s: 0.8 + Math.random() * 0.7,
      };
    });
    setParticles((p) => [...p.slice(-36), ...burst]);
    const ids = new Set(burst.map((b) => b.id));
    setTimeout(() => setParticles((p) => p.filter((x) => !ids.has(x.id))), 750);
  };

  return (
    <main className="clap-page">
      <div className="clap-wrap">
        {particles.map((p) => (
          <span
            key={p.id}
            className="particle"
            style={{ "--x": `${p.x}px`, "--y": `${p.y}px`, "--r": `${p.r}deg`, "--s": p.s } as React.CSSProperties}
          >
            {p.e}
          </span>
        ))}
        <button
          type="button"
          aria-label="박수 보내기"
          className="clap-btn"
          onPointerDown={onTap}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onTap(e as unknown as React.PointerEvent)}
        >
          <span key={bounce} className={bounce ? "clap-icon bounce" : "clap-icon"}>
            👏
          </span>
        </button>
      </div>

      <p className="caption">박수를 보내주세요!</p>
      <div key={count ?? -1} className={count === null ? "count" : "count pop"}>
        {count === null ? "···" : count.toLocaleString("en-US")}
      </div>
      <div className="label">CLAPS</div>
    </main>
  );
}

export default Index;
