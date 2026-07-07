import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link as RouterLink, NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from 'react';
import { authService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const farmerNav = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/crop-advisor", label: "Crop Advisor" },
  { to: "/fertilizer", label: "Fertilizer" },
  { to: "/rotation", label: "Rotation" },
  { to: "/community", label: "Community" },
  { to: "/about", label: "About" },
];

const adminNav = [
  { to: "/admin-home", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/crops", label: "Crops" },
  { to: "/admin/fertilizers", label: "Fertilizers" },
  { to: "/admin", label: "Settings" },
];

const authenticatedNav = [
  { to: "/recommendation-history", label: "History" },
  { to: "/recommendation-analytics", label: "Analytics" },
];

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/80 border-b border-border/60">
      <div className="container flex h-16 items-center justify-between">
        <RouterLink to="/" className="flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt="DharaaAI Logo"
            className="h-10 w-10 object-contain"
          />
          <span className="font-semibold tracking-tight">DharaaAI</span>
        </RouterLink>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {(isAuthenticated && user?.role === 'admin' ? adminNav : farmerNav).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "transition-colors text-foreground/70 hover:text-foreground",
                  isActive && "text-foreground font-medium",
                )
              }
              end
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-foreground" />
              )}
            </button>
          )}
          {!isAuthenticated ? (
            <>
              <Button asChild>
                <RouterLink to="/register" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5"><p>Register</p></RouterLink>
              </Button>
              <RouterLink to="/login" className="text-sm text-foreground/70 hover:text-foreground">Login</RouterLink>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Menu">
                  <MoreVertical className="h-5 w-5 text-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user?.role === 'admin' ? (
                  <>
                    <DropdownMenuItem asChild>
                      <RouterLink to="/admin-home" className="cursor-pointer">
                        Admin Dashboard
                      </RouterLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <RouterLink to="/admin/users" className="cursor-pointer">
                        Manage Users
                      </RouterLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <RouterLink to="/admin/crops" className="cursor-pointer">
                        Manage Crops
                      </RouterLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <RouterLink to="/admin/fertilizers" className="cursor-pointer">
                        Manage Fertilizers
                      </RouterLink>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <RouterLink to="/profiledashboard" className="cursor-pointer">
                        Profile
                      </RouterLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <RouterLink to="/recommendation-history" className="cursor-pointer">
                        History
                      </RouterLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <RouterLink to="/recommendation-analytics" className="cursor-pointer">
                        Analytics
                      </RouterLink>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
