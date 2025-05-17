import { Layout, Menu } from 'antd'
import { Link, Outlet, useLocation } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import PublicHeader from '../../pages/Home/PublicHeader';



const { Header, Content, Footer } = Layout

const PublicAppLayout = (): React.JSX.Element => {
    const location = useLocation()
    const [selectedKey, setSelectedKey] = useState<string>('home')

    useEffect(() => {
        const path = location.pathname.slice(1)
        setSelectedKey(path || 'home')
    }, [location])

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <PublicHeader />
            <Content style={{ padding: '24px 50px' }}>
                <Outlet />
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                © {new Date().getFullYear()} MOU App — Public Access
            </Footer>
        </Layout>
    )
}

export default PublicAppLayout
