import ManagingMOU from './Managing-MOU/ManagingMou.tsx';
import DocumentList from './Managing-MOU/DocumentList.tsx';
import DashboardMOU from './Dashboard/DashboardMOU.tsx';
import DashboardCSV from './Dashboard/DashboardCSV.tsx';
import ListofUser from './ManagingAccount/ListofUser.tsx';
import ListofAdmin from './ManagingAccount/ListofAdmin.tsx';
import LoginPage from './login-page/LoginPage';
import ListOfPostGraduateStudent from './ManagingStudent/ListOfPostGraduateStudent.tsx';
import TheNumberOfGraduates from './ManagingStudent/TheNumberOfGraduates.tsx';
import ComprehensiveAlumniManagement from './ManagingStudent/ComprehensiveAlumniManagement.tsx';
import WordEditor from './Managing-MOU/WordEditor.tsx';
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1NNaF5cXmBCe0x3QXxbf1x1ZFREal9VTnVXUj0eQnxTdEBjXX5acndWRmJaWUNyWklfag==');

export { DocumentList,ManagingMOU, DashboardMOU, DashboardCSV, LoginPage, ListofAdmin,ListofUser,ListOfPostGraduateStudent,TheNumberOfGraduates,ComprehensiveAlumniManagement,WordEditor };