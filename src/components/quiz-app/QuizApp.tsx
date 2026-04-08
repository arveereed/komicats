"use client";

import { useEffect, useState } from "react";
import LoadingDots from "./components/LoadingDots";
import Start from "./components/Start";
import Questions from "./components/Questions";
import Result from "./components/Result";
import Link from "next/link";
import { saveQuizGameResult } from "@/actions/quiz.action";
import { toast } from "sonner";

export type QuizQuestion = {
  type: "multiple" | "boolean";
  difficulty: "easy" | "medium" | "hard";
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  answers: string[];
};

export default function QuizApp() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [rewardCoins, setRewardCoins] = useState(0);

  useEffect(() => {
    if (quizStarted) {
      fetchQuestions();
    }
  }, [quizStarted]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/questions", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data: QuizQuestion[] = await res.json();
      setQuestions(data);
      setSelectedAnswers(new Array(data.length).fill(""));
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.warn(error);
    } finally {
      setLoading(false);
    }
  };

  function playTheGame() {
    setQuizStarted(true);
    setShowResult(false);
  }

  function handleAnswerSelect(index: number, answer: string) {
    setSelectedAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      updatedAnswers[index] = answer;
      return updatedAnswers;
    });
  }

  function handleNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }

  async function handleQuizSubmit() {
    const correctAnswers = questions.filter(
      (question, index) => question.correct_answer === selectedAnswers[index],
    );

    const score = correctAnswers.length;

    try {
      const result = await saveQuizGameResult(score, questions.length);
      setRewardCoins(result.rewardCoins);

      toast.success(`You earned ${result.rewardCoins} coins!`, {
        description: `Score: ${score}/${questions.length}`,
      });

      setShowResult(true);
    } catch (error) {
      console.error("Failed to save quiz result:", error);
    }
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentAnswerSelected = selectedAnswers[currentQuestionIndex] !== "";

  const correctAnswers = questions.filter(
    (question, index) => question.correct_answer === selectedAnswers[index],
  );

  const numCorrectAnswers = correctAnswers.length;

  let resultMessage = "";
  if (numCorrectAnswers === 0) {
    resultMessage = "Uh oh, you didn't guess anything.";
  } else if (numCorrectAnswers >= 1 && numCorrectAnswers <= 5) {
    resultMessage = "Not bad, but there’s still room to improve.";
  } else if (numCorrectAnswers >= 6 && numCorrectAnswers <= 9) {
    resultMessage = "Nice work, you were very close!";
  } else if (numCorrectAnswers === 10) {
    resultMessage = "Perfect score. You absolutely crushed it!";
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e9efff,_#c8d6ff_45%,_#8ca7ff_100%)] px-4 py-6 font-['Rubik',Arial,sans-serif] text-slate-900">
        <Start playTheGame={playTheGame} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e9efff,_#c8d6ff_45%,_#8ca7ff_100%)] px-4 py-6 font-['Rubik',Arial,sans-serif]">
        <div className="mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center rounded-[32px] border border-white/40 bg-white/30 p-8 text-center shadow-[0_20px_70px_rgba(37,99,235,0.18)] backdrop-blur-xl">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-indigo-500">
            Quiz App
          </p>
          <h1 className="bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 bg-clip-text text-4xl font-extrabold text-transparent md:text-6xl">
            Loading Questions
          </h1>
          <p className="mt-4 max-w-md text-base text-slate-600 md:text-lg">
            Preparing a fresh set of questions for you.
          </p>
          <LoadingDots />
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e9efff,_#c8d6ff_45%,_#8ca7ff_100%)] px-4 py-6 font-['Rubik',Arial,sans-serif]">
        <Result
          numCorrectAnswers={numCorrectAnswers}
          totalQuestions={questions.length}
          resultMessage={resultMessage}
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e9efff,_#c8d6ff_45%,_#8ca7ff_100%)] px-4 py-6 font-['Rubik',Arial,sans-serif] text-slate-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4">
          <Link
            href="/profile/avatar/my-coins"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/50 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white"
          >
            ← Exit the game
          </Link>
        </div>
        <div className="mb-6 rounded-[28px] border border-white/40 bg-white/35 p-5 shadow-[0_20px_60px_rgba(37,99,235,0.15)] backdrop-blur-xl md:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-indigo-500">
                Quiz Challenge
              </p>
              <h1 className="mt-1 bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 bg-clip-text text-3xl font-extrabold text-transparent md:text-5xl">
                Test Your Knowledge
              </h1>
            </div>

            <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-sm">
              <span className="font-semibold text-slate-900">
                {currentQuestionIndex + 1}
              </span>{" "}
              / {questions.length}
            </div>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-white/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {currentQuestion && (
          <Questions
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            selectedAnswer={selectedAnswers[currentQuestionIndex]}
            handleAnswerSelect={handleAnswerSelect}
          />
        )}

        <div className="mt-8 flex justify-center pb-6">
          {isLastQuestion ? (
            <button
              className="inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-8 py-4 text-lg font-bold text-white shadow-[0_14px_30px_rgba(249,115,22,0.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(244,63,94,0.35)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              onClick={handleQuizSubmit}
              disabled={!currentAnswerSelected}
            >
              Submit Answers
            </button>
          ) : (
            <button
              className="inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-8 py-4 text-lg font-bold text-white shadow-[0_14px_30px_rgba(249,115,22,0.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(244,63,94,0.35)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              onClick={handleNextQuestion}
              disabled={!currentAnswerSelected}
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
