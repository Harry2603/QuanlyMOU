import React, { useRef, useState, useEffect } from 'react';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import './spreadsheet.css';
import { Modal, Button, Space } from 'antd';
import { apiUtil } from '../../utils';
import realtimeService from '../../services/realtimeService';


const EditContent: React.FC<DetailProps> = ({ isModalOpen, Url, onClose, fileID, onFetch, fileDataSelect, isHideEnd, isCreate }) => {
    const spreadsheetRef = useRef<SpreadsheetComponent>(null)
    const [isFullyOpen, setIsFullyOpen] = useState(false)
    const [username, setUsername] = useState<string>()

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
        const sfdt = await spreadsheetRef.current?.saveAsJson();
        console.log("Spreadsheet content:", sfdt);

        if (!sfdt) return;

        try {
            console.log("Gọi API với FileId =", fileID);
            const isSelectDetail = await apiUtil.auth.queryAsync('ExcelFile_Select_ById', { FileId: fileID })

            if (!isSelectDetail.IsSuccess) {
                Modal.error({ content: 'Lỗi khi tải dữ liệu chi tiết.' })
                return
            }
            console.log("API Detail Result:", isSelectDetail);
            console.log("API Result:", isSelectDetail.Result);

            const detail: any = isSelectDetail.Result as ExcelDetail

            if (detail.length < 0) {
                Modal.error({ content: 'detail không có dữ liệu' })
                return
            }

            const blob = new Blob([JSON.stringify(sfdt)], { type: 'application/json' });
            // Kiểm tra kỹ dữ liệu trước khi truy cập
            let filename = "default.xlsx"; // tên mặc định
            if (detail && detail.length > 0 && detail[0].Name) {
                filename = detail[0].Name;
            }

            // Đảm bảo có phần mở rộng Excel
            if (!filename.endsWith(".xlsx") && !filename.endsWith(".xls")) {
                filename += ".xlsx";
            }

            const file = new File([blob], filename, { type: blob.type });

            const uploadResp = await apiUtil.auth.uploadFileAsync(file);
            // console.log("xxxxxxxxx", detail);
            if (uploadResp.IsSuccess) {
                const data = {
                    FileId: detail[0].FileId,
                    Name: filename,
                    Url: uploadResp.Result?.Url,
                    FullUrl: uploadResp.Result?.FullUrl,
                    Author: detail[0].Author, // em có thể dùng input hoặc username nếu có
                };

                const insertResp = await apiUtil.auth.queryAsync('ExcelFile_Update', data);

                if (insertResp.IsSuccess) {
                    Modal.success({ content: 'Tài liệu đã được lưu thành công!' });
                    onFetch()
                    onClose(); // đóng modal sau khi lưu
                    // await realtimeService.sendAsync("Save successfully")
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
        const sfdt = await spreadsheetRef.current?.saveAsJson();
        // console.log("Excel content:", sfdt);

        if (!sfdt) return;

        try {
            let filename = prompt("Please enter your filename") ?? "default";
            const blob = new Blob([JSON.stringify(sfdt)], { type: 'application/json' });
            // Kiểm tra nếu tên file chưa có đuôi Excel thì thêm vào
            if (!filename.endsWith(".xlsx") && !filename.endsWith(".xls")) {
                filename += ".xlsx";
            }

            const file = new File([blob], filename, { type: blob.type });
            const uploadResp = await apiUtil.auth.uploadFileAsync(file);
            if (uploadResp.IsSuccess) {
                const userInfo = getUserInfo()
                // console.log("xxhhh", userInfo);
                const data = {
                    Name: filename,
                    Url: uploadResp.Result?.Url,
                    FullUrl: uploadResp.Result?.FullUrl,
                    Username: "INTERNATIONAL UNIVERSITY",//TODO tên đối tác
                    AuthorUsername: userInfo?.UserName
                };
                // console.log("cvcvcv", data);

                // Gọi api insert vào db
                const isInsert = await apiUtil.auth.queryAsync('ExcelFile_Insert', data);

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
        try {
            if (!Url) {
                Modal.error({ content: "URL không hợp lệ." });
                return;
            }

            const response = await fetch(Url);
            const contentType = response.headers.get("content-type") || "";
            console.log("📄 Response content-type:", contentType);

            if (!response.ok) {
                Modal.error({ content: "Không thể tải file." });
                return;
            }

            // ✅ Bắt buộc đọc blob (dù là Excel hay JSON)
            const blob = await response.blob();

            // ✅ Điều kiện nhận diện file Excel
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
                // ✅ Excel thật: mở bằng open({ file })
                const file = new File([blob], "data.xlsx", {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                spreadsheet.open({ file });
                console.log("✅ Đã mở file Excel thành công:", Url);
            } else {
                // ✅ JSON thật (ví dụ exportFromJson)
                const text = await blob.text();
                try {
                    const json = JSON.parse(text);
                    spreadsheet.openFromJson({ file: json });
                    console.log("✅ Đã mở file JSON thành công:", Url);
                } catch (e) {
                    console.error("⚠️ File không phải JSON hợp lệ:", e);
                    Modal.error({ content: "Định dạng file không hợp lệ hoặc bị lỗi." });
                }
            }
        } catch (error) {
            console.error("❌ Lỗi khi tải file:", error);
            Modal.error({ content: "Không thể tải nội dung file. Vui lòng thử lại." });
        }
    };





    const handleEnd = async () => {
        // console.log("file xxx", fileDataSelect);
        const isBothEnd = !fileDataSelect?.Status_Side ? false : true

        const data = {
            FileID: fileDataSelect?.FileId,
            FileStatus: !isBothEnd ? 1 : 2
        }

        await apiUtil.auth.queryAsync('ExcelFileStatus_Update', data).then((resp) => {
            Modal.success({ content: 'Da end!' })
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
                    <SpreadsheetComponent
                        ref={spreadsheetRef}
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
                    isHideEnd === false ? null : (<Button disabled={fileDataSelect?.Status_BothSide || fileDataSelect?.NguoiCapNhat === username} type="primary" onClick={handleEnd}>End</Button>)
                }
                    {isCreate === true ? (<Button disabled={fileDataSelect?.Status_BothSide || fileDataSelect?.NguoiCapNhat === username} type="primary" onClick={handleCreate}>Create</Button>) :
                        (<Button disabled={fileDataSelect?.Status_BothSide || fileDataSelect?.NguoiCapNhat === username} type="primary" onClick={handleSave}>Save</Button>)}
                </Space>
            </div>

        </Modal>


    );
}
export default EditContent;