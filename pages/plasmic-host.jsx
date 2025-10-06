// pages/plasmic-host.jsx
import * as React from "react";
import { PlasmicCanvasHost, registerComponent } from "@plasmicapp/react-web/lib/host";
import IframeEmbed from "../components/IframeEmbed.jsx";

registerComponent(IframeEmbed, {
  name: "IframeEmbed",
  importPath: "./components/IframeEmbed",
  isDefaultExport: true,
  props: {
    src: {
      type: "string",
      displayName: "URL",
      defaultValue: "https://tsfdemo.com/features"
    },
    minHeight: {
      type: "number",
      displayName: "Min height (px)",
      defaultValue: 1200
    },
    loading: {
      type: "choice",
      options: ["eager", "lazy"],
      defaultValue: "eager"
    },
    allowFullscreen: {
      type: "boolean",
      displayName: "Allow fullscreen",
      defaultValue: true
    },
    referrerPolicy: {
      type: "choice",
      options: [
        "no-referrer",
        "no-referrer-when-downgrade",
        "origin",
        "origin-when-cross-origin",
        "same-origin",
        "strict-origin",
        "strict-origin-when-cross-origin",
        "unsafe-url"
      ],
      defaultValue: "no-referrer"
    }
  },
});

export default function PlasmicHost() {
  return <PlasmicCanvasHost />;
}
