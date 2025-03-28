import '@ant-design/v5-patch-for-react-19'
import { App as AntdApp, ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import './App.css'
import { AppLayout } from './components'
import { useAppState } from './hooks'
import { ManagingMOU, DashboardMOU, LoginPage, ListofUser, ListofAdmin, ListOfPostGraduateStudent, DashboardCSV, TheNumberOfGraduates, ComprehensiveAlumniManagement,WordEditor} from './pages'
 
// const clientId="393569771469-alife8pccujdsd3hk4nmnv1ben8npnhi.apps.googleusercontent.com"
// const apikey="AIzaSyCrOvo-H2ivJHZhmldboxp5L1AufAtNYC8"
// const scope="http://www.googleapis.com/auth/drive"

function App() {
    const isLogin = useAppState(state => state.isLogin)
    return (
        <ConfigProvider
            theme={{
                token: {
                    borderRadius: 4,
                    motion: false,
                },
                components: {},
                hashed: false,
            }}>
            <AntdApp>
                <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<Outlet />}>
                            <Route index element={<LoginPage />} />
                            <Route element={!isLogin ? <Navigate to='/' replace /> : <AppLayout />}>
                                {/* <Route path='tong-quan' element={<ManagingMOU />} /> */}
                                {/* <Route path='user' element={<UserPage />} /> */}

                                <Route path='Managing-MOU' element={<Outlet />}>
                                    <Route path='mou' element={<ManagingMOU />} />
                                    <Route path='dashboard' element={<DashboardMOU />} />
                                    <Route path='wordeditor' element={<WordEditor />}/>
                                </Route>

                                <Route path='ManagingAccount' element={<Outlet />}>
                                    <Route path='user' element={<ListofUser />} />
                                    <Route path='admin' element={<ListofAdmin />} />
                                </Route>

                                <Route path='ManagingStudent' element={<Outlet />}>
                                    <Route path='post-graduate' element={<ListOfPostGraduateStudent />} />
                                    <Route path='graduates' element={<TheNumberOfGraduates />} />
                                    <Route path='alumni' element={<ComprehensiveAlumniManagement />} />
                                    <Route path='dashboard-csv' element={<DashboardCSV />} />
                                </Route>
                            </Route>
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AntdApp>
        </ConfigProvider>
    )
}

export default App
