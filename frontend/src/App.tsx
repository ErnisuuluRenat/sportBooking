import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "./components/layout/Navbar";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { VenuePage } from "./pages/VenuePage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { AboutPage } from "./pages/AboutPage";
import { OwnersPage } from "./pages/OwnersPage";
import { ProfilePage } from "./pages/ProfilePage";
import { EditVenuePage } from "./pages/EditVenuePage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-bg-primary">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/venues/:id" element={<VenuePage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/owners" element={<OwnersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/venues/:id/edit" element={<EditVenuePage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
