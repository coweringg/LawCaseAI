import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, User, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const isPublicPage = [
    "/",
    "/login",
    "/register",
    "/pricing",
    "/about",
    "/privacy",
    "/terms",
  ].includes(router.pathname);

  return (
    <div className="min-h-screen bg-secondary-50">
      {!isPublicPage && (
        <nav className="bg-white shadow-sm border-b border-secondary-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/dashboard" className="flex items-center space-x-4">
                  <Image
                    src="/logo.png"
                    alt="LawCaseAI"
                    width={40}
                    height={40}
                    className="object-contain drop-shadow-md"
                  />
                  <span className="text-xl font-bold text-secondary-900">
                    LawCaseAI
                  </span>
                </Link>
              </div>

              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-secondary-600 hover:text-secondary-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="text-secondary-600 hover:text-secondary-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Settings
                </Link>
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-secondary-200">
                  <span className="text-sm text-secondary-700">
                    {user?.name}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="md:hidden flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            {isMobileMenuOpen && (
              <div className="md:hidden border-t border-secondary-200">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block px-3 py-2 rounded-md text-base font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                  >
                    Settings
                  </Link>
                  <div className="border-t border-secondary-200 mt-3 pt-3">
                    <div className="flex items-center justify-between px-3">
                      <span className="text-sm text-secondary-700">
                        {user?.name}
                      </span>
                      <Button variant="ghost" size="sm" onClick={handleLogout}>
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      )}

      {isPublicPage && !isAuthenticated && (
        <nav className="bg-white shadow-sm border-b border-secondary-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-4">
                  <Image
                    src="/logo.png"
                    alt="LawCaseAI"
                    width={40}
                    height={40}
                    className="object-contain drop-shadow-md"
                  />
                  <span className="text-xl font-bold text-secondary-900">
                    LawCaseAI
                  </span>
                </Link>
              </div>

              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/pricing"
                  className="text-secondary-600 hover:text-secondary-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Pricing
                </Link>
                <Link
                  href="/about"
                  className="text-secondary-600 hover:text-secondary-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  About
                </Link>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>

              <div className="md:hidden flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            {isMobileMenuOpen && (
              <div className="md:hidden border-t border-secondary-200">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  <Link
                    href="/pricing"
                    className="block px-3 py-2 rounded-md text-base font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/about"
                    className="block px-3 py-2 rounded-md text-base font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                  >
                    About
                  </Link>
                  <div className="border-t border-secondary-200 mt-3 pt-3 space-y-1">
                    <Link
                      href="/login"
                      className="block px-3 py-2 rounded-md text-base font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                    >
                      Log In
                    </Link>
                    <Link href="/register">
                      <Button className="w-full justify-center">Sign Up</Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      )}

      <main className={isPublicPage ? "" : "pt-0"}>{children}</main>
    </div>
  );
}
