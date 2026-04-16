// src/app/offline/page.tsx
export default function OfflinePage() {
  return (
    <main className="min-h-screen grid place-items-center bg-[#07141a] text-white p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">You are offline</h1>
        <p className="mt-3 text-sm text-zinc-300">
          Please reconnect to continue. Cached pages may still be available.
        </p>
      </div>
    </main>
  );
}
