/**
 * Single GSAP registration point.
 * Every client component imports gsap/ScrollTrigger/useGSAP from here -
 * never from the packages directly - so plugins register exactly once.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };
