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

  // Initialize refs for the 6 input boxes
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const [digits, setDigits] = useState(Array(6).fill(""));

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setCode(newDigits.join(""));

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#07141a] text-white p-6">
      {/* Background Decor to match RootLayout */}
      <BackgroundDecor />

      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent">
          Verify your email
        </h1>
        <p className="text-gray-400 text-center mb-8 text-sm">
          Enter the 6-digit code sent to your inbox.
        </p>

        {error && (
          <div className="flex items-center justify-between bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="hover:text-white transition-colors"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        {/* 6-digit Input Grid */}
        <div className="flex justify-between gap-2 mb-8">
          {digits.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              ref={inputRefs[index]}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`w-12 h-14 text-center text-xl font-bold rounded-lg border transition-all
                bg-black/40 text-white
                ${error ? "border-red-500 ring-1 ring-red-500" : "border-white/20"} 
                focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
            />
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={onVerifyPress}
            disabled={isLoading || code.length !== 6}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-400 hover:to-cyan-500 
            shadow-[0_0_20px_rgba(20,184,166,0.3)] px-8 py-3 cursor-pointer font-semibold rounded-xl 
            transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-teal-500"
          >
            {isLoading ? "Verifying..." : "Verify Identity"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Re-using your BackgroundDecor component for consistency
function BackgroundDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(86,153,160,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(72,117,126,0.12),transparent_30%),linear-gradient(135deg,#10242b_0%,#08161c_35%,#030b0f_100%)]" />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal-300/10 blur-3xl" />
      <div className="absolute left-[18%] top-[52%] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute right-[10%] top-[12%] h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:72px_72px]" />
    </div>
  );
}
