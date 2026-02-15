import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

function ResetPasswordContent() {
  return <ResetPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Suspense fallback={<div>加载中...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
