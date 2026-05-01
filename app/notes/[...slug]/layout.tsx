import Script from "next/script";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <>
      <Script
        src="https://tikzjax.com/v1/tikzjax.js"
        strategy={isDev ? "afterInteractive" : "beforeInteractive"}
      />
      {children}
    </>
  );
}
