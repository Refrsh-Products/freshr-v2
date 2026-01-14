export default function AuthCodeError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
      <p className="mt-4 text-gray-600">
        There was an error communicating with Supabase. Please try again.
      </p>
    </div>
  );
}
