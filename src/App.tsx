import '@ant-design/v5-patch-for-react-19'
import { App as AntdApp, ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import './App.css'
import { AppLayout, PublicAppLayout } from './components'
import { useAppState } from './hooks'
import { DocumentList, Template, DocumentListOfEmployee, LoginPage, PersonalAccount, WordEditor, AccessType } from './pages'
import RegisterPage from './pages/login-page/RegisterPage'
import Home from './pages/Home/Home'
import Category from './pages/Managing-MOU/Category'
import Spreadsheet from './pages/Excel/Spreadsheet'
import ExcelList from './pages/Excel/ExcelList';
import AccessTypeList from './pages/Excel/ManageAccess'

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
                            <Route index element={<Home />} />
                            <Route path="login" element={<LoginPage />} />
                            <Route path="register" element={<RegisterPage />} />

                            <Route element={!isLogin ? <Navigate to='/' replace /> : <AppLayout />}>
                                {/* <Route path='tong-quan' element={<ManagingMOU />} /> */}
                                {/* <Route path='user' element={<UserPage />} /> */}

                                <Route path='Managing-MOU' element={<Outlet />}>
                                    <Route path='documentlist' element={<DocumentList />} />
                                    <Route path='template' element={<Template />} />
                                    <Route path='documentlistofemployee' element={<DocumentListOfEmployee />} />
                                    <Route path='category' element={<Category />} />
                                    <Route path='wordeditor' element={<WordEditor />} />
                                    <Route path='accesslist' element={<AccessType />} />
                                </Route>

                                <Route path='spreadsheet' element={<Outlet />}>
                                    <Route path='excel-editor' element={<Spreadsheet />} />
                                    <Route path='excel-list' element={<ExcelList  />} />
                                    <Route path='accesstype-list' element={<AccessTypeList  />} />
                                </Route>

                                <Route path='ManagingAccount' element={<Outlet />}>
                                    <Route path='personalaccount' element={<PersonalAccount />} />
                                </Route>
                            </Route>

                            <Route path='template' element={<PublicAppLayout />} >
                                <Route index element={<Template />} />
                            </Route>

                        </Route>
                    </Routes>
                </BrowserRouter>
            </AntdApp>
        </ConfigProvider>
    )
}

export default App