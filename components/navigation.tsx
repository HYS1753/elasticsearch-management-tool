'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Database, FileText, BookOpen, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const navItems = [
  { href: '/cluster', label: 'Cluster Info', icon: Activity },
  { href: '/indices', label: 'Indices', icon: Database },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/dictionary', label: 'Dictionary', icon: BookOpen },
  { href: '/boosting', label: 'Category Boosting', icon: TrendingUp },
];

export function Navigation() {
  const pathname = usePathname();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const updateIndicator = () => {
      const activeIndex = navItems.findIndex((item) => pathname.startsWith(item.href));
      
      if (activeIndex !== -1 && itemRefs.current[activeIndex] && navRef.current) {
        const activeElement = itemRefs.current[activeIndex];
        const navRect = navRef.current.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();
        
        setIndicatorStyle({
          left: activeRect.left - navRect.left,
          width: activeRect.width,
        });
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [pathname]);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="border-b bg-white shadow-sm sticky top-[73px] z-40">
      <div className="container mx-auto px-6">
        <div ref={navRef} className="relative flex items-center gap-1 py-2">
          {/* Liquid crystal animated background */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-9 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-200/50 backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.width > 0 ? 1 : 0,
            }}
          />
          
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
                  relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                  ${
                    active
                      ? 'text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
