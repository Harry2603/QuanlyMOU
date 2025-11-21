import { Table, Space, Input, Button, Modal, Form, Input as AntInput, DatePicker, Row, Col, Upload, Select, InputNumber } from 'antd';
import React, { useState, useEffect } from 'react';
import type { TableColumnsType } from 'antd';
import { EditOutlined, DeleteOutlined, PlusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { apiUtil } from '../../utils';

const Category: React.FC = () => {
    const [filteredData, setFilteredData] = useState<CategoryType[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [CategoryList, setCategoryList] = useState<CategoryType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingRecord, setEditingRecord] = useState<CategoryType | null>(null);


    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const { Search } = Input;


    const onLoadCategory = () => {
        setIsLoading(true);
        apiUtil.auth.queryAsync<CategoryType[]>('Category_Select')
            .then(resp => {
                if (resp.IsSuccess && resp.Result) {
                    setCategoryList(resp.Result);
                }
            })
            .catch(error => {
                console.error('Error loading Category:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleEdit = (record: CategoryType) => {
        setEditingRecord(record); // lưu dữ liệu cần sửa
        editForm.setFieldsValue({
            Name: record.Name,
            Description: record.Description
        });
        setIsEditModalOpen(true); // mở modal Edit
    };

    const onDeleteCategory = (Id: number) => {
        setIsLoading(true);

        apiUtil.auth.queryAsync<{ IsSuccess: boolean }>('Category_Delete', { Id }).then(resp => {
            if (resp.IsSuccess) {
                // Xóa thành công, cập nhật danh sách
                setCategoryList(prevList => prevList.filter(item => item.Id !== Id));
                setIsLoading(false);
                // console.log(`Category với ID ${Id} đã bị xóa`);
            } else {
                // console.log(`Xóa Category thất bại`);
            }
        }).catch(error => {
            console.error('Lỗi khi xóa Category:', error);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        onLoadCategory()
    }, [])

    // Xóa một Category
    const handleDelete = (record: CategoryType) => {
        Modal.confirm({
            title: "Are you sure you want to delete this MOU?",
            okText: "Yes",
            cancelText: "No",
            onOk: async () => {
                try {
                    await onDeleteCategory(record.Id); // Gọi API để xóa MOU
                } catch (error) {
                    console.error("Lỗi khi xóa MOU:", error);
                }
            },
        });
    };
    // Hàm Search
    const onSearch = (value: string) => {
        const keyword = value.toLowerCase().trim();
        if (!keyword) {
            setFilteredData([]);
            return;
        }
        const result = CategoryList.filter(item =>
            (item.Name?.toLowerCase() ?? '').includes(keyword) ||
            (item.Description?.toLowerCase() ?? '').includes(keyword)
        );
        setFilteredData(result);
    };
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
    const handleAdd = async () => {
        try {
            const values = await addForm.validateFields();

            // Chuẩn bị dữ liệu theo format của API
            const newCategory: CategoryType = {
                Id: values.Id,
                Name: values.Name,
                Description: values.Description
            };

            // Gọi API Insert DoanhNghiep
            const resp = await apiUtil.auth.queryAsync('Category_Insert', newCategory);

            if (resp.IsSuccess) {
                const result = resp.Result as { Id: number };
                // Cập nhật danh sách sau khi thêm mới
                setFilteredData(prevData => [
                    ...prevData,
                    {
                        ...newCategory,
                        Id: result.Id, // Nếu backend trả lại ID mới thì lấy nó
                    }
                ]);
                setIsAddModalOpen(false);
                addForm.resetFields();
            } else {
                console.error('Error adding Category:', resp.Message);
            }
        } catch (error) {
            console.error("Validation failed Category:", error);
        }
    };

    const onSave = async (updatedRecord: CategoryType) => {
        setIsLoading(true);
        try {
            const resp = await apiUtil.auth.queryAsync('Category_Update', updatedRecord);
            if (resp.IsSuccess) {
                // Update lại list
                onLoadCategory();
                setIsEditModalOpen(false); // Close modal
            } else {
                console.error('Update category failed', resp.Message);
            }
        } catch (err) {
            console.error('Error when updating category:', err);
        } finally {
            setIsLoading(false);
        }
    };
    const handleOk = async () => {
        try {
            const values = await editForm.validateFields();
            onSave({ ...editingRecord, ...values });
        } catch (err) {
            console.error('Validation Failed:', err);
        }
    };
    // Cột Table
    const columns: TableColumnsType<CategoryType> = [
        {
            title: 'Count', key: 'index', ellipsis: true,
            render: (_text, _record, index) => index + 1
        },
        { title: 'Name', dataIndex: 'Name', key: 'Name' },
        { title: 'Description', dataIndex: 'Description', key: 'Description' },
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
                Category of Template
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
                <Table<CategoryType>
                    columns={columns}
                    dataSource={
                        (filteredData.length > 0 ? filteredData : CategoryList).sort((a, b) => a.Id - b.Id)
                    }
                    rowKey="Id"
                    scroll={{ x: 'max-content' }}
                />

            </div>
            <Modal
                title="Add Category"
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
                            <Form.Item name="Name" label="Category Name" rules={[{ required: true, message: 'Please input category name !' }]}>
                                <Input placeholder="Enter Category Name " />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="Description" label="Description" rules={[{ required: true, message: 'Please input Description!' }]}>
                                <Input placeholder="Enter Description" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
            <Modal
                title="Edit Category"
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
                            <Form.Item name="Name" label="Category Name" rules={[{ required: true, message: 'Please input category name !' }]}>
                                <Input placeholder="Enter Category Name " />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="Description" label="Description" rules={[{ required: true, message: 'Please input Description!' }]}>
                                <Input placeholder="Enter Description" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
}
export default Category;