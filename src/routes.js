import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import ReviewsPage from "./pages/ReviewsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import BoardingsPage from "./pages/BoardingsPage";
import NotFound from "./pages/NotFound";
export const router = createBrowserRouter([
    {
        path: "/",
        Component: DashboardLayout,
        children: [
            {
                index: true,
                Component: DashboardPage,
            },
            {
                path: "reviews",
                Component: ReviewsPage,
            },
            {
                path: "analytics",
                Component: AnalyticsPage,
            },
            {
                path: "boardings",
                Component: BoardingsPage,
            },
            {
                path: "*",
                Component: NotFound,
            },
        ],
    },
]);
