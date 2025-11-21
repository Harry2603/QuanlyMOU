import { Table, Space, Input, Button, Modal, Form, Input as AntInput, DatePicker, Row, Col, Upload, Select, InputNumber } from 'antd';
import React, { useState, useEffect } from 'react';
import type { TableColumnsType } from 'antd';
import ExpandedContent from './ExpandedContent';
import { EditOutlined, DeleteOutlined, PlusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiUtil } from '../../utils';

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
    muc_dich: string;
    nguyen_tac: string;
    trang_thai: number;
    id: number;
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
    const [isLoading, setIsLoading] = useState(false);
    const [mouList, setMOUList] = useState<DataType[]>([]);

    const onLoadMOU = () => {
        
        setIsLoading(true)
        apiUtil.auth.queryAsync<DataType[]>('MOU_Select').then(resp => {
            if (resp.IsSuccess) {
                if (resp.Result === null) return
                let handleData = resp.Result.map(item => {
                    let trang_thai_text = ''
                    if(item.trang_thai ==1 )
                        {
                        trang_thai_text = 'In Progres'
                        }
                    else if(item.trang_thai ==2)
                        {
                            trang_thai_text = 'Completed'
                        }
                        else if (item.trang_thai === 0) 
                            {
                            trang_thai_text = 'Pending';
                        }
                    return {...item, trang_thai_text:trang_thai_text}
                })
                // console.log('ds',handleData);

                setMOUList(handleData)// Cập nhật danh sách MOU vào state
                setIsLoading(false)// Kết thúc trạng thái loading
                // console.log('res.Result', resp.Result)
            } else {
                console.log('load linh vuc fail')
            }
        })
    }

    const onDeleteMOU = (id: number) => {
    setIsLoading(true);
    
    apiUtil.auth.queryAsync<{ IsSuccess: boolean }>('MOU_Delete', { id }).then(resp => {
        if (resp.IsSuccess) {
            // Xóa thành công, cập nhật danh sách
            setMOUList(prevList => prevList.filter(item => item.id !== id));
            setIsLoading(false);
            // console.log(`MOU với ID ${id} đã bị xóa`);
        } else {
            console.log(`Xóa MOU thất bại`);
        }
    }).catch(error => {
        console.error('Lỗi khi xóa MOU:', error);
        setIsLoading(false);
    });
};

    

    useEffect(() => {
        onLoadMOU()
    }, [])

    const handleEdit = async (record?: DataType) => {
        if (record) {
            // console.log("Dữ liệu record:", record); // Kiểm tra dữ liệu có hay khôngs
            // Chuyển đổi trạng thái số sang text khi hiển thị trong Form
        let trangThaiText = 'pending'; 
        if (record.trang_thai === 1) trangThaiText = 'in_progress';
        else if (record.trang_thai === 2) trangThaiText = 'completed';
            // Nếu có record => mở modal và set giá trị
            const periodParts = record.period?.split(" - ") || [];
            editForm.setFieldsValue({
                ...record,
                trang_thai: trangThaiText, // Hiển thị dạng text
                progress: parseInt(record.progress) || 0,
                status: record?.Status?.toLowerCase() || "",
                startDate: periodParts[0] ? dayjs(periodParts[0], "DD/MM/YY") : null,
                endDate: periodParts[1] ? dayjs(periodParts[1], "DD/MM/YY") : null,
            });
    
            setEditingRecord(record);
            setIsEditModalOpen(true);
        } else {
            try {
                const values = await editForm.validateFields();
                // console.log("Giá trị hợp lệ:", values);
                if (!editingRecord) {
                    // console.log("Không có dữ liệu để cập nhật!");
                    return;
                }
    
                const updatedData = {
                    ...editingRecord,
                    ...values,
                    progress: values.status === 'completed' ? '100%' : values.status === 'in_progress' ? `${values.progress || 0}%` : '0%',
                    period: `${values.startDate?.format('DD/MM/YY')} - ${values.endDate?.format('DD/MM/YY')}`
                };
    
                // Gọi API cập nhật
                const response = await apiUtil.auth.queryAsync('MOU_Update', updatedData);
    
                if (response.IsSuccess) {
                    setFilteredData(prevData =>
                        prevData.map(item => (item.key === editingRecord.key ? updatedData : item))
                    );
                    // console.log("Cập nhật thành công!");
                } else {
                    // console.log("Cập nhật thất bại!");
                }
    
                editForm.resetFields();
                setIsEditModalOpen(false);
            } catch (error) {
                console.error("Lỗi khi cập nhật:", error);
                // console.log("Cập nhật thất bại!");
            }
        }
    };
    
    
    

    // Hiển thị Modal
    const showAddModal = () => {
        addForm.resetFields();
        setProgress(0); // Reset progress về 0 khi mở modal
        setIsAddModalOpen(true);
    };

    const handleAdd = async () => {
        try {
            const values = await addForm.validateFields();

            const updatedProgress = values.status === "completed"
                ? "100%"
                : values.status === "in_progress"
                    ? `${progress}%`
                    : "0%";

            const newData: DataType = {
                key: crypto.randomUUID(), // Hoặc Date.now()
                ...values,
                progress: updatedProgress,
                Status: values.status === "completed"
                    ? "Completed"
                    : values.status === "in_progress"
                        ? "In Progress"
                        : "Pending",
                period: `${values.startDate.format("DD/MM/YY")} - ${values.endDate.format("DD/MM/YY")}`,
            };

            setFilteredData(prevData => [...prevData, newData]);
            setIsAddModalOpen(false);
            addForm.resetFields();
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };


    //  Đóng modal
    const handleCancel = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setTimeout(() => {
            addForm.resetFields();
            editForm.resetFields();
        }, 300);
    };
    // const handleEditClick = (record: DataType) => {
    //     showEditModal(record);
    // };

    // Xóa một MOU
    const handleDelete = (record: DataType) => {
        Modal.confirm({
            title: "Are you sure you want to delete this MOU?",
            okText: "Yes",
            cancelText: "No",
            onOk: async () => {
                try {
                    await onDeleteMOU(record.id); // Gọi API để xóa MOU
                } catch (error) {
                    console.error("Lỗi khi xóa MOU:", error);
                }
            },
        });
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
        { title: 'MOU-ID', dataIndex: 'ma_mou', key: 'ma_mou' },  // ID (trước là ma_mou)
        { title: 'Content', dataIndex: 'tieu_de', key: 'tieu_de' }, // Tiêu đề (trước là tieu_de)
        { title: 'Party A', dataIndex: 'TenDN_A', key: 'TenDN_A' }, // Bên A (trước là ben_a_id)
        { title: 'Party B', dataIndex: 'TenDN_B', key: 'TenDN_B' }, // Bên B (trước là ben_b_id)
        { title: 'Academic year', dataIndex: 'nam_hoc', key: 'nam_hoc' }, // Năm học (trước là nam_hoc)
        { title: 'Construction progress', dataIndex: 'PhanTramTienDo', key: 'PhanTramTienDo' }, // Phần trăm tiến độ (trước là PhanTramTienDo)
        { title: 'Status', dataIndex: 'trang_thai', key: 'trang_thai' }, // Trạng thái (trước là trang_thai)
        { title: 'Contract term', dataIndex: 'thoi_han', key: 'thoi_han', render: (text) => text ? text.split("T")[0] : "N/A"}, // Thời hạn hợp đồng (trước là thoi_han)
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <EditOutlined style={{ color: 'blue' }} onClick={() => handleEdit(record)} />
                    <DeleteOutlined style={{ color: 'red' }} onClick={() => handleDelete(record)} />
                </Space>
            ),
        },
    ];


    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                All cooperation agreements
            </p>

            <div style={{ display: 'flex', justifyContent: "right", gap: '10px', alignItems: "center" }}>
            {/* <WordEditor /> */}
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
                    dataSource={mouList}
                    expandable={{
                        expandedRowRender: (record) => <ExpandedContent record={record} />,
                    }}
                    scroll={{ x: 'max-content' }}
                    rowKey="id"
                />
            </div>

            {/* Modal Thêm Mới */}
            <Modal
                title="Add MOU"
                open={isAddModalOpen}
                onOk={handleAdd}
                onCancel={handleCancel}
                centered
                okText="Save"
                cancelText="Cancel"
                width={1000}
            >

                <Form form={addForm} onFinish={handleCancel} layout="vertical">
                    <Row gutter={10}>
                        <Col xs={24}>
                            <Form.Item label="Title" name="tieu_de" rules={[{ required: true, message: 'Please enter title!' }]}>
                                <AntInput placeholder="Please enter title!" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col xs={24} sm={6}>
                            <Form.Item label="MOU-ID" name="ma_mou" rules={[{ required: true, message: 'Please enter MOU code!' }]}>
                                <AntInput placeholder="Please enter MOU code!" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item label="Academic year" name="nam_hoc" rules={[{ required: true, message: 'Please enter academic year!' }]}>
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
                            <Form.Item label="Party A" name="TenDN_A" rules={[{ required: true, message: 'Please fill in Party A!' }]}>
                                <AntInput placeholder="Party A" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Party B" name="TenDN_B" rules={[{ required: true, message: 'Please fill in Party B!' }]}>
                                <AntInput placeholder="Party B" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col xs={24}>
                            <Form.Item label="Purpose" name="muc_dich" rules={[{ required: true, message: 'Please enter purpose!' }]}>
                                <TextArea rows={4} placeholder="Purpose" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col xs={24}>
                            <Form.Item label="Principle" name="nguyen_tac" rules={[{ required: true, message: 'Please enter principle!' }]}>
                                <TextArea rows={4} placeholder="Principle" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16} justify="space-between" align="middle">
                        <Col xs={24} sm={12}>
                            <Form.Item label="Status" name="trang_thai" rules={[{ required: true, message: 'Please select status!' }]}>
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
                            <Form.Item label="Construction progress"name="PhanTramTienDo">
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
                onOk={() => handleEdit()} // Gọi handleEdit() mà không truyền sự kiện
                onCancel={handleCancel}
                centered
                okText="Save"
                cancelText="Cancel"
                width={1000}
            >
                <Form form={editForm} layout="vertical">
                    <Row gutter={10}>
                        <Col xs={24}>
                            <Form.Item label="Title" name="tieu_de" rules={[{ required: true, message: 'Please enter title!' }]}>
                                <AntInput placeholder="Please enter title!" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col xs={24} sm={6}>
                            <Form.Item label="Code" name="ma_mou" rules={[{ required: true, message: 'Please enter MOU code!' }]}>
                                <AntInput placeholder="Please enter MOU code!" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item label="Academic year" name="nam_hoc" rules={[{ required: true, message: 'Please enter academic year!' }]}>
                                <AntInput type="number" placeholder="Please enter academic year!" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item label="Start Date" name="startDate" rules={[{ required: false, message: 'Select start date' }]}>
                                <DatePicker style={{ width: '100%' }} placeholder="Start Date" onChange={(date) => editForm.setFieldsValue({ startDate: date })} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item label="End Date" name="endDate" rules={[{ required: false, message: 'Select end date' }]}>
                                <DatePicker style={{ width: '100%' }} placeholder="End Date" onChange={(date) => editForm.setFieldsValue({ endDate: date })} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Party A" name="TenDN_A" rules={[{ required: true, message: 'Please fill in Party A!' }]}>
                                <AntInput placeholder="Party A" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Party B" name="TenDN_B" rules={[{ required: true, message: 'Please fill in Party B!' }]}>
                                <AntInput placeholder="Party B" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col xs={24}>
                            <Form.Item label="Purpose" name="muc_dich" rules={[{ required: true, message: 'Please enter purpose!' }]}>
                                <TextArea rows={4} placeholder="Purpose" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col xs={24}>
                            <Form.Item label="Principle" name="nguyen_tac" rules={[{ required: true, message: 'Please enter principle!' }]}>
                                <TextArea rows={4} placeholder="Principle" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16} justify="space-between" align="middle">
                        <Col xs={24} sm={12}>
                            <Form.Item label="Status" name="trang_thai" rules={[{ required: true, message: 'Please select status!' }]}>
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
                            <Form.Item label="Construction progress" name="PhanTramTienDo">
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






   // Hiển thị modal Edit
