import React, { useState } from 'react';
import { Tabs, Space, Radio, Row, Col } from 'antd';
import type { RadioChangeEvent } from 'antd';
import SubTable from './ContentsOfTheCooperationAgreement'; // Import bảng con
import SubTableAlt from './ObligationsAndResponsibilitiesOfTheParties';


interface ExpandedContentProps {
    record: {
        description: string
        muc_dich: string;
        nguyen_tac: string;
    }; // Nhận dữ liệu từ hàng được mở rộng
}

const ExpandedContent: React.FC<ExpandedContentProps> = ({ record }) => {
    const [tabPosition, setTabPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('left');

    const changeTabPosition = (e: RadioChangeEvent) => {
        setTabPosition(e.target.value);
    };
    console.log("Expanded record data:", record);

    return (
        <div>
            <Space style={{ marginBottom: 24 }}>
                <Radio.Group value={tabPosition} onChange={changeTabPosition}>
                    <Radio.Button value="top">top</Radio.Button>
                </Radio.Group>
            </Space>
            <Tabs
                className="custom-styled-tabs"
                tabPosition={tabPosition}
                items={[
                    {
                        label: 'I. Purpose of cooperation',
                        key: 'muc_dich',
                        children: record?.muc_dich,
                    },
                    {
                        label: 'II. Principles of cooperation agreements',
                        key: 'nguyen_tac',
                        children: record?.nguyen_tac ,
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
