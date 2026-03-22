import { useState } from "react";
import { Pill, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }
    setLoading(true);
    setError("");
    // Simple auth — replace with real auth as needed
    setTimeout(() => {
      if (username === "admin" && password === "admin123") {
        onLogin();
      } else {
        setError("Invalid username or password");
        setLoading(false);
      }
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary mb-4 shadow-lg">
            <Pill className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">MediTrade</h1>
          <p className="text-muted-foreground text-sm mt-1">Medicine Distribution Manager</p>
        </div>

        <Card className="shadow-lg border">
          <CardHeader className="pb-2 pt-6 px-6">
            <h2 className="text-xl font-semibold">Sign in</h2>
            <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}
            <Button className="w-full mt-2" onClick={handleLogin} disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-xs text-center text-muted-foreground pt-1">
              Default: <span className="font-mono">admin</span> / <span className="font-mono">admin123</span>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
