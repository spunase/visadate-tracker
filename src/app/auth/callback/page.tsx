"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

function sanitizeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/track";
  }
  return raw;
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = sanitizeNextPath(searchParams.get("next"));
  const completeEmailLinkSignIn = useAuthStore((s) => s.completeEmailLinkSignIn);

  const [needsEmail, setNeedsEmail] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function run() {
      const res = await completeEmailLinkSignIn(window.location.href);
      if (!active) return;

      if (res.needsEmail) {
        setNeedsEmail(true);
        return;
      }

      if (res.error) {
        setError(res.error);
        return;
      }

      router.replace(nextPath);
    }

    run();
    return () => {
      active = false;
    };
  }, [completeEmailLinkSignIn, nextPath, router]);

  const handleConfirmEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setSubmitting(true);
    setError(null);
    const res = await completeEmailLinkSignIn(window.location.href, emailInput.trim());
    setSubmitting(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    router.replace(nextPath);
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm items-center justify-center px-4">
      <Card className="w-full rounded-[18px] border border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            {needsEmail ? "Confirm your email" : error ? "Sign-in issue" : "Completing sign-in"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {needsEmail ? (
            <form onSubmit={handleConfirmEmail} className="flex flex-col gap-3">
              <p className="text-xs">
                Please enter the email address you used to request this sign-in link.
              </p>
              <input
                type="email"
                placeholder="you@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/20"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button
                type="submit"
                disabled={submitting || !emailInput.trim()}
                className="w-full rounded-xl bg-[#2F6BFF] text-white hover:bg-[#254FCC]"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Complete sign-in"}
              </Button>
            </form>
          ) : error ? (
            <div className="space-y-3">
              <p className="text-xs text-destructive">{error}</p>
              <Button
                variant="outline"
                onClick={() => router.replace("/track?auth_error=true")}
                className="w-full rounded-xl"
              >
                Back to Tracker
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#2F6BFF]" />
              <span>Verifying your sign-in link...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[60vh] max-w-sm items-center justify-center px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-[#2F6BFF]" />
            <span>Completing sign-in...</span>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
