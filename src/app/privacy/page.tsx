"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-lg">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-2 pt-6">
        <Link
          href="/settings"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm-blue focus-visible:ring-offset-2"
          aria-label="Back to settings"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-h1 font-bold text-foreground">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground">
            Last updated: March 25, 2025
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-8 pt-4">
        {/* Overview Card */}
        <Card className="rounded-[18px] border border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Shield className="h-4 w-4 text-calm-blue" aria-hidden="true" />
              Privacy-First Design
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              VisaDateTracker is designed with your privacy as a core principle.
              We collect minimal data and store your preferences locally on your
              device. No account is required to use this app.
            </p>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card className="rounded-[18px] border border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p className="font-medium text-foreground">
              Data stored locally on your device only:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Your visa category preference (EB1, EB2, EB3)</li>
              <li>Your country of chargeability preference</li>
              <li>Your processing path preference (AOS or CP)</li>
              <li>Your priority date (if entered)</li>
              <li>Theme preference (light, dark, or system)</li>
              <li>Notification reminder settings</li>
              <li>Milestone checklist completion status</li>
            </ul>
            <p className="font-medium text-foreground pt-2">
              Data we do NOT collect:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Your name, email, phone number, or address</li>
              <li>Your location</li>
              <li>Device identifiers or advertising IDs</li>
              <li>Analytics or usage tracking data</li>
              <li>Any financial or payment information</li>
              <li>Your immigration case number or receipt number</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Storage */}
        <Card className="rounded-[18px] border border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              How Data Is Stored
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              All user preferences are stored in your browser's local storage or
              the device's native storage. This data never leaves your device
              and is not transmitted to any server.
            </p>
            <p>
              Visa bulletin data is fetched from the U.S. Department of State
              and cached through our backend to provide faster access. This data
              is publicly available information and contains no personal
              information.
            </p>
          </CardContent>
        </Card>

        {/* Third-Party Services */}
        <Card className="rounded-[18px] border border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Third-Party Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="font-medium text-foreground">Supabase</span> -
                Used to store and serve visa bulletin data (public immigration
                data only, no personal data). See{" "}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-calm-blue underline"
                >
                  Supabase Privacy Policy
                </a>
              </li>
              <li>
                <span className="font-medium text-foreground">Netlify</span> -
                Used to host and serve the application. See{" "}
                <a
                  href="https://www.netlify.com/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-calm-blue underline"
                >
                  Netlify Privacy Policy
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card className="rounded-[18px] border border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Push Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              If you opt in to bulletin reminders, we may send push
              notifications to alert you when new visa bulletins are released.
              You can disable notifications at any time in Settings.
              Notification tokens are stored locally and are not shared with
              third parties.
            </p>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className="rounded-[18px] border border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Children's Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              This app is not directed at children under the age of 13. We do
              not knowingly collect personal information from children. The app
              provides immigration process tracking tools intended for adult
              users.
            </p>
          </CardContent>
        </Card>

        {/* Data Deletion */}
        <Card className="rounded-[18px] border border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Your Rights and Data Deletion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Since all your data is stored locally on your device, you have
              full control over it at all times:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Use the "Reset to Defaults" button in Settings to clear all
                preferences
              </li>
              <li>
                Clear your browser's local storage to remove all app data
              </li>
              <li>Uninstall the app to remove all stored data</li>
            </ul>
            <p>
              No account deletion is necessary because no account is created.
            </p>
          </CardContent>
        </Card>

        {/* California / CCPA */}
        <Card className="rounded-[18px] border border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              California Residents (CCPA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              We do not sell personal information. Since we do not collect
              personal information beyond locally stored preferences, there is
              no personal data to sell, share, or disclose to third parties.
            </p>
          </CardContent>
        </Card>

        {/* EU / GDPR */}
        <Card className="rounded-[18px] border border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              European Users (GDPR)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              We process minimal data based on your consent (when you choose to
              save preferences) and legitimate interest (serving publicly
              available visa bulletin data). You have the right to access,
              rectify, and erase your data at any time using the controls in the
              app.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="rounded-[18px] border border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Changes and Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              We may update this privacy policy from time to time. Changes will
              be reflected on this page with an updated revision date.
            </p>
            <p>
              If you have questions about this privacy policy, please open an
              issue on our GitHub repository or contact us through the app.
            </p>
          </CardContent>
        </Card>

        {/* Footer disclaimer */}
        <p className="rounded-xl bg-muted/60 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
          This privacy policy applies to the VisaDateTracker mobile and web
          application. VisaDateTracker is not affiliated with USCIS, the U.S.
          Department of State, or any government agency.
        </p>
      </div>
    </div>
  );
}
