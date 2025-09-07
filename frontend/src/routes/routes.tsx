import {Route, Routes} from "react-router";
import LoginPage from "../pages/loginPage.tsx";
import BaseLayout from "../BaseLayout.tsx";
import DashboardCalendar from "../pages/dashboardPage.tsx";
import LessonsPage from "../pages/lessonsPage.tsx";


const AppRoutes = () => {
    return <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<BaseLayout />}>
            <Route path="/" element={<DashboardCalendar />} />
            <Route path="/dashboard" element={<DashboardCalendar />} />
            <Route path="/lessons" element={<LessonsPage />} />
        </Route>
    </Routes>
}

export default AppRoutes