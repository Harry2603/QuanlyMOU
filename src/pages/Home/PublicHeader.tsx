// components/PublicHeader.tsx
import { Button, Flex, Layout } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header } = Layout;

const PublicHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = () => {
        navigate('/');
    };
    const showBackButton = location.pathname !== '/';
    return (
        <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '0 40px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#1a1a1a' }}>
                📝 A WEB-APP FOR DIGITAL OFFICE
            </div>
            <Flex gap="small">
                {showBackButton && (
                    <Button type="link" onClick={handleBack}>Back</Button>
                )}
                <Button type="link" onClick={() => navigate('/login')}>Login</Button>
                <Button type="link" onClick={() => navigate('/register')}>Register</Button>
            </Flex>
        </Header>
    );
};

export default PublicHeader;
