import '@/styles/globals.css'
import { PlasmicRootProvider } from "@plasmicapp/react-web";
import { registerComponent } from "@plasmicapp/react-web/lib/host";
import Head from "next/head";
import Link from "next/link";
import { WalmartDashboard } from "../components/WalmartDashboard";

// Register the Walmart Dashboard component for Plasmic
registerComponent(WalmartDashboard, {
  name: "WalmartDashboard",
  importPath: "./components/WalmartDashboard",
  props: {
    apiBase: {
      type: "string",
      defaultValue: "https://tsf-demand-back.onrender.com/api/walmart"
    }
  }
});

export default function MyApp({ Component, pageProps }) {
  return (
    <PlasmicRootProvider Head={Head} Link={Link}>
      <Component {...pageProps} />
    </PlasmicRootProvider>
  );
}
