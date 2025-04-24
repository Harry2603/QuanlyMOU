import React, { useRef, useState, useEffect } from 'react';
import {
    DocumentEditorContainerComponent,
    Toolbar,
    Inject,
} from '@syncfusion/ej2-react-documenteditor';
import './WordEditor.css';
import { Modal, Button, Space } from 'antd';
import { apiUtil } from '../../utils';


const EditDetail: React.FC<EditDetailProps> = ({ isModalOpen, Url, onClose, fileID, onFetch, fileDataSelect }) => {
    const editorRef = useRef<DocumentEditorContainerComponent>(null)
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
        const sfdt = editorRef.current?.documentEditor.serialize();
        console.log("Document content:", sfdt);

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
            console.log("xxxxxxxxx", detail);
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
                    Modal.success({ content: 'Tài liệu đã được lưu thành công!' });
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
            Modal.error({ content: 'URL không hợp lệ.' });
            return
        }

        const response = await fetch(Url);

        // Check if the fetch was successful
        if (!response.ok) {
            console.error("Failed to fetch the file");
            return;
        }

        // Convert the response to text
        const text = await response.text();
        // console.error("Text content:", text);

        if (editorRef.current && editorRef.current.documentEditor) {
            editorRef.current.documentEditor.open(text);
        } else {
            console.warn("editorRef or documentEditor is not ready yet.");
        }
    }

    const handleEnd = async () => {
        console.log("file xxx", fileDataSelect);
        const isBothEnd = !fileDataSelect?.Status_Side ? false : true

        const data = {
            FileID: fileDataSelect?.FileID,
            FileStatus: !isBothEnd ? 1 : 2
        }

        await apiUtil.auth.queryAsync('FileDataStatus_Update', data).then((resp) => {
            Modal.success({ content: 'Da end!' })
            onFetch()
            onClose()

        }).catch(error => {
            console.log("Fail to update file status", error);
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
            // afterOpenChange={(value) => {
            //     if (value) {
            //         setTimeout(() => {
            //             setIsFullyOpen(true)
            //             setTimeout(async () => {
            //                 fetchData()
            //             }, 0);
            //         }, 500)
            //     }
            // }}
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
                <Space>
                    {/* <Button disabled={fileDataSelect?.Status_BothSide || fileDataSelect?.NguoiCapNhat === username} type="primary" onClick={handleEnd}>End</Button> */}
                    <Button disabled={fileDataSelect?.Status_BothSide || fileDataSelect?.NguoiCapNhat === username} type="primary" onClick={handleSave}>Save</Button>
                </Space>
            </div>
        </Modal>


    );
}
export default EditDetail;