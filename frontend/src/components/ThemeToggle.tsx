import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Sparkles, Eye, Check } from 'lucide-react';
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
      subLabel: 'Halka Pink & Eye Resolution',
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyber-850 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-all shadow-sm"
        title="Switch UI Display Mode"
      >
        <CurrentIcon className={`w-4 h-4 ${theme === 'light' ? 'text-pink-500' : theme === 'night' ? 'text-amber-400' : 'text-cyber-accent'}`} />
        <span className="hidden sm:inline">{currentOption.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 glass-panel bg-cyber-900 border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-800/80 mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Theme Selector</p>
          </div>

          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800/70 transition-colors ${
                  isSelected ? 'text-cyber-accent font-semibold bg-cyber-accent/10' : 'text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${opt.id === 'light' ? 'text-pink-400' : opt.id === 'night' ? 'text-amber-400' : 'text-cyber-accent'}`} />
                  <div>
                    <p className="leading-tight text-xs">{opt.label}</p>
                    <p className="text-[10px] text-slate-400 font-normal">{opt.subLabel}</p>
                  </div>
                </div>

                {isSelected && <Check className="w-3.5 h-3.5 text-cyber-accent shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
