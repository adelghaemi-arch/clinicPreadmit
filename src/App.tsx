import { AppProvider, useApp } from './store/AppStore';
import { Login } from './pages/Login';
import { Shell } from './components/layout/Shell';
import { panelPages } from './panels';
import { panelMeta } from './config/panels';
import { Card } from './components/ui/Card';
import { EmptyState } from './components/ui/EmptyState';
import { FileQuestion } from 'lucide-react';

function AppContent() {
  const { user, page } = useApp();

  if (!user) {
    return (
      <>
        <Login />
      </>
    );
  }

  const pages = panelPages[user.role];
  const fallbackKey = panelMeta[user.role].nav[0]?.id ?? 'dashboard';
  const Page = pages[page] ?? pages[fallbackKey];

  return (
    <Shell>
      <div key={`${user.role}-${page}`} className="animate-fade-up">
        {Page ? (
          <Page />
        ) : (
          <Card>
            <EmptyState
              icon={FileQuestion}
              title="صفحه مورد نظر یافت نشد"
              description="از منوی کنار، یکی از بخش‌های پنل را انتخاب کنید."
            />
          </Card>
        )}
      </div>
    </Shell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
