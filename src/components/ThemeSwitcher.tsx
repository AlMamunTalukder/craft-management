"use client";

import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useColorScheme } from "@mui/material/styles";
import { useState, useEffect, useRef } from "react";

export default function ThemeSwitcher() {
  const { mode, setMode } = useColorScheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted || !mode) {
    return (
      <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 animate-pulse" />
    );
  }

  const options = [
    { value: "light", label: "Light", icon: Sun, desc: "Bright & clean" },
    { value: "dark", label: "Dark", icon: Moon, desc: "Easy on eyes" },
    { value: "system", label: "System", icon: Monitor, desc: "Follow OS" },
  ] as const;

  const current = options.find((o) => o.value === mode) || options[2];
  const CurrentIcon = current.icon;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle theme"
        className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-white hover:text-[#4F0187] hover:border-white backdrop-blur transition-all duration-150 shadow-sm"
      >
        <CurrentIcon size={16} className={mode === "dark" ? "rotate-0" : mode === "light" ? "rotate-0" : ""} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-40 w-[220px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 pb-2 pt-1">
            <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">Theme</p>
          </div>
          {options.map((opt) => {
            const Icon = opt.icon;
            const active = mode === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setMode(opt.value as any);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  active ? "bg-[#4F0187]/10 dark:bg-violet-500/15 text-[#4F0187] dark:text-violet-300" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${active ? "bg-[#4F0187] dark:bg-violet-600 text-white border-[#4F0187] dark:border-violet-600" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}>
                  <Icon size={16} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className={`block text-sm font-semibold leading-none ${active ? "text-[#4F0187] dark:text-violet-300" : "text-slate-900 dark:text-slate-100"}`}>{opt.label}</span>
                  <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-none mt-0.5">{opt.desc}</span>
                </span>
                {active && <Check size={16} className="text-[#4F0187] dark:text-violet-400 shrink-0" />}
              </button>
            );
          })}
          <div className="px-3 py-2 mt-1 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">Applies instantly • Saved</p>
          </div>
        </div>
      )}
    </div>
  );
}
