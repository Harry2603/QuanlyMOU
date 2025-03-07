import React, { useState } from 'react';
import { Tabs, Space, Radio, Row, Col } from 'antd';
import type { RadioChangeEvent } from 'antd';
import SubTable from './ContentsOfTheCooperationAgreement'; // Import bảng con
import SubTableAlt from './ObligationsAndResponsibilitiesOfTheParties';


interface ExpandedContentProps {
    record: {
        description: string
        purpose: string;
        principle: string;
    }; // Nhận dữ liệu từ hàng được mở rộng
}

const ExpandedContent: React.FC<ExpandedContentProps> = ({ record }) => {
    const [tabPosition, setTabPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('left');

    const changeTabPosition = (e: RadioChangeEvent) => {
        setTabPosition(e.target.value);
    };

    return (
        <div>
            <Space style={{ marginBottom: 24 }}>
                <Radio.Group value={tabPosition} onChange={changeTabPosition}>
                    <Radio.Button value="top">top</Radio.Button>
                    <Radio.Button value="bottom">bottom</Radio.Button>
                    <Radio.Button value="left">left</Radio.Button>
                    <Radio.Button value="right">right</Radio.Button>
                </Radio.Group>
            </Space>
            <Tabs
                className="custom-styled-tabs"
                tabPosition={tabPosition}
                items={[
                    {
                        label: 'I. Purpose of cooperation',
                        key: '1',
                        children: `Details about the purpose of cooperation - ${record.purpose}`,
                    },
                    {
                        label: 'II. Principles of cooperation agreements',
                        key: '2',
                        children: `Details about the principles of cooperation - ${record.principle}`,
                    },
                    {
                        label: 'III. Contents of the cooperation agreement',
                        key: '3',
                        children: (
                            <div>
                                <p>List of contents</p>
                                <SubTable /> {/* Gọi bảng con, không có Tabs */}
                            </div>
                        ),
                    },
                    {
                        label: 'IV. Obligations and responsibilities of the parties',
                        key: '4',
                        children: (
                            <Row gutter={16}>
                                {/* Cột cho Party A */}
                                <Col span={12}>
                                    <div className="subtable-box">

                                        <SubTableAlt dataType="A" /> {/* Truyền dữ liệu Party A */}
                                    </div>
                                </Col>

                                {/* Cột cho Party B */}
                                <Col span={12}>
                                    <div className="subtable-box">

                                        <SubTableAlt dataType="B" /> {/* Truyền dữ liệu Party B */}
                                    </div>
                                </Col>
                            </Row>
                        ),
                    },
                ]}
            />
        </div>
    );
};

export default ExpandedContent;
