import React, { useState } from 'react';
import LoginForm from '../../components/auth/LoginForm';
import ApplicationForm from '../../components/auth/ApplicationForm';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'apply'>('login');

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'apply' : 'login');
  };

  return (
    <>
      {mode === 'login' ? (
        <LoginForm onToggleMode={toggleMode} />
      ) : (
        <ApplicationForm onToggleMode={toggleMode} />
      )}
    </>
  );
}