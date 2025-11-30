import React, { useEffect, useRef, useState } from 'react';
import {
  DocumentEditorContainerComponent,
  Toolbar,
  Inject,
  DocumentEditor,
  WordExport,
  SfdtExport,
  Selection,
} from '@syncfusion/ej2-react-documenteditor';
import './WordEditor.css';
import { Button, Modal, Select, message } from 'antd';
import type { ConfigProviderProps } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { apiUtil } from '../../utils';

DocumentEditorContainerComponent.Inject(Toolbar)
DocumentEditor.Inject(WordExport, SfdtExport,Selection)
type SizeType = ConfigProviderProps['componentSize'];

const WordEditor: React.FC = () => {
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
        console.error("Error loading company list:", error);
      });
  };

  const fetchData = async (Url:string) => {
    if (!Url) {
      Modal.error({ content: "Invalid URL." });
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

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const templateUrl = queryParams.get('templateUrl');
    if(templateUrl){
      fetchData(templateUrl)
    }
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
    // console.log("filename author", filename);
    const editor = (editorRef.current as any)?.documentEditor;
    if (!editor) {
      console.warn("⚠️ DocumentEditor is not ready.");
      setIsLoading(false)
      return;
    }
    try {
      const sfdt = editor.serialize();
      // console.log(sfdt);
      const sfdtBlob = new Blob([sfdt], { type: 'application/json' });
      const file = new File([sfdtBlob], `${filename}.txt`, { type: 'application/json' });
      // Goi api upload file lên server
      const resp = await apiUtil.auth.uploadFileAsync(file);
      // console.log("Upload response:", resp);
      if (resp.IsSuccess) {
        const userInfo = getUserInfo()
        // console.log("xxhhh", userInfo);
        const data = {
          FileName: filename,
          Url: resp.Result?.Url,
          FullUrl: resp.Result?.FullUrl,
          Username: userSelect,
          AuthorUsername: userInfo?.UserName
        };
        // console.log("cvcvcv", data);
        // Gọi api insert vào db
        const isInsert = await apiUtil.auth.queryAsync('FileData_Insert', data);
        if (isInsert.IsSuccess) {
          setIsLoading(false)
          message.success('Tạo file thành công!');
          // console.log("File inserted successfully");
          setShowDialog(false);
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
    // console.log("Selected:", value); // debug nếu cần
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
          {roleId === 1 || roleId === 3 || roleId === 4 || roleId === 2 ? (
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
        // enableTrackChanges={true}
        ref={editorRef}
      >
        <Inject services={[Toolbar]} />
      </DocumentEditorContainerComponent>
    </div>
  );
};

export default WordEditor;