import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <SignUp fallbackRedirectUrl="/app" />
    </div>
  );
}
