'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Book, Wrench, Edit3, Grid, Menu, X, Search } from 'lucide-react';
import Link from 'next/link';

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const NavLink: React.FC<NavLinkProps> = ({
  href,
  icon,
  label,
  active = false,
  onClick,
}) => {
  return (
    <a
      href={href}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap',
        active
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:hidden block'
      )}
      style={{ display: isOpen ? 'block' : 'block' }}
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-bold">AI探索者</h2>
        <button
          className="p-2 rounded-md hover:bg-muted transition-colors"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-4 h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

interface CardProps {
  title?: string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
  tags?: string[];
  onClick?: () => void;
  link?: string;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  className = '',
  icon,
  tags = [],
  onClick,
  link,
  children,
}) => {
  const CardContent = (
    <div
      className={cn(
        'bg-card border border-border rounded-xl p-6 transition-all duration-300 card-hover',
        className
      )}
    >
      {icon && (
        <div className="mb-4 p-3 bg-gradient-primary text-primary-foreground rounded-2xl inline-flex">
          {icon}
        </div>
      )}
      {title && <h3 className="text-xl font-bold mb-2">{title}</h3>}
      {description && <p className="text-muted-foreground mb-4 leading-relaxed">{description}</p>}
      {children}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs px-3 py-1.5 bg-secondary rounded-full text-secondary-foreground font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  if (link) {
    return (
      <a href={link} className="block hover:no-underline">
        {CardContent}
      </a>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        {CardContent}
      </div>
    );
  }

  return CardContent;
};

interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({ children, className = '' }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        'bg-secondary text-secondary-foreground',
        className
      )}
    >
      {children}
    </span>
  );
};

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '搜索...',
  value,
  onChange,
  onSearch,
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyPress={(e) => e.key === 'Enter' && onSearch?.()}
        className="w-full pl-12 pr-4 py-3 border border-input rounded-xl bg-background focus:ring-2 focus:ring-ring focus:border-primary transition-all shadow-sm focus:shadow-md"
      />
    </div>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  onNavClick?: (page: string) => void;
  currentPage?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavClick, currentPage = 'home' }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [activePage, setActivePage] = React.useState(currentPage);

  React.useEffect(() => {
    setActivePage(currentPage);
  }, [currentPage]);

  const handleNavClick = (page: string) => {
    setActivePage(page);
    setSidebarOpen(false);
    if (onNavClick) {
      onNavClick(page);
    }
  };

  const navLinks = [
    { id: 'concepts', icon: <Book size={20} />, label: '概念库', href: '/concepts' },
    { id: 'tools', icon: <Wrench size={20} />, label: 'AI工具箱', href: '/tools' },
    { id: 'notes', icon: <Edit3 size={20} />, label: '知识笔记', href: '/notes' },
    { id: 'demos', icon: <Grid size={20} />, label: '应用广场', href: '/demos' }
  ];

  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile && sidebarOpen) {
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  return (
    <div className="flex flex-col bg-background text-foreground min-h-screen">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="md:hidden flex items-center justify-between">
            <button
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors z-10"
              onClick={() => setSidebarOpen(true)}
              aria-label="打开菜单"
              style={{ display: 'block' }}
            >
              <Menu size={24} className="text-foreground" aria-hidden="true" />
            </button>
            
            <Link 
              href="/" 
              className="flex items-center gap-2"
              onClick={() => handleNavClick('home')}
            >
              <img src="/logo.svg" alt="AI探索者" className="w-8 h-8" />
              <span className="text-xl font-bold text-gradient">AI探索者</span>
            </Link>
            
            <div className="w-10"></div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="flex items-center gap-3 mr-auto"
              onClick={() => handleNavClick('home')}
            >
              <img src="/logo.svg" alt="AI探索者" className="w-9 h-9" />
              <span className="text-2xl font-bold text-gradient">AI探索者</span>
            </Link>
            
            <nav className="flex justify-center space-x-2 overflow-x-auto flex-1 max-w-4xl mx-auto">
              {navLinks.map(link => (
                <NavLink 
                  key={link.id} 
                  href={link.href} 
                  icon={link.icon} 
                  label={link.label} 
                  active={activePage === link.id} 
                  onClick={() => handleNavClick(link.id)} 
                />
              ))}
            </nav>
            
            <div className="w-40"></div>
          </div>
        </div>
      </header>

      <div className="flex-1">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {sidebarOpen && (
          <div className="md:hidden z-50 relative">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
              <nav className="space-y-2">
                {navLinks.map(link => (
                  <NavLink 
                    key={link.id} 
                    href={link.href} 
                    icon={link.icon} 
                    label={link.label} 
                    active={activePage === link.id} 
                    onClick={() => handleNavClick(link.id)} 
                  />
                ))}
              </nav>
            </Sidebar>
          </div>
        )}

        <main className="p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};