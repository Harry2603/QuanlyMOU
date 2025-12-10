import React, { useEffect, useRef, useState } from 'react';
import { Space, Table, Button, Input, Typography, Tag, Modal, Select, Badge } from 'antd';
import realtimeService from '../../services/realtimeService'
import { BellOutlined, DeleteOutlined, EditOutlined, PlusOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
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
    const [userAccess, setUserAccess] = useState<"Viewer" | "Editor">("Viewer");
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isNotiOpen, setIsNotiOpen] = useState(false);
    const notiOpenRef = useRef(false);

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
                console.error("Error loading company list:", error);
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

    const handleEdit = async (record: FileDataType) => {
        setEditUrl(record.FullUrl);
        setSelectedFileId(record.FileID);
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
                await getUserAccess(user.UserId, record.FileID);
            }
        }

        setIsModalOpen(true);
    };
    const getUserAccess = async (userId: number, fileId: number) => {
        // console.log("UserId gửi API:", userId, "FileId gửi API:", fileId);

        if (!userId || !fileId) {
            console.error("Missing UserId or FileId");
            setUserAccess("Viewer");
            return;
        }

        const resp = await apiUtil.auth.queryAsync(
            "FileDataAccess_Select_ByAccessType",
            {
                FileID: fileId,
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
                setFilteredData(result);
                for (const row of result) {
                    if (row.FileID) {
                        realtimeService.joinAsync(row.FileID);
                    }
                }
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
    const handleAddAccessClick = (record: FileDataType) => {
        const isAdminOfFile =
            record.UsernameAuthor === username ||
            record.UsernamePartner === username;

        if (userAccess === "Viewer" && !isAdminOfFile) {
            Modal.warning({
                content: "You are not granted permission for the Add Access feature",
            });
            return;
        }

        handleOpenModal(record.FileID);
    };
    const isAdminOfFile = (record: FileDataType) => {
        return record.UsernameAuthor === username ||
            record.UsernamePartner === username;
    };
    const handleDeleteClick = (record: FileDataType) => {
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
            const resp = await apiUtil.auth.queryAsync('Notification_Select_ByUser', {
                ToUserName: userName,
            });

            if (resp.IsSuccess) {
                const rows = resp.Result as any[];

                const items: NotificationItem[] = rows.map(row => ({
                    id: row.Id,
                    fileId: row.FileID,
                    fileName: row.FileName,
                    fromUser: row.FromUser,
                    time: row.CreatedTime,      // format sau
                    action: row.Action,
                    isRead: row.IsRead === true,
                }));

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
            await apiUtil.auth.queryAsync('Notification_MarkRead_All_ByUser', {
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

        const keyword = value.toLowerCase().trim();
        if (!keyword) return setFilteredData(dataSource);

        setFilteredData(
            dataSource.filter(item => {
                const fileName = (item.FileName || '').toString().toLowerCase();
                const author = (item.NguoiTao || '').toString().toLowerCase();
                return fileName.includes(keyword) || author.includes(keyword);
            })
        );
    };


    const handleOpenModal = (fileId: number) => {
        setSelectedFileId(fileId);
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
                FileID: selectedFileId,
                UserId: selectedUser.UserId,   // người được thêm quyền
                AccessType: selectedPermission // 'Viewer' hoặc 'Editor'
            };
            // console.log('payload', payload)
            // Gọi API
            const res = await apiUtil.auth.queryAsync("FileDataAccess_Insert", payload);

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
            render: (text: string) => {
                const displayName = text?.replace(/\.txt$/i, '');
                return <a>{displayName}</a>;
            }
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
                        style={{ color: 'purple' }}
                        onClick={() => loadAndDownload('Docx', record.FullUrl)}
                        className="px-4 py-2 bg-green-600 text-white rounded">
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
                <Title level={3}>List Of Document</Title>
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
                        value={searchText}
                        onChange={(e) => onSearch(e.target.value)}
                        style={{ width: 300 }}
                    />
                </div>

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
                <Table columns={columns} dataSource={filteredData.length > 0 || searchText ? filteredData : dataSource} loading={loading} />

                <EditDetail
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