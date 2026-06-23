"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

export type ProofTab = {
  id: "before" | "build" | "ready";
  label: string;
  eyebrow: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  gemClassName: string;
};

export type ProofShowcaseProps = {
  title: string;
  tabs: readonly ProofTab[];
};

export default function ProofShowcase({ title, tabs }: ProofShowcaseProps) {
  const [activeTabId, setActiveTabId] = useState<ProofTab["id"]>("before");
  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0],
    [activeTabId, tabs],
  );

  return (
    <article className="overflow-hidden rounded-[2rem] border border-neutral-200/80 bg-[#f7f7f5] shadow-[0_18px_52px_rgba(15,23,42,0.08)]">
      <div className="p-5 sm:p-7 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Proof System</p>
            <h3 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.045em] text-neutral-950 sm:text-4xl">
              {title}
            </h3>
            <div className="relative mt-3 min-h-[8.3rem] max-w-3xl overflow-hidden sm:min-h-[5.3rem]">
              <motion.p
                key={activeTab.id}
                className="absolute inset-0 text-base font-medium leading-relaxed text-neutral-600 sm:text-lg"
                initial={{ y: 4 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeTab.subtitle}
              </motion.p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-[1.45rem] border border-black/5 bg-neutral-200/60 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:min-w-[25rem]">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex min-h-11 items-center justify-center gap-1.5 rounded-[1rem] px-2 text-xs font-semibold transition sm:gap-2 sm:px-3 sm:text-sm ${
                    isActive
                      ? "bg-white text-neutral-950 shadow-[0_9px_20px_rgba(15,23,42,0.13)] ring-1 ring-black/5"
                      : "text-neutral-500 hover:bg-white/55 hover:text-neutral-900"
                  }`}
                  aria-pressed={isActive}
                >
                  <span className={`h-3 w-3 rounded-full ${tab.gemClassName}`} aria-hidden="true" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200/80 bg-[#f2f2ef] p-3 sm:p-4">
        <div className="hidden" aria-hidden="true">
          {tabs.map((tab) => (
            <Image
              key={`preload-${tab.id}`}
              src={tab.imageSrc}
              alt=""
              width={1024}
              height={1280}
              priority
              sizes="1px"
            />
          ))}
        </div>
        <div className="overflow-hidden rounded-[1.35rem] bg-[#f8f8f6]">
          <div className="relative h-[31rem] overflow-hidden sm:h-[40rem] lg:h-[58rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab.id}
                className="absolute inset-0 bg-cover bg-[position:50%_7%]"
                style={{ backgroundImage: `url(${activeTab.imageSrc})` }}
                initial={{ scale: 0.992 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.998 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                role="img"
                aria-label={activeTab.imageAlt}
              >
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </article>
  );
}
