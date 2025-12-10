import React, { useRef, useState, useEffect } from 'react';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import './spreadsheet.css';
import { Modal, Button, Space } from 'antd';
import { apiUtil } from '../../utils';
import realtimeService from '../../services/realtimeService';


const EditContent: React.FC<DetailProps> = ({ isModalOpen, Url, onClose, fileID, onFetch, fileDataSelect, isHideEnd, isCreate, userAccess, isFileAdmin }) => {
    const spreadsheetRef = useRef<SpreadsheetComponent>(null)
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
        const spreadsheet = spreadsheetRef.current;
        if (!spreadsheet) return;

        try {
            // console.log("Gọi API với FileId =", fileID);

            const isSelectDetail = await apiUtil.auth.queryAsync("ExcelFile_Select_ById", { FileId: fileID });
            if (!isSelectDetail.IsSuccess) {
                Modal.error({ content: "Lỗi khi tải dữ liệu chi tiết." });
                return;
            }

            const detail: any = isSelectDetail.Result as ExcelDetail;
            if (!detail || detail.length === 0) {
                Modal.error({ content: "Không có dữ liệu chi tiết file." });
                return;
            }

            let filename = detail[0].Name || "default.xlsx";
            if (!filename.endsWith(".xlsx")) filename += ".xlsx";

            // Đặt cấu hình trước khi save để Syncfusion trả về blob Excel
            spreadsheet.beforeSave = (args) => {
                args.needBlobData = true;
                args.isFullPost = true;
            };

            // Chờ event saveComplete
            const blob = await new Promise<Blob>((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error("Save timeout")), 10000);

                spreadsheet.saveComplete = (args) => {
                    clearTimeout(timeout);
                    if (args.blobData) {
                        // console.log("Nhận blobData Excel thành công:", args.blobData);
                        resolve(args.blobData);
                    } else {
                        reject(new Error("Không nhận được blobData"));
                    }
                };
                spreadsheet.endEdit?.();
                spreadsheet.notify('beforeSave', {}); // ép ghi nhận merge/border
                spreadsheet.refresh();                // đồng bộ lại layout & merge range
                spreadsheet.save();                   // giờ mới lưu thật

            });

            // Upload file blob vừa nhận
            const file = new File([blob], filename, {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const uploadResp = await apiUtil.auth.uploadFileAsync(file);
            if (!uploadResp.IsSuccess) {
                Modal.error({ content: "Upload file thất bại." });
                return;
            }

            const data = {
                FileId: detail[0].FileId,
                Name: filename,
                Url: uploadResp.Result?.Url,
                FullUrl: uploadResp.Result?.FullUrl,
                Author: detail[0].Author,
            };

            const updateResp = await apiUtil.auth.queryAsync("ExcelFile_Update", data);
            if (updateResp.IsSuccess) {
                Modal.success({ content: "Save Successfull !" });
                onFetch();
                onClose();
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
                                'ExcelFileAccess_Select_ByFile',     // map tới Api_Auth_FileDataAccess_Select_ByFile
                                { FileId: fileInfo.FileId }
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

                            await apiUtil.auth.queryAsync('NotificationEX_Insert', {
                                FileID: fileInfo.FileId,
                                FileName: fileInfo.Name,
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
                        FileID: detail[0].FileId,   // hoặc fileID cũng được
                        FileName: detail[0].Name,
                        UserName: username,
                        Time: new Date().toISOString(),
                    }
                    // console.log('>>> SEND REALTIME', payload);
                    await realtimeService.sendAsync(fileID, JSON.stringify(payload))
                }
            } else {
                Modal.error({ content: "Lỗi khi lưu dữ liệu vào database." });
            }
        } catch (err) {
            console.error("Lỗi khi lưu file:", err);
            Modal.error({ content: "Đã xảy ra lỗi khi lưu file." });
        }
    };


    const handleCreate = async () => {
        const spreadsheet = spreadsheetRef.current;
        if (!spreadsheet) return;

        try {
            let filename = prompt("Please enter your filename") ?? "default.xlsx";
            if (!filename.endsWith(".xlsx")) filename += ".xlsx";

            // Đặt cấu hình để Syncfusion trả về blob Excel
            spreadsheet.beforeSave = (args) => {
                args.needBlobData = true;
                args.isFullPost = true;
            };

            // Lắng nghe event saveComplete để nhận blobData Excel
            const blob = await new Promise<Blob>((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error("Save timeout")), 10000);

                spreadsheet.saveComplete = (args) => {
                    clearTimeout(timeout);
                    if (args.blobData) {
                        // console.log("Nhận blobData Excel khi tạo mới:", args.blobData);
                        resolve(args.blobData);
                    } else {
                        reject(new Error("Không nhận được blobData"));
                    }
                };

                spreadsheet.endEdit?.();
                spreadsheet.notify('beforeSave', {});
                spreadsheet.refresh();
                spreadsheet.save();

            });

            // Upload file Excel blob
            const file = new File([blob], filename, {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const uploadResp = await apiUtil.auth.uploadFileAsync(file);
            if (!uploadResp.IsSuccess) {
                Modal.error({ content: "Upload file thất bại." });
                return;
            }

            const userInfo = getUserInfo();
            const data = {
                Name: filename,
                Url: uploadResp.Result?.Url,
                FullUrl: uploadResp.Result?.FullUrl,
                Username: "INTERNATIONAL UNIVERSITY",
                AuthorUsername: userInfo?.UserName,
            };

            const isInsert = await apiUtil.auth.queryAsync("ExcelFile_Insert", data);

            if (isInsert.IsSuccess) {
                Modal.success({ content: "Template đã được lưu thành công!" });
                onFetch();
                onClose();
            } else {
                Modal.error({ content: "Lỗi khi lưu dữ liệu vào database." });
            }
        } catch (err) {
            console.error("Lỗi khi tạo mới file:", err);
            Modal.error({ content: "Đã xảy ra lỗi khi lưu file." });
        }
    };


    const fetchData = async () => {
        try {
            if (!Url) {
                Modal.error({ content: "URL không hợp lệ." });
                return;
            }

            const response = await fetch(Url);
            const contentType = response.headers.get("content-type") || "";
            // console.log("Response content-type:", contentType);

            if (!response.ok) {
                Modal.error({ content: "Không thể tải file." });
                return;
            }

            // Bắt buộc đọc blob (dù là Excel hay JSON)
            const blob = await response.blob();

            // Điều kiện nhận diện file Excel
            const isExcelFile =
                contentType.includes("sheet") ||
                contentType.includes("excel") ||
                contentType === "application/octet-stream" ||
                Url.toLowerCase().endsWith(".xlsx") ||
                Url.toLowerCase().endsWith(".xls");

            const spreadsheet = spreadsheetRef.current;
            if (!spreadsheet) {
                console.warn("Spreadsheet chưa sẵn sàng để mở file.");
                return;
            }

            if (isExcelFile) {
                // Excel thật: mở bằng open({ file })
                const file = new File([blob], "data.xlsx", {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                spreadsheet.open({ file });
                // console.log("Đã mở file Excel thành công:", Url);
            } else {
                // JSON thật (ví dụ exportFromJson)
                const text = await blob.text();
                try {
                    const json = JSON.parse(text);
                    spreadsheet.openFromJson({ file: json });
                    // console.log("Đã mở file JSON thành công:", Url);
                } catch (e) {
                    console.error("File không phải JSON hợp lệ:", e);
                    Modal.error({ content: "Định dạng file không hợp lệ hoặc bị lỗi." });
                }
            }
        } catch (error) {
            console.error("Lỗi khi tải file:", error);
            Modal.error({ content: "Không thể tải nội dung file. Vui lòng thử lại." });
        }
    };

    const handleEnd = async () => {
        // console.log("file xxx", fileDataSelect);
        const isBothEnd = !fileDataSelect?.Status_Side ? false : true

        const data = {
            FileId: fileDataSelect?.FileId,
            FileStatus: !isBothEnd ? 1 : 2
        }

        await apiUtil.auth.queryAsync('ExcelFileStatus_Update', data).then((resp) => {
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
    // console.log("DEBUG nút disable", {
    //     isLocked,
    //     Status_BothSide: fileDataSelect?.Status_BothSide,
    //     userAccess,
    //     NguoiCapNhat: fileDataSelect?.NguoiCapNhat,
    //     username
    // });
    return (
        <Modal
            title="Edit Spreadsheet File"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={null}
            width="90%"
            style={{ top: 20 }}
        >
            {isFullyOpen ? (
                <div style={{ height: '600px' }}>
                    <SpreadsheetComponent
                        ref={spreadsheetRef}
                        {...({ allowMultiSelection: true } as any)}
                        allowFreezePane={true}          // Cho phép cố định hàng/cột
                        allowDataValidation={true}      // Cho phép tạo rule dữ liệu (dropdown, số, text)
                        allowConditionalFormat={true}   // Cho phép tô màu theo điều kiện
                        allowNumberFormatting={true}    // Cho phép định dạng số
                        allowCellFormatting={true}      // Cho phép đổi font, màu chữ, merge
                        allowWrap={true}                // Cho phép xuống dòng trong ô
                        allowOpen
                        allowSave
                        openUrl="https://document.syncfusion.com/web-services/spreadsheet-editor/api/spreadsheet/open"
                        saveUrl="https://document.syncfusion.com/web-services/spreadsheet-editor/api/spreadsheet/save"
                        showFormulaBar
                    />
                </div>
            ) : null}

            <div style={{ marginTop: '10px', textAlign: 'right' }}>
                <Space>{
                    isHideEnd === false ? null : (<Button disabled={isLocked || fileDataSelect?.Status_BothSide || (!isFileAdmin && userAccess === "Viewer") || (!isFileAdmin && userAccess === "Editor") || (!isFileAdmin && fileDataSelect?.NguoiCapNhat === username) || fileDataSelect?.NguoiCapNhat === username} type="primary" onClick={handleEnd}>End</Button>)
                }
                    {isCreate === true ? (<Button disabled={isLocked || fileDataSelect?.Status_BothSide || (!isFileAdmin && userAccess === "Viewer") || (!isFileAdmin && fileDataSelect?.NguoiCapNhat === username) || fileDataSelect?.NguoiCapNhat === username} type="primary" onClick={handleCreate}>Create</Button>) :
                        (<Button disabled={isLocked || fileDataSelect?.Status_BothSide || (!isFileAdmin && userAccess === "Viewer") || (!isFileAdmin && fileDataSelect?.NguoiCapNhat === username) || fileDataSelect?.NguoiCapNhat === username} type="primary" onClick={handleSave}>Save</Button>)}
                </Space>
            </div>

        </Modal>


    );
}
export default EditContent;