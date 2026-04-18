import { useRef, useState } from "react";
import { XCircle, AlertCircle } from "lucide-react";

type VerifyUIType = {
  pendingVerification: boolean;
  isLoading: boolean;
  error: string | null;
  setError: (msg: string) => void;
  code: string;
  setCode: (code: string) => void;
  onVerifyPress: () => void;
};

export default function VerifyEmailUI({
  pendingVerification,
  isLoading,
  error,
  setError,
  code,
  setCode,
  onVerifyPress,
}: VerifyUIType) {
  if (!pendingVerification) return null;

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [digits, setDigits] = useState(Array(6).fill(""));

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setCode(newDigits.join(""));

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#07141a] px-4 py-6 text-white sm:px-6 sm:py-8">
      <BackgroundDecor />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl sm:p-8">
        <h1 className="mb-2 text-center text-2xl font-bold leading-tight bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent sm:text-3xl">
          Verify your email
        </h1>

        <p className="mx-auto mb-6 max-w-sm text-center text-sm leading-relaxed text-gray-400 sm:mb-8">
          Enter the 6-digit code sent to your inbox.
        </p>

        {error && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-lg border border-red-500/50 bg-red-500/20 p-3 text-red-200">
            <div className="flex min-w-0 items-start gap-2">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm leading-relaxed break-words">{error}</p>
            </div>

            <button
              onClick={() => setError("")}
              className="shrink-0 transition-colors hover:text-white"
              aria-label="Dismiss error"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        <div className="mb-8 grid grid-cols-6 gap-2 sm:gap-3">
          {digits.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`h-12 w-full min-w-0 rounded-lg border bg-black/40 text-center text-lg font-bold text-white transition-all sm:h-14 sm:text-xl
                ${error ? "border-red-500 ring-1 ring-red-500" : "border-white/20"}
                focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
            />
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={onVerifyPress}
            disabled={isLoading || code.length !== 6}
            className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all active:scale-[0.98] hover:from-teal-400 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-teal-500 sm:px-8 sm:text-base"
          >
            {isLoading ? "Verifying..." : "Verify Identity"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BackgroundDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(86,153,160,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(72,117,126,0.12),transparent_30%),linear-gradient(135deg,#10242b_0%,#08161c_35%,#030b0f_100%)]" />
      <div className="absolute -left-24 top-10 h-52 w-52 rounded-full bg-teal-300/10 blur-3xl sm:h-72 sm:w-72" />
      <div className="absolute left-[18%] top-[52%] h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl sm:h-80 sm:w-80" />
      <div className="absolute right-[10%] top-[12%] h-52 w-52 rounded-full bg-emerald-300/10 blur-3xl sm:h-72 sm:w-72" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:48px_48px] sm:[background-size:72px_72px]" />
    </div>
  );
}
