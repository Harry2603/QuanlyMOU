import React, { useState, useEffect } from 'react';
import { Button, Space, Table } from 'antd';
import type { TableProps } from 'antd';
import { apiUtil } from '../../utils';
import { EditOutlined, DeleteOutlined, PlusCircleOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';

interface DataType {
    DoanhNghiepID: number;
    MaDN: string;
    TenDN: string;
    DiaChi: string;
    SDT: number;
    Email: string;
    NguoiDaiDien: string;
    Website: string;
    NgayThanhLap: string;
    GhiChu: string
}

const ListOfCompany: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [DoanhNghiepList, setDoanhNghiepList] = useState<DataType[]>([]);


    const loadDoanhNghiepList = () => {
        setIsLoading(true);
        apiUtil.auth.queryAsync<DataType[]>('DoanhNghiep_Select')
            .then(resp => {
                if (resp.IsSuccess && resp.Result) {
                    setDoanhNghiepList(resp.Result);
                } else {
                    console.error("Tải danh sách doanh nghiệp thất bại", resp.Message);
                }
            })
            .catch(err => {
                console.error("Lỗi khi gọi API:", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };
    useEffect(() => {
        loadDoanhNghiepList();
    }, []);

    const handleDelete = (record: { DoanhNghiepID: number }) => {
        setIsLoading(true);

        apiUtil.auth.queryAsync<{ IsSuccess: boolean }>('DoanhNghiep_Delete', { DoanhNghiepID: record.DoanhNghiepID }).then(resp => {
            console.log("Delete Response:", resp);
            if (resp.IsSuccess) {
                // Xóa thành công, cập nhật danh sách
                setDoanhNghiepList(prevList => prevList.filter(item => item.DoanhNghiepID !== record.DoanhNghiepID));
                console.log(`Delete Companay successful: ${record.DoanhNghiepID}`);
            } else {
                console.log(`Delete fail`, resp);
            }
        }).catch(error => {
            console.error('ERROR Ò DELETE:', error);
        }).finally(() => {
            setIsLoading(false);
        });
    };

    const columns: TableProps<DataType>['columns'] = [
        {
            title: 'STT',
            key: 'index',
            width: '15%',
            ellipsis: true,
            render: (_text, _record, index) => index + 1
        },
        // {
        //     title: 'Company',
        //     dataIndex: 'DoanhNghiepID',
        //     key: 'DoanhNghiepID',
        //     width: '15%',
        //     ellipsis: true,
        //     render: (_text, _record, index) => index + 1
        // },
        {
            title: 'Company_ID',
            dataIndex: 'MaDN',
            key: 'MaDN',
            width: '15%',
            ellipsis: true,
            render: (text: string) => <a>{text}</a>,
        },
        {
            title: 'Company Name',
            dataIndex: 'TenDN',
            key: 'TenDN',
            width: '20%',
            ellipsis: true,
            render: (_, record) => (
                <>
                    <p><strong>Phone number:</strong> {record.SDT || 'N/A'}</p>
                    <p><strong>DiaChi:</strong> {record.DiaChi}</p>
                    <p><strong>Website:</strong> {record.Website}</p>
                    <p><strong>Email:</strong> {record.Email || 'N/A'}</p>
                    <p><strong>Note:</strong> {record.GhiChu || 'N/A'}</p>
                    <p><strong>Establishment Date:</strong> {record.NgayThanhLap || 'N/A'}</p>
                </>
            ),
        },
        {
            title: 'Representative',
            dataIndex: 'NguoiDaiDien',
            key: 'NguoiDaiDien',
            width: '15%',
            ellipsis: true,
            render: (text: string) => <a>{text}</a>,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    {/* <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}></Button> */}
                    <Button
                        type="primary"
                        icon={<DeleteOutlined />}
                        size="middle" // hoặc "small" / "large"
                        onClick={() => handleDelete({ DoanhNghiepID: record.DoanhNghiepID })}
                        className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Table columns={columns} dataSource={DoanhNghiepList} rowKey="DoanhNghiepID" />

        </div>
    );
}

export default ListOfCompany
