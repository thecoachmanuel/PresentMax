"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";
import { toast } from "sonner";
import { supabase } from "@/server/supabase";

export default function SignIn() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/presentation";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch (err) {
      toast.error("Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
        setIsLoading(false);
        return;
      }

      toast.success("Signed in successfully!");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        toast.success("Check your email for the confirmation link!");
        setIsLoading(false);
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">
            PresentMax
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to create stunning presentations in seconds
          </CardDescription>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-md mt-2">
              Authentication error. Please check your credentials and try again.
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-muted/30 focus:bg-background transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Password</Label>
                    <Button variant="link" className="px-0 font-normal text-xs" type="button">
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-muted/30 focus:bg-background transition-colors"
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-muted/30 focus:bg-background transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-muted/30 focus:bg-background transition-colors"
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-3 h-11 border-muted hover:bg-muted/50 transition-all"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <FaGoogle className="h-4 w-4 text-[#4285F4]" />
            Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center gap-4 pt-0">
          <p className="text-[10px] text-center text-muted-foreground px-8 leading-relaxed">
            By continuing, you agree to PresentMax's{" "}
            <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a> and{" "}
            <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
