import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ChatBot } from "@/components/common/ChatBot";
import ScrollToTop from "@/components/ScrollToTop";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
}
