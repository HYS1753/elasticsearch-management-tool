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
      className={`border-b bg-slate-50/95 backdrop-blur-lg shadow-sm fixed top-[73px] left-0 right-0 z-40 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="relative flex items-center gap-2 py-3">
          {/* Sliding liquid crystal indicator */}
          <div
            className="absolute pointer-events-none rounded-2xl transition-all duration-500 ease-out"
            style={{
              width: indicatorStyle.width,
              left: indicatorStyle.left,
              opacity: indicatorStyle.opacity,
              height: '44px',
              top: '12px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.9) 100%)',
              boxShadow: '0 2px 12px rgba(148, 163, 184, 0.12), 0 1px 3px rgba(148, 163, 184, 0.18), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(148, 163, 184, 0.25)',
            }}
          >
            {/* Liquid droplet inner glow */}
            <div 
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.3) 40%, transparent 70%)',
              }}
            />
            <div 
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 70% 80%, rgba(148, 163, 184, 0.06) 0%, transparent 50%)',
              }}
            />
            <div 
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(148, 163, 184, 0.08) 0%, transparent 100%)',
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
                  group relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300
                  ${
                    active
                      ? 'text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }
                `}
              >
                {/* Hover effect for non-active items */}
                {!active && (
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.04) 0%, rgba(148, 163, 184, 0.08) 100%)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(148, 163, 184, 0.1)',
                    }}
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
