"use client";

import {
  clearCustomerToken,
  CustomerUser,
  getCustomerMe,
  getCustomerToken,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
} from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "./use-toast";

export default function useAuth() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const me = await getCustomerMe();
      if (!cancelled) {
        setUser(me);
        setLoading(false);
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  async function login(email: string, password: string) {
    try {
      const { user: loggedIn } = await loginCustomer({ email, password });
      setUser(loggedIn);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to log in. Please try again.",
      });
      throw error;
    }
  }

  async function register(
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) {
    try {
      const { user: registered } = await registerCustomer({
        name,
        email,
        password,
        phone,
      });
      setUser(registered);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to register. Please try again.",
      });
      throw error;
    }
  }

  async function logout() {
    try {
      await logoutCustomer();
    } catch {
      clearCustomerToken();
    }
    setUser(null);
    router.refresh();
  }

  function openLogin() {
    router.push("/login");
  }

  return {
    user,
    loading,
    login,
    register,
    logout,
    openLogin,
    isLoggedIn: !!user,
    token: getCustomerToken(),
  };
}
