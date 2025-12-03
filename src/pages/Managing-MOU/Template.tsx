import { TableColumnsType, Button, Flex, Table, Typography, Input, Form, message, Modal, Select } from 'antd';
import StandardUploadFile from '../../components/StandardUploadFile';
import { apiUtil } from '../../utils';
import React, { useState, useEffect } from 'react';
import { DeleteOutlined, DownloadOutlined, EditOutlined } from '@ant-design/icons';
import EditDetail from './EditDetail';

interface DataType {
    TemplateID?: number // thêm ? để không bắt buộc khi upload
    Description: string
    FullUrl: string
    Url: string
    CategoryId: number // thêm dòng này
    CategoryName?: string; // chỉ dùng để hiển thị
}
interface UploadResult {
    IsSuccess: boolean
    Message: string
    Result: {
        TemplateID?: number
        FileName: string;
        FullUrl: string;
        Url: string;
    } | null;
}

const Template: React.FC = () => {

    const [filteredData, setFilteredData] = useState<DataType[]>([]);
    const [Templatelist, setTemplateList] = useState<DataType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataSource, setDataSource] = useState<any[]>([]);
    const [fileDataSelect, setFileDataSelect] = useState<DataType | null>(null)
    const [editUrl, setEditUrl] = useState<string | null>(null); // Thêm dòng này
    const [selectedFileId, setSelectedFileId] = useState<number>()
    const [isLoading, setIsLoading] = useState(false);
    const [CategoryList, setCategoryList] = useState<CategoryType[]>([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [pendingUploadData, setPendingUploadData] = useState<UploadResult | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfoType | null>(null);


    const { Search } = Input;
    const { Title } = Typography;
    const [form] = Form.useForm();
    const { Option } = Select;

    const [description, setDescription] = useState<{ [key: string]: string | null }>({
        defaultUrl: null,
        defaultName: null,
        defaultFullUrl: null
    })


    useEffect(() => {
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
        };

        setUserInfo(getUserInfo());
    }, []);

    // Xóa một Template
    const handleDelete = (record: DataType) => {
        // console.log("recỏdxxxxx", record);
        if (record.TemplateID) {
            Modal.confirm({
                title: "Are you sure you want to delete this MOU?",
                okText: "Yes",
                cancelText: "No",
                onOk: async () => {
                    if (record.TemplateID)
                        try {
                            await onDeleteTemplate(record?.TemplateID); // Gọi API để xóa MOU
                        } catch (error) {
                            console.error("Lỗi khi xóa MOU:", error);
                        }
                },
            });
        }
    };

    const onDeleteTemplate = (TemplateID: number) => {
        setIsLoading(true);

        apiUtil.auth.queryAsync('Template_Delete', { TemplateID }).then(resp => {
            if (resp.IsSuccess) {
                // Xóa thành công, cập nhật danh sách
                // setTemplateList(prevList => prevList.filter(item => item.TemplateID !== TemplateID));
                onLoadTemplateList()
                setIsLoading(false);
                // console.log(`Doanh Nghiep với ID ${TemplateID} đã bị xóa`);
            } else {
                console.log(`Xóa Doanh Nghiệp thất bại`);
            }
        }).catch(error => {
            console.error('Lỗi khi xóa Doanh Nghiệp:', error);
            setIsLoading(false);
        });
    };

    const handleEdit = (record: DataType) => {
        window.open('/Managing-MOU/wordeditor?templateUrl=' + record.FullUrl);
        // setEditUrl(record.FullUrl);
        // setSelectedFileId(record.TemplateID);
        // setFileDataSelect(record)
        // setIsModalOpen(true);
    };

    const fetchData = async () => {
        try {
            const res = await apiUtil.auth.queryAsync('FileData_Select', {});
            if (res.IsSuccess) {
                const result = (res.Result as any[]).map((item: any, index: number) => ({
                    ...item,
                    key: index,
                }));
                setDataSource(result);
            }
        } catch (err) {
            console.error("Error fetching file list:", err);
        }
    };

    const onLoadTemplateList = () => {
        setIsLoading(true);

        apiUtil.any.queryAsync<DataType[]>('Template_Select').then(resp => {
            if (resp.IsSuccess && resp.Result) {
                const data = resp.Result.map((item, index) => ({
                    ...item,
                    key: index + 1
                }));

                setTemplateList(data);     // lưu data gốc
                setFilteredData(data);     // hiển thị ban đầu giống nhau
            }

            setIsLoading(false);
        });
    };

    const onSearch = (value: string) => {
        const keyword = value.trim().toLowerCase();

        if (!keyword) {
            setFilteredData(Templatelist);
            return;
        }
        const result = Templatelist.filter(item =>
            item.Description.toLowerCase().includes(keyword)
        );

        setFilteredData(result);
    };


    const onLoadCategory = () => {
        setIsLoading(true);
        apiUtil.any.queryAsync<CategoryType[]>('Category_Select')
            .then(resp => {
                if (resp.IsSuccess && resp.Result) {
                    setCategoryList(resp.Result);
                }
            })
            .catch(error => {
                console.error('Error loading Category:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        // console.log("Templatelist updated:", Templatelist);
        setIsLoading(true);
        Promise.all([
            onLoadTemplateList(), onLoadCategory()
        ]).then(() => setIsLoading(false));
    }, []);

    const handleFileUpload = async (keyUrl: string, keyName: string, keyFullUrl: string, resp: UploadResult) => {
        if (!resp.IsSuccess || !resp.Result) {
            message.error("Upload thất bại, không thể insert.");
            return;
        }

        form.setFieldsValue({
            [keyUrl]: resp.Result?.Url,
            [keyName]: resp.Result?.FileName || null,
            [keyFullUrl]: resp.Result?.FullUrl || null,
        });

        setDescription(prev => ({
            ...prev,
            [keyName]: resp.Result?.FileName || null,
        }));

        // Lưu file tạm và mở modal chọn category
        setPendingUploadData(resp);
        setIsCategoryModalOpen(true);
        onLoadCategory(); // gọi API để load category
    };

    const handleConfirmCategory = async () => {
        if (!pendingUploadData?.Result || selectedCategoryId === null) {
            message.warning("Vui lòng chọn loại Category");
            return;
        }

        const newTemplate: DataType = {
            Description: pendingUploadData.Result.FileName,
            FullUrl: pendingUploadData.Result.FullUrl,
            Url: pendingUploadData.Result.Url,
            CategoryId: selectedCategoryId, // 🔥 Thêm dòng này
        };

        try {
            const response = await apiUtil.auth.queryAsync('Template_Insert', newTemplate);
            if (response.IsSuccess) {
                message.success("Thêm template thành công");
                setTemplateList(prev => [...prev, newTemplate]);
                await onLoadTemplateList();
            } else {
                message.error(response.Message || "Insert thất bại");
            }
        } catch (err) {
            console.error("Lỗi khi insert:", err);
        }

        // Đóng modal
        setIsCategoryModalOpen(false);
        setPendingUploadData(null);
        onLoadCategory(); // gọi API để load category
    };

    // Cột Table
    const columns: TableColumnsType<DataType> = [
        {
            title: 'Count',
            key: 'index',
            width: '8%',
            align: 'center',
            render: (_text, _record, index) => index + 1,
        },
        {
            title: 'Description',
            dataIndex: 'Description',
            key: 'Description',
            width: '40%',
            ellipsis: true,
        },
        {
            title: 'Category',
            dataIndex: 'CategoryName',
            key: 'CategoryName',
            width: '25%',
            filters: Array.from(
                new Set(Templatelist.map(cat => cat.CategoryName).filter(Boolean)) // lọc bỏ undefined
            ).map(name => ({
                text: name as string,
                value: name as string,
            })),
            onFilter: (value, record) => record.CategoryName === value,
            render: (text: string) => text || 'Unknown',
            ellipsis: true,
        },


        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Flex gap="small" wrap>
                    <EditOutlined
                        style={{ color: 'blue', cursor: 'pointer' }}
                        onClick={() => {
                            if (!userInfo) {
                                message.info('Login for watching file !');
                                return;
                            }
                            handleEdit(record);
                        }}
                    />

                    {userInfo?.RoleId === 1 && (
                        <DeleteOutlined
                            style={{ color: 'red', cursor: 'pointer' }}
                            onClick={() => handleDelete(record)}
                        />
                    )}
                </Flex>
            ),
        }

    ];
    return (
        <div>
            <Title level={3}>List of Template For Contract</Title>
            <div style={{ display: 'flex', justifyContent: "right", gap: '10px', alignItems: "center" }}>
                <Search
                    placeholder="Search description"
                    allowClear
                    enterButton="Search"
                    size="large"
                    onSearch={onSearch}
                    onChange={(e) => onSearch(e.target.value)} // clear = reset luôn
                    style={{ width: 300 }}
                />

                <Modal
                    title="Chọn Category cho Template"
                    open={isCategoryModalOpen}
                    onOk={handleConfirmCategory}
                    onCancel={() => {
                        setIsCategoryModalOpen(false);
                        setPendingUploadData(null);
                        onLoadCategory();
                    }}
                >
                    <Form layout="vertical">
                        <Form.Item label="Category">
                            <Select
                                placeholder="Select Category"
                                value={selectedCategoryId ?? undefined}
                                onChange={(value) => setSelectedCategoryId(value)}
                                style={{ width: '100%' }}
                            >
                                {CategoryList.map(cat => (
                                    <Select.Option key={cat.Id} value={cat.Id}>
                                        {cat.Name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>

                {userInfo?.RoleId === 1 && (
                    <StandardUploadFile
                        onStart={() => {
                            console.log('onStart');
                        }}
                        onCompleted={(resp) => {
                            handleFileUpload('defaultUrl', 'defaultName', 'defaultFullUrl', resp);
                        }}
                    >
                        <Button type="primary" size="large">
                            Upload
                        </Button>
                    </StandardUploadFile>
                )}


            </div>
            <Table<DataType>
                columns={columns}
                dataSource={filteredData}
                loading={isLoading}
            // rowKey={(record) => record.TemplateID.toString()} // Sử dụng TemplateID làm rowKey
            />
            <EditDetail
                isCreate={true}
                isHideEnd={false}
                isModalOpen={isModalOpen}
                Url={editUrl}
                fileID={selectedFileId}
                fileDataSelect={fileDataSelect ?? null}
                onFetch={() => fetchData()}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

export default Template;