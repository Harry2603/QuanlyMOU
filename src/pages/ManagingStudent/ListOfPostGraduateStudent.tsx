import { Table, TableColumnsType, Space, Button, Input, Modal, Row, Form, Col, DatePicker, Divider, Select } from "antd";
import { EditOutlined, DeleteOutlined, PlusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { apiUtil } from '../../utils';

interface DataType {
    key: string | number;
    ordinalnumber: number;
    studentid: string;
    name: string;
    information: string;
    major: string;
    department: string;
    yearofgraduation: number;
    graduationofgrading: string;
    detail: string;
    gender: string;
    dob: string;
    phone: string;
    email: string;
    serialNumber: string;
    form: string;
    grade: string;
    register: string;
    MaSV: string;
    HoTen: string;
    GioiTinh: string; // Thêm thuộc tính này
    NgaySinh: string; // Thêm thuộc tính này
    DienThoai?: string; // Thêm thuộc tính này, có thể rỗng
    Email?: string; // Chỉnh sửa chữ thường nếu API trả về khác
    TenNganh: string;
    KhoaTotNghiep: string;
    NamTotNghiep: number;
    XepLoai: string;
    SoHieu: string; // Thêm thuộc tính này
    HinhThuc: string; // Thêm thuộc tính này
    QuyetDinh: string; // Thêm thuộc tính này
    VaoSo: string; // Thêm thuộc tính này
    NgayCap: string;
}

const ListOfPostGraduateStudent: React.FC = () => {
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    const [addForm] = Form.useForm();
    const { Search } = Input;
    const [searchValue, setSearchValue] = useState("");
    const { Option } = Select;
    const [isLoading, setIsLoading] = useState(false);

    const [CuuSinhVienList, setCuuSinhVienList] = useState<DataType[]>([]);
    const [nganhList, setNganhList] = useState<DataType[]>([]);
    const [doanhNghiepList, setDoanhNghiepList] = useState<DataType[]>([]);
    const [loaiHinhList, setLoaiHinhList] = useState<DataType[]>([]);
    const [khoaList, setKhoaList] = useState<DataType[]>([]);


    const onLoadCuuSinhVien = () => {

        setIsLoading(true)
        apiUtil.auth.queryAsync<DataType[]>('CuuSinhVien_Select').then(resp => {
            if (resp.IsSuccess) {
                console.log("API Response:", resp);
                if (resp.Result === null) return
                setCuuSinhVienList(resp.Result.map((item, index) => {
                    return {
                        ...item,
                        STT: index + 1,
                        key: String(item.MaSV || index), // Ép key thành string
                    }
                }))// Cập nhật danh sách CSV vào state
                setIsLoading(false)// Kết thúc trạng thái loading
                // console.log('res.Result', resp.Result)
            } else {
                console.log('load linh vuc fail')
            }
        })
    }
    const onAddCuuSinhVien = async () => {
        setIsLoading(true);
        const resp = await apiUtil.auth.queryAsync<DataType[]>('CuuSinhVien_Insert', true);

        console.log("API Response:", resp);

        if (resp.IsSuccess) {
            console.log("Dữ liệu sau khi thêm:", resp.Result);
            // Sau khi thêm xong, load lại danh sách sinh viên
            await onLoadCuuSinhVien();
        } else {
            console.error("Lỗi khi thêm sinh viên");
        }
        setIsLoading(false);
    };

    const onLoadNganh = () => {

        setIsLoading(true)
        apiUtil.auth.queryAsync<DataType[]>('Nganh_Select').then(resp => {
            if (resp.IsSuccess) {
                console.log("API Response:", resp);
                if (resp.Result === null) return
                setNganhList(resp.Result)// Cập nhật danh sách CSV vào state
                setIsLoading(false)// Kết thúc trạng thái loading
                // console.log('res.Result', resp.Result)
            } else {
                console.log('load linh vuc fail')
            }
        })
    }
    const onLoadDoanhNghiep = () => {

        setIsLoading(true)
        apiUtil.auth.queryAsync<DataType[]>('DoanhNghiep_Select').then(resp => {
            if (resp.IsSuccess) {
                console.log("API Response:", resp);
                if (resp.Result === null) return
                setDoanhNghiepList(resp.Result)// Cập nhật danh sách CSV vào state
                setIsLoading(false)// Kết thúc trạng thái loading
                // console.log('res.Result', resp.Result)
            } else {
                console.log('load linh vuc fail')
            }
        })
    }
    const onGetDoanhNghiep = () => {

        setIsLoading(true)
        apiUtil.auth.queryAsync<DataType[]>('NamHoc_Get').then(resp => {
            if (resp.IsSuccess) {
                console.log("API Response:", resp);
                if (resp.Result === null) return
                setCuuSinhVienList(resp.Result)// Cập nhật danh sách CSV vào state
                setIsLoading(false)// Kết thúc trạng thái loading
                // console.log('res.Result', resp.Result)
            } else {
                console.log('load linh vuc fail')
            }
        })
    }
    const onLoadLoaiHinh = () => {

        setIsLoading(true)
        apiUtil.auth.queryAsync<DataType[]>('LoaiHinh_Select').then(resp => {
            if (resp.IsSuccess) {
                console.log("API Response:", resp);
                if (resp.Result === null) return
                setLoaiHinhList(resp.Result)// Cập nhật danh sách CSV vào state
                setIsLoading(false)// Kết thúc trạng thái loading
                // console.log('res.Result', resp.Result)
            } else {
                console.log('load linh vuc fail')
            }
        })
    }
    const onLoadKhoa = () => {

        setIsLoading(true)
        apiUtil.auth.queryAsync<DataType[]>('Khoa_Select').then(resp => {
            if (resp.IsSuccess) {
                console.log("API Response:", resp);
                if (resp.Result === null) return
                setKhoaList(resp.Result)// Cập nhật danh sách CSV vào state
                setIsLoading(false)// Kết thúc trạng thái loading
                // console.log('res.Result', resp.Result)
            } else {
                console.log('load linh vuc fail')
            }
        })
    }

    useEffect(() => {
        console.log("🔍 cuuSinhVienList updated:", CuuSinhVienList);
        setIsLoading(true);
        Promise.all([
            onLoadCuuSinhVien(),
            onLoadNganh(),
            onLoadDoanhNghiep(),
            onGetDoanhNghiep(),
            onLoadLoaiHinh(),
            onLoadKhoa(),
        ]).then(() => setIsLoading(false));
    }, []);


    const showEditModal = (record: DataType) => {
        console.log("Edit", record);
    };

    const handleDelete = (record: DataType) => {
        console.log("Delete", record);
    };

    const filteredData = CuuSinhVienList?.filter(student =>
        student?.HoTen?.toLowerCase().includes(searchValue?.toLowerCase() || '') ||
        student?.MaSV?.toLowerCase().includes(searchValue?.toLowerCase() || '')
    ) || [];

    const onSearch = (value: string) => {
        setSearchValue(value);
        console.log("Search:", value);
    };

    const showAddModal = () => {
        console.log("Open Add Modal");
        setIsAddModalOpen(true);
    };

    const handleOk = async () => {
        try {
            const values = await addForm.validateFields(); // Lấy dữ liệu từ form
            console.log("Form values:", values);

            // Định nghĩa newStudent với đầy đủ thông tin cần thiết
            const newStudent: DataType = {
                key: values.studentid, // Sử dụng mã sinh viên làm key
                ordinalnumber: CuuSinhVienList.length + 1, // STT tự động tăng
                studentid: values.studentid, // Mã sinh viên
                name: values.name, // Họ tên
                gender: values.gender, // Giới tính
                dob: values.dob.format("YYYY-MM-DD"), // Ngày sinh
                phone: values.phone || "", // Số điện thoại
                email: values.email || "", // Email
                major: values.major, // Ngành học
                department: values.department, // Khoa
                yearofgraduation: values.graduationYear, // Năm tốt nghiệp
                graduationofgrading: values.graduationGrade, // Xếp loại tốt nghiệp
                serialNumber: values.serialNumber || "", // Số hiệu
                form: values.educationType, // Hình thức đào tạo
                grade: values.graduationGrade, // Xếp loại tốt nghiệp
                register: values.register || "", // Vào sổ
                MaSV: values.studentid, // Mã sinh viên
                HoTen: values.name, // Họ tên
                GioiTinh: values.gender, // Giới tính
                NgaySinh: values.dob.format("YYYY-MM-DD"), // Ngày sinh
                DienThoai: values.phone || "", // Số điện thoại
                Email: values.email || "", // Email
                TenNganh: values.major, // Ngành học
                KhoaTotNghiep: values.department, // Khoa tốt nghiệp
                NamTotNghiep: values.graduationYear, // Năm tốt nghiệp
                XepLoai: values.graduationGrade, // Xếp loại
                SoHieu: values.serialNumber || "", // Số hiệu
                HinhThuc: values.educationType, // Hình thức đào tạo
                QuyetDinh: values.decision || "", // Quyết định
                NgayCap: values.ngayCap || "", // Ngày cấp (viết đúng tên)
                VaoSo: values.register || "", // Vào sổ
                information: "", // Thêm thông tin khác nếu có
                detail: "", // Thêm thông tin chi tiết nếu có
            };


            const resp = await apiUtil.auth.queryAsync('CuuSinhVien_Insert', newStudent, true);

            if (resp.IsSuccess) {
                console.log("Thêm sinh viên thành công:", resp);
                setCuuSinhVienList([...CuuSinhVienList, newStudent]); // Cập nhật danh sách
                setIsAddModalOpen(false); // Đóng modal
                addForm.resetFields(); // Reset form
                await onLoadCuuSinhVien(); // Tải lại danh sách
            } else {
                console.error("Lỗi khi thêm sinh viên:", resp.Message);
            }
        } catch (error) {
            console.error("Lỗi khi xử lý form hoặc gọi API:", error);
        }
    };


    const handleCancel = () => {
        setIsAddModalOpen(false);
    };

    const columns: TableColumnsType<DataType> = [
        {
            title: 'Ordinal Number',
            dataIndex: 'STT',
            key: 'STT',

        },
        {
            title: 'Student ID',
            dataIndex: 'MaSV',
            key: 'MaSV',
        },
        {
            title: 'Name',
            dataIndex: 'HoTen',
            key: 'HoTen',
            render: (text) => <a>{text}</a>,
        },
        {
            title: 'Information',
            key: 'information',
            render: (_, record) => (
                <>
                    <p><strong>Gender:</strong> {record.GioiTinh}</p>
                    <p><strong>Date of birth:</strong> {record.NgaySinh}</p>
                    <p><strong>Phone number:</strong> {record.DienThoai || 'N/A'}</p>
                    <p><strong>Email:</strong> {record.Email || 'N/A'}</p>
                </>
            ),
        },
        {
            title: 'Major',
            dataIndex: 'TenNganh',
            key: 'TenNganh',
        },
        {
            title: 'Department',
            dataIndex: 'KhoaID',
            key: 'KhoaID',
        },
        {
            title: 'Year of fraduation',
            dataIndex: 'NamTotNghiep',
            key: 'NamTotNghiep',
        },
        {
            title: 'Graduation of grading',
            dataIndex: 'XepLoai',
            key: 'XepLoai',
        },
        {
            title: 'Deatail',
            key: 'detail',
            render: (_, record) => (
                <>
                    <p><strong>Serial Number:</strong> {record.SoHieu}</p>
                    <p><strong>Form:</strong> {record.HinhThuc}</p>
                    <p><strong>Ngày Cấp:</strong> {record.NgayCap}</p>
                    <p><strong>Decision:</strong> {record.QuyetDinh}</p>
                    <p><strong>Register:</strong> {record.VaoSo}</p>
                </>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <EditOutlined style={{ color: 'blue' }} onClick={() => showEditModal(record)} />
                    <DeleteOutlined style={{ color: 'red' }} onClick={() => handleDelete(record)} />
                </Space>
            ),
        },

    ]
    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    ListOfPostGraduateStudent
                </p>

                <div style={{ display: 'flex', justifyContent: "right", gap: '10px', alignItems: "center" }}>
                    <Search
                        placeholder="Search by name, code or description"
                        allowClear
                        enterButton="Search"
                        size="large"
                        onSearch={onSearch}
                        style={{ width: 300 }}
                    />
                    <Button type="primary" size="large" icon={<PlusCircleOutlined />} onClick={showAddModal}></Button>
                </div>
                <Table columns={columns} dataSource={filteredData} rowKey="key" loading={isLoading} />

            </div>
            {/* // Modal thêm mới */}
            <Modal
                title="Add New"
                open={isAddModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                centered
                okText="Save"
                cancelText="Cancel"
                width={1000}>
                <Form form={addForm} layout="vertical">
                    <Divider orientation="left">Thông tin cá nhân</Divider>
                    <Row gutter={8}>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                label="Nhập mã sinh viên"
                                name="studentid"
                                rules={[{ required: true, message: 'Vui lòng nhập mã sinh viên!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                label="Tên sinh viên"
                                name="name"
                                rules={[{ required: true, message: 'Vui lòng nhập tên sinh viên!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                label="Giới tính"
                                name="gender"
                                rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                            >
                                <Select placeholder="Chọn giới tính">
                                    <Option value="male">Nam</Option>
                                    <Option value="female">Nữ</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                label="Ngày sinh"
                                name="dob"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                label="Số điện thoại"
                                name="phone"
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider orientation="left">Thông tin tốt nghiệp</Divider>
                    <Row gutter={8}>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                label="Năm tốt nghiệp"
                                name="graduationYear"
                                rules={[{ required: true, message: 'Vui lòng chọn năm tốt nghiệp!' }]}
                            >
                                <Select placeholder="Chọn năm tốt nghiệp" allowClear>
                                    {[...Array(2025 - 1990 + 1)].map((_, index) => {
                                        const year = 1990 + index;
                                        return (
                                            <Option key={year} value={year.toString()}>
                                                {year}
                                            </Option>
                                        );
                                    })}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                label="Ngành học"
                                name="major"
                                rules={[{ required: true, message: 'Vui lòng nhập ngành học!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                label="Hình Thức"
                                name="educationType"
                                rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                            >
                                <Select placeholder="Chọn hình thức">
                                    <Option value="regular">Chính quy</Option>
                                    <Option value="non-regular">Không chính quy</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                label="Số hiệu"
                                name="studentNumber"
                                rules={[{ required: true, message: 'Vui lòng nhập số hiệu!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                label="Khoa tốt nghiệp"
                                name="faculty"
                                rules={[{ required: true, message: 'Vui lòng nhập khoa tốt nghiệp!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                label="Xếp loại"
                                name="grading"
                                rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                            >
                                <Select placeholder="Chọn loại học lực">
                                    <Option value="excellent">Xuất sắc</Option>
                                    <Option value="good">Giỏi</Option>
                                    <Option value="fair">Khá</Option>
                                    <Option value="average">Trung bình khá</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                label="Ngày cấp"
                                name="issueDate"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày cấp!' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                label="Vào sổ"
                                name="recordNumber"
                                rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                label="Quyết định"
                                name="decision"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        label="Đóng góp"
                        name="contribution"
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default ListOfPostGraduateStudent
