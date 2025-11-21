import React, { useEffect, useRef, useState } from 'react';
import { Space, Table, Button, Input, Typography, Tag, Modal, Select } from 'antd';

import { EditOutlined, VerticalAlignBottomOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiUtil } from '../../utils';
import EditContent from './EditContent';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
const ExcelList: React.FC = () => {
    const spreadsheetRef = useRef<SpreadsheetComponent | null>(null);
    const [dataSource, setDataSource] = useState<ExcelFileType[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editUrl, setEditUrl] = useState<string | null>(null); // Thêm dòng này
    const [selectedFileId, setSelectedFileId] = useState<number>()
    const hiddenEditorRef = useRef<SpreadsheetComponent>(null)
    const { Search } = Input;
    const [filteredData, setFilteredData] = useState<ExcelFileType[]>([]);
    const [fileDataSelect, setFileDataSelect] = useState<ExcelFileType | null>(null)
    const [username, setUsername] = useState<string>()
    const { Title } = Typography;
    const [searchText, setSearchText] = useState<string>('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [userList, setUserList] = useState<UserListType[]>([])
    const [userSelect, setUserSelect] = useState<string>()
    const [selectedPermission, setSelectedPermission] = useState<string>('');


    const getUserInfo = (): UserInfoType | null => {
        const userInfoString = localStorage.getItem('userInfo');
        // console.log('userinfotype',userInfoString)
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

    const handleEdit = (record: ExcelFileType) => {
        setEditUrl(record.FullUrl);
        setSelectedFileId(record.FileId);
        setFileDataSelect(record)
        setIsModalOpen(true);
    };

    const fetchData = async () => {
        try {
            const res = await apiUtil.auth.queryAsync('ExcelFile_Select', {});
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


    const A_approved = async (record: ExcelFileType) => {
        const data = {
            FileId: record.FileId,
            FileStatus: 3
        }

        await apiUtil.auth.queryAsync('ExcelFileStatus_Update', data).then((resp) => {
            Modal.success({ content: 'A signed successful!' })
            fetchData()

        }).catch(error => {
            // console.log("Fail to update file status", error);
            Modal.error({ content: 'Fail to sign!' })
        })
    }

    const B_approved = async (record: ExcelFileType) => {
        const data = {
            FileId: record.FileId,
            FileStatus: 4
        }

        await apiUtil.auth.queryAsync('ExcelFileStatus_Update', data).then((resp) => {
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
            content: `Do you want to delete file "${record.Name}" ?`,
            okText: 'Delete',
            okType: 'primary',
            cancelText: 'Cancel',
            async onOk() {
                try {
                    const res = await apiUtil.auth.queryAsync('ExcelFile_Delete', {
                        FileId: record.FileId,
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
    const loadAndDownload = async (fullUrl: string, fileName: string) => {
        try {
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error('Không tìm thấy file trên server.');
            // console.log('Content-Type:', response.headers.get('content-type'));
            const blob = await response.blob();
            // console.log('Blob type:', blob.type, 'size:', blob.size);
            // Tạo link ẩn để trigger download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName || 'DownloadedFile';
            document.body.appendChild(link);
            link.click();

            // Dọn dẹp
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Lỗi tải file:', error);
        }
    };

    useEffect(() => {
        onLoadUserList();
        fetchData();
        const userInfo = getUserInfo()
        setUsername(userInfo?.UserName)
    }, []);

    // Hàm Search
    const onSearch = (value: string) => {
        setSearchText(value);
        const keyword = value.toLowerCase();
        const result = dataSource.filter(item =>
            (item.Name?.toLowerCase() ?? '').includes(keyword) ||
            (item.NguoiTao?.toLowerCase() ?? '').includes(keyword)
        );
        // console.log("object", result);
        setFilteredData(result);
    };
    // Hàm khi bấm nút Add
    const handleOpenModal = (fileId: number) => {
        setSelectedFileId(fileId);
        setIsAddModalOpen(true);
    };

    // Hàm đóng modal
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
                FileId: selectedFileId,
                UserId: selectedUser.UserId,   // người được thêm quyền
                AccessType: selectedPermission // 'Viewer' hoặc 'Editor'
            };
            // console.log('payload', payload)
            // Gọi API
            const res = await apiUtil.auth.queryAsync("ExcelFileAccess_Insert", payload);

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
            dataIndex: 'Name',
            key: 'Name',
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
            render: (text: string, record: ExcelFileType) => {
                // console.log("object", record, username, record.Status_BothSide, record.Status_SignatureA, username !== record.UsernameAuthor);
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
            render: (text: string, record: ExcelFileType) => (
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
                    <EditOutlined
                        style={{ color: 'blue' }}
                        onClick={() => handleEdit(record)} />
                    <VerticalAlignBottomOutlined
                        style={{ color: 'purple' }}
                        onClick={() => loadAndDownload(record.FullUrl, record.Name)}
                    // className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                    </VerticalAlignBottomOutlined>
                    <PlusOutlined
                        style={{ color: 'green' }}
                        onClick={() => handleOpenModal(record.FileId)}
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
                {/* <Table columns={columns} dataSource={dataSource} loading={loading} /> */}
                <Table
                    columns={columns} dataSource={filteredData.length > 0 || searchText ? filteredData : dataSource}
                    loading={loading} />

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
                <EditContent
                    isModalOpen={isModalOpen}
                    Url={editUrl}
                    fileID={selectedFileId}
                    fileDataSelect={fileDataSelect ?? null}
                    onFetch={() => fetchData()}
                    onClose={() => setIsModalOpen(false)}
                />

                <div style={{ display: 'none' }}>
                    <SpreadsheetComponent
                        ref={hiddenEditorRef}
                        allowOpen
                        allowSave
                        openUrl="https://document.syncfusion.com/web-services/spreadsheet-editor/api/spreadsheet/open"
                        saveUrl="https://document.syncfusion.com/web-services/spreadsheet-editor/api/spreadsheet/save"
                        showFormulaBar
                    />
                </div>
            </div>
        </>

    );
};

export default ExcelList;