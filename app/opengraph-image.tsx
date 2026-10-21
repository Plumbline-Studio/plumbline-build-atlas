import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "The Build Atlas by Plumbline Studio: pick a stack you can defend.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Google Fonts serves TTF to a plain fetch, which is what ImageResponse needs.
async function font(family: string, weight: number, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!src) throw new Error(`Font not found: ${family}`);
  return (await fetch(src[1])).arrayBuffer();
}

const INK = "#ece7df";
const MUTED = "#9ba5b4";
const GOLD = "#c8a878";
const GROUND = "#1b2433";
const PANEL = "#232d3d";
const RULE = "#3a4558";
const GREEN = "#6fcf97";

const rows = [
  { who: "Small business", pick: "Next.js + Supabase", score: "+38", why: "Row-level security keeps each customer in their lane" },
  { who: "Enterprise, Microsoft estate", pick: "ASP.NET Core", score: "+46", why: "Lands inside the operating model IT already runs" },
];

export default async function Image() {
  const serifText = "The Build Atlas";
  const sansText =
    "PLUMBLINE STUDIO Same ask. Different client. A different stack, and every point shows its reason." +
    rows.map((r) => r.who + r.pick + r.why).join("") +
    "Client portal ranked for0123456789+.,";
  const monoText = "atlas.plumblinestudio.dev+0123456789";
  const [playfair, inter, interMedium, mono] = await Promise.all([
    font("Playfair+Display", 500, serifText),
    font("Inter", 400, sansText),
    font("Inter", 500, sansText),
    font("JetBrains+Mono", 400, monoText),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: GROUND, color: INK, fontFamily: "Inter", position: "relative" }}>
        <div style={{ position: "absolute", left: 88, top: 0, width: 1, height: 58, background: GOLD, opacity: 0.8 }} />
        <div style={{ position: "absolute", left: 80, top: 54, width: 16, height: 16, background: GOLD, transform: "rotate(45deg)" }} />

        <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 88, top: 112, width: 470 }}>
          <div style={{ display: "flex", fontSize: 18, letterSpacing: 6, color: MUTED, fontWeight: 500 }}>
            PLUMBLINE <span style={{ color: GOLD, marginLeft: 10 }}>STUDIO</span>
          </div>
          <div style={{ display: "flex", fontFamily: "Playfair", fontSize: 84, lineHeight: 1.02, marginTop: 26 }}>The Build Atlas</div>
          <div style={{ display: "flex", fontSize: 27, lineHeight: 1.4, color: "#b9c0cc", marginTop: 26 }}>
            Same ask. Different client. A different stack, and every point shows its reason.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", position: "absolute", right: 72, top: 96, width: 520, gap: 18 }}>
          <div style={{ display: "flex", fontSize: 16, letterSpacing: 4, color: MUTED, fontWeight: 500 }}>CLIENT PORTAL, RANKED FOR</div>
          {rows.map((r, i) => (
            <div
              key={r.who}
              style={{
                display: "flex",
                flexDirection: "column",
                background: PANEL,
                border: `1px solid ${i === 0 ? RULE : GOLD}`,
                borderRadius: 16,
                padding: "22px 26px",
              }}
            >
              <div style={{ display: "flex", fontSize: 17, color: GOLD, fontWeight: 500 }}>{r.who}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 10 }}>
                <div style={{ display: "flex", fontSize: 30, fontWeight: 500 }}>{r.pick}</div>
                <div style={{ display: "flex", fontFamily: "Mono", fontSize: 24, color: GREEN }}>{r.score}</div>
              </div>
              <div style={{ display: "flex", fontSize: 18, color: MUTED, marginTop: 8 }}>{r.why}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", position: "absolute", left: 88, bottom: 64, fontFamily: "Mono", fontSize: 22, color: GOLD }}>
          atlas.plumblinestudio.dev
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Playfair", data: playfair, weight: 500, style: "normal" },
        { name: "Inter", data: inter, weight: 400, style: "normal" },
        { name: "Inter", data: interMedium, weight: 500, style: "normal" },
        { name: "Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
