import Link from "next/link";

type ResultProps = {
  numCorrectAnswers: number;
  totalQuestions: number;
  resultMessage: string;
};

export default function Result({
  numCorrectAnswers,
  totalQuestions,
  resultMessage,
}: ResultProps) {
  const percentage = Math.round((numCorrectAnswers / totalQuestions) * 100);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
      <div className="w-full rounded-[32px] border border-white/40 bg-white/35 p-8 text-center shadow-[0_20px_70px_rgba(37,99,235,0.18)] backdrop-blur-xl md:p-12">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-indigo-500">
          Quiz Complete
        </p>

        <h1 className="mt-3 bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 bg-clip-text text-4xl font-extrabold text-transparent md:text-6xl">
          Your Result
        </h1>

        <div className="mx-auto mt-8 flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-4xl font-extrabold text-white shadow-[0_18px_40px_rgba(244,63,94,0.35)] md:h-40 md:w-40">
          {percentage}%
        </div>

        <p className="mt-8 text-xl font-semibold text-slate-900 md:text-2xl">
          You answered {numCorrectAnswers} / {totalQuestions} correctly
        </p>

        <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
          {resultMessage}
        </p>

        <Link href="/profile/avatar/my-coins">
          <button className="mt-8 inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-8 py-4 text-lg font-bold text-white shadow-[0_14px_30px_rgba(249,115,22,0.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(244,63,94,0.35)] active:translate-y-0">
            Exit
          </button>
        </Link>
      </div>
    </div>
  );
}
