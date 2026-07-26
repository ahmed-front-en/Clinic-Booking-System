"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, isAuthenticated } = useAuth();
  const { submit: logout, isPending } = useLogout();
  const router = useRouter();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface-container-low px-4">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Toggle menu">
            <Menu className="size-5" />
          </Button>
        )}
        <Link href="/" className="text-lg font-bold text-primary">
          HealthFlow
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar fallback={user.email} className="cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2.5 py-1.5 text-sm text-muted-foreground">
                {user.email}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/appointments")}>
                Appointments
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} disabled={isPending}>
                {isPending ? "Signing out..." : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="default" size="sm" onClick={() => router.push("/login")}>
            Sign in
          </Button>
        )}
      </div>
    </header>
  );
}
