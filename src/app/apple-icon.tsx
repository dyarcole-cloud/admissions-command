import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at 50% 38%, #c4b5fd 0%, #a78bfa 18%, #5b3aa1 42%, #14182e 75%, #0a0e1a 100%)",
          borderRadius: 40,
          position: "relative",
        }}
      >
        {/* Inset shadow for chassis depth */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 40,
            boxShadow:
              "inset 0 4px 0 rgba(255,255,255,0.16), inset 0 -10px 30px rgba(0,0,0,0.5)",
          }}
        />
        {/* Accent line */}
        <div
          style={{
            position: "absolute",
            left: 36,
            right: 36,
            top: 108,
            height: 7,
            borderRadius: 4,
            background:
              "linear-gradient(90deg, #a78bfa 0%, #c4b5fd 50%, #ea580c 100%)",
            boxShadow:
              "0 0 24px rgba(167,139,250,0.85), 0 0 48px rgba(234,88,12,0.45)",
          }}
        />
        {/* Highlight gleam */}
        <div
          style={{
            position: "absolute",
            left: 50,
            top: 40,
            width: 56,
            height: 14,
            borderRadius: 56,
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.45) 0%, transparent 70%)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
