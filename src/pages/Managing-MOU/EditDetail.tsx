import React, { useRef, useState, useEffect } from 'react';
import {
    DocumentEditorContainerComponent,
    Toolbar,
    Inject,
    DocumentEditorComponent,
    DocumentEditor,
    WordExport,
    SfdtExport,
} from '@syncfusion/ej2-react-documenteditor';
import './WordEditor.css';
import { Modal, Button } from 'antd';
import { apiUtil } from '../../utils';

interface EditDetailProps {
    isModalOpen: boolean;
    Url: string | null;
    onClose: () => void;
}


const EditDetail: React.FC<EditDetailProps> = ({ isModalOpen, Url, onClose }) => {
    const editorRef = useRef<DocumentEditorContainerComponent>(null)
    const [isFullyOpen, setIsFullyOpen] = useState(false)

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
            const blob = new Blob([sfdt], { type: 'application/json' });
            const filename = `edited_document_${Date.now()}.sfdt`;
            const file = new File([blob], filename, { type: blob.type });

            const uploadResp = await apiUtil.auth.uploadFileAsync(file);

            if (uploadResp.IsSuccess) {
                const data = {
                    FileName: filename,
                    Url: uploadResp.Result?.Url,
                    FullUrl: uploadResp.Result?.FullUrl,
                    author: "", // em có thể dùng input hoặc username nếu có
                };

                const insertResp = await apiUtil.auth.queryAsync('FileData_Insert', data);

                if (insertResp.IsSuccess) {
                    Modal.success({ content: 'Tài liệu đã được lưu thành công!' });
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



    // useEffect(() => {
    //     if (Url && editorRef.current?.documentEditor) {
    //       fetch(Url)
    //         .then((res) => res.text())
    //         .then((sfdtText) => {
    //           editorRef.current?.documentEditor.open(sfdtText);
    //         })
    //         .catch((err) => {
    //           console.error('❌ Lỗi khi mở file .sfdt:', err);
    //         });
    //     }
    //   }, [Url]);



    return (
        <Modal
            title="Chỉnh sửa tài liệu"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={null}
            width="80%"
            afterOpenChange={(value) => {
                if (value) {
                    setTimeout(() => {
                        setIsFullyOpen(true)
                        setTimeout (async() => {
                            const response = await fetch(Url);

                            // Check if the fetch was successful
                            if (!response.ok) {
                                console.error("Failed to fetch the file");
                                return;
                            }

                            // Convert the response to text
                            const text = await response.text();
                            console.error("Text content:", text);
                        
                            editorRef.current.documentEditor.open(text);
                        }, 0);
                    }, 500)
                }
            }}
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
                <Button type="primary" onClick={handleSave}>Save</Button>
            </div>
        </Modal>


    );
}
export default EditDetail;