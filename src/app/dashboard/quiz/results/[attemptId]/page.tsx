export default function QuizResultsPage({
  params,
}: {
  params: { attemptId: string };
}) {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Quiz Results</h1>
      <p className="text-muted-foreground mt-2">
        Attempt ID: {params.attemptId}
      </p>
    </div>
  );
}
