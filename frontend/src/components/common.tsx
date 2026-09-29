'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Book, Wrench, Edit3, Grid, Menu, X, Search, BookMarked } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

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
        'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap',
        active
          ? 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/25'
          : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
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
        <h2 className="text-xl font-bold tech-gradient-text">AI探索者</h2>
        <button
          className="p-2 rounded-lg hover:bg-muted transition-colors"
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
        'tech-card p-6',
        className
      )}
    >
      {icon && (
        <div className="mb-4 p-3 bg-primary/10 text-primary rounded-xl inline-flex tech-icon-wrapper">
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
              className="tech-tag"
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
        'tech-tag',
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
        className="w-full pl-12 pr-4 py-3 border-2 border-border rounded-xl bg-card focus:ring-2 focus:ring-ring focus:border-primary transition-all"
      />
    </div>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  onNavClick?: (page: string) => void;
  currentPage?: string;
}

/**
 * 顶部导航的四个栏目。它们都是「容器」——各自下辖多条内容或多个工具，因此保持等权。
 * 「知识问答」是单个应用，与它们不同级，刻意不放进这个数组，见 Layout 内的 askCta。
 */
const NAV_LINKS = [
  { id: 'concepts', icon: <Book size={20} />, label: '概念库', href: '/concepts' },
  { id: 'tools', icon: <Wrench size={20} />, label: 'AI工具箱', href: '/tools' },
  { id: 'notes', icon: <Edit3 size={20} />, label: '知识笔记', href: '/notes' },
  { id: 'demos', icon: <Grid size={20} />, label: '应用广场', href: '/demos' },
];

export const Layout: React.FC<LayoutProps> = ({ children, onNavClick, currentPage = 'home' }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const pathname = usePathname();

  // 当前栏目高亮以路由为准：NavLink 渲染的是原生 <a>，点击即整页刷新，
  // 靠点击瞬间的 state 记录高亮在刷新后必然丢失（此前也没有任何页面传 currentPage，等于高亮一直没生效）。
  const matchedNav = NAV_LINKS.find(
    (link) => pathname === link.href || pathname.startsWith(`${link.href}/`)
  );
  const activePage = matchedNav ? matchedNav.id : currentPage;
  const isQaActive = pathname === '/qa';

  const handleNavClick = (page: string) => {
    setSidebarOpen(false);
    if (onNavClick) {
      onNavClick(page);
    }
  };

  /**
   * 「知识问答」入口。
   *
   * 它是站内唯一的 RAG 能力入口，也是这个项目最想被访客看到的能力，所以不能只沉在应用广场里；
   * 但它和提示词优化器、AI 概念解释器一样，只是「应用广场里的一个应用」，与四个栏目不同级，
   * 于是做成实心强调按钮：视觉权重最高，同时和「栏目」相比在语义上就不一样。
   *
   * 视觉语言上与品牌同源：logo 图形、logo 字标、tech-card 顶边用的都是「青→紫」渐变，
   * CTA 也用同一配方（135deg primary→accent），否则横条两端的两个彩色点一个渐变一个平涂，
   * 色相对不上，看起来像两个来源的组件。圆角用 rounded-lg（= var(--radius)，与卡片一致），
   * 不再用 rounded-xl（20px，在 40px 高的按钮上正好是全胶囊），阴影收敛到 shadow-md。
   * 应用广场里 /qa 的卡片保留——广场是完整目录，这里是快捷入口，两者不冲突。
   */
  const askCta = (extraClassName = '') => (
    <Link
      href="/qa"
      onClick={() => handleNavClick('qa')}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg whitespace-nowrap',
        'text-primary-foreground bg-gradient-to-br from-primary to-accent',
        'shadow-md shadow-primary/20',
        'hover:shadow-lg hover:shadow-primary/25 hover:brightness-105 transition-all duration-200',
        isQaActive && 'ring-2 ring-primary/40 ring-offset-2 ring-offset-background',
        extraClassName
      )}
    >
      <BookMarked size={20} />
      <span>知识问答</span>
    </Link>
  );

  return (
    <div className="flex flex-col bg-background text-foreground min-h-screen">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="md:hidden flex items-center justify-between">
            <button
              className="p-2 rounded-lg hover:bg-muted transition-colors z-10"
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
              <Image src="/logo.svg" alt="AI探索者" width={32} height={32} />
              <span className="text-xl font-bold tech-gradient-text">AI探索者</span>
            </Link>

            {/* 移动端头部空间有限，知识问答只放一个图标按钮，与左侧汉堡按钮对称，抽屉里另有一份完整入口。
                视觉语言与桌面端 askCta 一致：品牌渐变 + rounded-lg + 轻阴影 */}
            <Link
              href="/qa"
              onClick={() => handleNavClick('qa')}
              aria-label="知识问答"
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md shadow-primary/20"
            >
              <BookMarked size={20} />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="flex items-center gap-3 mr-auto"
              onClick={() => handleNavClick('home')}
            >
              <Image src="/logo.svg" alt="AI探索者" width={36} height={36} />
              <span className="text-2xl font-bold tech-gradient-text">AI探索者</span>
            </Link>

            <nav className="flex justify-center space-x-2 overflow-x-auto flex-1 max-w-4xl mx-auto">
              {NAV_LINKS.map(link => (
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

            {askCta()}
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
                {askCta('w-full justify-center')}
                {NAV_LINKS.map(link => (
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