import React, { useEffect, useRef, useState } from 'react';
import { Space, Table, Button, Input, Typography, Tag, Modal, Select, Badge } from 'antd';
import realtimeService from '../../services/realtimeService'
import { EditOutlined, VerticalAlignBottomOutlined, PlusOutlined, DeleteOutlined, BellOutlined } from '@ant-design/icons';
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
    const [userAccess, setUserAccess] = useState<"Viewer" | "Editor">("Viewer");
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isNotiOpen, setIsNotiOpen] = useState(false);
    const notiOpenRef = useRef(false);

    const getUserInfo = (): UserInfoType | null => {
        const userInfoString = localStorage.getItem('userInfo');
        // console.log('userinfotype', userInfoString)
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
                console.error("Error loading business list:", error);
            });
    };

    const handleEdit = async (record: ExcelFileType) => {
        setEditUrl(record.FullUrl);
        setSelectedFileId(record.FileId);
        setFileDataSelect(record);

        const currentUser = getUserInfo();
        if (!currentUser?.UserName) {
            console.error("Username not found!");
            return;
        }

        // Xác định có phải quản trị viên chính của file không
        const isFileAdmin =
            record.UsernameAuthor === currentUser.UserName ||
            record.UsernamePartner === currentUser.UserName;
        // nếu bạn xài UsernameAuthor/UsernamePartner thì đổi cho đúng field

        // Nếu là admin file -> luôn Editor, không cần check ExcelFileAccess
        if (isFileAdmin) {
            // console.log("User là admin của file, set quyền Editor mặc định");
            setUserAccess("Editor");
        } else {
            // User thường -> check bảng ExcelFileAccess
            const user = userList.find(u => u.TenDangNhap === currentUser.UserName);
            if (!user) {
                console.error("UserId not found in the user list!");
                setUserAccess("Viewer");
            } else {
                await getUserAccess(user.UserId, record.FileId);
            }
        }

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
                setFilteredData(result);
            }
        } catch (err) {
            console.error("Error fetching file list:", err);
        }
    };
    const getUserAccess = async (userId: number, fileId: number) => {
        // console.log("UserId gửi API:", userId, "FileId gửi API:", fileId);

        if (!userId || !fileId) {
            console.error("Missing UserId or FileId");
            setUserAccess("Viewer");
            return;
        }

        const resp = await apiUtil.auth.queryAsync(
            "ExcelFileAccess_Select_ByAccessType",
            {
                FileId: fileId,
                UserId: userId
            }
        );

        // console.log(">>> resp từ ExcelFileAccess_Select:", resp);

        const rows = resp.Result as { AccessType: string }[] | null;

        if (resp.IsSuccess && rows && rows.length > 0 && rows[0].AccessType) {
            const access = rows[0].AccessType.trim();   //QUAN TRỌNG
            // console.log("AccessType sau khi trim:", access);

            setUserAccess(access === "Editor" ? "Editor" : "Viewer");
        } else {
            setUserAccess("Viewer");
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
    const isAdminOfFile = (record: ExcelFileType) => {
        return record.UsernameAuthor === username ||
            record.UsernamePartner === username;
    };

    const handleDeleteClick = (record: ExcelFileType) => {
        const isAdminOfFile =
            record.UsernameAuthor === username ||
            record.UsernamePartner === username;

        if (userAccess === "Viewer" && !isAdminOfFile) {
            Modal.warning({
                content: "You do not have permission for the Delete feature",
            });
            return;
        }

        // nếu có quyền → gọi hàm xóa thật
        handleDelete(record);
    };

    const loadAndDownload = async (fullUrl: string, fileName: string) => {
        try {
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error('File not found on the server.');
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
            console.error('File download error:', error);
        }
    };
    useEffect(() => {
        notiOpenRef.current = isNotiOpen;
    }, [isNotiOpen]);

    useEffect(() => {
        const handler = (msg: { Data: string }) => {
            // console.log('[APP] RAW MESSAGE >>>', msg)
            try {
                const payload = JSON.parse(msg.Data);
                // console.log('[APP] PARSED PAYLOAD >>>', payload)

                const newItem: NotificationItem = {
                    id: Date.now(),
                    fileId: payload.FileID,
                    fileName: payload.FileName,
                    fromUser: payload.UserName,
                    time: payload.Time,
                    action: payload.Action, // "Save"
                    isRead: notiOpenRef.current ? true : false,
                };

                setNotifications(prev => {
                    const next = [newItem, ...prev]
                    // console.log('[APP] NOTIFICATIONS UPDATED >>>', next)
                    return next
                })
            } catch (e) {
                console.error("Parse notification error", e);
            }
        };

        const init = async () => {
            // Start SignalR
            await realtimeService.startAsync();

            // ĐĂNG KÝ LẮNG NGHE SAU KHI startAsync xong
            realtimeService.onMessage(handler);

            // Load list file => join group
            await fetchData();

            // Load user list
            await onLoadUserList();

            const userInfo = getUserInfo();
            if (userInfo?.UserName) {
                setUsername(userInfo.UserName);
                await loadNotificationsFromDb(userInfo.UserName);
            }
        };

        init();

        return () => {
            realtimeService.stopAsync();
        };
    }, []); //chỉ chạy 1 lần khi mount
    const loadNotificationsFromDb = async (userName: string) => {
        try {
            const resp = await apiUtil.auth.queryAsync('NotificationEX_Select_ByUser', {
                ToUserName: userName,
            });

            if (resp.IsSuccess) {
                const rows = resp.Result as any[];

                const items: NotificationItem[] = rows.map(row => ({
                    id: row.Id,
                    fileId: row.FileId,
                    fileName: row.FileName,
                    fromUser: row.FromUser,
                    time: row.CreatedTime,      // format sau
                    action: row.Action,
                    isRead: row.IsRead === true,
                }));
// console.log('item',items)
                setNotifications(items);
            }
        } catch (err) {
            console.error('Error loading notifications from DB:', err);
        }
    };

    const markAllRead = async () => {
        const user = getUserInfo();
        if (!user?.UserName) return;

        try {
            await apiUtil.auth.queryAsync('NotificationEX_MarkRead_All_ByUser', {
                ToUserName: user.UserName,
            });

            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Error mark notifications read:', err);
        }
    };
    // Hàm Search
    const onSearch = (value: string) => {
        setSearchText(value);

        const keyword = value.trim().toLowerCase();
        if (!keyword) {
            // ô search trống → trả lại full list
            setFilteredData(dataSource);
            return;
        }

        setFilteredData(
            dataSource.filter(item => {
                const name = (item.Name || '').toString().toLowerCase();
                const author = (item.NguoiTao || '').toString().toLowerCase();

                return name.includes(keyword) || author.includes(keyword);
            })
        );
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
    const handleAddAccessClick = (record: ExcelFileType) => {
        const isAdminOfFile =
            record.UsernameAuthor === username ||
            record.UsernamePartner === username;

        if (userAccess === "Viewer" && !isAdminOfFile) {
            Modal.warning({
                content: "You are not granted permission for the Add Access feature",
            });
            return;
        }

        handleOpenModal(record.FileId);
    };

    const handleSaveAddUser = async () => {
        // Kiểm tra input
        if (!userSelect) {
            Modal.warning({ content: "Please select an account!" });
            return;
        }
        if (!selectedPermission) {
            Modal.warning({ content: "Please select access!" });
            return;
        }
        if (!selectedFileId) {
            Modal.error({ content: "Unable to determine the file that needs additional permissions!" });
            return;
        }

        // Lấy thông tin người thao tác
        const currentUser = getUserInfo();
        // console.log("currentUser:", currentUser);
        if (!currentUser?.RoleId) {
            Modal.error({ content: "Current user information not found!" });
            return;
        }

        try {
            // Gọi API để lấy thông tin người được chọn (để có UserId)
            const selectedUser = userList.find(u => u.TenDangNhap === userSelect);
            if (!selectedUser) {
                Modal.error({ content: "Selected user not found!" });
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
                Modal.success({ content: "Access granted successfully!" });
                setIsAddModalOpen(false);
                setUserSelect('');
                setSelectedPermission('');
            } else {
                Modal.error({ content: res.Message || "Cannot add access!" });
            }
        } catch (error) {
            console.error("Error adding user:", error);
            Modal.error({ content: "An error occurred while adding access!" });
        }
    };

    const handleChange = (value: string) => {
        setUserSelect(value);
        // console.log("Selected:", value); // debug nếu cần
    }
    const columns: ColumnsType<any> = [
        {
            title: 'Excel_Number',
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
                    return <Tag color="gray">Writing</Tag>;
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
                    >
                    </VerticalAlignBottomOutlined>
                    <PlusOutlined
                        style={{
                            color: userAccess === "Viewer" && !isAdminOfFile(record) ? '#ccc' : 'green',
                            cursor: userAccess === "Viewer" && !isAdminOfFile(record) ? 'not-allowed' : 'pointer'
                        }}
                        onClick={() => handleAddAccessClick(record)}
                    />

                    <DeleteOutlined
                        style={{
                            color: userAccess === "Viewer" && !isAdminOfFile(record) ? 'gray' : 'red',
                            cursor: userAccess === "Viewer" && !isAdminOfFile(record) ? 'not-allowed' : 'pointer',
                        }}
                        onClick={() => handleDeleteClick(record)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <>
            <div>
                <Title level={3}>List Of Excel File</Title>
                <div style={{ display: 'flex', justifyContent: "right", gap: '10px', alignItems: "center" }}>
                    <div style={{ position: 'relative' }}>
                        <Badge
                            count={notifications.filter(n => !n.isRead).length}
                            size="small"
                        >
                            <BellOutlined
                                style={{ fontSize: 20, cursor: 'pointer' }}
                                onClick={async () => {
                                    const willOpen = !isNotiOpen;
                                    setIsNotiOpen(willOpen);

                                    if (willOpen) {
                                        // mở panel → mark read ở DB + state
                                        await markAllRead();
                                    }
                                }}
                            />
                        </Badge>

                        {isNotiOpen && (
                            <div
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 28,
                                    width: 340,
                                    maxHeight: 400,
                                    overflowY: 'auto',
                                    background: '#fff',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    borderRadius: 4,
                                    padding: 8,
                                    zIndex: 1000,
                                }}
                            >
                                {notifications.length === 0 ? (
                                    <p style={{ margin: 8 }}>No notifications</p>
                                ) : (
                                    notifications.map(item => (
                                        <div
                                            key={item.id}
                                            style={{
                                                padding: '6px 4px',
                                                borderBottom: '1px solid #f0f0f0',
                                                fontWeight: item.isRead ? 400 : 600,
                                                cursor: 'default',
                                            }}
                                        >
                                            <div>
                                                <span style={{ color: '#1890ff' }}>{item.fromUser}</span>{' '}
                                                đã <b>{item.action}</b> file <b>{item.fileName}</b>
                                            </div>
                                            <div style={{ fontSize: 12, color: '#999' }}>
                                                {new Date(item.time).toLocaleString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    <Search
                        placeholder="Search description"
                        allowClear
                        enterButton="Search"
                        size="large"
                        onSearch={onSearch}
                        onChange={(e) => onSearch(e.target.value)}
                        style={{ width: 300 }}
                    />
                </div>
                {/* <Table columns={columns} dataSource={dataSource} loading={loading} /> */}
                <Table
                    columns={columns} dataSource={filteredData.length > 0 || searchText ? filteredData : dataSource}
                    loading={loading} />

                <Modal
                    title="Add User"
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
                    userAccess={userAccess}
                    isFileAdmin={
                        fileDataSelect?.UsernameAuthor === username ||
                        fileDataSelect?.UsernamePartner === username
                    }
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