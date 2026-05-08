import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import ChatbotWidget from "./components/Chatbot/ChatbotWidget";

/**
 * App – Root component wrapping the router.
 * ChatbotWidget is mounted inside BrowserRouter so it can
 * access useLocation() to hide itself on admin/technician pages.
 */
export default function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <BrowserRouter>
          <AppRoutes />
          <ChatbotWidget />
        </BrowserRouter>
      </NotificationsProvider>
    </AuthProvider>
  );
}
