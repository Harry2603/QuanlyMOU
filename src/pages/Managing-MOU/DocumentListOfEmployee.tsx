import React, { useEffect, useRef, useState } from 'react';
import { Space, Table, Button, Input, Typography, Tag } from 'antd';

import { DownloadOutlined, EditOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiUtil } from '../../utils';
import {
    DocumentEditorComponent,
    WordExport,
    // PdfExport,
    SfdtExport
} from '@syncfusion/ej2-react-documenteditor';
import EditDetail from './EditDetail';

DocumentEditorComponent.Inject(WordExport, SfdtExport)

const DocumentListOfEmployee: React.FC = () => {
    const [dataSource, setDataSource] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editUrl, setEditUrl] = useState<string | null>(null); // Thêm dòng này
    const [selectedFileId, setSelectedFileId] = useState<number>()
    const hiddenEditorRef = useRef<DocumentEditorComponent>(null)
    const { Search } = Input;
    const [filteredData, setFilteredData] = useState<FileDataType[]>([]);
    const [fileDataSelect, setFileDataSelect] = useState<FileDataType | null>(null)
    const { Title } = Typography;

    const loadAndDownload = async (format: 'Docx', fullUrl: string) => {
        try {
            const response = await fetch(fullUrl);
            const sfdtText = await response.text();

            const editor = hiddenEditorRef.current;
            if (editor) {
                editor.open(sfdtText);

                // Wait a bit to ensure the document is loaded before saving
                setTimeout(() => {
                    editor.save(`MyDocument.${format.toLowerCase()}`, format);
                }, 500);
            }
        } catch (error) {
            console.error('Download error:', error);
        }
    }

    const handleEdit = (record: FileDataType) => {
        setEditUrl(record.FullUrl);
        setSelectedFileId(record.FileID);
        setFileDataSelect(record)
        setIsModalOpen(true);
    };
    // const showModal = () => {
    //     setIsModalOpen(true);
    // };

    // const handleOk = () => {
    //     setIsModalOpen(false);
    // };

    // const handleCancel = () => {
    //     setIsModalOpen(false);
    // };

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

    // Hàm Search
    const onSearch = (value: string) => {
        const keyword = value.toLowerCase().trim();
        if (!keyword) {
            setFilteredData([]);
            return;
        }
        const result = dataSource.filter(item =>
            (item.FileName ?? "").toLowerCase().includes(keyword) ||
            (item.NguoiTao ?? "").toLowerCase().includes(keyword) ||
            (item.TenPartner ?? "").toLowerCase().includes(keyword)
            
        );
        setFilteredData(result);
    };


    const columns: ColumnsType<any> = [
        {
            title: 'Number',
            key: 'index',
            width: '15%',
            ellipsis: true,
            render: (_text, _record, index) => index + 1
        },
        {
            title: 'File Name',
            dataIndex: 'FileName',
            key: 'FileName',
            width: '30%',
            ellipsis: true,
            render: (text: string) => <a>{text}</a>,
        },
        {
            title: 'Status',
            dataIndex: 'Status',
            key: 'Status',
            width: '20%',
            ellipsis: true,
            render: (_: any, record: any) => {
                if (!record.Status_Side) {
                    return <Tag color="yellow">Writing</Tag>;
                } else if (record.Status_Side && !record.Status_BothSide) {
                    return <Tag color="yellow">One side finished</Tag>;
                } else if (record.Status_BothSide && !record.Status_SignatureA && !record.Status_SignatureB) {
                    return <Tag color="green">Waiting to approve</Tag>;
                } else if (record.Status_SignatureA && !record.Status_SignatureB) {
                    return <Tag color="green">On side Approved</Tag>;
                } else if (record.Status_SignatureB) {
                    return <Tag color="green">Both Sides Approved</Tag>;
                } else {
                    return <Tag color="default">Unknown</Tag>;
                }
            },
        },
        {
            title: 'Author',
            dataIndex: 'NguoiTao',
            key: 'NguoiTao',
            width: '20%',
            ellipsis: true,
            render: (text: string) => <span>{text}</span>,
        },
        {
            title: 'Partner',
            dataIndex: 'TenPartner',
            key: 'TenPartner',
            width: '20%',
            ellipsis: true,
            render: (text: string) => <span>{text}</span>,
        },
        {
            title: 'Action',
            key: 'action',
            width: '20%',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <EditOutlined style={{ color: 'blue' }} onClick={() => handleEdit(record)} />
                    <VerticalAlignBottomOutlined
                        style={{ color: 'red' }}
                        onClick={() => loadAndDownload('Docx', record.FullUrl)}
                        className="px-4 py-2 bg-green-600 text-white rounded">
                    </VerticalAlignBottomOutlined>
                </Space>
            ),
        },
    ];

    return (
        <>
            <div>
                <Title level={3}>List Of All Document For Admin</Title>
                <div style={{ display: 'flex', justifyContent: "right", gap: '10px', alignItems: "center" }}>
                    <Search
                        placeholder="Search description"
                        allowClear
                        enterButton="Search"
                        size="large"
                        onSearch={onSearch}
                        style={{ width: 300 }}
                    />
                </div>
                <Table columns={columns} dataSource={filteredData.length > 0 ? filteredData : dataSource} loading={loading} />

                <EditDetail
                    isHideEnd={false}
                    isModalOpen={isModalOpen}
                    Url={editUrl}
                    fileID={selectedFileId}
                    fileDataSelect={fileDataSelect ?? null}
                    onFetch={() => fetchData()}
                    onClose={() => setIsModalOpen(false)}
                />

                <div style={{ display: 'none' }}>
                    <DocumentEditorComponent
                        ref={hiddenEditorRef}
                        enableWordExport={true}
                        enableSfdtExport={true}
                        enableSelection={false}
                        enableEditor={false}
                        isReadOnly={true}
                    />
                </div>
            </div>
        </>

    );
};

export default DocumentListOfEmployee;