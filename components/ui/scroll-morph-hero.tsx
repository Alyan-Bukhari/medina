"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

export type MorphHeroItem = {
  src: string;
  title: string;
  href: string;
  caption?: string;
};

interface FlipCardProps {
  item: MorphHeroItem;
  index: number;
  target: { x: number; y: number; rotation: number; scale: number; opacity: number };
  reducedMotion: boolean;
}

const IMG_WIDTH = 176;
const IMG_HEIGHT = 248;

function FlipCard({ item, index, target, reducedMotion }: FlipCardProps) {
  return (
    <motion.a
      href={item.href}
      aria-label={`${item.title}${item.caption ? ` — ${item.caption}` : ""}`}
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 40, damping: 15 }
      }
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
        marginLeft: -IMG_WIDTH / 2,
        marginTop: -IMG_HEIGHT / 2,
        transformStyle: "preserve-3d",
        perspective: "1000px",
        zIndex: Math.round(400 + target.y),
        pointerEvents: "auto",
      }}
      className="group cursor-pointer"
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={reducedMotion ? undefined : { rotateY: 180 }}
      >
        <div
          className="absolute inset-0 overflow-hidden rounded-xl bg-[#cdc2b0] shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            backgroundImage: `url(${item.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <img
            src={item.src}
            alt={item.title}
            className="absolute inset-0 block h-full w-full"
            style={{ objectFit: "cover", objectPosition: "center", width: "100%", height: "100%" }}
            loading={index < 4 ? "eager" : "lazy"}
            decoding="async"
          />
          <div className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-transparent" />
          <p className="absolute bottom-0 left-0 right-0 bg-[#372522]/80 px-2 py-1.5 text-center text-[10px] font-medium uppercase tracking-wide text-[#f2e6d6]">
            {item.title}
          </p>
        </div>

        <div
          className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-[#af522a]/40 bg-[#372522] p-4 shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#af522a]">
            {item.caption || "View"}
          </p>
          <p className="text-center text-sm font-medium leading-tight text-[#f2e6d6]">
            {item.title}
          </p>
        </div>
      </motion.div>
    </motion.a>
  );
}

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

