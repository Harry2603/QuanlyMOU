import {
    DashboardOutlined,
    KeyOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined
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

    const [isShowModalChangePassword, setIsShowModalChangePassword] = useState(false)

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

    return (
        <Fragment>
            <Input addonBefore='' hidden />
            <Layout>
                <Sider trigger={null} collapsible collapsed={collapsed} style={{ height: '100vh' }}>
                    <div
                        style={{
                            height: 32,
                            margin: '16px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: 6,
                        }}>
                        <div className={styles.textLogo}>{collapsed ? 'QLVP' : 'Quản lý vi phạm'}</div>
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
                                <Button
                                    type='text'
                                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                                    onClick={() => setCollapsed(!collapsed)}
                                    style={{ fontSize: 16, width: 64, height: 64 }}
                                />
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

const items: MenuItem[] = [
    {
        key: 'tong-quan',
        icon: <DashboardOutlined />,
        label: <Link to='/tong-quan'>Tổng quan</Link>,
        title: 'Tổng quan',
    },
]
