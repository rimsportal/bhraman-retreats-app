"use client";

import { CircleDot, Compass, MoonStar, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { EditorialHeading, SectionContainer, SectionLabel } from "@/components/design-system";
import { trackAnonymousProductEvent } from "@/lib/anonymous-analytics.mjs";
import type { ExperienceId } from "@/lib/experience-model.mjs";

const BreathingExperience = dynamic(
  () => import("@/components/experiences/breathing-experience").then((mod) => mod.BreathingExperience),
  { ssr: false }
);
const DailyPause = dynamic(
  () => import("@/components/experiences/daily-pause").then((mod) => mod.DailyPause),
  { ssr: false }
);
const ElementReflection = dynamic(
  () => import("@/components/experiences/element-reflection").then((mod) => mod.ElementReflection),
  { ssr: false }
);
const IntentionExperience = dynamic(
  () => import("@/components/experiences/intention-experience").then((mod) => mod.IntentionExperience),
  { ssr: false }
);

const EXPERIENCES = [
  { id: "breathing", title: "One-Minute Breathing", copy: "Five gentle cycles of inhale, hold and exhale.", meta: "About 1 minute", icon: Wind, element: "air" },
  { id: "intention", title: "Choose Your Intention", copy: "Name the quality you want to make room for today.", meta: "A quiet choice", icon: Compass, element: "fire" },
  { id: "element-reflection", title: "Which Element Needs Attention?", copy: "Five reflective questions and one elemental invitation.", meta: "Up to 5 questions", icon: CircleDot, element: "earth" },
  { id: "daily-pause", title: "Daily Pause", copy: "Receive one small mindful activity for this day.", meta: "Under 2 minutes", icon: MoonStar, element: "space" },
] as const;

export function ExperienceBhraman({ label, title, copy }: { label: string; title: string; copy: string }) {
  const [active, setActive] = useState<ExperienceId | null>(null);
  useEffect(() => {
    if (!active) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setActive(null); };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [active]);
  const open = (id: ExperienceId) => { setActive(id); trackAnonymousProductEvent("experience_started", { experience: id }); };

  return (
    <SectionContainer className="experience-module">
      {!active ? <>
        <header className="experience-heading"><SectionLabel>{label}</SectionLabel><EditorialHeading>{title}</EditorialHeading><p>{copy}</p><small>Optional experiences · No signup · Sound is always your choice</small></header>
        <div className="experience-menu" aria-label="Experience Bhraman options">
          {EXPERIENCES.map((experience, index) => { const Icon = experience.icon; return <button type="button" data-element={experience.element} key={experience.id} onClick={() => open(experience.id)}><span className="experience-number">0{index + 1}</span><Icon aria-hidden="true" /><strong>{experience.title}</strong><p>{experience.copy}</p><small>{experience.meta}</small></button>; })}
        </div>
      </> : <div className="experience-active" aria-live="polite">
        {active === "breathing" && <BreathingExperience onExit={() => setActive(null)} />}
        {active === "intention" && <IntentionExperience onExit={() => setActive(null)} />}
        {active === "element-reflection" && <ElementReflection onExit={() => setActive(null)} />}
        {active === "daily-pause" && <DailyPause onExit={() => setActive(null)} />}
      </div>}
    </SectionContainer>
  );
}