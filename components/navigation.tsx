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
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const updateIndicator = () => {
      // 메인 페이지('/')인 경우 인디케이터 숨김
      if (pathname === '/') {
        setIndicatorStyle({ left: 0, width: 0, opacity: 0 });
        return;
      }

      const activeIndex = navItems.findIndex((item) => pathname.startsWith(item.href));
      
      if (activeIndex !== -1 && itemRefs.current[activeIndex] && navRef.current) {
        const activeElement = itemRefs.current[activeIndex];
        const navRect = navRef.current.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();
        
        setIndicatorStyle({
          left: activeRect.left - navRect.left,
          width: activeRect.width,
          opacity: 1,
        });
      } else {
        setIndicatorStyle({ left: 0, width: 0, opacity: 0 });
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [pathname]);

  const isActive = (href: string) => pathname !== '/' && pathname.startsWith(href);

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md shadow-sm sticky top-[73px] z-40">
      <div className="container mx-auto px-6">
        <div ref={navRef} className="relative flex items-center gap-1 py-2">
          {/* Liquid crystal animated background with jelly effect */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-10 rounded-xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.12) 100%)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(59, 130, 246, 0.15)',
            }}
          >
            {/* Inner glow effect for more depth */}
            <div 
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 60%)',
              }}
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
                  relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 z-10
                  ${
                    active
                      ? 'text-blue-700 scale-105'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 hover:scale-102'
                  }
                `}
              >
                <Icon className={`h-4 w-4 transition-transform duration-300 ${active ? 'scale-110' : ''}`} />
                <span className="relative">
                  {item.label}
                  {active && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
