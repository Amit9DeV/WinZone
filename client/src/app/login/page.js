'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { Mail, Lock, ArrowRight, Github } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Welcome back!');
        router.push('/');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-purple-900/50 z-10"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-20"></div>

        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] animate-pulse delay-1000"></div>

        <div className="relative z-30 flex flex-col justify-center px-20 text-white">
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Welcome to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">WinZone</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-md">
            The premium destination for next-gen gaming. Join thousands of players winning big every day.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Sign in to your account</h2>
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:text-primary-hover font-medium transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                <Input
                  icon={Mail}
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-300">Password</label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:text-primary-hover">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  icon={Lock}
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-3 text-lg"
              disabled={loading}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In <ArrowRight size={20} />
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button type="button" variant="secondary" className="w-full">
                <Github size={20} className="mr-2" /> Github
              </Button>
              <Button type="button" variant="secondary" className="w-full">
                <span className="mr-2 font-bold text-blue-500">G</span> Google
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
