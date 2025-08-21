import React, { useState } from 'react';
import RoleBasedLogin from '../../components/auth/RoleBasedLogin';
import ApplicationHub from '../../components/auth/ApplicationHub';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'apply'>('login');

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'apply' : 'login');
  };

  return (
    <>
      {mode === 'login' ? (
        <RoleBasedLogin onToggleMode={toggleMode} />
      ) : (
        <ApplicationHub onToggleMode={toggleMode} />
      )}
    </>
  );
}