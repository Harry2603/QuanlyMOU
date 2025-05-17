import React from 'react';
import { Layout, Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import './Home.css';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            <PublicHeader />
            <Content style={{ padding: 0, margin: 0 }}>
                <div className="hero-section">
                    <div className="hero-text">
                        <Title level={3} style={{ textAlign: 'center' }}>
                            Streamline Your Workflow with Digital Contracts
                        </Title>
                        <Paragraph style={{ color: 'white',textAlign: 'center' }}>
                            Access a wide range of ready-to-use, legally reviewed contract templates.
                            Customize in minutes and send out for signatures with ease. Ideal for startups,
                            agencies, and businesses of any size.
                        </Paragraph>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
                            <Button
                                type="primary"
                                className="hero-button"
                                size="large"
                                onClick={() => navigate('/template')}
                            >
                                Browse Template
                            </Button>
                        </div>
                    </div>
                    <div className="hero-image-container">
                        <img
                            src="/digitaloffice1.jpg"
                            alt="Digital Office"
                            className="hero-image"
                        />
                    </div>
                </div>
            </Content>
        </Layout>
    );
};

export default HomePage;
