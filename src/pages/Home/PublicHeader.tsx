// components/PublicHeader.tsx
import { Button, Flex, Layout } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

const PublicHeader = () => {
    const navigate = useNavigate();

    return (
        <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '0 40px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#1a1a1a' }}>
                📝 A WEB-APP FOR DIGITAL OFFICE
            </div>
            {/* <Flex gap="small">
                <Button type="link" onClick={() => navigate('/template')}>Template</Button>
            </Flex> */}
            <Flex gap="small">
                <Button type="link" onClick={() => navigate('/login')}>Login</Button>
                <Button type="link" onClick={() => navigate('/register')}>Register</Button>
            </Flex>
        </Header>
    );
};

export default PublicHeader;
    