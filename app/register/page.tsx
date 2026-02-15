import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] artistic-theme artistic-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* 霓虹背景效果 */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#b026ff]/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#00f0ff]/20 rounded-full blur-[128px] pointer-events-none" />
      
      {/* 网格装饰 */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(176, 38, 255, 0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(176, 38, 255, 0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
      
      <RegisterForm />
    </div>
  );
}
