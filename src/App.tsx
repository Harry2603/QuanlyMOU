import '@ant-design/v5-patch-for-react-19'
import { App as AntdApp, ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import './App.css'
import { AppLayout } from './components'
import { useAppState } from './hooks'
import { ManagingMOU, DashboardMOU, LoginPage, ListofUser, ListofAdmin, Wordeditor } from './pages'

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
                                <Route path='tong-quan' element={<ManagingMOU />} />
                                {/* <Route path='user' element={<UserPage />} /> */}
                                <Route path='mou' element={<ManagingMOU />} />
                                <Route path='dashboard' element={<DashboardMOU />} />

                                <Route path='user' element={<ListofUser />} />
                                <Route path='admin' element={<ListofAdmin />} />
                                <Route path='wordeditor' element={<Wordeditor />} />
                            </Route>
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AntdApp>
        </ConfigProvider>
    )
}

export default App
