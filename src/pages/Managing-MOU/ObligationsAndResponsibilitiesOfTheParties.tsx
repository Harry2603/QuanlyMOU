import React, { useState } from 'react';
import { Table, Space, Modal, Input, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Column, ColumnGroup } = Table;

interface DataType {
    key: string;
    content: string;
    tags: string[];
}

interface SubTableAltProps {
    dataType: string;
}

const initialDataA: DataType[] = [
    { key: '1', content: 'Content A1', tags: ['active'] },
    { key: '2', content: 'Content A2', tags: ['pending'] },
];

const initialDataB: DataType[] = [
    { key: '1', content: 'Content B1', tags: ['completed'] },
    { key: '2', content: 'Content B2', tags: ['review'] },
];

const SubTableAlt: React.FC<SubTableAltProps> = ({ dataType }) => {
    const [data, setData] = useState<DataType[]>(dataType === 'A' ? initialDataA : initialDataB);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<DataType | null>(null);
    const [editedContent, setEditedContent] = useState('');

    // ✅ Hàm Edit
    const handleEdit = (record: DataType) => {
        setEditingRecord(record);
        setEditedContent(record.content);
        setIsModalOpen(true);
    };

    const handleSaveEdit = () => {
        if (editingRecord) {
            if (editedContent.trim() === editingRecord.content) {
                message.info('No changes made');
                return;
            }
            const updatedData = data.map(item =>
                item.key === editingRecord.key ? { ...item, content: editedContent } : item
            );
            setData(updatedData);
            setIsModalOpen(false);
            message.success('Content updated successfully');
        }
    };

    // ✅ Hàm Delete
    const handleDelete = (record: DataType) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this record?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => {
                const updatedData = data.filter(item => item.key !== record.key);
                setData(updatedData);
                message.success('Record deleted successfully');
            },
        });
    };

    return (
        <>
            <Table<DataType> dataSource={data} pagination={false} bordered rowKey="key">
                <ColumnGroup title={`Party ${dataType}`}>
                    <Column title="Content" dataIndex="content" key="content" width={600} 
                        render={(text: string) => (
                            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {text}
                            </div>
                        )}
                    />
                    <Column
                        title="Action"
                        key="action"
                        render={(_: any, record: DataType) => (
                            <Space size="middle" style={{ textAlign: 'center'}}>
                                <EditOutlined style={{ color: 'blue' }} onClick={() => handleEdit(record)} />
                                <DeleteOutlined style={{ color: 'red' }} onClick={() => handleDelete(record)} />
                            </Space>
                        )}
                    />
                </ColumnGroup>
            </Table>

            {/* Modal cho Edit */}
            <Modal
                title="Edit Content"
                open={isModalOpen}
                onOk={handleSaveEdit}
                onCancel={() => setIsModalOpen(false)}
                okText="Save"
            >
                <Input
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    placeholder="Edit content"
                />
            </Modal>
        </>
    );
};

export default SubTableAlt;
