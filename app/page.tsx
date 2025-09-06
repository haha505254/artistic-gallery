'use client';

import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with p5.js
const FlowField = dynamic(
  () => import('@/components/generators/flow-field/FlowField'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    )
  }
);

export default function Home() {
  return (
    <main className="w-full h-screen overflow-hidden">
      <FlowField />
    </main>
  );
}