"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock login - qualquer nome/senha funciona
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userName", name);
      }
      router.push("/");
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-lusioBlueLight via-white to-primaryLight p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-[url('/lusio-logo.jpeg')] bg-center bg-no-repeat opacity-5 bg-contain"></div>

      <Card className="w-full max-w-md shadow-2xl border-none hover-lift animate-slideIn relative z-10">
        <CardHeader className="space-y-4 pb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32">
              <Image
                src="/lusio-logo.jpeg"
                alt="Lusio Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-primaryHover bg-clip-text text-transparent">
            Lusio Backoffice
          </CardTitle>
          <CardDescription className="text-center text-base text-gray-600">
            Portal da Advogada - Gestão de Processos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Nome
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Digite seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primaryLight transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primaryLight transition-all"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary to-primaryHover hover:from-primaryHover hover:to-primary text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-pulse">Entrando...</span>
                </span>
              ) : (
                "Entrar"
              )}
            </Button>
            <div className="bg-primaryLight/30 rounded-lg p-3 border border-primary/20">
              <p className="text-xs text-center text-primary font-medium">
                💡 Ambiente de Desenvolvimento: Use qualquer nome/senha
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
