import { Table, Space, Input, Button, Modal, Form, Input as AntInput, DatePicker, Row, Col, Upload, Select, InputNumber } from 'antd';
import React, { useState, useEffect } from 'react';
import type { TableColumnsType } from 'antd';
import { EditOutlined, DeleteOutlined, PlusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiUtil } from '../../utils';
import Title from 'antd/es/skeleton/Title';



const ListOfCompany: React.FC = () => {
    const [filteredData, setFilteredData] = useState<DNDataType[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [DNList, setDNList] = useState<DNDataType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingRecord, setEditingRecord] = useState<DNDataType | null>(null);


    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const { Search } = Input;
    const { TextArea } = Input;


    const onLoadDoanhNghiep = () => {
        setIsLoading(true);
        apiUtil.auth.queryAsync<DNDataType[]>('DoanhNghiep_Select')
            .then(resp => {
                if (resp.IsSuccess && resp.Result) {
                    setDNList(resp.Result);
                }
            })
            .catch(error => {
                console.error('Error loading DoanhNghiep:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const onSave = async (updatedRecord: DNDataType) => {
        setIsLoading(true);
        try {
            const resp = await apiUtil.auth.queryAsync('DoanhNghiep_Update', updatedRecord);
            if (resp.IsSuccess) {
                // Update lại list
                onLoadDoanhNghiep();
                setIsEditModalOpen(false); // Close modal
            } else {
                console.error('Update failed', resp.Message);
            }
        } catch (err) {
            console.error('Error when updating:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = async () => {
        try {
            const values = await addForm.validateFields();

            // Chuẩn bị dữ liệu theo format của API
            const newDoanhNghiep: DNDataType = {
                DoanhNghiepID:values.DoanhNghiepID, 
                MaDN: values.MaDN,
                TenDN: values.TenDN,
                DiaChi: values.DiaChi,
                SDT: values.SDT,
                Email: values.Email,
                NguoiDaiDien: values.NguoiDaiDien,
                Website: values.Website,
                NgayThanhLap: values.NgayThanhLap.format('YYYY-MM-DD'), // Convert ngày thành dạng 'YYYY-MM-DD' cho chuẩn
                GhiChu: values.GhiChu,
            };

            // Gọi API Insert DoanhNghiep
            const resp = await apiUtil.auth.queryAsync('DoanhNghiep_Insert', newDoanhNghiep);

            if (resp.IsSuccess) {
                const result = resp.Result as { DoanhNghiepID: number };
                // Cập nhật danh sách sau khi thêm mới
                setFilteredData(prevData => [
                    ...prevData,
                    {
                        ...newDoanhNghiep,
                        DoanhNghiepID: result.DoanhNghiepID, // Nếu backend trả lại ID mới thì lấy nó
                    }
                ]);
                setIsAddModalOpen(false);
                addForm.resetFields();
            } else {
                console.error('Error adding DoanhNghiep:', resp.Message);
            }
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };



    const onDeleteMOU = (DoanhNghiepID: number) => {
        setIsLoading(true);

        apiUtil.auth.queryAsync<{ IsSuccess: boolean }>('DoanhNghiep_Delete', { DoanhNghiepID }).then(resp => {
            if (resp.IsSuccess) {
                // Xóa thành công, cập nhật danh sách
                setDNList(prevList => prevList.filter(item => item.DoanhNghiepID !== DoanhNghiepID));
                setIsLoading(false);
                console.log(`Doanh Nghiep với ID ${DoanhNghiepID} đã bị xóa`);
            } else {
                console.log(`Xóa Doanh Nghiệp thất bại`);
            }
        }).catch(error => {
            console.error('Lỗi khi xóa Doanh Nghiệp:', error);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        onLoadDoanhNghiep()
    }, [])

    // Hiển thị Modal
    const showAddModal = () => {
        addForm.resetFields();
        editForm.resetFields();
        setIsAddModalOpen(true);
    };
    //  Đóng modal
    const handleCancel = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setTimeout(() => {
            // addForm.resetFields();
            editForm.resetFields();
        }, 300);
    };
    const handleOk = async () => {
        try {
            const values = await editForm.validateFields();
            if (values.NgayThanhLap) {
                values.NgayThanhLap = values.NgayThanhLap.format('YYYY-MM-DD');
            }
            onSave({ ...editingRecord, ...values });
        } catch (err) {
            console.error('Validation Failed:', err);
        }
    };

    const handleEdit = (record: DNDataType) => {
        setEditingRecord(record); // lưu dữ liệu cần sửa
        editForm.setFieldsValue({
            ...record,
            NgayThanhLap: record.NgayThanhLap ? dayjs(record.NgayThanhLap) : null, // nếu có date thì convert về dayjs
        });
        setIsEditModalOpen(true); // mở modal Edit
    };




    // Hàm Search
    const onSearch = (value: string) => {
        const keyword = value.toLowerCase().trim();
        if (!keyword) {
            setFilteredData([]);
            return;
        }
        const result = DNList.filter(item =>
            (item.TenDN?.toLowerCase() ?? '').includes(keyword) ||
            (item.MaDN?.toLowerCase() ?? '').includes(keyword) ||
            (item.NguoiDaiDien?.toLowerCase() ?? '').includes(keyword)
        );
        setFilteredData(result);
    };
    // Xóa một MOU
    const handleDelete = (record: DNDataType) => {
        Modal.confirm({
            title: "Are you sure you want to delete this MOU?",
            okText: "Yes",
            cancelText: "No",
            onOk: async () => {
                try {
                    await onDeleteMOU(record.DoanhNghiepID); // Gọi API để xóa MOU
                } catch (error) {
                    console.error("Lỗi khi xóa MOU:", error);
                }
            },
        });
    };



    // Cột Table
    const columns: TableColumnsType<DNDataType> = [
        { title: 'Business Code', dataIndex: 'MaDN', key: 'MaDN' },
        { title: 'Company Name', dataIndex: 'TenDN', key: 'TenDN' },
        { title: 'Representative', dataIndex: 'NguoiDaiDien', key: 'NguoiDaiDien' },
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
                List of Company
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
                <Table<DNDataType>
                    columns={columns}
                    dataSource={filteredData.length > 0 ? filteredData : DNList}
                    scroll={{ x: 'max-content' }}
                    rowKey="DoanhNghiepID"
                />
            </div>

            <Modal
                title="Add Company Information"
                onCancel={handleCancel}
                onOk={handleAdd}
                okText="Save"
                cancelText="Cancel"
                open={isAddModalOpen} // đừng quên open
                width={700}
            >
                <Form form={addForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="MaDN" label="Business Code" rules={[{ required: true, message: 'Please input Company ID!' }]}>
                                <Input placeholder="Enter Company ID" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="TenDN" label="Company Name" rules={[{ required: true, message: 'Please input Company Name!' }]}>
                                <Input placeholder="Enter Company Name" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="DiaChi" label="Address">
                                <Input placeholder="Enter Address" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="SDT" label="Phone Number">
                                <Input placeholder="Enter Phone Number" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="Email" label="Email">
                                <Input placeholder="Enter Email" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="NguoiDaiDien" label="Representative">
                                <Input placeholder="Enter Representative" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="Website" label="Website">
                                <Input placeholder="Enter Website" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="NgayThanhLap" label="Establishment Date">
                                <DatePicker style={{ width: '100%' }} placeholder="Select Date" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24}>
                            <Form.Item name="GhiChu" label="Note">
                                <Input.TextArea rows={3} placeholder="Enter Note" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Modal
                title="Edit Company Information"
                onCancel={handleCancel}
                onOk={handleOk}
                okText="Save"
                cancelText="Cancel"
                open={isEditModalOpen} // đừng quên open
                width={700}
            >
                <Form form={editForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="MaDN" label="Business Code" rules={[{ required: true, message: 'Please input Company ID!' }]}>
                                <Input placeholder="Enter Company ID" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="TenDN" label="Company Name" rules={[{ required: true, message: 'Please input Company Name!' }]}>
                                <Input placeholder="Enter Company Name" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="DiaChi" label="Address">
                                <Input placeholder="Enter Address" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="SDT" label="Phone Number">
                                <Input placeholder="Enter Phone Number" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="Email" label="Email">
                                <Input placeholder="Enter Email" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="NguoiDaiDien" label="Representative">
                                <Input placeholder="Enter Representative" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="Website" label="Website">
                                <Input placeholder="Enter Website" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="NgayThanhLap" label="Establishment Date">
                                <DatePicker style={{ width: '100%' }} placeholder="Select Date" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24}>
                            <Form.Item name="GhiChu" label="Note">
                                <Input.TextArea rows={3} placeholder="Enter Note" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

        </div>
    );
};
export default ListOfCompany;