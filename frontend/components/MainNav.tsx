interface NavLink {
  label: string;
  href: string;
}

const links: NavLink[] = [
  { label: '首頁', href: '/' },
  { label: '文章', href: '/posts' },
  { label: '關於', href: '/about' },
  { label: '項目 / Lab', href: '/works' },
];

interface MainNavProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function MainNav({ orientation = 'horizontal', className = '' }: MainNavProps) {
  const isHorizontal = orientation === 'horizontal';
  const baseClass = isHorizontal ? 'flex items-center gap-4 md:gap-6' : 'flex flex-col gap-2';
  return (
    <nav className={`${baseClass} ${className}`}>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className={`text-sm md:text-base font-medium text-slate-600 dark:text-slate-300 transition-colors duration-200 group ${isHorizontal ? 'relative' : 'py-1'}`}
        >
          <span>{link.label}</span>
          {isHorizontal && (
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
          )}
        </a>
      ))}
    </nav>
  );
}
