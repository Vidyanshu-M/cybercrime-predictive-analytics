import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Sparkles, Check } from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: { id: ThemeMode; label: string; subLabel: string; icon: React.FC<{ className?: string }> }[] = [
    {
      id: 'dark',
      label: 'Dark Mode',
      subLabel: 'Cyber Midnight Navy',
      icon: Moon,
    },
    {
      id: 'night',
      label: 'Night Mode',
      subLabel: 'OLED Black & Eye Care',
      icon: Sparkles,
    },
    {
      id: 'light',
      label: 'Light Mode',
      subLabel: 'Halka Pink & Soft Rose',
      icon: Sun,
    },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = options.find((o) => o.id === theme) || options[0];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyber-850 hover:bg-rose-100/60 dark:hover:bg-slate-800 night:hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 night:text-slate-200 transition-all shadow-sm"
        title="Switch UI Display Mode"
      >
        <CurrentIcon className={`w-4 h-4 ${theme === 'light' ? 'text-pink-500' : theme === 'night' ? 'text-amber-400' : 'text-cyber-accent'}`} />
        <span className="hidden sm:inline">{currentOption.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 glass-panel rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-800/80 mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Theme Selector
            </p>
          </div>

          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;

            const getItemHoverStyle = () => {
              if (opt.id === 'dark') {
                return 'hover:bg-sky-500/15 hover:text-sky-400 hover:border-sky-500/30';
              }
              if (opt.id === 'night') {
                return 'hover:bg-amber-500/15 hover:text-amber-400 hover:border-amber-500/30';
              }
              return 'hover:bg-pink-500/15 hover:text-pink-500 hover:border-pink-500/30';
            };

            const getSelectedStyle = () => {
              if (!isSelected) return 'text-slate-700 dark:text-slate-300 night:text-slate-300 border-transparent';
              if (opt.id === 'dark') return 'text-sky-400 font-semibold bg-sky-500/20 border-sky-500/40';
              if (opt.id === 'night') return 'text-amber-400 font-semibold bg-amber-500/20 border-amber-500/40';
              return 'text-pink-500 font-semibold bg-pink-500/20 border-pink-500/40';
            };

            return (
              <button
                key={opt.id}
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl border flex items-center justify-between transition-all my-0.5 ${getSelectedStyle()} ${getItemHoverStyle()}`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${opt.id === 'light' ? 'text-pink-500' : opt.id === 'night' ? 'text-amber-400' : 'text-sky-400'}`} />
                  <div>
                    <p className="leading-tight text-xs font-semibold">{opt.label}</p>
                    <p className="text-[10px] opacity-75 font-normal">{opt.subLabel}</p>
                  </div>
                </div>

                {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
