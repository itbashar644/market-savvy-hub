
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import { useAuth } from "./hooks/useAuth";
import PendingApprovalPage from "./pages/PendingApprovalPage";

const queryClient = new QueryClient();

const App = () => {
  const { session, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-medium">
        Загрузка...
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/update-password" element={<UpdatePasswordPage />} />
            <Route path="/auth" element={!session ? <AuthPage /> : <Navigate to="/" />} />
            
            <Route 
              path="/" 
              element={
                !session ? (
                  <Navigate to="/auth" />
                ) : profile?.status === 'approved' ? (
                  <Index />
                ) : (
                  <PendingApprovalPage />
                )
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={session ? <Navigate to="/" /> : <NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