//    const showEditModal = (record: DataType) => {

//     const periodParts = record.period?.split(" - ") || [];
//     const startDate = periodParts[0] ? dayjs(periodParts[0], "DD/MM/YY") : dayjs();
//     const endDate = periodParts[1] ? dayjs(periodParts[1], "DD/MM/YY") : dayjs();
    
//     editForm.setFieldsValue({
//         ...record,
//         progress: parseInt(record.progress),
//         status: record?.Status?.toLowerCase() || "",
//         startDate: startDate,
//         endDate: endDate,
//     });

//     setEditingRecord(record);
//     setIsEditModalOpen(true);
//     console.log(isEditModalOpen);
//     setStartDate(startDate);
//     setEndDate(endDate);
// };


//   // Hàm Edit
//   const handleEdit = () => {
//     editForm.validateFields().then(values => {
//         const updatedData = {
//             ...editingRecord,
//             ...values,
//             progress: values.status === 'completed' ? '100%' : values.status === 'in_progress' ? `${progress}%` : '0%',
//             period: `${values.startDate?.format('DD/MM/YY')} - ${values.endDate?.format('DD/MM/YY')}`
//         };

//         setFilteredData(prevData =>
//             prevData.map(item => (item.key === editingRecord?.key ? updatedData : item))
//         );
//         editForm.resetFields();
//         setIsEditModalOpen(false);
//     });
// };