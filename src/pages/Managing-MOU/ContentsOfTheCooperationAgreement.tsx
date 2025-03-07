import React, { useState } from 'react';
import { Form, Input, DatePicker, Select, Upload, Button, Modal, Table, Row, Col, InputNumber } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';

const { TextArea } = Input;

interface SubDataType {
    key: string;
    section: string;
    details: string;
    progress: string;
    overview: string;
    rowSpan?: number;
    rowSpanOverview?: number;
}

const ProgressForm: React.FC<{ visible: boolean; onCancel: () => void; onSubmit: (values: any) => void }> = ({ visible, onCancel, onSubmit }) => {
    const [form] = Form.useForm();
    const [progress, setProgress] = useState<number>(0);

    const handleFinish = (values: any) => {
        console.log("Form values:", values);
        onSubmit(values);           // Gửi dữ liệu ra ngoài
        form.resetFields();         // ✅ Reset form sau khi Submit
    };

    const handleCancel = () => {
        form.resetFields();         // ✅ Reset form khi Cancel
        onCancel();                 // Đóng Modal
    };

    return (
        <Modal
            title="Thêm mới tiến độ thực hiện"
            open={visible}
            onCancel={handleCancel}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()}>
                    Submit
                </Button>
            ]}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                {/* Hàng 1: Tên tiến độ */}
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item label="Tên tiến độ" name="progressName" rules={[{ required: true, message: 'Vui lòng nhập tên tiến độ' }]}>
                            <Input placeholder="Tên tiến độ" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item label="Người đại diện" name="representative">
                            <Input placeholder="Người đại diện" />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Hàng 2: Ngày thực hiện - Ngày kết thúc */}
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item label="Ngày thực hiện" name="startDate" rules={[{ required: true, message: 'Chọn ngày thực hiện' }]}>
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Ngày thực hiện" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item label="Ngày kết thúc" name="endDate" rules={[{ required: true, message: 'Chọn ngày kết thúc' }]}>
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Ngày kết thúc" />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Hàng 3: Mô tả */}
                <Row gutter={16}>
                    <Col xs={24}>
                        <Form.Item label="Mô tả" name="description">
                            <TextArea rows={3} placeholder="Mô tả" />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Hàng 4: Trạng thái - Tiến độ - File minh chứng */}
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item label="Trạng thái" name="status">
                            <Select placeholder="Chọn trạng thái">
                                <Select.Option value="pending">Chờ xử lý</Select.Option>
                                <Select.Option value="in_progress">Đang thực hiện</Select.Option>
                                <Select.Option value="completed">Hoàn thành</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={8}>
                        <Form.Item label="Progress (%)" name="progress">
                            <InputNumber
                                min={0}
                                max={100}
                                value={progress}
                                onChange={(value) => setProgress(value ?? 0)}
                                addonAfter="%"
                                disabled={form.getFieldValue('status') === 'completed'}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row>
                    <Col xs={24} sm={12}>
                        <Form.Item label="File minh chứng" name="evidenceFile">
                            <Upload beforeUpload={() => false}>
                                <Button icon={<UploadOutlined />}>Chọn file</Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

const subData: SubDataType[] = [
    {
        key: '1',
        section: 'Clause 1',
        details: 'This is the detail for Clause 1',
        progress: '75%',
        overview: 'abc',
        rowSpan: 3,
        rowSpanOverview: 3,
    },
    { key: '1-2', section: '', details: 'Detail for Sub Clause 1.2', progress: '30%', overview: 'lmn' },
    { key: '1-1', section: '', details: 'Detail for Sub Clause 1.1', progress: '50%', overview: 'xyz' },
];

const SubTable: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        Modal.confirm({
            title: 'Bạn có chắc muốn hủy?',
            content: 'Các thay đổi sẽ không được lưu.',
            okText: 'Có',
            cancelText: 'Không',
            onOk: () => setIsModalVisible(false),
        });
    };

    const handleSubmit = (values: any) => {
        console.log("Form submitted:", values);
        setIsModalVisible(false);
    };

    const subColumns: TableColumnsType<SubDataType> = [
        {
            title: 'Content',
            dataIndex: 'section',
            align: 'center',
            key: 'section',
            onCell: (record) => ({
                rowSpan: record.rowSpan || 0,
            }),
        },
        {
            title: 'Main Content',
            dataIndex: 'details',
            align: 'center',
            key: 'details',
        },
        {
            title: 'Implementation progress',
            dataIndex: 'progress',
            align: 'center',
            key: 'progress',
            render: () => (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={showModal} />
                </div>
            ),
        },
        {
            title: 'Overview',
            dataIndex: 'overview',
            align: 'center',
            key: 'overview',
            onCell: (record) => ({
                rowSpan: record.rowSpanOverview || 0,
            }),
        },
    ];

    return (
        <>
            <Table columns={subColumns} dataSource={subData} pagination={false} bordered />
            <ProgressForm visible={isModalVisible} onCancel={handleCancel} onSubmit={handleSubmit} />
        </>
    );
};

export default SubTable;
