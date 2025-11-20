import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error || 'An error occurred';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
      <p className="text-muted-foreground mb-4">{error}</p>
      <Button asChild>
        <Link href="/login">Return to Login</Link>
      </Button>
    </div>
  );
}
