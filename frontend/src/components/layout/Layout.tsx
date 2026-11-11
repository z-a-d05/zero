import React from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-apple-gray flex flex-col font-sans text-apple-text antialiased">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
};

