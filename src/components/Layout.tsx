import type { ReactNode } from 'react';

interface LayoutProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export function Layout({ title, description, children }: LayoutProps) {
  return (
    <div>
      <header>
        <h1 className="hero-title test">{title ?? 'My React SSR Blog'}</h1>
        {description ? <p className="hero-subtitle">{description}</p> : null}
        <p style={{ color: 'yellow' }}>fdfdffㄑfddfs</p>
        <span className="test">dfdfㄑffdxxf</span>
      </header>
      <main>
        {children}
      </main>
      <footer>
        <span>© {new Date().getFullYear()} | Built with React + Express</span>
      </footer>
    </div>
  );
}
