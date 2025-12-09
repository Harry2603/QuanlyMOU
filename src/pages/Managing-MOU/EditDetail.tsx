import React, { useRef, useState, useEffect } from 'react';
import {
    DocumentEditorContainerComponent,
    Toolbar,
    Inject,
} from '@syncfusion/ej2-react-documenteditor';
import './WordEditor.css';
import { Modal, Button, Space } from 'antd';
import { apiUtil } from '../../utils';
import realtimeService from '../../services/realtimeService';


const EditDetail: React.FC<EditDetailProps> = ({ isModalOpen, Url, onClose, fileID, onFetch, fileDataSelect, isHideEnd, isCreate, userAccess, isFileAdmin }) => {
    const editorRef = useRef<DocumentEditorContainerComponent>(null)
    const [isFullyOpen, setIsFullyOpen] = useState(false)
    const [username, setUsername] = useState<string>()
    const [isLocked, setIsLocked] = useState(false);

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


    const handleCancel = () => {
        onClose();
    };

    const handleOk = () => {
        onClose();
    };

    const handleSave = async () => {
        const sfdt = editorRef.current?.documentEditor.serialize();
        // console.log("Document content:", sfdt);

        if (!sfdt) return;

        try {
            const isSelectDetail = await apiUtil.auth.queryAsync('FileData_Select_ById', { FileID: fileID })

            if (!isSelectDetail.IsSuccess) {
                Modal.error({ content: 'Lỗi khi tải dữ liệu chi tiết.' })
                return
            }

            const detail: any = isSelectDetail.Result as FileDetail

            if (detail.lenght < 0) {
                Modal.error({ content: 'detail không có dữ liệu' })
                return
            }

            const blob = new Blob([sfdt], { type: 'application/json' });
            let filename = detail[0].FileName;

            // Kiểm tra nếu chưa có phần mở rộng .txt thì mới thêm vào
            if (!filename.endsWith(".txt")) {
                filename += ".txt";
            }
            const file = new File([blob], filename, { type: blob.type });

            const uploadResp = await apiUtil.auth.uploadFileAsync(file);
            // console.log("xxxxxxxxx", detail);
            if (uploadResp.IsSuccess) {
                const data = {
                    FileID: detail[0].FileID,
                    FileName: filename,
                    Url: uploadResp.Result?.Url,
                    FullUrl: uploadResp.Result?.FullUrl,
                    author: detail[0].author, // em có thể dùng input hoặc username nếu có
                };

                const insertResp = await apiUtil.auth.queryAsync('FileData_Update', data);

                if (insertResp.IsSuccess) {
                    Modal.success({ content: 'Save Successfull !' });
                    onFetch()
                    onClose(); // đóng modal sau khi lưu
                    try {
                        const userInfo = getUserInfo();
                        const currentUserName = userInfo?.UserName;
                        const fileInfo = detail[0];

                        if (currentUserName && fileInfo) {
                            // Dùng Set để loại trùng
                            const receivers = new Set<string>();

                            // 1. Author + Partner từ fileDataSelect
                            if (fileDataSelect?.UsernameAuthor) receivers.add(fileDataSelect.UsernameAuthor);
                            if (fileDataSelect?.UsernamePartner) receivers.add(fileDataSelect.UsernamePartner);

                            // 2. Lấy thêm tất cả user có quyền trên file (User3, User4...)
                            try {
                                const accessResp = await apiUtil.auth.queryAsync(
                                    'FileDataAccess_Select_ByFile',     // map tới Api_Auth_FileDataAccess_Select_ByFile
                                    { FileID: fileInfo.FileID }
                                );

                                if (accessResp.IsSuccess && Array.isArray(accessResp.Result)) {
                                    (accessResp.Result as any[]).forEach(row => {
                                        // Tùy theo SP bạn trả về cột gì: UserName / TenDangNhap
                                        if (row.UserName) {
                                            receivers.add(row.UserName);
                                        }
                                        // hoặc nếu bạn đặt là TenDangNhap thì:
                                        // if (row.TenDangNhap) receivers.add(row.TenDangNhap);
                                    });
                                }
                            } catch (err) {
                                console.error('Error loading access users for notification:', err);
                            }
                            // 3. Gửi notification cho TẤT CẢ user trong group file
                            for (const toUser of receivers) {
                                // Nếu bạn không muốn gửi thông báo cho chính người đang Save thì bỏ comment:
                                // if (toUser === currentUserName) continue;

                                await apiUtil.auth.queryAsync('Notification_Insert', {
                                    FileID: fileInfo.FileID,
                                    FileName: fileInfo.FileName,
                                    FromUser: currentUserName,
                                    ToUserName: toUser,
                                    Action: 'Save',
                                });
                            }
                        }
                    } catch (err) {
                        console.error('Error inserting notification to DB:', err);
                    }
                    // THÊM ĐOẠN NÀY – GỬI THÔNG BÁO REALTIME
                    if (fileID && username) {
                        const payload = {
                            Action: 'Save',
                            FileID: detail[0].FileID,   // hoặc fileID cũng được
                            FileName: detail[0].FileName,
                            UserName: username,
                            Time: new Date().toISOString(),
                        }
                        console.log('>>> SEND REALTIME', payload);
                        await realtimeService.sendAsync(fileID, JSON.stringify(payload))
                    }
                } else {
                    Modal.error({ content: 'Lỗi khi lưu dữ liệu vào database.' });
                }
            } else {
                Modal.error({ content: 'Upload file thất bại.' });
            }
        } catch (err) {
            console.error("Error during save:", err);
            Modal.error({ content: 'Đã xảy ra lỗi khi lưu.' });
        }
    };

    const handleCreate = async () => {
        const sfdt = editorRef.current?.documentEditor.serialize();
        // console.log("Document content:", sfdt);

        if (!sfdt) return;

        try {
            let filename = prompt("Please enter your filename") ?? "default";
            const blob = new Blob([sfdt], { type: 'application/json' });
            // Kiểm tra nếu chưa có phần mở rộng .txt thì mới thêm vào
            if (!filename.endsWith(".txt")) {
                filename += ".txt";
            }
            const file = new File([blob], filename, { type: blob.type });
            const uploadResp = await apiUtil.auth.uploadFileAsync(file);
            if (uploadResp.IsSuccess) {
                const userInfo = getUserInfo()
                // console.log("xxhhh", userInfo);
                const data = {
                    FileName: filename,
                    Url: uploadResp.Result?.Url,
                    FullUrl: uploadResp.Result?.FullUrl,
                    Username: "INTERNATIONAL UNIVERSITY",//TODO tên đối tác
                    AuthorUsername: userInfo?.UserName
                };
                // console.log("cvcvcv", data);

                // Gọi api insert vào db
                const isInsert = await apiUtil.auth.queryAsync('FileData_Insert', data);

                if (isInsert.IsSuccess) {
                    Modal.success({ content: 'Template đã được lưu thành công!' });
                    onFetch()
                    onClose(); // đóng modal sau khi lưu
                } else {
                    Modal.error({ content: 'Lỗi khi lưu dữ liệu vào database.' });
                }
            } else {
                Modal.error({ content: 'Upload file thất bại.' });
            }
        } catch (err) {
            console.error("Error during save:", err);
            Modal.error({ content: 'Đã xảy ra lỗi khi lưu.' });
        }
    };

    const fetchData = async () => {
        if (!Url) {
            Modal.error({ content: "URL không hợp lệ." });
            return;
        }

        const response = await fetch(Url);

        if (!response.ok) {
            console.error("Failed to fetch the file");
            return;
        }

        let text: any;

        const isDocxUrl = (url: string): boolean => {
            try {
                const parsedUrl = new URL(url);
                const pathname = parsedUrl.pathname.toLowerCase();
                return pathname.endsWith(".docx") || pathname.endsWith(".doc");
            } catch (error) {
                console.error("Invalid URL:", error);
                return false;
            }
        };

        if (isDocxUrl(Url)) {
            const docxBlob = await response.blob();

            // console.log('Uploading DOCX to Syncfusion server...');

            const formData = new FormData();
            formData.append('UploadFiles', new File([docxBlob], 'uploaded.docx', {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            }));

            const uploadResponse = await fetch('https://ej2services.syncfusion.com/production/web-services/api/documenteditor/Import', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) throw new Error(`Failed to convert DOCX: ${uploadResponse.statusText}`);
            const result = await uploadResponse.text();

            // console.log('SFDT Data received!', result);
            text = result
        } else {
            text = await response.text();
            // console.log(text);
        }

        if (editorRef.current && editorRef.current.documentEditor) {
            editorRef.current.documentEditor.open(text);
        } else {
            console.warn("editorRef or documentEditor is not ready yet.");
        }
    };

    const handleEnd = async () => {
        // console.log("file xxx", fileDataSelect);
        const isBothEnd = !fileDataSelect?.Status_Side ? false : true

        const data = {
            FileID: fileDataSelect?.FileID,
            FileStatus: !isBothEnd ? 1 : 2
        }

        await apiUtil.auth.queryAsync('FileDataStatus_Update', data).then((resp) => {
            Modal.success({ content: 'Da end!' })
            setIsLocked(true);
            onFetch()
            onClose()

        }).catch(error => {
            // console.log("Fail to update file status", error);
            Modal.error({ content: 'Fail to end!' })
        })
    }
    useEffect(() => {
        if (isModalOpen) {
            setTimeout(() => {
                setIsFullyOpen(true)
                setTimeout(async () => {
                    fetchData()
                }, 0);
            }, 500)

            const userInfo = getUserInfo()
            setUsername(userInfo?.UserName)
        }
    }, [isModalOpen])

    return (
        <Modal
            title="Edit MOU"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={null}
            width="90%"
            style={{ top: 20 }}
        >
            {isFullyOpen ? (
                <div style={{ height: '600px' }}>
                    <DocumentEditorContainerComponent
                        id="container"
                        height="100%"
                        serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
                        enableToolbar={true}
                        ref={editorRef}
                    >
                        <Inject services={[Toolbar]} />
                    </DocumentEditorContainerComponent>
                </div>
            ) : null}

            <div style={{ marginTop: '10px', textAlign: 'right' }}>
                <Space>{
                    isHideEnd === false ? null : (<Button disabled={isLocked || fileDataSelect?.Status_BothSide || (!isFileAdmin && userAccess === "Viewer") || fileDataSelect?.NguoiCapNhat === username} type="primary" onClick={handleEnd}>End</Button>)
                }
                    {isCreate === true ? (<Button disabled={isLocked || fileDataSelect?.Status_BothSide || (!isFileAdmin && userAccess === "Viewer") || fileDataSelect?.NguoiCapNhat === username} type="primary" onClick={handleCreate}>Create</Button>) :
                        (<Button disabled={isLocked || fileDataSelect?.Status_BothSide || (!isFileAdmin && userAccess === "Viewer") || fileDataSelect?.NguoiCapNhat === username} type="primary" onClick={handleSave}>Save</Button>)}
                </Space>
            </div>

        </Modal>


    );
}
export default EditDetail;