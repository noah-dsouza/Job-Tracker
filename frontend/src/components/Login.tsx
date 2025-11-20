import { useState } from 'react';
import Logo from "@/components/Logo";


interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f3] via-[#eae8df] to-[#ddd9cc] flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-[#d4d1c8]">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo className="w-16 h-16" />
            </div>
            <h2 className="text-[#3d5a4f] mb-2">Greenlit</h2>
            <p className="text-[#7a8a7e]">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-[#5a6d5e] block">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#f5f3ed] border border-[#e0ddd0] text-[#3d5a4f] focus:outline-none focus:ring-2 focus:ring-[#8a9a8f] focus:border-transparent transition-all duration-300 focus:shadow-lg focus:shadow-[#8a9a8f]/20"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[#5a6d5e] block">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#f5f3ed] border border-[#e0ddd0] text-[#3d5a4f] focus:outline-none focus:ring-2 focus:ring-[#8a9a8f] focus:border-transparent transition-all duration-300 focus:shadow-lg focus:shadow-[#8a9a8f]/20"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#6b8273] text-white transition-all duration-300 hover:bg-[#5a6d5e] hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
            >
              {isSignup ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-[#6b8273] hover:text-[#5a6d5e] transition-colors duration-300"
            >
              {isSignup
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}