import {
    DashboardOutlined,
    KeyOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    FileOutlined,
    SettingOutlined,
    FolderOutlined,
    FolderOpenOutlined,
    FileWordOutlined,
    IdcardOutlined,
    UserAddOutlined
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Button, Input, Layout, Menu, Space, theme } from 'antd'
import { MenuItemGroupType, MenuItemType } from 'antd/es/menu/interface'
import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { useConfirm } from '../../hooks'
import { apiUtil } from '../../utils'
import { useAppState } from './../../hooks'
import { ModalChangePassword } from './components'
import styles from './style.module.css'

type MenuItem = Required<MenuProps>['items'][number]

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}


const { Header, Content, Sider } = Layout

const AppLayout = (): React.JSX.Element => {
    const {
        token: { colorBgContainer },
    } = theme.useToken()

    const location = useLocation()

    const [setIsLogin, username, pageTitle] = useAppState(useShallow(s => [s.setIsLogin, s.username, s.pageTitle]))

    const confirmModal = useConfirm()

    const [collapsed, setCollapsed] = useState(false)

    const [title, setTitle] = useState<string>('')

    const [roleId, setRoleId] = useState<number>()

    const [isShowModalChangePassword, setIsShowModalChangePassword] = useState(false)

    const getUserInfo = (): any | null => {
        const userInfoString = localStorage.getItem('userInfo');
        try {
            if (userInfoString) {
                return JSON.parse(userInfoString);
            }
            return null;
        } catch (error) {
            console.error('Error parsing userInfo from localStorage:', error);
            return null;
        }
    }

    useEffect(() => {
        const userInfo = getUserInfo()
        setRoleId(userInfo?.RoleId)
    }, [])

    useEffect(() => {
        const pathname = location.pathname.slice(1)
        if (pathname.includes('/')) {
            const arr = pathname.split('/')
            const firstSegment: string = arr[0]
            const lastSegment: string = arr[arr.length - 1]
            const findMenu = items.find(n => n?.key == firstSegment)
            if (findMenu !== undefined) {
                const menuGroup = findMenu as MenuItemGroupType<MenuItemType>
                const findSubMenu = menuGroup.children?.find(n => n?.key == `${firstSegment}-${lastSegment}`)
                if (findSubMenu !== undefined) {
                    const subMenu = findSubMenu as MenuItemType
                    setTitle(subMenu?.title ?? '')
                } else {
                    setTitle(pageTitle)
                }
            } else {
                setTitle(pageTitle)
            }
        } else {
            const findMenu = items.find(n => n?.key === pathname)
            if (findMenu !== undefined) {
                if (findMenu != null) {
                    const menu = findMenu as MenuItemType
                    setTitle(menu.title ?? '')
                }
            }
        }
    }, [location, pageTitle])

    const defaultOpenKeys = useMemo<string[]>(() => {
        const pathname = window.location.pathname.slice(1)
        const arr = pathname.split('/')
        if (arr.length > 1) {
            const firstSegment = arr[0]
            return [firstSegment]
        }
        return []
    }, [])

    const defaultSelectedKeys = useMemo<string[]>(() => {
        const pathname = window.location.pathname.slice(1)
        const arr = pathname.split('/')
        if (arr.length === 1) {
            return [arr[0]]
        } else if (arr.length > 1) {
            const firstSegment = arr[0]
            const lastSegment = arr[1]
            return [`${firstSegment}-${lastSegment}`]
        }
        return []
    }, [])

    const onLogout = useCallback(() => {
        confirmModal({
            content: 'bạn có muốn đăng xuất không?',
            onOk: () => {
                localStorage.clear()
                setIsLogin(false)
                apiUtil.clearToken()
            },
        })
    }, [])

    const items: MenuItem[] = [

        getItem('ManagingMOU', 'managing-mou', <MenuUnfoldOutlined />, [
            ...(roleId === 1 || roleId === 3 || roleId === 4
                ? [getItem(<Link to="/Managing-MOU/documentlist">DocumnetList</Link>, 'documentlist', <FolderOutlined />)]
                : []),

            ...(roleId === 1 || roleId === 2
                ? [getItem(<Link to="/Managing-MOU/documentlistofemployee">Document List Of Employee</Link>, 'documentlistofemployee', <FileWordOutlined />)]
                : []),

            ...(roleId === 1 || roleId === 2 || roleId === 3 || roleId === 4 || roleId === null
                ? [getItem(<Link to="/Managing-MOU/template">Template</Link>, 'template', <FolderOpenOutlined />)]
                : []),

            ...(roleId === 1
                ? [getItem(<Link to="/Managing-MOU/category">Category</Link>, 'category')]
                : []),

            ...(roleId === 1 || roleId === 2 || roleId === 3 || roleId === 4
                ? [getItem(<Link to="/Managing-MOU/wordeditor">WordEditor</Link>, 'word-editor')]
                : []),
        ]),
        getItem('ManagingAccount', 'account-group', <SettingOutlined />, [
            ...(roleId === 1 || roleId === 2 || roleId === 4
                ? [getItem(<Link to="/ManagingAccount/listofcompany">List of Company</Link>, 'listofcompany', <IdcardOutlined />)]
                : []),

            ...(roleId === 3
                ? [getItem(<Link to="/ManagingAccount/Personal-account">Personal File</Link>, 'personalfile')]
                : []),
        ]),


        // ...(roleId !== 3
        //     ? [

        //         getItem('ManagingStudent', 'student-group', <UserOutlined />, [
        //             ...(roleId === 1 || roleId === 2 || roleId === 4
        //                 ? [getItem(<Link to="/ManagingStudent/post-graduate">ListOfPostGraduateStudent</Link>, 'ListOfPostGraduateStudent')]
        //                 : []),
        //             ...(roleId === 1 || roleId === 2 || roleId === 4
        //                 ? [getItem(<Link to="/ManagingStudent/graduates">TheNumberOfGraduates</Link>, 'TheNumberOfGraduates')] : []),
        //             ...(roleId === 1 || roleId === 2 || roleId === 4
        //                 ? [getItem(<Link to="/ManagingStudent/alumni">ComprehensiveAlumniManagement</Link>, 'Comprehensive Alumni Management')] : []),

        //             // getItem(<Link to="/ManagingStudent/dashboard-csv">DashboardCSV</Link>, 'dashboard-csv', <DashboardOutlined />),
        //         ]),
        //     ]
        //     : []),
    ];

    return (
        <Fragment>
            <Input addonBefore='' hidden />
            <Layout>
                <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} style={{ height: '100vh' }}>
                    <div
                        style={{
                            height: 32,
                            margin: '16px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: 6,
                        }}>
                        <div className={styles.textLogo}>{collapsed ? 'MOU' : 'PROCESSOR MOU'}</div>

                    </div>
                    <Menu
                        theme='dark'
                        mode='inline'
                        defaultOpenKeys={defaultOpenKeys}
                        defaultSelectedKeys={defaultSelectedKeys}
                        items={items}
                    />
                </Sider>
                <Layout>
                    <Header
                        style={{
                            padding: 0,
                            background: colorBgContainer,
                            borderBottom: '1px solid #f0f2f5',
                        }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                position: 'relative',
                            }}>
                            <div>
                                {/* type='text' */}
                                {/* // icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                                    // onClick={() => setCollapsed(!collapsed)} */}
                                {/* style={{ fontSize: 16, width: 64, height: 64 }} */}

                                <span style={{ fontSize: 18, fontWeight: 600 }}>{title}</span>
                            </div>
                            <Space style={{ marginRight: 24 }}>
                                <UserOutlined />
                                <span>{username}</span>
                                <Button icon={<KeyOutlined />} onClick={() => setIsShowModalChangePassword(true)} />
                                <Button type='primary' icon={<LogoutOutlined />} onClick={onLogout}>
                                    Đăng xuất
                                </Button>
                            </Space>
                        </div>
                    </Header>
                    <div style={{ overflowY: 'auto', height: 'calc(100vh - 65px)' }}>
                        <Content
                            style={{
                                margin: '6px 8px 8px 8px',
                                minHeight: 'auto',
                            }}>
                            <Outlet />
                        </Content>
                    </div>
                </Layout>
            </Layout>
            <ModalChangePassword isShow={isShowModalChangePassword} setIsShow={setIsShowModalChangePassword} />
        </Fragment>
    )
}

export default AppLayout

// Danh sách menu có submenu

