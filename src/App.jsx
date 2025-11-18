import { Notificador } from "@/components/ui/notificador";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Main from "./pages/Main";
import Admin from "./pages/Admin";
import DebugErrorBoundary from "./components/DebugErrorBoundary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DebugErrorBoundary>
      <Notificador />
      <BrowserRouter>
              <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
      </BrowserRouter>
    </DebugErrorBoundary>
  </QueryClientProvider>
);

export default App;

