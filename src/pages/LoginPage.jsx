import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import {
  Sprout,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Mohon lengkapi email dan kata sandi Anda.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/");
    }, 700);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-surface-light text-ink flex flex-col justify-between items-center px-4 py-8 sm:py-12 selection:bg-primary-50 selection:text-primary">
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-primary transition-colors cursor-pointer select-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <span className="text-[11px] font-medium text-ink-muted">
          Platform Agritech Bebas Gudang
        </span>
      </div>

      <div className="w-full max-w-md bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 select-none mb-1 group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-[#E6E4DA] shadow-xs group-hover:bg-primary-hover transition-colors">
              <Sprout className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-primary group-hover:text-primary-hover transition-colors">
              PatraTani
            </span>
          </Link>

          <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
            Selamat Datang Kembali
          </h1>

          <p className="text-xs sm:text-sm text-ink-secondary">
            Masuk untuk mengakses pasar langsung, tender aktif, dan rekening escrow
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-xs font-medium text-[#991B1B] text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Alamat Email"
            type="email"
            placeholder="nama@usaha.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            iconLeft={Mail}
            required
          />

          <div className="space-y-1.5">
            <div className="relative">
              <Input
                label="Kata Sandi"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi akun"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                iconLeft={Lock}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-ink-muted hover:text-ink cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-ink-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
              />
              <span>Ingat saya</span>
            </label>

            <button
              type="button"
              onClick={() => alert("Tautan pemulihan kata sandi telah dikirimkan ke email simulasi Anda.")}
              className="font-semibold text-primary hover:text-primary-hover hover:underline cursor-pointer transition-colors"
            >
              Lupa Kata Sandi?
            </button>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              icon={ArrowRight}
              iconPosition="right"
              className="hover:bg-primary-hover transition-colors"
            >
              Masuk ke Akun
            </Button>
          </div>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative bg-surface px-3 text-[11px] uppercase tracking-wider text-ink-muted">
            atau masuk dengan
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2.5 px-4 rounded-xl border border-border bg-surface hover:bg-surface-green/40 active:bg-surface-green transition-colors flex items-center justify-center gap-2.5 text-xs font-semibold text-ink cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Masuk dengan Akun Google</span>
        </button>

        <div className="pt-2 text-center text-xs text-ink-secondary border-t border-border/80">
          Belum memiliki akun Patra Tani?{" "}
          <Link
            to="/register"
            className="font-bold text-primary hover:text-primary-hover hover:underline cursor-pointer transition-colors"
          >
            Daftar Sekarang
          </Link>
        </div>
      </div>

      <div className="w-full max-w-md mt-6 flex items-center justify-center gap-2 text-[11px] text-ink-muted text-center">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
        <span>Dilindungi Enkripsi Sandbox Simulasi Patra Tani</span>
      </div>
    </div>
  );
}
