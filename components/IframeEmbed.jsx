// components/IframeEmbed.jsx
import React from "react";

export default function IframeEmbed({
  src = "https://example.com",
  minHeight = 1200,
  loading = "eager",
  allowFullscreen = true,
  referrerPolicy = "no-referrer",
}) {
  return (
    <div style={{ width: "100%", display: "block" }}>
      <iframe
        src={src}
        style={{ width: "100%", minHeight: Number(minHeight) || 0, border: 0, display: "block" }}
        loading={loading}
        referrerPolicy={referrerPolicy}
        allowFullScreen={!!allowFullscreen}
      />
    </div>
  );
}
