import React from 'react';
import { cn } from '@/lib/utils';
import { Globe, Book, Wrench, Edit3, Grid, Menu, X, Search } from 'lucide-react';

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
        'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
        'fixed inset-y-0 left-0 z-30 w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
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
  const handleNavClick = (page: string, event?: React.MouseEvent) => {
    event?.preventDefault();
    setActivePage(page); // 更新当前激活的菜单项
    setSidebarOpen(false);
    if (onNavClick) {
      onNavClick(page);
    }
  };

  // 创建菜单项，确保激活状态一致
  const navLinks = [
    { id: 'home', icon: <Globe size={20} />, label: '首页' },
    { id: 'concepts', icon: <Book size={20} />, label: '概念库' },
    { id: 'tools', icon: <Wrench size={20} />, label: 'AI工具箱' },
    { id: 'notes', icon: <Edit3 size={20} />, label: '知识笔记' },
    { id: 'demos', icon: <Grid size={20} />, label: '应用广场' }
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {/* Header - 固定在顶部，不随内容滚动 */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold">AI 知识库</h1>
          </div>

        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 主内容区域 - 占据剩余空间，实现独立滚动 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 桌面设备侧边栏 - 固定位置，仅在内容超出时滚动 */}
        <div className="hidden md:block w-64 border-r border-border h-[calc(100vh-64px)]">
          <div className="p-4 h-full overflow-y-auto">
            <nav className="space-y-1">
              {navLinks.map(link => (
                <NavLink 
                  key={link.id} 
                  href="#" 
                  icon={link.icon} 
                  label={link.label} 
                  active={activePage === link.id} 
                  onClick={(e) => handleNavClick(link.id, e)} 
                />
              ))}
            </nav>
          </div>
        </div>

        {/* 移动设备侧边栏 */}
        {sidebarOpen && (
          <div className="md:hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
              <nav className="space-y-1">
                {navLinks.map(link => (
                  <NavLink 
                    key={link.id} 
                    href="#" 
                    icon={link.icon} 
                    label={link.label} 
                    active={activePage === link.id} 
                    onClick={(e) => handleNavClick(link.id, e)} 
                  />
                ))}
              </nav>
            </Sidebar>
          </div>
        )}

        {/* 右侧内容区域 - 可独立滚动 */}
        <main className="flex-1 overflow-auto p-4" style={{ overflowAnchor: 'none' }}>
          {children}
        </main>
      </div>
    </div>
  );
};