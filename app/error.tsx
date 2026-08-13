// An error boundary has to be a Client Component: React needs to attach it on
// the client to catch render errors. The lint rule that forbids "use client"
// covers pages and layouts only, so this file is the exception by design.
"use client";

import { useEffect } from "react";

import { Button } from "@/components/react-aria/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with real error reporting. The digest is the only handle on the
    // server-side stack, which Next withholds from the client in production.
    console.error(error);
  }, [error]);

  return (
    <main>
      <h1>Something went wrong</h1>
      <p>
        The page could not be displayed. Trying again may work; if it does not,
        the problem is on our side.
      </p>
      {error.digest && <p>Reference: {error.digest}</p>}
      <Button onPress={reset}>Try again</Button>
    </main>
  );
}
