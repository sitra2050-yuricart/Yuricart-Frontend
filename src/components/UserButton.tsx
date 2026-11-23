"use client";

import useAuth from "@/hooks/auth";
import {
  LogInIcon,
  LogOutIcon,
  UserPlus,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  const { user, logout, openLogin } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className={className}
          aria-label="Account menu"
        >
          <UserIcon aria-hidden="true" />
          <span className="sr-only">Account</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-44 max-w-64">
        {user && (
          <>
            <DropdownMenuLabel>
              Logged in as {user.name || user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/profile">
              <DropdownMenuItem>
                <UserIcon className="mr-2 size-4" />
                Profile
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem onClick={() => logout()}>
            <LogOutIcon className="mr-2 size-4" />
            Logout
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem onClick={() => openLogin()}>
              <LogInIcon className="mr-2 size-4" />
              Log in
            </DropdownMenuItem>
            <Link href="/register">
              <DropdownMenuItem>
                <UserPlus className="mr-2 size-4" />
                Create account
              </DropdownMenuItem>
            </Link>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
