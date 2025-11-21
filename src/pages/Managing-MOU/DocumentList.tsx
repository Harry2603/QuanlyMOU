import React, { useEffect, useRef, useState } from 'react';
import { Space, Table, Button, Input, Typography, Tag, Modal, Select } from 'antd';

import { DeleteOutlined, EditOutlined, PlusOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
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
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [userSelect, setUserSelect] = useState<string>()
    const [selectedPermission, setSelectedPermission] = useState<string>('');
    const [userList, setUserList] = useState<UserListType[]>([])

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
    const onLoadUserList = async () => {
        await apiUtil.auth.queryAsync<UserListType[]>('CoreUser_Select')
            .then(resp => {
                const data = resp.Result?.map((item, index) => {
                    return {
                        ...item,
                        label: item.TenDangNhap,
                        value: item.TenDangNhap,
                        key: index + 1
                    }
                })
                // console.log('data', data)
                setUserList(data ?? [])
            })
            .catch((error) => {
                console.error("Error loading doanh nghiep list:", error);
            });
    };

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
            // console.log("Fail to update file status", error);
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
            // console.log("Fail to update file status", error);
            Modal.error({ content: 'Fail to sign!' })
        })
    }
    const handleDelete = async (record: any) => {
        Modal.confirm({
            title: 'Delete Confirm',
            content: `Do you want to delete file "${record.FileName}" ?`,
            okText: 'Delete',
            okType: 'primary',
            cancelText: 'Cancel',
            async onOk() {
                try {
                    const res = await apiUtil.auth.queryAsync('FileData_Delete', {
                        FileID: record.FileID,
                    });
                    if (res.IsSuccess) {
                        Modal.success({ content: 'Delete Successful !' });
                        fetchData();
                    } else {
                        Modal.error({ content: res.Message || 'Delete Fail !' });
                    }
                } catch (err) {
                    console.error('Error Delete:', err);
                    Modal.error({ content: 'Error when Delete!' });
                }
            },
        });
    };

    useEffect(() => {
        fetchData();
        onLoadUserList();
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
        // console.log("object", result);
        setFilteredData(result);
    };
    const handleOpenModal = (record:FileDataType) => {
        setSelectedFileId(record.FileID);
        setIsAddModalOpen(true);
    };
    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        // reset các field trong modal
        setUserSelect('');          // hoặc undefined
        setSelectedPermission('');  // reset quyền
        setSelectedFileId(undefined);
    };

    const handleSaveAddUser = async () => {
        // Kiểm tra input
        if (!userSelect) {
            Modal.warning({ content: "Vui lòng chọn tài khoản!" });
            return;
        }
        if (!selectedPermission) {
            Modal.warning({ content: "Vui lòng chọn quyền truy cập!" });
            return;
        }
        if (!selectedFileId) {
            Modal.error({ content: "Không xác định được file cần thêm quyền!" });
            return;
        }

        // Lấy thông tin người thao tác
        const currentUser = getUserInfo();
        // console.log("currentUser:", currentUser);
        if (!currentUser?.RoleId) {
            Modal.error({ content: "Không tìm thấy thông tin người dùng hiện tại!" });
            return;
        }

        try {
            // Gọi API để lấy thông tin người được chọn (để có UserId)
            const selectedUser = userList.find(u => u.TenDangNhap === userSelect);
            if (!selectedUser) {
                Modal.error({ content: "Không tìm thấy người dùng được chọn!" });
                return;
            }

            // Chuẩn bị dữ liệu gửi API
            const payload = {
                // SysUserId: currentUser.UserId,
                FileID: selectedFileId,
                UserId: selectedUser.UserId,   // người được thêm quyền
                AccessType: selectedPermission // 'Viewer' hoặc 'Editor'
            };
            // console.log('payload', payload)
            // Gọi API
            const res = await apiUtil.auth.queryAsync("FileDataAccess_Insert", payload);

            // Kiểm tra kết quả
            if (res.IsSuccess) {
                Modal.success({ content: "Thêm quyền truy cập thành công!" });
                setIsAddModalOpen(false);
                setUserSelect('');
                setSelectedPermission('');
            } else {
                Modal.error({ content: res.Message || "Không thể thêm quyền truy cập!" });
            }
        } catch (error) {
            console.error("Error adding user:", error);
            Modal.error({ content: "Có lỗi xảy ra khi thêm quyền truy cập!" });
        }
    };
    const handleChange = (value: string) => {
        setUserSelect(value);
        // console.log("Selected:", value); // debug nếu cần
    }
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
                // console.log("object",record,username,record.Status_BothSide,record.Status_SignatureA,username !== record.UsernameAuthor);
                return (
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
                        disabled={!record.Status_BothSide || (record.Status_SignatureB || username !== record.UsernamePartner)}
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
                    <EditOutlined style={{ color: 'blue' }} onClick={() => handleEdit(record)} />
                    <VerticalAlignBottomOutlined
                        style={{ color: 'red' }}
                        onClick={() => loadAndDownload('Docx', record.FullUrl)}
                        className="px-4 py-2 bg-green-600 text-white rounded">
                    </VerticalAlignBottomOutlined>
                    <PlusOutlined
                        style={{ color: 'green' }}
                        onClick={() => handleOpenModal(record)}
                    />
                    <DeleteOutlined
                        style={{ color: 'red' }}
                        onClick={() => handleDelete(record)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <>
            <div>
                <Title level={3}>List Of Document</Title>
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

                <Modal
                    title="Thêm người dùng vào file"
                    open={isAddModalOpen}
                    onCancel={handleCloseAddModal}
                    onOk={handleSaveAddUser}
                    maskClosable={false}
                    okText="Save"
                    cancelText="Cancel"
                >
                    <div style={{ marginBottom: 12 }}>
                        <label>Account Name :</label>
                        <Select
                            onChange={handleChange}
                            style={{ width: "100%" }}
                            options={userList}
                            placeholder="Select a account"
                            value={userSelect || undefined}
                        />
                    </div>
                    <div>
                        <label>Permission :</label>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="Select a permission"
                            value={selectedPermission || undefined}
                            onChange={(value) => setSelectedPermission(value)}
                            options={[
                                {
                                    value: 'Viewer',
                                    label: 'Viewer',
                                },
                                {
                                    value: 'Editor',
                                    label: 'Editor',
                                },
                            ]}
                        />
                    </div>
                </Modal>
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