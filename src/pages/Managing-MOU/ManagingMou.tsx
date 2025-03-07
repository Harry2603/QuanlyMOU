import axios from 'axios';
import { Table, Space, Input, Button, Modal, Form, Input as AntInput, DatePicker, Row, Col, Upload, Select, InputNumber } from 'antd';
import React, { useState } from 'react';
import type { TableColumnsType } from 'antd';
import ExpandedContent from './ExpandedContent';
import { EditOutlined, DeleteOutlined, PlusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Search } = Input;
const { TextArea } = Input;

interface DataType {
    key: string;
    nameA: string;
    nameB: string;
    academicYear: number;
    progress: string;
    Status: string;
    ID: string;
    period: string;
    address: string;
    description: string;
    purpose: string;
    principle: string;
}


const ManagingMOU: React.FC = () => {
    const [filteredData, setFilteredData] = useState<DataType[]>([]);
    // const [isModalOpen, setIsModalOpen] = useState(false);

    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [progress, setProgress] = useState(0);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<DataType | null>(null);
    const [startDate, setStartDate] = useState(dayjs());
    const [endDate, setEndDate] = useState(dayjs());

    console.log("startDate:", startDate);
    console.log("endDate:", endDate);
    // console.log("addForm:", addForm);
    // console.log("editForm:", editForm);

    // // Fetch dữ liệu từ API khi component mount
    // useEffect(() => {
    //     axios.get(API_URL)
    //         .then(response => {
    //             setFilteredData(response.data);
    //         })
    //         .catch(error => console.error('Error fetching data:', error));
    // }, []);
    // Hiển thị Modal
    const showAddModal = () => {
        addForm.resetFields();
        setProgress(0); // Reset progress về 0 khi mở modal
        setIsAddModalOpen(true);
    };


    // Hiển thị modal Edit
    const showEditModal = (record: DataType) => {
        const periodParts = record.period.split(" - "); // Tách chuỗi "DD/MM/YY - DD/MM/YY"
        const startDate = periodParts[0] ? dayjs(periodParts[0], "DD/MM/YY") : dayjs();
        const endDate = periodParts[1] ? dayjs(periodParts[1], "DD/MM/YY") : dayjs();


        editForm.setFieldsValue({
            ...record,
            progress: parseInt(record.progress),
            status: record.Status.toLowerCase(),
            startDate: startDate,
            endDate: endDate,
        });

        setEditingRecord(record);
        setIsEditModalOpen(true);
        setStartDate(startDate);  // Đúng kiểu dữ liệu
        setEndDate(endDate);      // Đúng kiểu dữ liệu
    };


    // Đóng Modal
    const handleCancel = () => {
        setTimeout(() => {
            addForm.resetFields();
            editForm.resetFields();
        }, 300);
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
    };

    // Thêm hoặc Cập nhật dữ liệu mới từ Modal
    const handleOk = () => {
        addForm.validateFields().then(values => {
            let updatedProgress = '0%';
            if (values.status === 'in_progress') updatedProgress = `${progress}%`;
            else if (values.status === 'completed') updatedProgress = '100%';

            const newData: DataType = {
                key: `${filteredData.length + 1}`,
                ID: values.ID,
                nameA: values.nameA,
                nameB: values.nameB,
                academicYear: values.academicYear,
                progress: updatedProgress,
                Status: values.status === 'completed' ? 'Completed' : values.status === 'in_progress' ? 'In Progress' : 'Pending',
                period: `${values.startDate?.format('DD/MM/YY')} - ${values.endDate?.format('DD/MM/YY')}`,
                address: values.address || 'MOU-File',
                description: values.description,
                purpose: values.purpose,
                principle: values.principle,

            };
            axios.post('https://api.mou.iotsoftvn.com/auth/query/MOU_Select_By_Id', newData)
            .then(() => {
                setFilteredData([...filteredData, newData]);
                addForm.resetFields();
                setIsAddModalOpen(false);
            })
            .catch(error => console.error('Error adding data:', error));
    });
};

    // Hàm Edit
     // Chỉnh sửa MOU
     const handleEdit = () => {
        editForm.validateFields().then(values => {
            const updatedData = {
                ...editingRecord,
                ...values,
                progress: values.status === 'completed' ? '100%' : values.status === 'in_progress' ? `${progress}%` : '0%',
                period: `${values.startDate?.format('DD/MM/YY')} - ${values.endDate?.format('DD/MM/YY')}`
            };

            axios.post('https://api.mou.iotsoftvn.com/auth/execute-reader/MOU_Select_By_Id', updatedData)
                .then(() => {
                    setFilteredData(prevData =>
                        prevData.map(item => (item.key === editingRecord?.key ? updatedData : item))
                    );
                    editForm.resetFields();
                    setIsEditModalOpen(false);
                })
                .catch(error => console.error('Error updating data:', error));
        });
    };


    // const handleEditClick = (record: DataType) => {
    //     showEditModal(record);
    // };

    // Hàm Delete
    const handleDelete = (record: DataType) => {
        axios.delete('https://api.mou.iotsoftvn.com/auth/execute-reader/MOU_Select_By_Id')
            .then(() => {
                setFilteredData(prev => prev.filter(item => item.key !== record.key));
            })
            .catch(error => console.error('Error deleting data:', error));
    };

    // Hàm Search
    const onSearch = (value: string) => {
        const keyword = value.toLowerCase();
        const result = filteredData.filter(item =>
            item.nameA.toLowerCase().includes(keyword) ||
            item.ID.toLowerCase().includes(keyword) ||
            item.description.toLowerCase().includes(keyword)
        );
        setFilteredData(result);
    };

    // Cột Table
    const columns: TableColumnsType<DataType> = [
        { title: 'Code', dataIndex: 'ID', key: 'ID' },
        { title: 'Agreement', dataIndex: 'description', key: 'description' },
        { title: 'Party A', dataIndex: 'nameA', key: 'nameA' },
        { title: 'Party B', dataIndex: 'nameB', key: 'nameB' },
        { title: 'Academic year', dataIndex: 'academicYear', key: 'academicYear' },
        { title: 'Construction progress', dataIndex: 'progress', key: 'progress' },
        { title: 'Status', dataIndex: 'Status', key: 'Status' },
        { title: 'Contract term', dataIndex: 'period', key: 'period' },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <EditOutlined style={{ color: 'blue' }} onClick={() => showEditModal(record)} />
                    <DeleteOutlined style={{ color: 'red' }} onClick={() => handleDelete(record)} />
                </Space>
            ),
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>All cooperation agreements</p>

            <div style={{ display: 'flex', justifyContent: "right", gap: '10px', alignItems: "center" }}>
                <Search
                    placeholder="Search by name, code or description"
                    allowClear
                    enterButton="Search"
                    size="large"
                    onSearch={onSearch}
                    style={{ width: 300 }}
                />
                <Button type="primary" size="large" icon={<PlusCircleOutlined />} onClick={showAddModal}></Button>
            </div>

            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                <Table<DataType>
                    columns={columns}
                    dataSource={filteredData}
                    expandable={{
                        expandedRowRender: (record) => <ExpandedContent record={record} />,
                    }}
                    scroll={{ x: 'max-content' }}
                    rowKey="key"
                />
            </div>

            {/* Modal Thêm Mới */}
            <Modal
                title="Add MOU"
                open={isAddModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                centered
                okText="Save"
                cancelText="Cancel"
                width={1000}
            >
                <Form form={addForm} layout="vertical">
                    <Row gutter={10}>
                        <Col xs={24}>
                            <Form.Item label="Title" name="description" rules={[{ required: true, message: 'Please enter title!' }]}>
                                <AntInput placeholder="Please enter title!" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col xs={24} sm={6}>
                            <Form.Item label="Code" name="ID" rules={[{ required: true, message: 'Please enter MOU code!' }]}>
                                <AntInput placeholder="Please enter MOU code!" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item label="Academic year" name="academicYear" rules={[{ required: true, message: 'Please enter academic year!' }]}>
                                <AntInput type="number" placeholder="Please enter academic year!" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item label="Start Date" name="startDate" rules={[{ required: true, message: 'Select start date' }]}>
                                <DatePicker style={{ width: '100%' }} placeholder="Start Date" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item label="End Date" name="endDate" rules={[{ required: true, message: 'Select end date' }]}>
                                <DatePicker style={{ width: '100%' }} placeholder="End Date" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Party A" name="nameA" rules={[{ required: true, message: 'Please fill in Party A!' }]}>
                                <AntInput placeholder="Party A" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Party B" name="nameB" rules={[{ required: true, message: 'Please fill in Party B!' }]}>
                                <AntInput placeholder="Party B" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col xs={24}>
                            <Form.Item label="Purpose" name="purpose" rules={[{ required: true, message: 'Please enter purpose!' }]}>
                                <TextArea rows={4} placeholder="Purpose" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col xs={24}>
                            <Form.Item label="Principle" name="principle" rules={[{ required: true, message: 'Please enter principle!' }]}>
                                <TextArea rows={4} placeholder="Principle" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16} justify="space-between" align="middle">
                        <Col xs={24} sm={12}>
                            <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please select status!' }]}>
                                <Select
                                    placeholder="Select status"
                                    onChange={(value) => {
                                        if (value === 'pending') setProgress(0);
                                        else if (value === 'in_progress' && progress === 0) setProgress(10);
                                        else if (value === 'completed') setProgress(100);
                                    }}
                                >
                                    <Select.Option value="pending">Pending</Select.Option>
                                    <Select.Option value="in_progress">In Progress</Select.Option>
                                    <Select.Option value="completed">Completed</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item label="Progress (%)">
                                <InputNumber
                                    min={0}
                                    max={100}
                                    value={progress}
                                    onChange={(value) => {
                                        setProgress(value ?? 0);
                                        addForm.setFieldsValue({ progress: value ?? 0 });
                                    }}
                                    addonAfter="%"
                                    disabled={addForm.getFieldValue('status') === 'completed'}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={4}>
                            <Form.Item label="Upload Evidence" name="evidenceFile">
                                <Upload beforeUpload={() => false}>
                                    <Button icon={<UploadOutlined />}>Select File</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Modal Edit */}
            <Modal
                title="Edit MOU"
                open={isEditModalOpen}
                onOk={handleEdit}
                onCancel={handleCancel}
                centered
                okText="Save"
                cancelText="Cancel"
                width={1000}
            >
                <Form form={editForm} layout="vertical">
                    <Row gutter={10}>
                        <Col xs={24}>
                            <Form.Item label="Title" name="description" rules={[{ required: true, message: 'Please enter title!' }]}>
                                <AntInput placeholder="Please enter title!" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col xs={24} sm={6}>
                            <Form.Item label="Code" name="ID" rules={[{ required: true, message: 'Please enter MOU code!' }]}>
                                <AntInput placeholder="Please enter MOU code!" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item label="Academic year" name="academicYear" rules={[{ required: true, message: 'Please enter academic year!' }]}>
                                <AntInput type="number" placeholder="Please enter academic year!" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item label="Start Date" name="startDate" rules={[{ required: true, message: 'Select start date' }]}>
                                <DatePicker style={{ width: '100%' }} placeholder="Start Date" onChange={(date) => editForm.setFieldsValue({ startDate: date })} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item label="End Date" name="endDate" rules={[{ required: true, message: 'Select end date' }]}>
                                <DatePicker style={{ width: '100%' }} placeholder="End Date" onChange={(date) => editForm.setFieldsValue({ endDate: date })} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Party A" name="nameA" rules={[{ required: true, message: 'Please fill in Party A!' }]}>
                                <AntInput placeholder="Party A" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Party B" name="nameB" rules={[{ required: true, message: 'Please fill in Party B!' }]}>
                                <AntInput placeholder="Party B" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col xs={24}>
                            <Form.Item label="Purpose" name="purpose" rules={[{ required: true, message: 'Please enter purpose!' }]}>
                                <TextArea rows={4} placeholder="Purpose" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col xs={24}>
                            <Form.Item label="Principle" name="principle" rules={[{ required: true, message: 'Please enter principle!' }]}>
                                <TextArea rows={4} placeholder="Principle" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16} justify="space-between" align="middle">
                        <Col xs={24} sm={12}>
                            <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please select status!' }]}>
                                <Select
                                    placeholder="Select status"
                                    onChange={(value) => {
                                        if (value === 'pending') setProgress(0);
                                        else if (value === 'in_progress' && progress === 0) setProgress(10);
                                        else if (value === 'completed') setProgress(100);
                                    }}
                                >
                                    <Select.Option value="pending">Pending</Select.Option>
                                    <Select.Option value="in_progress">In Progress</Select.Option>
                                    <Select.Option value="completed">Completed</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item label="Progress (%)">
                                <InputNumber
                                    min={0}
                                    max={100}
                                    value={progress}
                                    onChange={(value) => setProgress(value ?? 0)}
                                    addonAfter="%"
                                    disabled={editForm.getFieldValue('status') === 'completed'}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={4}>
                            <Form.Item label="Upload Evidence" name="evidenceFile">
                                <Upload beforeUpload={() => false}>
                                    <Button icon={<UploadOutlined />}>Select File</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default ManagingMOU;
