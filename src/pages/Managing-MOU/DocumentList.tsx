import React, { useEffect, useState } from 'react';
import { Space, Table, Tag, Modal, Button } from 'antd';
import axios from 'axios';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { apiUtil } from '../../utils';
import EditDetail from './EditDetail';

const App: React.FC = () => {
    const [dataSource, setDataSource] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const navigate = useNavigate(); // điều hướng đến WordEditor
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editUrl, setEditUrl] = useState<string | null>(null); // Thêm dòng này
    const [selectedFileId, setSelectedFileId] = useState<number>()

    const handleEdit = (record: any) => {
        setEditUrl(record.FullUrl);
        setSelectedFileId(record.FileID);
        setIsModalOpen(true);
    };
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const fetchData = async () => {
        try {
            const res = await apiUtil.auth.queryAsync('FileData_Select', {});
            if (res.IsSuccess) {
                const result = (res.Result as any[]).map((item: any, index: number) => ({
                    ...item,
                    key: index,
                }));
                setDataSource(result);
            }
        } catch (err) {
            console.error("Error fetching file list:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    const columns: ColumnsType<any> = [
        {
            title: 'File Name',
            dataIndex: 'FileName',
            key: 'FileName',
            render: (text: string) => <a>{text}</a>,
        },
        {
            title: 'Auhtor',
            dataIndex: 'author',
            key: 'author',
            render: (text: string) => <a>{text}</a>,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <a onClick={() => handleEdit(record)}>Edit</a>

                    <a onClick={() => setPreviewUrl(record.FullUrl)}>Xem trước</a>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Table columns={columns} dataSource={dataSource} loading={loading} />
            {/* Modal xem trước file */}
            <Modal
                title="Watching"
                open={!!previewUrl}
                onCancel={() => setPreviewUrl(null)}
                footer={null}
                width="80%"
                style={{ top: 20 }}
            >
                {previewUrl && (
                    <iframe
                        src={previewUrl}
                        title="Document Preview"
                        width="100%"
                        height="600px"
                        style={{ border: 'none' }}
                    />
                )}
            </Modal>
            <EditDetail
                isModalOpen={isModalOpen}
                Url={editUrl}
                fileID={selectedFileId}
                onFetch={() => fetchData()}
                onClose={() => setIsModalOpen(false)}
            />

        </>
    );
};

export default App;
