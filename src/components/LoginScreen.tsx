import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  AlertOctagon,
  Lock,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
  Users,
} from 'lucide-react';
import { googleSignIn, ALLOWED_DOMAIN } from '../utils/firebaseAuth';

interface LoginScreenProps {
  onSuccess: (user: any, token: string | null) => void;
  initialError?: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccess,
  initialError,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError || null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await googleSignIn();
      onSuccess(result.user, result.accessToken);
    } catch (err: any) {
      console.error('Falha no login:', err);
      // Friendly message
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('A janela de login do Google foi fechada antes da conclusão.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMessage('O navegador bloqueou a janela pop-up do Google. Por favor, permita pop-ups para este site.');
      } else {
        setErrorMessage(err.message || 'Ocorreu um erro ao autenticar com o Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100 font-sans">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-100/20 overflow-hidden">
          {/* Top Brand Header */}
          <div className="bg-slate-950 p-6 text-center relative border-b border-slate-800">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-500 text-slate-950 mb-3 shadow-lg shadow-emerald-500/20">
              <GraduationCap className="h-8 w-8" />
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wider text-emerald-400 uppercase mb-1">
              <Building2 className="h-3.5 w-3.5" />
              <span>UNISUAM • Portal DRA</span>
            </div>

            <h1 className="text-xl font-black text-white tracking-tight">
              Processamento de Formandos & ENADE
            </h1>

            <p className="text-xs text-slate-400 mt-1">
              Sistema de Auditoria e Emissão de Processos Acadêmicos
            </p>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Domain Restrict Badge */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Acesso Restrito Institucional</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Este sistema é de uso exclusivo de colaboradores autorizados. O login exige uma conta do Google Workspace com o domínio:
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                @{ALLOWED_DOMAIN}
              </div>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div
                id="login-error-alert"
                className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs flex items-start gap-2.5 animate-fadeIn"
              >
                <AlertOctagon className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-rose-900">Acesso Não Autorizado</p>
                  <p className="text-rose-700 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Sign in with Google Button */}
            <div className="pt-2">
              <button
                id="btn-google-signin"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-sm shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg
                      className="animate-spin h-5 w-5 text-emerald-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Conectando com Google...</span>
                  </div>
                ) : (
                  <>
                    <svg
                      className="h-5 w-5 shrink-0"
                      viewBox="0 0 48 48"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                    <span className="group-hover:text-slate-900 transition-colors">
                      Entrar com Google (@{ALLOWED_DOMAIN})
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <FileSpreadsheet className="h-3.5 w-3.5 text-blue-600" />
                <span>Processos DRA 137/100/139</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-emerald-600" />
                <span>Mapeamento ENADE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security / Privacy notice */}
        <p className="text-center text-[11px] text-slate-500 mt-4 flex items-center justify-center gap-1">
          <Lock className="h-3 w-3" />
          <span>Ambiente protegido com autenticação Google OAuth &amp; SSL</span>
        </p>
      </div>
    </div>
  );
};
