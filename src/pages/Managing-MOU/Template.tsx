import { TableColumnsType, Button, Flex, Table, Typography, Input, Form, message } from 'antd';
import StandardUploadFile from '../../components/StandardUploadFile';
import { apiUtil } from '../../utils';
import React, { useState, useEffect } from 'react';

interface DataType {
    TemplateID?: number; // thêm ? để không bắt buộc khi upload
    Description: string
    FullUrl: string
    Url: string
}
interface UploadResult {
    IsSuccess: boolean
    Message: string
    Result: {
        FileName: string;
        FullUrl: string;
        Url: string;
    } | null;
}

const Template: React.FC = () => {

    const [filteredData, setFilteredData] = useState<DataType[]>([]);
    const [Templatelist, setTemplateList] = useState<DataType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { Search } = Input;
    const { Title } = Typography;
    const [form] = Form.useForm();

    const [description, setDescription] = useState<{ [key: string]: string | null }>({
        defaultUrl: null,
        defaultName: null,
        defaultFullUrl: null
    })

    const onLoadTemplateList = () => {

        setIsLoading(true)
        apiUtil.auth.queryAsync<DataType[]>('Template_Select').then(resp => {
            if (resp.IsSuccess) {
                console.log("API Response:", resp);
                if (resp.Result === null) return
                setTemplateList(resp.Result.map((item, index) => {
                    return {
                        ...item,
                        TemplateID: index + 1, // Giả sử bạn tạo TemplateID nếu không có sẵn
                    }
                }))// Cập nhật danh sách CSV vào state

                setIsLoading(false)// Kết thúc trạng thái loading
                // console.log('res.Result', resp.Result)
            } else {
                console.log('load linh vuc fail')
            }
        })
    }

    useEffect(() => {
        console.log("🔍 Templatelist updated:", Templatelist);
        setIsLoading(true);
        Promise.all([
            onLoadTemplateList(),
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
        })
        setDescription(prev => ({
            ...prev,
            [keyName]: resp.Result?.FileName || null,
        }));
        // Sau khi upload thành công và gán form xong => gọi insert luôn
        if (resp.IsSuccess) {
            try {
                // const values = await form.validateFields();

                const newTemplate: DataType = {
                    Description: resp.Result?.FileName,
                    FullUrl: resp.Result?.FullUrl,
                    Url: resp.Result?.Url
                };

                console.log("newTemplate xxxxx", newTemplate);

                const response = await apiUtil.auth.queryAsync('Template_Insert', newTemplate);

                if (response.IsSuccess) {
                    message.success("Upload và thêm template thành công");
                    setTemplateList(prev => [...prev, newTemplate]);
                    await onLoadTemplateList();
                } else {
                    message.error(response.Message || "Insert thất bại");
                }
            } catch (err) {
                console.error("Lỗi khi upload và insert:", err);
            }
        } else {
            console.log("Upload file that bai");
        }
    }

    // Hàm Search
    const onSearch = (value: string) => {
        const keyword = value.toLowerCase();
        const result = filteredData.filter(item =>
            item.Description.toLowerCase().includes(keyword)
        );
        setFilteredData(result);
    };

    // Cột Table
    const columns: TableColumnsType<DataType> = [
        {
            title: 'Count',
            key: 'index',
            width: '15%',
            ellipsis: true,
            render: (_text, _record, index) => index + 1
          },
        { title: 'Description', dataIndex: 'Description', key: 'Description' },
        {
            title: 'Action',
            key: 'action',
            render: (_, _record) => (
                <Flex gap="small" wrap>
                    <Button type="primary">Choose</Button>
                    <Button type="primary">Delete</Button>
                </Flex>
            ),
        },
    ];
    return (
        <div>
            <Title level={3}>List of Template MOU</Title>
            <div style={{ display: 'flex', justifyContent: "right", gap: '10px', alignItems: "center" }}>
                <Search
                    placeholder="Search description"
                    allowClear
                    enterButton="Search"
                    size="large"
                    onSearch={onSearch}
                    style={{ width: 300 }}
                />
                <p>{description.defaultName}</p>
                <StandardUploadFile
                    onStart={() => {
                        console.log('onStart')
                    }}
                    onCompleted={resp => {
                        handleFileUpload(
                            'defaultUrl',
                            'defaultName',
                            'defaultFullUrl',
                            resp,
                        )
                        console.log('resp', resp)
                    }}>
                    <Button
                        type="primary"
                        size="large"
                    >Upload</Button>
                </StandardUploadFile>
            </div>
            <Table<DataType> 
            columns={columns} 
            dataSource={Templatelist} 
            loading={isLoading}
            // rowKey={(record) => record.TemplateID.toString()} // Sử dụng TemplateID làm rowKey
            />
        </div>
    );
}

export default Template;