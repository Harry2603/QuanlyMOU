import React, { useEffect, useState } from "react";
import { Button, Form, Input, message,Row, Col, DatePicker } from "antd";
import { StandardForm } from "../../components";
import { useNavigate } from "react-router-dom";
import { apiUtil } from "../../utils";
import "./style.css";

const RegisterPage: React.FC = () => {
    const [isBusy, setIsBusy] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const token = localStorage.getItem("access_token"); // Kiểm tra quyền admin

    //Kiểm tra quyền Admin
    useEffect(() => {
    }, [token, navigate]);
    useEffect(() => {
        // onLoadDoanhNghiep()
    }, [])

    const onFinish = async (formData: FieldType) => {
        setIsBusy(true);
        const {
            Username,
            Password,
            // Role,
            MaDN,
            TenDN,
            DiaChi,
            SDT,
            Email,
            NguoiDaiDien,
            Website,
            NgayThanhLap,
            GhiChu } = formData;

        try {

            const doanhResp = await apiUtil.any.queryAsync("DoanhNghiep_Insert", {
                MaDN: MaDN,
                TenDN: TenDN,
                DiaChi: DiaChi,
                SDT: SDT,
                Email: Email,
                NguoiDaiDien: NguoiDaiDien,
                Website: Website,
                NgayThanhLap: NgayThanhLap,
                GhiChu: GhiChu
            });
            if (!doanhResp?.IsSuccess || !doanhResp.Result) {
                message.error(doanhResp?.Message || "Tạo doanh nghiệp thất bại!");
                return;
            }
            const result = doanhResp.Result as any[];

            const DoanhNghiepID = Array.isArray(result)
                ? result[0]?.DoanhNghiepID
                : undefined;

            // console.log("DoanhNghiepID:", DoanhNghiepID);

            if (!DoanhNghiepID) {
                message.error("Không lấy được DoanhNghiepID từ API DoanhNghiep_Insert!");
                setIsBusy(false);
                return;
            }


            // 2️ Gọi API để mã hóa mật khẩu
            const passwordResp = await apiUtil.user.generatePasswordAsync(Password);
            // console.log("call success", passwordResp.Result);
            if (!passwordResp?.IsSuccess || !passwordResp.Result) {
                message.error(passwordResp?.Message || "Mã hóa mật khẩu thất bại!");
                setIsBusy(false);
                return;
            }

            const passHash = passwordResp.Result as any
            // console.log("pass", passHash.PasswordHash);
            //  Định nghĩa RoleId cho UsepasswordResp.Resultr
            // console.log("user name", Username);

            //  4️ Gửi request đăng ký tài khoản
            const registerResp = await apiUtil.any.queryAsync("CoreUsers_Insert", {
                UserName: Username,
                PasswordHash: passHash.PasswordHash,
                FullName: Username,
                Salt: passHash.Salt,
                RoleId: 3,
                DoanhNghiepID: DoanhNghiepID
            });
            // console.log("Dang ky thanh cong", registerResp);

            if (!registerResp?.IsSuccess) {
                message.error(registerResp?.Message || "Đăng ký thất bại!");
                setIsBusy(false);
                return;
            }

            //  5️ Đăng ký thành công
            message.success("Tạo tài khoản thành công!");
            form.resetFields();
            navigate("/login");
            // setTimeout(() => navigate("/list-of-user-account"), 2000);
        } catch (error) {
            console.error("Lỗi khi đăng ký:", error);
            message.error("Đã xảy ra lỗi, vui lòng thử lại sau!");
        } finally {
            setIsBusy(false);
        }
    };

    return (
        <div className="register-form">
            <div className="form" >
                <div className="logo">
                    <span className="text-gradient">Sign Up</span>
                </div>
                <StandardForm form={form} onFinish={onFinish}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item<FieldType>
                                name="Username"
                                hasFeedback
                                rules={[{ required: true, message: "Please enter your Username!" }, { min: 3, max: 70 }]}>
                                <Input placeholder="Username" autoFocus />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item<FieldType>
                                name="Password"
                                hasFeedback
                                rules={[{ required: true, message: "Please enter your Password!" }, { min: 6, max: 70 }]}>
                                <Input.Password placeholder="Password" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item<FieldType>
                                name="ConfirmPassword"
                                dependencies={["Password"]}
                                hasFeedback
                                rules={[
                                    { required: true, message: "ConfirmPassword!" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue("Password") === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error("The confirmation password does not match!"));
                                        },
                                    }),
                                ]}>
                                <Input.Password placeholder="ConfirmPassword" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item<FieldType>
                                name="MaDN" rules={[{ required: true, message: 'Please input Company Code!' }]}>
                                <Input placeholder="Enter Company Code " />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item<FieldType> name="TenDN" rules={[{ required: true, message: 'Please input Company Name or similar with UserName!' }]}>
                                <Input placeholder="Enter Company Name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item<FieldType> name="DiaChi" >
                                <Input placeholder="Enter Address" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item<FieldType> name="SDT">
                                <Input placeholder="Enter Phone Number" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item<FieldType> name="Email">
                                <Input placeholder="Enter Email" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item<FieldType> name="NguoiDaiDien">
                                <Input placeholder="Enter Representative" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item<FieldType> name="Website">
                                <Input placeholder="Enter Website" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item<FieldType> name="NgayThanhLap">
                                <DatePicker style={{ width: '100%' }} placeholder="Select Establish Date" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="GhiChu">
                                <Input.TextArea rows={3} placeholder="Enter Note" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button type="primary" htmlType="submit" loading={isBusy} block>
                        Sign Up
                    </Button>
                </StandardForm>
            </div>
        </div>
    );
};

export default RegisterPage;

interface FieldType {
    Username: string;
    Password: string;
    ConfirmPassword: string;
    Role: number
    DoanhNghiepID: number
    MaDN: string
    TenDN: string
    DiaChi: string
    SDT: string
    Email: string
    NguoiDaiDien: string
    Website: string
    NgayThanhLap: string
    GhiChu: string
}
