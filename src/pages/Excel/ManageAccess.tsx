import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useRef, useState } from 'react';
import { Space, Table, Button, Input, Typography, Tag, Modal, Select } from 'antd';
import { apiUtil } from '../../utils';
import { EllipsisOutlined } from '@ant-design/icons';

const AccessTypeList: React.FC = () => {
    const [userList, setUserList] = useState<UserListType[]>([])
    const [accessList, setAccessList] = useState<AccessType[]>([]);
    const [rawAccess, setRawAccess] = useState<any[]>([]);
    const [selectedID, setSelectedID] = useState<number | null>(null)
    const [permission, setPermission] = useState<string>("");;
    const [username, setUsername] = useState<string>()
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'viewer' | 'editor' | null>(null);
    const [selectOptions, setSelectOptions] = useState<any[]>([]);
    const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const { Title } = Typography;

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

    const getAccessType = async () => {
        setLoading(true);
        try {
            const userInfo = getUserInfo();
            if (!userInfo) {
                throw new Error('Không tìm thấy thông tin user');
            }
            // Gọi API, không cần truyền filter gì (nếu cần filter thì thêm param vào {})
            const res = await apiUtil.auth.queryAsync('ExcelFileAccess_Select', {});
            // console.log('res excelfileaccess', res);
            if (res.IsSuccess) {
                const raw = res.Result as any[];
                // Gom nhóm theo FileId
                const grouped = Object.values(
                    raw.reduce((acc: any, item: any) => {
                        const fileId = item.FileId;
                        if (!acc[fileId]) {
                            acc[fileId] = {
                                key: fileId,
                                FileId: fileId,
                                Name: item.FileName ?? `File ${fileId}`, // hoặc lấy từ join với ExcelFile_Select
                                ViewerName: [],
                                EditorName: [],
                            };
                        }
                        // Gom user theo loại quyền
                        if (item.AccessType.trim() === "Viewer") {
                            acc[fileId].ViewerName.push(item.UserName);
                        } else if (item.AccessType.trim() === "Editor") {
                            acc[fileId].EditorName.push(item.UserName);
                        }
                        return acc;
                    }, {})
                );
                // Gộp các tên lại thành chuỗi để hiển thị
                const result = grouped.map((f: any) => ({
                    ...f,
                    ViewerName: f.ViewerName.join(", "),
                    EditorName: f.EditorName.join(", "),
                }));
                setAccessList(result);
                setRawAccess(raw);
                // console.log('raw', raw)
                // console.log('res', result)
            }

            else {
                console.error('Lấy danh sách ExcelFileAccess thất bại:', res.Message);
            }
        } catch (error) {
            console.error('Lỗi khi gọi API ExcelFileAccess_Select:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        onLoadUserList();
        getAccessType();
        const userInfo = getUserInfo()
        setUsername(userInfo?.UserName)
    }, []);

    const handleCloseUpdateModal = () => {
        resetModal();
        setIsModalOpen(false);
    };

    const handleUpdateUser = async () => {
        try {
            if (!selectedFileId || !selectedUserId || !permission) {
                Modal.error({
                    title: "Thiếu thông tin",
                    content: "Bạn cần chọn user và quyền trước khi update."
                });
                return;
            }

            const userInfo = getUserInfo();
            if (!userInfo) {
                Modal.error({
                    title: "Lỗi",
                    content: "Không tìm thấy thông tin người dùng hệ thống."
                });
                return;
            }
            // Gọi API
            const res = await apiUtil.auth.queryAsync("ExcelFileAccess_Update", {
                SysUserId: userInfo.UserId,
                FileId: selectedFileId,
                UserId: selectedUserId,
                AccessType: permission.toLowerCase()   // store yêu cầu viewer/editor
            });
            // console.log('res update', res)
            if (res.IsSuccess) {
                await getAccessType();
                Modal.success({
                    title: "Cập nhật thành công",
                    content: "Quyền truy cập đã được cập nhật."
                });
                // Reset modal
                resetModal();
                setIsModalOpen(false);
            } else {
                Modal.error({
                    title: "Lỗi cập nhật",
                    content: res.Message || "Không cập nhật được quyền."
                });
            }
        } catch (err) {
            console.error("Update error:", err);
            Modal.error({
                title: "Lỗi",
                content: "Có lỗi xảy ra khi gọi API update."
            });
        }
    };

    const handleDeleteUser = async () => {
            Modal.confirm({
                title: 'Delete Confirm',
                content: `Do you want to delete this user's permission" ?`,
                okText: 'Delete',
                okType: 'primary',
                cancelText: 'Cancel',
                async onOk() {
                    try {
                        const res = await apiUtil.auth.queryAsync('ExcelFileAccess_Delete', {
                            FileId: selectedFileId,
                            UserId:selectedUserId,

                        });
                        // console.log('id delete', res)
                        if (res.IsSuccess) {
                            Modal.success({ content: 'Delete Successful !' });
                            getAccessType();
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
    const resetModal = () => {
        setSelectedID(null);
        setPermission("");
        setSelectedFileId(null);
        setSelectedUserId(null);
        setSelectOptions([]);
        setModalType(null);
    };

    // Click icon Viewer
    const selectViewerName = async (fileId: number) => {
        resetModal();
        setModalType("viewer");
        setIsModalOpen(true);
        setSelectedFileId(fileId);

        // Lấy dữ liệu mới nhất từ DB trước khi hiển thị modal
        await getAccessType();

        // Lọc user từ rawAccess mới
        const users = rawAccess
            .filter(x => x.FileId === fileId && x.AccessType.trim() === "Viewer")
            .map(u => ({
                value: u.ID,
                label: u.UserName
            }));

        setSelectOptions(users);
        setSelectedID(null);
        setPermission("Viewer");
    };


    // Click icon Editor
    const selectEditorName = async (fileId: number) => {
        resetModal();
        setModalType("editor");
        setIsModalOpen(true);
        setSelectedFileId(fileId);

        await getAccessType();

        const users = rawAccess
            .filter(x => x.FileId === fileId && x.AccessType.trim() === "Editor")
            .map(u => ({
                value: u.ID,
                label: u.UserName
            }));

        setSelectOptions(users);
        setSelectedID(null);
        setPermission("Editor");
    };


    const handleSelectName = (id: number) => {
        setSelectedID(id);

        const user = rawAccess.find(x => x.ID === id);
        if (!user) return;

        setPermission(user.AccessType.trim());
        setSelectedUserId(user.UserId);
    };

    const columns: ColumnsType<any> = [
        {
            title: 'Number',
            key: 'index',
            width: '10%',
            ellipsis: true,
            render: (_text, _record, index) => index + 1
        },
        {
            title: 'File Name',
            dataIndex: 'Name',
            key: 'Name',
            width: '20%',
            ellipsis: true,
            render: (text: string) => <a>{text}</a>,
        },
        {
            title: 'Viewer',
            dataIndex: 'ViewerName',
            key: 'ViewerName',
            width: '35%',
            ellipsis: true,
            render: (text: string, record: any) => (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%'
                    }}
                >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {text}
                    </span>

                    <EllipsisOutlined
                        style={{
                            fontSize: 20,
                            color: '#110e0eff',
                            cursor: 'pointer',
                            flexShrink: 0           // giữ icon không bị ép nhỏ 
                        }}
                        onClick={() => selectViewerName(record.FileId)}
                    />
                </div>
            ),
        },
        {
            title: 'Editor',
            dataIndex: 'EditorName',
            key: 'EditorName',
            width: '35%',
            ellipsis: true,
            render: (text: string, record: any) => (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%'
                    }}
                >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {text}
                    </span>

                    <EllipsisOutlined
                        style={{
                            fontSize: 20,
                            color: '#110e0eff',
                            cursor: 'pointer',
                            flexShrink: 0           // giữ icon không bị ép nhỏ 
                        }}
                        onClick={() => selectEditorName(record.FileId)}
                    />
                </div>
            ),
        },
    ];

    return (
        <>

            <Title level={3}>AccessType List</Title>
            <Modal
                title={modalType === 'viewer' ? "Update/Delete Viewer" : "Update/Delete Editor"}
                open={isModalOpen}
                onCancel={handleCloseUpdateModal}
                maskClosable={false}
                footer={[
                    // Nút Delete
                    <Button key="delete" danger onClick={() => handleDeleteUser()}>
                        Delete
                    </Button>,
                    // Nút Update
                    <Button key="update" type="primary" onClick={handleUpdateUser}>
                        Update
                    </Button>
                ]}
            >
                <div>
                    <label><b>Name:</b></label>
                    <Select
                        style={{ width: "100%" }}
                        placeholder="Select Viewer"
                        value={selectedID}
                        onChange={handleSelectName}
                    >
                        {selectOptions.map(opt => (
                            <Select.Option key={opt.value} value={opt.value}>
                                {opt.label}
                            </Select.Option>
                        ))}
                    </Select>
                    <label><b>Permission:</b></label>
                    <Select
                     style={{ width: "100%" }}
                        placeholder="Permission"
                        value={permission}
                        onChange={(value) => setPermission(value)}
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
            <Table
                columns={columns}
                dataSource={accessList}
                loading={loading}
            />
        </>
    )
};

export default AccessTypeList;