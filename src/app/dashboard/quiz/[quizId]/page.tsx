export default function QuizPage({ params }: { params: { quizId: string } }) {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Quiz</h1>
      <p className="text-muted-foreground mt-2">Quiz ID: {params.quizId}</p>
    </div>
  );
}
