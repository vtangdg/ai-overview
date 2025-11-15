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
        'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap',
        active
          ? 'text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground'
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
        <h2 className="text-xl font-bold">AI 知识库</h2>
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
        'bg-card border border-border rounded-lg p-5 transition-all duration-300 hover:shadow-md hover:border-primary/50',
        className
      )}
    >
      {icon && (
        <div className="mb-3 p-2 bg-primary/10 text-primary rounded-md inline-flex">
          {icon}
        </div>
      )}
      {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
      {description && <p className="text-muted-foreground mb-4">{description}</p>}
      {children}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-secondary rounded-full text-secondary-foreground"
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
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyPress={(e) => e.key === 'Enter' && onSearch?.()}
        className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-primary transition-all"
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
  const [activePage, setActivePage] = React.useState(currentPage); // 跟踪当前激活的菜单项

  // 当外部currentPage变化时，更新内部activePage状态
  React.useEffect(() => {
    setActivePage(currentPage);
  }, [currentPage]);

  // 处理导航点击
  const handleNavClick = (page: string) => {
    // 不再阻止默认行为，让链接正常跳转
    setActivePage(page); // 更新当前激活的菜单项
    setSidebarOpen(false);
    if (onNavClick) {
      onNavClick(page);
    }
  };

  // 创建菜单项，为每个链接添加正确的href值
  const navLinks = [
    { id: 'concepts', icon: <Book size={20} />, label: '概念库', href: '/concepts' },
    { id: 'tools', icon: <Wrench size={20} />, label: 'AI工具箱', href: '/tools' },
    { id: 'notes', icon: <Edit3 size={20} />, label: '知识笔记', href: '/notes' },
    { id: 'demos', icon: <Grid size={20} />, label: '应用广场', href: '/demos' }
  ];

  // 确保组件在移动设备上正确初始化
  React.useEffect(() => {
    // 检测屏幕宽度变化
    const handleResize = () => {
      // 确保在大屏幕切换到小屏幕时，菜单状态正确
      const isMobile = window.innerWidth < 768; // 假设md断点为768px
      if (isMobile && sidebarOpen) {
        // 保持移动端菜单状态
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  return (
    <div className="flex flex-col bg-background text-foreground">
      {/* Header - 固定在顶部，包含顶部导航菜单 */}
      <header className="sticky top-0 z-50 bg-gray-100 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          {/* 移动端布局：左侧菜单按钮，中间标题 */}
          <div className="md:hidden flex items-center justify-between">
            <button
              className="p-2 rounded-md hover:bg-muted transition-colors z-10"
              onClick={() => setSidebarOpen(true)}
              aria-label="打开菜单"
              style={{ display: 'block' }}
            >
              <Menu size={24} className="text-foreground" aria-hidden="true" />
            </button>
            
            <Link 
              href="/" 
              className="text-xl font-bold"
              onClick={() => handleNavClick('home')}
            >
              AI 知识库
            </Link>
            
            {/* 空div用于平衡布局 */}
            <div className="w-10"></div>
          </div>
          
          {/* 桌面端布局：标题在左侧，菜单在中间 */}
          <div className="hidden md:flex items-center space-x-4">
            {/* 标题放在左侧 */}
            <Link 
              href="/" 
              className="text-xl font-bold mr-auto"
              onClick={() => handleNavClick('home')}
            >
              AI 知识库
            </Link>
            
            {/* 菜单放在中间位置 */}
            <nav className="flex justify-center space-x-1 overflow-x-auto flex-1 max-w-3xl mx-auto">
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
            
            {/* 右侧占位，确保菜单居中 */}
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* 主内容区域 - 占据剩余空间，实现独立滚动 */}
      <div className="flex-1">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* 移动设备侧边栏 - 提高z-index确保可见 */}
        {sidebarOpen && (
          <div className="md:hidden z-50 relative">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
              <nav className="space-y-1">
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

        {/* 主内容区域 - 确保可以正常滚动 */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
};