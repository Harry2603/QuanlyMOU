import { App as AntdApp, ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import './App.css'
import { AppLayout } from './components'
import { useAppState } from './hooks'
import { DashboardPage, LoginPage } from './pages'

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
                                <Route path='tong-quan' element={<DashboardPage />} />
                            </Route>
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AntdApp>
        </ConfigProvider>
    )
}

export default App
