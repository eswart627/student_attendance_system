import { useState, useContext } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { AuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login/", {
        email,
        password,
        role: "teacher",
      });

      if (res.data.success) {
        const { token, user } = res.data.data;
        const serverTime = res.data.serverTime;

        login(user, token, serverTime);
        navigate("/home");
      } else {
        setError("Invalid login");
      }
    } catch (err) {
      console.log(err);
      setError("Incorrect email or password");
    }

    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#dfe4e1] px-4 py-8">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Soft gradient blobs */}
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#527c7a]/20 blur-3xl" />
        <div className="absolute -bottom-48 -right-40 h-[600px] w-[600px] rounded-full bg-[#9a804f]/15 blur-3xl" />

        {/* Large circles */}
        <div className="absolute -left-32 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full border border-[#172d38]/10" />
        <div className="absolute -left-20 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full border border-[#172d38]/[0.08]" />
        <div className="absolute -right-36 -top-36 h-[520px] w-[520px] rounded-full border border-[#8a7042]/10" />
        <div className="absolute -right-20 -top-20 h-[380px] w-[380px] rounded-full border border-[#8a7042]/[0.08]" />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.28]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(23,45,56,0.22) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "linear-gradient(to bottom right, black, transparent 65%)",
            WebkitMaskImage:
              "linear-gradient(to bottom right, black, transparent 65%)",
          }}
        />

        {/* Decorative diagonal lines */}
        <div className="absolute left-[8%] top-[18%] h-px w-32 rotate-45 bg-[#172d38]/15" />
        <div className="absolute left-[12%] top-[20%] h-px w-20 rotate-45 bg-[#172d38]/15" />

        <div className="absolute bottom-[18%] right-[8%] h-px w-32 -rotate-45 bg-[#8a7042]/15" />
        <div className="absolute bottom-[20%] right-[12%] h-px w-20 -rotate-45 bg-[#8a7042]/15" />

        {/* Corner accents */}
        <div className="absolute left-8 top-8 h-16 w-16 border-l border-t border-[#172d38]/15" />
        <div className="absolute bottom-8 right-8 h-16 w-16 border-b border-r border-[#172d38]/15" />

        {/* Small decorative squares */}
        <div className="absolute left-[14%] bottom-[22%] h-2 w-2 rounded-sm bg-[#3f6260]/40" />
        <div className="absolute right-[16%] top-[24%] h-2 w-2 rounded-sm bg-[#9a804f]/40" />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-[440px]">

        {/* Top accent */}
        <div className="absolute -top-1 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#3f6260] to-[#9a804f]" />

        <div className="rounded-3xl border border-[#c8cfcb] bg-[#f1f3f1]/95 p-7 shadow-[0_25px_80px_rgba(23,45,56,0.20)] backdrop-blur-xl sm:p-10">

          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#cbd2ce] bg-[#e5e9e6] p-3 shadow-sm">
              <img
                src="/logo.png"
                alt="IIIT Pune Logo"
                className="max-h-14 w-auto max-w-[150px] object-contain"
              />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-[#527c7a]/60" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#3f6260]">
                Teacher Portal
              </span>
              <span className="h-px w-8 bg-[#527c7a]/60" />
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-[#172d38]">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#596663]">
              Sign in to access your faculty workspace.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#293b40]"
              >
                Email address
              </label>

              <Input
                id="email"
                type="email"
                placeholder="name@iiitp.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-[#c8cfcb] bg-[#e4e8e5] px-4 text-sm text-[#172d38] shadow-none transition-all placeholder:text-[#7b8581] hover:border-[#aeb9b4] focus:border-[#527c7a] focus:bg-[#f7f8f7] focus:ring-4 focus:ring-[#527c7a]/10"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#293b40]"
              >
                Password
              </label>

              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl border-[#c8cfcb] bg-[#e4e8e5] px-4 text-sm text-[#172d38] shadow-none transition-all placeholder:text-[#7b8581] hover:border-[#aeb9b4] focus:border-[#527c7a] focus:bg-[#f7f8f7] focus:ring-4 focus:ring-[#527c7a]/10"
              />
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-medium text-[#3f6260] transition-colors hover:text-[#294746] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-[#d7b8b8] bg-[#eee0e0] px-4 py-3 text-center text-sm text-[#8b4141]"
              >
                {error}
              </div>
            )}

            {/* Login */}
            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-[#172d38] text-sm font-semibold text-white shadow-[0_8px_20px_rgba(23,45,56,0.20)] transition-all duration-200 hover:bg-[#203b45] hover:shadow-[0_12px_25px_rgba(23,45,56,0.25)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 border-t border-[#d5dad7] pt-5 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[#527c7a]/70" />
              <span className="h-px w-8 bg-[#cbd2ce]" />
              <span className="h-1 w-1 rounded-full bg-[#9a804f]/70" />
            </div>

            <p className="text-xs font-medium text-[#737e7a]">
              Indian Institute of Information Technology, Pune
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}