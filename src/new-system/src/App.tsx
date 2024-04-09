import React from "react";
import { useRoutes } from "react-router-dom";
import router from "@/router";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

function App() {
  const dom = useRoutes(router);
  return (
    <>
      <div className="App">
        <QueryClientProvider client={queryClient}>
          <React.Suspense fallback={<div> Loading... </div>}>
            {dom}
          </React.Suspense>
        </QueryClientProvider>
      </div>
    </>
  );
}

export default App; 
