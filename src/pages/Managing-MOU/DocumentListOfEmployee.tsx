import React, { useEffect, useRef, useState } from 'react';
import { Space, Table, Button, Input, Typography, Tag, Modal } from 'antd';

import { DownloadOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiUtil } from '../../utils';
import {
    DocumentEditorComponent,
    WordExport,
    // PdfExport,
    SfdtExport
} from '@syncfusion/ej2-react-documenteditor';
import EditDetailOfEmployee from './EditDetailOfEmployee';

DocumentEditorComponent.Inject(WordExport, SfdtExport)

const DocumentListOfEmployee: React.FC = () => {
    const [dataSource, setDataSource] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editUrl, setEditUrl] = useState<string | null>(null); // Thêm dòng này
    const [selectedFileId, setSelectedFileId] = useState<number>()
    const hiddenEditorRef = useRef<DocumentEditorComponent>(null)
    const { Search } = Input;
    const [filteredData, setFilteredData] = useState<DataType[]>([]);
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

    // const A_approved = async (record: FileDataType) => {
    //     const data = {
    //         FileID: record.FileID,
    //         FileStatus: 3
    //     }

    //     await apiUtil.auth.queryAsync('FileDataStatus_Update', data).then((resp) => {
    //         Modal.success({ content: 'A signed!' })
    //         fetchData()

    //     }).catch(error => {
    //         console.log("Fail to update file status", error);
    //         Modal.error({ content: 'Fail to sign!' })
    //     })
    // }

    // const B_approved = async (record: FileDataType) => {
    //     const data = {
    //         FileID: record.FileID,
    //         FileStatus: 4
    //     }

    //     await apiUtil.auth.queryAsync('FileDataStatus_Update', data).then((resp) => {
    //         Modal.success({ content: 'B signed!' })
    //         fetchData()

    //     }).catch(error => {
    //         console.log("Fail to update file status", error);
    //         Modal.error({ content: 'Fail to sign!' })
    //     })
    // }

    useEffect(() => {
        fetchData();
    }, []);

    // Hàm Search
    const onSearch = (value: string) => {
        const keyword = value.toLowerCase();
        const result = filteredData.filter(item =>
            item.FileName.toLowerCase().includes(keyword) ||
            item.TenDN.toLowerCase().includes(keyword)
        );
        setFilteredData(result);
    };

    const columns: ColumnsType<any> = [
        {
            title: 'MOU_ID',
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
        // {
        //     title: 'Status',
        //     dataIndex: 'Status',
        //     key: 'Status',
        //     width: '20%',
        //     ellipsis: true,
        //     render: (_: any, record: any) => (
        //         <div>
        //             {record.Status_Side === 0 ? <Tag color="yellow">Writting</Tag> : record.Status_Side === 1 ? <Tag color="yellow">One side finish</Tag> : record.Status_BothSide === 1 ? <Tag color="green">Waiting to approve</Tag> : record.Status_SignatureA === 1 ? <Tag color="green">University International Approved</Tag> : record.Status_SignatureB === 1 ? <Tag color="green">Both Side Approved</Tag>}
        //             <Tag></Tag>
        //         </div>
        //     ),
        // },
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
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}></Button>
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        size="middle" // hoặc "small" / "large"
                        onClick={() => loadAndDownload('Docx', record.FullUrl)}
                        className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            <div>
                <Title level={3}>List of Template MOU</Title>
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
                <Table columns={columns} dataSource={dataSource} loading={loading} />
                <EditDetailOfEmployee
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