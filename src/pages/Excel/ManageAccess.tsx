import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useRef, useState } from 'react';
import { Space, Table, Button, Input, Typography, Tag, Modal, Select } from 'antd';
import { apiUtil } from '../../utils';


const AccessTypeList: React.FC = () => {
    const [userList, setUserList] = useState<UserListType[]>([])
    const [dataSource, setDataSource] = useState<ExcelFileType[]>([])
    const [accessList, setAccessList] = useState<AccessType[]>([]);
    const [filteredData, setFilteredData] = useState<ExcelFileType[]>([])
    const [combinedData, setCombinedData] = useState<ExcelFileType[]>([]);
    const [searchText, setSearchText] = useState<string>('')
    const [username, setUsername] = useState<string>()
    const [loading, setLoading] = useState(false);

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
                // console.log('data', data)
                setUserList(data ?? [])
            })
            .catch((error) => {
                console.error("Error loading doanh nghiep list:", error);
            });
    };
    const getUserInfo = (): UserInfoType | null => {
        const userInfoString = localStorage.getItem('userInfo');
        // console.log('userinfotype',userInfoString)
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
    const getExcelList = async () => {
        try {
            const res = await apiUtil.auth.queryAsync('ExcelFile_Select', {});

            if (res.IsSuccess) {
                const excelList = res.Result; // danh sách file trả về
                console.log('Danh sách file Excel:', excelList);
                const result = (res.Result as any[]).map((item: any, index: number) => ({
                    ...item,
                    key: index,
                }));
                setFilteredData(result);
            } else {
                console.error('Lấy danh sách file Excel thất bại:', res.Message);
                return [];
            }
        } catch (error) {
            console.error('Lỗi khi gọi API ExcelFile_Select:', error);
            return [];
        }
    };
    const getAccessType = async () => {
        setLoading(true);

        try {
            const userInfo = getUserInfo();
            if (!userInfo) {
                throw new Error('Không tìm thấy thông tin user');
            }

            // Gọi API, không cần truyền filter gì (nếu cần filter thì thêm param vào {})
            const res = await apiUtil.auth.queryAsync('ExcelFileAccess_Select', {});

            console.log('res excelfileaccess', res);

            if (res.IsSuccess) {
                const result = (res.Result as any[]).map((item: any, index: number) => ({
                    key: item.ID ?? index,   // rowKey
                    ...item,                // giữ nguyên: ID, FileId, UserId, UserName, AccessType, ...
                }));

                setAccessList(result);
            } else {
                console.error('Lấy danh sách ExcelFileAccess thất bại:', res.Message);
            }
        } catch (error) {
            console.error('Lỗi khi gọi API ExcelFileAccess_Select:', error);
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     if (!filteredData.length || !accessList.length || !userList.length) return;

    //     const merged = filteredData.map(file => {
    //         // Lọc các access cho file hiện tại
    //         const accessesForFile = accessList.filter(a => Number(a.FileId) === file.FileId);

    //         // Lấy danh sách viewers, tìm tên trong userList
    //         const viewers = accessesForFile
    //             .filter(a => a.AccessType?.toLowerCase() === 'viewer')
    //             .map(a => {
    //                 const user = userList.find(u => u.UserId === a.UserId);
    //                 return user ? user.TenDangNhap : a.ViewerName;
    //             })
    //             .join(', ');

    //         // Lấy danh sách editors, tìm tên trong userList
    //         const editors = accessesForFile
    //             .filter(a => a.AccessType?.toLowerCase() === 'editor')
    //             .map(a => {
    //                 const user = userList.find(u => u.UserId === a.UserId);
    //                 return user ? user.TenDangNhap : a.EditorName;
    //             })
    //             .join(', ');

    //         return {
    //             ...file,
    //             Viewer: viewers,
    //             Editor: editors,
    //         };
    //     });

    //     console.log('combinedData merged', merged);
    //     setCombinedData(merged);
    // }, [filteredData, accessList, userList]);



    useEffect(() => {
        onLoadUserList();
        getExcelList();
        getAccessType();
        const userInfo = getUserInfo()
        setUsername(userInfo?.UserName)
    }, []);

    const columns: ColumnsType<any> = [
        {
            title: 'MOU_Number',
            key: 'index',
            width: '10%',
            ellipsis: true,
            render: (_text, _record, index) => index + 1
        },
        {
            title: 'File Name',
            dataIndex: 'Name',
            key: 'Name',
            width: '20%',
            ellipsis: true,
            render: (text: string) => <a>{text}</a>,
        },
        {
            title: 'Viewer',
            dataIndex: 'ViewerName',
            key: 'ViewerName',
            width: '35%',
            ellipsis: true,
            render: (text: string) => <a>{text}</a>,
        },
        {
            title: 'Editor',
            dataIndex: 'EditorName',
            key: 'EditorName',
            width: '35%',
            ellipsis: true,
            render: (text: string) => <a>{text}</a>,
        },
    ];

    return (
        <>
            <p>AccessType List</p>
            <Table
                columns={columns}
                dataSource={filteredData}
                loading={loading}
            />
        </>
    )
};

export default AccessTypeList;