import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PageNotFound from "./ui/PageNotFound";
import AppLayout from "./ui/AppLayout";
import Home from "./pages/Home";
import Models from "./pages/Models";
import Decisioning from "./pages/Decisioning";
import Frontier from "./pages/Frontier";
import LGD from "./pages/LGD";
import Robustness from "./pages/Robustness";
import Notebooks from "./pages/Notebooks";
import About from "./pages/About";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 0 } },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate replace to="home" />} />
            <Route path="home" element={<Home />} />
            <Route path="models" element={<Models />} />
            <Route path="decisioning" element={<Decisioning />} />
            <Route path="frontier" element={<Frontier />} />
            <Route path="lgd" element={<LGD />} />
            <Route path="robustness" element={<Robustness />} />
            <Route path="notebooks" element={<Notebooks />} />
            <Route path="about" element={<About />} />
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
