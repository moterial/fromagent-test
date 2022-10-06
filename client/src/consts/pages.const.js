import Dashboard from '../pages/dashboard.jsx';
import MeetingListPage from '../pages/meetingList.jsx';
import CandidateListPage from '../pages/candidateList.jsx';
import AddCandidatePage from '../pages/addcandidate.jsx';
import AddRecordPage from '../pages/addrecord.jsx';
import SettingsPage from '../pages/settings.jsx';
import YearlyTargetPage from '../pages/yearlytarget.jsx';

export const Pages = [
    {
        name: "MeetingList",
        path: "/meetinglist/*",
        component: MeetingListPage,
    },
    {
        name: "CandidateList",
        path: "/candidatelist/*",
        component: CandidateListPage,
    },
    {
        name: "AddCandidate",
        path: "/addcandidate",
        component: AddCandidatePage,
    },
    {
        name: "Dashboard",
        path: "/dashboard/*",
        component: Dashboard,
    },
    {
        name: "AddRecord",
        path: "/addrecord",
        component: AddRecordPage,
    },
    {
        name: "Settings",
        path: "/settings/*",
        component: SettingsPage,
    },
    {
        name: "YearlyTarget",
        path: "/yearlytarget",
        component: YearlyTargetPage,
    }
]
