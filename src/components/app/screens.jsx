import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { APP_VERSION } from "@/lib/app/constants";

import { Field } from "./shared";

export function SetupRequiredScreen() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-3xl">
        <Card className="rounded-3xl border border-amber-200 bg-white p-8 shadow-sm">
          <CardHeader className="space-y-3 px-0 pt-0">
            <Badge className="w-fit !border-amber-200 !bg-amber-100 !text-amber-800">{APP_VERSION}</Badge>
            <CardTitle className="text-3xl font-bold tracking-tight">Firebase Setup Required</CardTitle>
            <div className="text-sm text-slate-600">
              Add your Firebase web app environment variables, then restart `npm run dev`.
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-0 pb-0 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-medium text-slate-900">Required `.env.local` keys</div>
              <pre className="mt-3 overflow-x-auto text-xs leading-6 text-slate-700">{`VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...`}</pre>
            </div>
            <div>Manual account creation is still handled in the Firebase Authentication console.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AuthScreen({ email, password, authError, isSigningIn, onEmailChange, onPasswordChange, onSubmit }) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-md">
        <Card className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <CardHeader className="space-y-3 px-0 pt-0">
            <Badge className="w-fit !border-slate-200 !bg-slate-100 !text-slate-700">{APP_VERSION}</Badge>
            <CardTitle className="text-3xl font-bold tracking-tight">Sign In</CardTitle>
            <div className="text-sm text-slate-600">Use the manually-created Firebase account for this app.</div>
          </CardHeader>
          <CardContent className="space-y-4 px-0 pb-0">
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} placeholder="name@example.com" />
            </Field>
            <Field label="Password">
              <Input type="password" value={password} onChange={(e) => onPasswordChange(e.target.value)} placeholder="Password" />
            </Field>
            {authError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{authError}</div> : null}
            <Button type="button" className="w-full" onClick={onSubmit} disabled={isSigningIn}>
              {isSigningIn ? "Signing In..." : "Sign In"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function LoadingScreen({ title, body }) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-md">
        <Card className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <CardHeader className="space-y-3 px-0 py-0">
            <Badge className="w-fit !border-slate-200 !bg-slate-100 !text-slate-700">{APP_VERSION}</Badge>
            <CardTitle className="text-3xl font-bold tracking-tight">{title}</CardTitle>
            <div className="text-sm text-slate-600">{body}</div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
