import React, { useEffect, useRef, useState } from 'react';
import {
  DocumentEditorContainerComponent,
  Toolbar,
  Inject,
  DocumentEditor,
  WordExport,
  SfdtExport,
} from '@syncfusion/ej2-react-documenteditor';
import './WordEditor.css';
import { Button, Modal, Select } from 'antd';
import type { ConfigProviderProps } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { apiUtil } from '../../utils';

DocumentEditorContainerComponent.Inject(Toolbar)
DocumentEditor.Inject(WordExport, SfdtExport)
type SizeType = ConfigProviderProps['componentSize'];

const WordEditor: React.FC = () => {
  // let container = useRef<DocumentEditorContainerComponent>(null)
  const editorRef = useRef<DocumentEditorContainerComponent>(null)

  const [showDialog, setShowDialog] = useState(false);
  const [filename, setFilename] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const [userSelect, setUserSelect] = useState<string>()
  const [userList, setUserList] = useState<UserListType[]>([])
  const [roleId, setRoleId] = useState<number>()

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

  const optionList = [
    {
      label: "1",
      value: "1"
    },
    {
      label: "2",
      value: "2"
    },
    {
      label: "3",
      value: "3"
    },
    {
      label: "4",
      value: "4"
    },
    {
      label: "5",
      value: "5"
    },
    {
      label: "6",
      value: "6"
    },
    {
      label: "7",
      value: "7"
    },
    {
      label: "8",
      value: "8"
    },
    {
      label: "9",
      value: "9"
    }
  ]

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
        setUserList(data ?? [])
      })
      .catch((error) => {
        console.error("Error loading doanh nghiep list:", error);
      });
  };

  useEffect(() => {
    const userInfo = getUserInfo()
    setRoleId(userInfo?.RoleId)
    onLoadUserList()
  }, [])

  const onDownload = () => {
    const editor = (editorRef.current as any)?.documentEditor;
    if (editor) {
      editor.save('sample', 'Docx'); // Tải file xuống
    }
  };

  const handleConfirmSave = async () => {
    setIsLoading(true)
    console.log("filename author", filename);

    const editor = (editorRef.current as any)?.documentEditor;

    if (!editor) {
      console.warn("⚠️ DocumentEditor is not ready.");
      setIsLoading(false)
      return;
    }

    try {
      // const blob: Blob = await editor.saveAsBlob("DOCX");
      // console.log("📄 Blob file output:", blob);
      // const filenameDocument = `${filename}.docx`;
      // const file = new File([blob], filenameDocument, { type: blob.type });

      const sfdt = editor.serialize();
      console.log(sfdt);
      const sfdtBlob = new Blob([sfdt], { type: 'application/json' });
      const file = new File([sfdtBlob], `${filename}.txt`, { type: 'application/json' });

      // Goi api upload file lên server
      const resp = await apiUtil.auth.uploadFileAsync(file);
      console.log("Upload response:", resp);

      if (resp.IsSuccess) {
        const data = {
          FileName: filename,
          Url: resp.Result?.Url,
          FullUrl: resp.Result?.FullUrl,
          // DoanhNghiepID === 1 là trường ĐH Quốc tế
          Username: roleId === 1 ? userSelect : 1
        };

        // Gọi api insert vào db
        const isInsert = await apiUtil.auth.queryAsync('FileData_Insert', data);

        if (isInsert.IsSuccess) {
          setIsLoading(false)

          console.log("File inserted successfully");
        } else {
          setIsLoading(false)
          console.error("Failed to insert file data");
        }
      } else {
        setIsLoading(false)
        console.error("Upload was not successful");
      }
    } catch (err) {
      setIsLoading(false)
      console.error("Error during upload or insert:", err);
    }
  };

  const handleChange = (value: string) => {
    setUserSelect(value);
    console.log("Selected:", value); // debug nếu cần
  }

  return (
    <div style={{ height: '100vh' }}>
      <Button
        className="ml-2"
        type="primary"
        shape="round"
        size="middle"
        onClick={() => setShowDialog(true)}>
        Save</Button>
      <Button
        type="primary"
        shape="round" icon={<DownloadOutlined />}
        size="middle"
        onClick={onDownload}>
        Download</Button>
      <div />
      <Modal
        title={<span className="text-lg font-semibold">Save New MOU</span>}
        open={showDialog}
        onOk={handleConfirmSave}
        onCancel={() => setShowDialog(false)}
        confirmLoading={isLoading}>
        <div className="p-4 space-y-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">File Name:</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
          </div>
          {/* roleID === 1, tức la admin, sẽ có quyền chọn đối tác */}
          {roleId === 1 ? (
            <>
              <label className="block text-sm font-medium text-gray-700">Account name:</label>
              <Select
                onChange={handleChange}
                style={{ width: "100%" }}
                options={userList}
                placeholder="Select a account"
              />
            </>
          ) : null}
        </div>
      </Modal>
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
  );
};

export default WordEditor;