import {Route, Routes} from "react-router";
import DashboardCalendar from "../Pages/DashboardPage.jsx";
import HomeworksPage from "../Pages/HomeworksPage.jsx";
import BaseLayout from "../BaseLayout.jsx";
import LoginPage from "../Pages/LoginPage.jsx";
import LessonsPage from "../Pages/LessonsPage.jsx";
import MessagesPage from "../Pages/MessagesPage.jsx";
import ProfilePage from "../Pages/ProfilePage.jsx";
import MaterialsPage from "../Pages/MaterialsPage.jsx";
import LearningProgramsPage from "../Pages/LearningProgramsPage.jsx";
import UserManagementPage from "../Pages/UserManagementPage.jsx";
import DataCollectionsPage from "../Pages/DataCollectionsPage.jsx";
import MailingPage from "../Pages/MailingPage.jsx";
import LearningPlansPage from "../Pages/LearningPlansPage.jsx";

const AppRoutes = () => {
    return <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<BaseLayout />}>
            <Route path="/" element={<DashboardCalendar />} />
            <Route path="/dashboard" element={<DashboardCalendar />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/learning_programs" element={<LearningProgramsPage />} />
            <Route path="/learning_plans" element={<LearningPlansPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/homeworks" element={<HomeworksPage />} />
            <Route path="/adm/users" element={<UserManagementPage />} />
            <Route path="/adm/collections" element={<DataCollectionsPage />} />
            <Route path="/adm/mailing" element={<MailingPage />} />
        </Route>
    </Routes>
}

export default AppRoutes