import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { PropsWithChildren } from "react";

export default function QueryProvider({ children }: PropsWithChildren) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false, retry: 1 },
          mutations: { retry: 0 },
        },
      })
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
