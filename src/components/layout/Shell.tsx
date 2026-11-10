import { useState, type ReactNode } from 'react';
import { HeartPulse } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Toasts } from '../ui/Toasts';
import { CLINIC } from '../../data/mock';
import { faDigits } from '../../lib/utils';

export function Shell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-base-200">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-dvh flex-col lg:mr-[276px]">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-[1500px] flex-1 px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
          {children}
        </main>
        <footer className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center justify-between gap-2 border-t border-base-300/60 px-4 py-3 text-[9px] text-base-content/35 sm:px-6">
          <span className="flex items-center gap-1">
            <HeartPulse className="size-3 text-primary" />
            {CLINIC.name} — {CLINIC.hospital}
          </span>
          <span>نسخه نمایشی {CLINIC.license} · تمام داده‌ها نمونه و در مرورگر شماست</span>
          <span>پشتیبانی: {faDigits('021-88776655')}</span>
        </footer>
      </div>
      <Toasts />
    </div>
  );
}
