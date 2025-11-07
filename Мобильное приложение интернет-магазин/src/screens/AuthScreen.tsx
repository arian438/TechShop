import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { Toaster } from '../components/ui/sonner';

type AuthMode = 'login' | 'register' | 'forgot-password';

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {mode === 'login' && (
          <LoginForm
            onSwitchToRegister={() => setMode('register')}
            onForgotPassword={() => setMode('forgot-password')}
          />
        )}
        
        {mode === 'register' && (
          <RegisterForm
            onSwitchToLogin={() => setMode('login')}
          />
        )}
        
        {mode === 'forgot-password' && (
          <ForgotPasswordForm
            onBack={() => setMode('login')}
          />
        )}
      </div>
      <Toaster />
    </div>
  );
}