function arcLayout(
  i: number,
  total: number,
  size: { width: number; height: number },
  rotateValue: number,
  parallaxValue: number
) {
  const width = size.width || 800;
  const height = size.height || 800;
  const isMobile = width < 768;
  const arcRadius = Math.min(width * (isMobile ? 0.92 : 0.7), height * 0.82);
  const arcApexY = height * (isMobile ? 0.04 : -0.06);
  const arcCenterY = arcApexY + arcRadius;
  const spreadAngle = isMobile ? 92 : 118;
  const startAngle = -90 - spreadAngle / 2;
  const step = spreadAngle / Math.max(total - 1, 1);
  const scrollProgressClamped = Math.min(Math.max(rotateValue / 360, 0), 1);
  const boundedRotation = -scrollProgressClamped * spreadAngle * 0.55;
  const currentArcAngle = startAngle + i * step + boundedRotation;
  const arcRad = (currentArcAngle * Math.PI) / 180;
  const rawRotation = currentArcAngle + 90;
  const rotation = Math.max(-18, Math.min(18, rawRotation));

  return {
    x: Math.cos(arcRad) * arcRadius + parallaxValue,
    y: Math.sin(arcRad) * arcRadius + arcCenterY,
    rotation,
    scale: isMobile ? 0.92 : 1.12,
    opacity: 1,
  };
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function useSectionProgress(target: React.RefObject<HTMLElement | null>) {
  const progress = useMotionValue(0);

  useEffect(() => {
    const update = () => {
      const el = target.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) {
        progress.set(0);
        return;
      }
      const scrolled = -el.getBoundingClientRect().top;
      progress.set(Math.min(1, Math.max(0, scrolled / total)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("rt:scroll", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("rt:scroll", update);
    };
  }, [target, progress]);

  return progress;
}

function useSmoothNumber(source: MotionValue<number>, reducedMotion: boolean) {
  const spring = useSpring(source, { stiffness: 40, damping: 20 });
  return reducedMotion ? source : spring;
}

export type IntroAnimationProps = {
  items: MorphHeroItem[];
  className?: string;
  introTitle?: string;
  introEyebrow?: string;
  eyebrow?: string;
  activeBody?: string;
  onActiveChange?: (active: boolean) => void;
};

export default function IntroAnimation({
  items,
  className,
  introTitle = "The full collection.",
  introEyebrow = "Scroll to explore",
  eyebrow = "Our Projects",
  activeBody = "Every development we have delivered in Lahore — plus Madina Mall & Residency, now live.",
  onActiveChange,
}: IntroAnimationProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const introLockedRef = useRef(false);

  const total = items.length;
  const scrollProgress = useSectionProgress(trackRef);
  const morphProgress = useTransform(scrollProgress, [0, 0.22], [0, 1]);
  const scrollRotate = useTransform(scrollProgress, [0.22, 1], [0, 360]);
  const smoothMorph = useSmoothNumber(morphProgress, reducedMotion);
  const smoothScrollRotate = useSmoothNumber(scrollRotate, reducedMotion);

  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
  }, []);

  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(el);
    setContainerSize({ width: el.offsetWidth, height: el.offsetHeight });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sticky = stickyRef.current;
    if (!sticky || !onActiveChange) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        onActiveChange(entry.isIntersecting && entry.intersectionRatio > 0.62);
      },
      { threshold: [0, 0.5, 0.62, 0.85, 1] }
    );
    io.observe(sticky);
    return () => io.disconnect();
  }, [onActiveChange]);

  useEffect(() => {
    const sticky = stickyRef.current;
    if (!sticky) return;

    if (reducedMotion) {
      introLockedRef.current = true;
      setIntroPhase("circle");
      return;
    }

    let cancelled = false;
    let lineTimer = 0;
    let circleTimer = 0;

    const lockToCircle = () => {
      cancelled = true;
      introLockedRef.current = true;
      window.clearTimeout(lineTimer);
      window.clearTimeout(circleTimer);
      setIntroPhase("circle");
    };

    const startIntro = () => {
      if (introLockedRef.current || cancelled) return;
      introLockedRef.current = true;
      lineTimer = window.setTimeout(() => {
        if (!cancelled) setIntroPhase("line");
      }, 500);
      circleTimer = window.setTimeout(() => {
        if (!cancelled) setIntroPhase("circle");
      }, 2500);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startIntro();
      },
      { threshold: 0.35 }
    );
    io.observe(sticky);

    const unsub = scrollProgress.on("change", (value) => {
      if (value > 0.02) lockToCircle();
    });

    return () => {
      cancelled = true;
      window.clearTimeout(lineTimer);
      window.clearTimeout(circleTimer);
      io.disconnect();
      unsub();
    };
  }, [reducedMotion, scrollProgress]);

  useEffect(() => {
    const container = stickyRef.current;
    if (!container || reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normalizedX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseX.set(normalizedX * 100);
    };
    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, reducedMotion]);

  const scatterPositions = useMemo(
    () =>
      items.map(() => ({
        x: (Math.random() - 0.5) * 1500,
        y: (Math.random() - 0.5) * 1000,
        rotation: (Math.random() - 0.5) * 180,
        scale: 0.6,
        opacity: 0,
      })),
    [items]
  );

  const [morphValue, setMorphValue] = useState(0);
  const [rotateValue, setRotateValue] = useState(0);
  const [parallaxValue, setParallaxValue] = useState(0);

  useEffect(() => {
    const unsubscribeMorph = smoothMorph.on("change", setMorphValue);
    const unsubscribeRotate = smoothScrollRotate.on("change", setRotateValue);
    const unsubscribeParallax = smoothMouseX.on("change", setParallaxValue);
    return () => {
      unsubscribeMorph();
      unsubscribeRotate();
      unsubscribeParallax();
    };
  }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

  const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1]);
  const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0]);

  return (
    <div ref={trackRef} className={cn("relative h-[420vh] w-full", className)}>
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full overflow-hidden bg-background"
      >
        <div className="flex h-full w-full flex-col items-center justify-center [perspective:1000px]">
          <div className="pointer-events-none absolute top-1/2 z-0 flex -translate-y-1/2 flex-col items-center justify-center text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={
                introPhase === "circle" && morphValue < 0.5
                  ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, filter: "blur(10px)" }
              }
              transition={{ duration: reducedMotion ? 0 : 1 }}
              className="max-w-3xl px-6 text-2xl font-medium tracking-tight text-foreground md:text-4xl"
            >
              {introTitle}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={
                introPhase === "circle" && morphValue < 0.5
                  ? { opacity: 0.5 - morphValue }
                  : { opacity: 0 }
              }
              transition={{ duration: reducedMotion ? 0 : 1, delay: 0.2 }}
              className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground"
            >
              {introEyebrow}
            </motion.p>
          </div>

          <motion.div
            style={{ opacity: contentOpacity, y: contentY }}
            className="pointer-events-none absolute top-[max(1.25rem,env(safe-area-inset-top))] z-10 flex flex-col items-center justify-center px-6 pt-4 text-center sm:px-10 sm:pt-6"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-[clamp(2.2rem,6.5vw,4.8rem)] font-black uppercase leading-[0.92] tracking-tight text-foreground">
              The full{" "}
              <em
                className="font-medium"
                style={{
                  fontFamily: "Fraunces, Iowan Old Style, Palatino, serif",
                  fontStyle: "italic",
                  textTransform: "none",
                }}
              >
                collection.
              </em>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{activeBody}</p>
          </motion.div>

          <div className="relative flex h-full w-full items-center justify-center">
            {items.map((item, i) => {
              let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

              if (reducedMotion) {
                target = arcLayout(i, total, containerSize, 0, 0);
              } else if (introPhase === "scatter") {
                target = scatterPositions[i] ?? target;
              } else if (introPhase === "line") {
                const lineSpacing = 196;
                const lineTotalWidth = total * lineSpacing;
                const lineX = i * lineSpacing - lineTotalWidth / 2;
                target = { x: lineX, y: 0, rotation: 0, scale: 0.92, opacity: 1 };
              } else {
                const minDimension = Math.min(
                  containerSize.width || 800,
                  containerSize.height || 800
                );
                const circleRadius = Math.min(minDimension * 0.32, 320);
                const circleAngle = (i / total) * 360;
                const circleRad = (circleAngle * Math.PI) / 180;
                const circlePos = {
                  x: Math.cos(circleRad) * circleRadius,
                  y: Math.sin(circleRad) * circleRadius,
                  rotation: circleAngle + 90,
                };
                const arcPos = arcLayout(
                  i,
                  total,
                  containerSize,
                  rotateValue,
                  parallaxValue
                );

                target = {
                  x: lerp(circlePos.x, arcPos.x, morphValue),
                  y: lerp(circlePos.y, arcPos.y, morphValue),
                  rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                  scale: lerp(1, arcPos.scale, morphValue),
                  opacity: 1,
                };
              }

              return (
                <FlipCard
                  key={`${item.href}-${item.src}-${i}`}
                  item={item}
                  index={i}
                  target={target}
                  reducedMotion={reducedMotion}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export { IntroAnimation as ScrollMorphHero };
