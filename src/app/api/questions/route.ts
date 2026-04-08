type QuizApiResponse = {
  response_code: number;
  results: QuizQuestion[];
};

type QuizQuestion = {
  type: "multiple" | "boolean";
  difficulty: "easy" | "medium" | "hard";
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

type FormattedQuizQuestion = QuizQuestion & {
  answers: string[];
};

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch("https://opentdb.com/api.php?amount=10", {
      cache: "no-store",
    });

    if (!res.ok) {
      return Response.json(
        { error: "Failed to fetch questions" },
        { status: 500 },
      );
    }

    const data: QuizApiResponse = await res.json();

    const formattedQuestions: FormattedQuizQuestion[] = data.results.map(
      (question): FormattedQuizQuestion => ({
        ...question,
        answers: shuffleArray([
          question.correct_answer,
          ...question.incorrect_answers,
        ]),
      }),
    );

    return Response.json(formattedQuestions);
  } catch (error) {
    return Response.json(
      {
        error: "Something went wrong",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

function shuffleArray(array: string[]): string[] {
  return [...array].sort(() => Math.random() - 0.5);
}
