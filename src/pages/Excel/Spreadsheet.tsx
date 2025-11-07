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

  const handleOk = async () => {
    const spreadsheet = spreadsheetRef.current;
    if (!spreadsheet) return;

    if (!fileName) {
      message.warning("Vui lòng nhập File Name!");
      return;
    }
    if (!userSelect) {
      message.warning("Vui lòng chọn Account Name!");
      return;
    }

    spreadsheet.save();
  };

  const beforeSave = (args: any) => {
    args.needBlobData = true;
    args.isFullPost = false;
  };

  const saveComplete = async (args: any) => {
    console.log('Save complete event triggered:', args);
    console.log('Blob data type:', args.blobData?.type);
    const blobData = args.blobData;
    if (!blobData) {
      message.error("Không lấy được file Blob Excel!");
      return;
    }

    const file = new File([blobData], `${fileName}.xlsx`, {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    console.log("Blob file Excel:", file);

    // Upload file lên server
    const uploadResp = await apiUtil.auth.uploadFileAsync(file);
    if (!uploadResp.IsSuccess) {
      message.error("Upload file thất bại!");
      return;
    }

    const userInfo = getUserInfo();
    const data = {
      Name: fileName,
      Url: uploadResp.Result?.Url,
      FullUrl: uploadResp.Result?.FullUrl,
      Username: userSelect,
      AuthorUsername: userInfo?.UserName,
    };

    const isInsert = await apiUtil.auth.queryAsync("ExcelFile_Insert", data);
    if (isInsert.IsSuccess) {
      message.success("Lưu file Excel thành công!");
      setIsModalOpen(false);
    } else {
      message.error("Lưu DB thất bại!");
    }
  };


  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const templateUrl = queryParams.get('templateUrl');
    if (templateUrl) {
      // fetchExcelData(templateUrl)
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
        beforeSave={beforeSave}
        saveComplete={saveComplete}
        openUrl="https://document.syncfusion.com/web-services/spreadsheet-editor/api/spreadsheet/open"
        saveUrl="https://document.syncfusion.com/web-services/spreadsheet-editor/api/spreadsheet/save"
        showFormulaBar
      />
    </div>
  );
};

export default Spreadsheet;
