import React, { useEffect, useRef, useState } from 'react';
import { Space, Table, Button, Input, Typography, Tag, Modal } from 'antd';

import { EditOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiUtil } from '../../utils';
import EditDetail from './EditDetail';
import {
    DocumentEditorComponent,
    WordExport,
    // PdfExport,
    SfdtExport
} from '@syncfusion/ej2-react-documenteditor';

DocumentEditorComponent.Inject(WordExport, SfdtExport)

const App: React.FC = () => {
    const [dataSource, setDataSource] = useState<FileDataType[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editUrl, setEditUrl] = useState<string | null>(null); // Thêm dòng này
    const [selectedFileId, setSelectedFileId] = useState<number>()
    const hiddenEditorRef = useRef<DocumentEditorComponent>(null)
    const { Search } = Input;
    const [filteredData, setFilteredData] = useState<FileDataType[]>([]);
    const [fileDataSelect, setFileDataSelect] = useState<FileDataType | null>(null)
    const [username, setUsername] = useState<string>()
    const { Title } = Typography;
    const [searchText, setSearchText] = useState<string>('');

    const getUserInfo = (): UserInfoType | null => {
        const userInfoString = localStorage.getItem('userInfo');
        try {
            if (userInfoString) {
                return JSON.parse(userInfoString);
            }
            return null;
        } catch (error) {
            console.error('Error parsing userInfo from localStorage:', error);
            return null;
        }
    }

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
                const currentUser = getUserInfo(); // Lấy thông tin user hiện tại
                const myUsername = currentUser?.UserName; // lấy Username
    
                
    
                const result = (res.Result as any[]).map((item: any, index: number) => ({
                    ...item,
                    key: index,
    
                    // Add hai biến để enable nút
                    canApproveA: item.Status_SignatureA === 0 && item.AuthorUsername === myUsername,
                    canApproveB: item.Status_SignatureB === 0 && item.PartnerID === myUsername,
                }));
                setDataSource(result);
            }
        } catch (err) {
            console.error("Error fetching file list:", err);
        }
    };
    

    const A_approved = async (record: FileDataType) => {
        const data = {
            FileID: record.FileID,
            FileStatus: 3
        }

        await apiUtil.auth.queryAsync('FileDataStatus_Update', data).then((resp) => {
            Modal.success({ content: 'A signed successful!' })
            fetchData()

        }).catch(error => {
            console.log("Fail to update file status", error);
            Modal.error({ content: 'Fail to sign!' })
        })
    }

    const B_approved = async (record: FileDataType) => {
        const data = {
            FileID: record.FileID,
            FileStatus: 4
        }

        await apiUtil.auth.queryAsync('FileDataStatus_Update', data).then((resp) => {
            Modal.success({ content: 'B signed successful!' })
            fetchData()

        }).catch(error => {
            console.log("Fail to update file status", error);
            Modal.error({ content: 'Fail to sign!' })
        })
    }

    useEffect(() => {
        fetchData();
        const userInfo = getUserInfo()
        setUsername(userInfo?.UserName)
    }, []);

    // Hàm Search

    const onSearch = (value: string) => {
        setSearchText(value);
        const keyword = value.toLowerCase();
        const result = dataSource.filter(item =>
            // item.FileName.toLowerCase().includes(keyword) ||
            // item.NguoiTao.toLowerCase().includes(keyword)
            (item.FileName?.toLowerCase() ?? '').includes(keyword) ||
            (item.NguoiTao?.toLowerCase() ?? '').includes(keyword)
        );
        console.log("object", result);
        setFilteredData(result);
    };

    const columns: ColumnsType<any> = [
        {
            title: 'MOU_Number',
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
                  } else if (record.Status_BothSide && !(record.Status_SignatureA || record.Status_SignatureB)) {
                    return <Tag color="blue">Both side finished</Tag>;
                  } else if (record.Status_BothSide && (record.Status_SignatureA || record.Status_SignatureB) && !(record.Status_SignatureA && record.Status_SignatureB)) {
                    return <Tag color="green">One side Approved</Tag>;
                  } else if (record.Status_SignatureA && record.Status_SignatureB) {
                    return <Tag color="green">Both sides Approved</Tag>;
                  } else {
                    return <Tag color="default">Unknown</Tag>;
                  }
              }              
        },
        {
            title: 'Author',
            dataIndex: 'NguoiTao',
            key: 'NguoiTao',
            width: '20%',
            ellipsis: true,
            render: (text: string, record: FileDataType) => {
                console.log("object",record,username,record.Status_BothSide,record.Status_SignatureA,username !== record.UsernameAuthor);
                return(
                <div>
                <p>{text}</p>
                <Button
                    disabled={!record.Status_BothSide || (record.Status_SignatureA || username !== record.UsernameAuthor)}
                    type="primary"
                    size="middle" 
                    onClick={() => A_approved(record)}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                >
                    Approve
                </Button>
            </div>)
            }
                // <div>
                //     <p>{text}</p>
                //     <Button
                //         disabled={!record.Status_BothSide || (record.Status_SignatureA || username !== record.UsernameAuthor)}
                //         type="primary"
                //         size="middle" 
                //         onClick={() => A_approved(record)}
                //         className="px-4 py-2 bg-green-600 text-white rounded"
                //     >
                //         Approve
                //     </Button>
                // </div>
            
        },
        {
            title: 'Partner',
            dataIndex: 'TenPartner',
            key: 'TenPartner',
            width: '20%',
            ellipsis: true,
            render: (text: string, record: FileDataType) => (
                <div>
                    <p>{text}</p>
                    <Button
                        disabled={!record.Status_BothSide ||(record.Status_SignatureB || username !== record.UsernamePartner)}
                        type="primary"
                        size="middle" // hoặc "small" / "large"
                        onClick={() => B_approved(record)}
                        className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                        Approve
                    </Button>
                </div>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            width: '20%',
            render: (_: any, record: any) => (
                <Space size="middle">
                    {/* <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}></Button> */}
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
                <Title level={3}>List of MOU</Title>
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
                {/* <Table columns={columns} dataSource={dataSource} loading={loading} /> */}
                <Table columns={columns} dataSource={filteredData.length > 0 || searchText ? filteredData : dataSource} loading={loading} />

                <EditDetail
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

export default App;