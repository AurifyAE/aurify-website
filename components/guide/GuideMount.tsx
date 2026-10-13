"use client";

import dynamic from "next/dynamic";

// ssr: false is only allowed in a client module; it keeps three.js out of the
// server render and the first-paint bundle.
const GuideCanvas = dynamic(() => import("./GuideCanvas"), { ssr: false });

export default function GuideMount() {
  return <GuideCanvas />;
}
