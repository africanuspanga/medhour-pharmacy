import { ImageResponse } from "next/og";

export const runtime = "nodejs";
// Pin as static so the image is prerendered (required by `output: "export"`).
export const dynamic = "force-static";
export const alt = "Medhour Pharmacy — Your Trusted Pharmacy in Dar es Salaam";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#008F5A",
          color: "white",
          padding: 64,
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700, letterSpacing: -2 }}>
          Medhour Pharmacy
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 34, opacity: 0.9 }}>
          Your Trusted Pharmacy in Dar es Salaam
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 24,
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 9999,
            padding: "12px 32px",
          }}
        >
          Benjamin Tower, Azikiwe Street, Posta
        </div>
      </div>
    ),
    { ...size }
  );
}
