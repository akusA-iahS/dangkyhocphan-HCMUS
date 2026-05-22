'use client';

import { useStore } from '../store/useStore';
import Login from '../components/Login';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const isLoggedIn = useStore((state) => state.isLoggedIn);

  return (
    <main>
      {isLoggedIn ? <Dashboard /> : <Login />}
    </main>
  );
}
