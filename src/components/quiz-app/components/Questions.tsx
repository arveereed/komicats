import { QuizQuestion } from "../QuizApp";

type QuestionsProps = {
  question: QuizQuestion;
  questionIndex: number;
  selectedAnswer: string;
  handleAnswerSelect: (index: number, answer: string) => void;
};

export default function Questions({
  question,
  questionIndex,
  selectedAnswer,
  handleAnswerSelect,
}: QuestionsProps) {
  return (
    <section>
      <article className="overflow-hidden rounded-[28px] border border-white/40 bg-white/75 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(15,23,42,0.14)] md:p-7">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
            Question {questionIndex + 1}
          </span>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
            {question.difficulty}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {question.category}
          </span>
        </div>

        <h2
          className="text-xl font-bold leading-relaxed text-slate-900 md:text-2xl"
          dangerouslySetInnerHTML={{ __html: question.question }}
        />

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {question.answers.map((answer, answerIndex) => {
            const isSelected = selectedAnswer === answer;

            return (
              <label
                key={answerIndex}
                className={`group flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all duration-200 ${
                  isSelected
                    ? "border-orange-400 bg-gradient-to-r from-orange-50 to-rose-50 shadow-[0_10px_25px_rgba(251,146,60,0.18)]"
                    : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${questionIndex}`}
                  value={answer}
                  checked={isSelected}
                  onChange={() => handleAnswerSelect(questionIndex, answer)}
                  className="mt-1 h-4 w-4 accent-orange-500"
                />

                <span
                  className={`text-sm leading-6 md:text-base ${
                    isSelected ? "font-medium text-slate-900" : "text-slate-700"
                  }`}
                  dangerouslySetInnerHTML={{ __html: answer }}
                />
              </label>
            );
          })}
        </div>
      </article>
    </section>
  );
}
