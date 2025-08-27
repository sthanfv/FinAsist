import React, { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <header className="bg-card shadow-soft p-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-primary font-headline">FinAssist</h1>
        {/* Navigation items can be added here */}
      </header>
      <main className="flex-1 p-4 container mx-auto">{children}</main>
      <footer className="bg-card shadow-soft p-4 text-center text-muted-foreground">
        © 2025 FinAssist
      </footer>
    </div>
  );
}
