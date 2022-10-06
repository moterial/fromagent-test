export const ROOT = process.env.REACT_APP_API_URL;

// Users 
export const LOGIN_PATH = ROOT + "/api/users/login";
export const USER_MANAGEMENT_PATH = ROOT + "/api/users/getusers";
export const GET_SECURITY = ROOT + "/api/users/getsecurity";
export const FORGET_GET_SECURITY = ROOT + "/api/users/forgetpwgetsecurity";
export const FORGET_COMPARE_SECURITY = ROOT + "/api/users/forgetpwcomparesecurity";
export const FORGET_CHANGE_PASSWORD = ROOT + "/api/users/forgetpwchangepassword";
export const UPDATE_SECURITY = ROOT + "/api/users/updatesecurity";
export const ADD_USER_PATH = ROOT + "/api/users/adduser";
export const DELETE_USER_PATH = ROOT + "/api/users/deleteuser";
export const CHANGE_PASSWORD_PATH = ROOT + "/api/users/changepassword";
export const SET_YEARLY_TARGET_PATH = ROOT + "/api/users/setyearlytarget";
export const GET_YEARLY_TARGET_PATH = ROOT + "/api/users/getyearlytarget";
export const RESUME_SESSION_PATH = ROOT + "/api/users/resumesession";
export const CHANGE_OTHERS_PASSWORD = ROOT + "/api/users/changeotherspassword";
export const USER_LOGOUT = ROOT + "/api/users/logout";

// Clients

export const CLIENTS_LIST = ROOT + "/api/clients/clients"
export const ADD_RECORD_PATH = ROOT + "/api/clients/submit";
export const MEETING_LIST_PATH = ROOT + "/api/clients/meetinglist";
export const DELETE_CLIENTS_PATH = ROOT + "/api/clients/deleteclients";
export const DELETE_MEETINGS_PATH = ROOT + "/api/clients/deletemeeting";
export const CLIENT_CHANGE_NAME_PATH = ROOT + "/api/clients/changename";
export const CLIENT_SAVEREAD = ROOT + "/api/clients/saveread";

// Candidates
export const CANDIDATES_LIST = ROOT + "/api/candidates/candidates"
export const CANDIDATES_ADD_RECORD_PATH = ROOT + "/api/candidates/submit";
export const CANDIDATES_INTERVIEW_LIST_PATH = ROOT + "/api/candidates/interviewlist";
export const DELETE_CANDIDATES_PATH = ROOT + "/api/candidates/deletecandidates";
export const CANDIDATES_DELETE_INTERVIEWS_PATH = ROOT + "/api/candidates/deleteinterview";
export const CANDIDATES_CHANGE_NAME_PATH = ROOT + "/api/candidates/changename";

// Dashboard
export const DASHBOARD_TODAYTASKS = ROOT + "/api/dashboard/todaytasks";
export const DASHBOARD_PROFIT = ROOT + "/api/dashboard/profit";
export const DASHBOARD_RECRUITMENT = ROOT + "/api/dashboard/recruitment"
export const DASHBOARD_PROFIT_SUBMANAGERS = ROOT + "/api/dashboard/profitsubmanagers";
export const DASHBOARD_PROFIT_2_SUBSUBMANAGERS = ROOT + "/api/dashboard/profitsubmanagersteam";
export const DASHBOARD_RECRUITMENT_SUBMANAGERS = ROOT + "/api/dashboard/recruitmentsubmanagers";
export const DASHBOARD_RECRUITMENT_2_SUBSUBMANAGERS = ROOT + "/api/dashboard/recruitmentsubmanagersteam";
export const DASHBOARD_BARCHART = ROOT + "/api/dashboard/barchart"


// Google
export const GAPI_GET_LINK = ROOT + "/api/google/gapigetlink";
export const GAPI_GET_USER_TOKEN = ROOT + "/api/google/getusertoken";
export const GAPI_DELETE_USER = ROOT + "/api/google/deletegapidata";