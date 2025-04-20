import React, { useState, useEffect } from 'react';
import { Space, Table, Tag, Button, Popconfirm, Form,message } from 'antd';
import type { TableProps } from 'antd';
import { EditOutlined, DeleteOutlined, PlusCircleOutlined, UploadOutlined } from '@ant-design/icons';

interface DataType {
    key: string;
    username: string;
    password: string;
    id: string;
}

const ListofUser: React.FC = () => {
    const [editForm] = Form.useForm();
    const [filteredData, setFilteredData] = useState<DataType[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userList, setUserList] = useState<DataType[]>([
            { key: '1', username: 'user1', password: '123456', id: '1' },
            { key: '2', username: 'user2', password: 'abcdef', id: '2' },
        ]);

    const handleEditClick = (record:DataType) => {
        editForm.setFieldsValue(record); // Set dữ liệu vào form
        setIsEditModalOpen(true); // Mở modal chỉnh sửa
    };
    const handleDelete = (id:string) => {
        const updatedList = userList.filter(item => item.id !== id);
        setUserList(updatedList); // Cập nhật state
        message.success('Deleted successfully');
    };


    const columns: TableProps<DataType>['columns'] = [
        {
            title: 'User Name',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'PassWord',
            dataIndex: 'password',
            key: 'password',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <EditOutlined style={{ color: 'blue' }} onClick={() => handleEditClick(record)} />
                    <Popconfirm
                        title="Are you sure to delete this MOU?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <DeleteOutlined style={{ color: 'red' }}/>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
    <div>
        <Table columns={columns} dataSource={userList} rowKey="id" />
    </div>
    );
}

export default ListofUser
