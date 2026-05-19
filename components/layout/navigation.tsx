'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Network, Settings2, FileText, SearchCode, BookOpen, BarChart3 } from 'lucide-react';

const navItems = [
  { href: '/cluster-information', label: 'Cluster Info', icon: Network },
  { href: '/cluster-dashboard', label: 'Cluster Dashboard', icon: BarChart3 },
  { href: '/indices-management', label: 'Indices Management', icon: Settings2 },
  { href: '/documents', label: 'Documents', icon: FileText },
  //{ href: '/boosting', label: 'Category Boosting', icon: TrendingUp },
  { href: '/query-explain', label: 'Query Explain', icon: SearchCode },
  { href: '/dictionary', label: 'Dictionary', icon: BookOpen },
];

export function Navigation() {
  const pathname = usePathname();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    width: number;
    left: number;
    opacity: number;
  }>({ width: 0, left: 0, opacity: 0 });

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // 스크롤 다운
        setIsVisible(false);
      } else {
        // 스크롤 업
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  useEffect(() => {
    const activeIndex = navItems.findIndex((item) => isActive(item.href));

    if (activeIndex !== -1 && itemRefs.current[activeIndex]) {
      const activeElement = itemRefs.current[activeIndex];
      if (activeElement) {
        setIndicatorStyle({
          width: activeElement.offsetWidth,
          left: activeElement.offsetLeft,
          opacity: 1,
        });
      }
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [pathname]);

  const isActive = (href: string) => pathname !== '/' && pathname.startsWith(href);

  return (
    <>
      <nav
        className={`border-b dark:border-slate-800/80 bg-slate-50/95 dark:bg-slate-950/90 backdrop-blur-lg shadow-sm fixed top-[73px] left-0 right-0 z-40 transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
      >
        <div className="w-full px-6">
          <div className="relative flex items-center gap-2 py-3">
            {/* Sliding liquid crystal indicator */}
            <div
              className="absolute pointer-events-none rounded-2xl transition-all duration-500 ease-out h-[44px] top-[12px] bg-gradient-to-br from-white/80 to-slate-50/90 dark:from-slate-800/80 dark:to-slate-900/90 shadow-[0_2px_12px_rgba(148,163,184,0.12),0_1px_3px_rgba(148,163,184,0.18),inset_0_1px_2px_rgba(255,255,255,0.9)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md border border-slate-400/25 dark:border-slate-800"
              style={{
                width: indicatorStyle.width,
                left: indicatorStyle.left,
                opacity: indicatorStyle.opacity,
              }}
            >
              {/* Liquid droplet inner glow */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.3)_40%,transparent_70%)] dark:bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.1)_0%,transparent_70%)]"
              />
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none bg-[radial-gradient(ellipse_at_70%_80%,rgba(148,163,184,0.06)_0%,transparent_50%)] dark:bg-[radial-gradient(ellipse_at_70%_80%,rgba(255,255,255,0.03)_0%,transparent_50%)]"
              />
            </div>

            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  className={`
                  group relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300
                  ${active
                      ? 'text-slate-900 dark:text-slate-50'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50 dark:text-slate-400 dark:hover:text-slate-200'
                    }
                `}
                >
                  {/* Hover effect for non-active items */}
                  {!active && (
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-slate-400/[0.04] to-slate-400/[0.08] dark:from-white/[0.03] dark:to-white/[0.05] transition-opacity duration-300 pointer-events-none"
                    />
                  )}

                  <Icon className={`h-4 w-4 relative z-10 transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="relative z-10 transition-all duration-300">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
