'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrainCircuit, Home, User, LogOut, FileText, Lightbulb, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { signOutUser } from '@/lib/firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile } = useAuth();

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/test', label: 'Start Test', icon: FileText },
    { href: '/dashboard/analysis', label: 'AI Analysis', icon: Lightbulb },
    { href: '/dashboard/study-plan', label: 'Study Plan', icon: BookOpen },
    { href: '/profile', label: 'Profile', icon: User },
  ];
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="hidden border-r bg-card md:block w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span>BrainBoost IQ</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  pathname === item.href && 'bg-muted text-primary'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
             <Avatar className="h-9 w-9">
                <AvatarImage src={userProfile?.photoURL || ''} alt={userProfile?.displayName || ''} />
                <AvatarFallback>{getInitials(userProfile?.displayName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold leading-none">{userProfile?.displayName}</p>
                <p className="text-xs text-muted-foreground">{userProfile?.email}</p>
              </div>
          </div>
          <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
