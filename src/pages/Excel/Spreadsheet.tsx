import React, { useEffect, useRef, useState } from 'react';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import './spreadsheet.css';
import { Button, Modal, Input, Select, message } from 'antd';
import { apiUtil } from '../../utils';
const Spreadsheet: React.FC = () => {
  const spreadsheetRef = useRef<SpreadsheetComponent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userList, setUserList] = useState<UserListType[]>([])
  const [userSelect, setUserSelect] = useState<string>()
  const [fileName, setFilename] = useState('');
  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);
  const handleChange = (value: string) => {
    setUserSelect(value);
    console.log("Selected:", value); // debug nếu cần
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
        console.error("Error loading doanh nghiep list:", error);
      });
  };
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
  const fetchExcelData = async (url: string) => {
    if (!spreadsheetRef.current) return;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error("❌ Failed to fetch file:", response.statusText);
        return;
      }

      const isExcelUrl = (url: string) => {
        return url.endsWith(".xlsx") || url.endsWith(".xls");
      };

      let jsonData: any;

      if (isExcelUrl(url)) {
        // Nếu là Excel → convert qua Syncfusion Import API
        const excelBlob = await response.blob();
        const formData = new FormData();
        formData.append("files", excelBlob, "uploaded.xlsx");

        const uploadResp = await fetch(
          "https://services.syncfusion.com/react/production/api/spreadsheet/import",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadResp.ok) throw new Error("Convert Excel thất bại!");
        jsonData = await uploadResp.json();
      } else {
        // Nếu đã là JSON thì load trực tiếp
        jsonData = await response.json();
      }

      spreadsheetRef.current.open(jsonData);
    } catch (err) {
      console.error("⚠️ Error loading file:", err);
    }
  };
  const handleOk = async () => {
    if (!spreadsheetRef.current) return;
    if (!fileName) {
      message.warning("Vui lòng nhập File Name!");
      return;
    }
    if (!userSelect) {
      message.warning("Vui lòng chọn Account Name!");
      return;
    }
    try {
      // Lấy JSON từ Spreadsheet
      const json = await spreadsheetRef.current.saveAsJson();
      const blob = new Blob([JSON.stringify(json)], { type: "application/json" });
      const file = new File([blob], `${fileName}.xlsx`, { type: "application/json" });
      console.log("File chuẩn bị upload:", file);
      // Upload file lên server
      const uploadResp = await apiUtil.auth.uploadFileAsync(file);
      console.log("Upload response:", uploadResp);
      if (uploadResp.IsSuccess) {
        const userInfo = getUserInfo()
        // Insert DB
        const data = {
          Name: fileName,
          Url: uploadResp.Result?.Url,
          FullUrl: uploadResp.Result?.FullUrl,
          Username: userSelect,
          AuthorUsername: userInfo?.UserName
        };

        const isInsert = await apiUtil.auth.queryAsync("ExcelFile_Insert", data);

        if (isInsert.IsSuccess) {
          message.success("Lưu file Excel thành công!");
          setIsModalOpen(false);
        } else {
          message.error("Lưu DB thất bại!");
        }
      } else {
        message.error("Upload file thất bại!");
      }
    } catch (err) {
      console.error("Error saving file:", err);
    }
  };
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const templateUrl = queryParams.get('templateUrl');
    if (templateUrl) {
      fetchExcelData(templateUrl)
    }
    onLoadUserList();
    getUserInfo();
  }, [])
  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <Button type="primary" onClick={showModal} style={{ marginBottom: 12 }}>
        Save
      </Button>

      <Modal
        title="Save File"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        maskClosable={false}  // không cho click ra ngoài để tắt
      >
        <div style={{ marginBottom: 12 }}>
          <label>File Name</label>
          <Input
            placeholder="Enter file name"
            value={fileName}
            onChange={(e) => setFilename(e.target.value)} />
        </div>
        <div>
          <label>Account Name</label>
          <Select
            onChange={handleChange}
            style={{ width: "100%" }}
            options={userList}
            placeholder="Select a account"
          />
        </div>
      </Modal>

      <SpreadsheetComponent
        ref={spreadsheetRef}
        allowOpen
        allowSave
        openUrl="https://document.syncfusion.com/web-services/spreadsheet-editor/api/spreadsheet/open"
        saveUrl="https://document.syncfusion.com/web-services/spreadsheet-editor/api/spreadsheet/save"
        showFormulaBar
      />
    </div>
  );
};

export default Spreadsheet;
