import Link from "next/link";

type StartProps = {
  playTheGame: () => void;
};

export default function Start({ playTheGame }: StartProps) {
  return (
    <div className="relative w-full mx-auto flex min-h-[80vh] max-w-4xl items-center justify-center px-4">
      <Link
        href="/profile/avatar/my-coins"
        className="absolute z-50 left-0 top-0 inline-flex items-center gap-2 rounded-2xl border border-white/50 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white"
      >
        ← Exit the game
      </Link>
      <div className="mt-20">
        <div className="w-full rounded-[32px] border border-white/40 bg-white/35 px-6 py-12 text-center shadow-[0_20px_70px_rgba(37,99,235,0.18)] backdrop-blur-xl md:px-12 md:py-16">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-rose-500 text-3xl shadow-[0_16px_35px_rgba(244,63,94,0.35)]">
            🧠
          </div>

          <p className="text-sm font-medium uppercase tracking-[0.25em] text-indigo-500">
            Welcome
          </p>

          <h1 className="mt-3 bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 bg-clip-text text-4xl font-extrabold leading-tight text-transparent md:text-7xl">
            Quiz Game
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            Challenge yourself with 10 randomly generated questions across
            different categories and see how many you can get right.
          </p>

          <button
            className="mt-10 inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-8 py-4 text-lg font-bold text-white shadow-[0_14px_30px_rgba(249,115,22,0.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(244,63,94,0.35)] active:translate-y-0"
            onClick={playTheGame}
          >
            Play the Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
