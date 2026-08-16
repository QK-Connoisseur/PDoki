import { Suspense } from "react";
import { LoadingState } from "./StateViews";

export default function RouteSuspense({ children }) {
  return (
    <Suspense
      fallback={
        <main
          aria-busy="true"
          aria-label="Loading page"
          className="flex min-h-screen items-center justify-center bg-[#fff8fb]"
        >
          <LoadingState label="Loading page…" />
        </main>
      }
    >
      {children}
    </Suspense>
  );
}
