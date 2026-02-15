"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider data-oid="gjdyuz.">
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} data-oid="a8giuem">
            <div className="grid gap-1" data-oid="53_q4:o">
              {title && <ToastTitle data-oid="1a5e:9e">{title}</ToastTitle>}
              {description && (
                <ToastDescription data-oid="m2floui">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose data-oid=".3:1kw5" />
          </Toast>
        );
      })}
      <ToastViewport data-oid="l8-z:u3" />
    </ToastProvider>
  );
}
