import React, { useEffect, useState } from "react";
import { Button, Form, Input, message, Select } from "antd";
import { StandardForm } from "../../components";
import { useNavigate } from "react-router-dom";
import { apiUtil } from "../../utils";
import "./style.css";

const RegisterPage: React.FC = () => {
    const [isBusy, setIsBusy] = useState(false);
    const [doanhNghiepList, setDoanhNghiepList] = useState<DoanhNghiepType[]>([])
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const token = localStorage.getItem("access_token"); // Kiểm tra quyền admin

    const roleList = [
        {
            label: 'Admin',
            value: 1
        },
        {
            label: 'Employee',
            value: 2
        },
        {
            label: 'Customer',
            value: 3
        },
        {
            label: 'President',
            value: 4
        }
    ]

    // ✅ Kiểm tra quyền Admin
    useEffect(() => {

        // const checkAdminRole = async () => {
        //     if (!token) {
        //         message.error("Bạn không có quyền truy cập!");
        //         navigate("/"); // Chuyển hướng về trang chính
        //         return;
        //     }

        //     const resp = await apiUtil.auth.queryAsync("GetUserRole", { token });
        //     if (!resp?.IsSuccess || resp.Result !== "Admin") {
        //         message.error("Bạn không có quyền tạo tài khoản!");
        //         navigate("/");
        //     }
        // };

        // checkAdminRole();
    }, [token, navigate]);

    const onLoadDoanhNghiep = async () => {
        await apiUtil.auth.queryAsync<DoanhNghiepType[]>('DoanhNghiep_Select')
            .then(resp => {
                setDoanhNghiepList(
                    resp.Result?.map(item => ({
                        ...item,
                        label: item.TenDN,
                        value: item.DoanhNghiepID,
                    })) || []
                );
            })
            .catch((error) => {
                console.error("Error loading doanh nghiep list:", error);
            });
    };


    useEffect(() => {
        onLoadDoanhNghiep()
    }, [])

    const onFinish = async (formData: FieldType) => {
        setIsBusy(true);
        const { Username, Password, Role, DoanhNghiepID } = formData;

        try {
            //  1️ Kiểm tra Username đã tồn tại chưa
            // const checkResp = await apiUtil.auth.queryAsync("CheckUsernameExists", { Username });
            // if (checkResp?.IsSuccess && checkResp.Result) {
            //     message.error("Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!");
            //     setIsBusy(false);
            //     return;
            // }

            // 2️ Gọi API để mã hóa mật khẩu
            const passwordResp = await apiUtil.user.generatePasswordAsync(Password);
            console.log("call success", passwordResp.Result);
            if (!passwordResp?.IsSuccess || !passwordResp.Result) {
                message.error(passwordResp?.Message || "Mã hóa mật khẩu thất bại!");
                setIsBusy(false);
                return;
            }

            const passHash = passwordResp.Result as any
            console.log("pass", passHash.PasswordHash);
            //  3️⃣ Định nghĩa RoleId cho UsepasswordResp.Resultr
            console.log("ủe name", Username);
            //  4️ Gửi request đăng ký tài khoản
            const registerResp = await apiUtil.auth.queryAsync("CoreUsers_Insert", {
                UserName: Username,
                PasswordHash: passHash.PasswordHash,
                FullName: Username,
                Salt: passHash.Salt,
                RoleId: Role,
                DoanhNghiepID: DoanhNghiepID
            });
            console.log("ín succ", registerResp);

            if (!registerResp?.IsSuccess) {
                message.error(registerResp?.Message || "Đăng ký thất bại!");
                setIsBusy(false);
                return;
            }

            //  5️ Đăng ký thành công
            message.success("Tạo tài khoản thành công!");
            form.resetFields();
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
            <div className="form">
                <div className="logo">
                    <span className="text-gradient">Tạo Tài Khoản</span>
                </div>
                <StandardForm form={form} onFinish={onFinish}>
                    <Form.Item<FieldType>
                        name="Username"
                        hasFeedback
                        rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }, { min: 3, max: 70 }]}>
                        <Input placeholder="Tên đăng nhập" autoFocus />
                    </Form.Item>
                    <Form.Item<FieldType>
                        name="Password"
                        hasFeedback
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }, { min: 6, max: 70 }]}>
                        <Input.Password placeholder="Mật khẩu" />
                    </Form.Item>
                    <Form.Item<FieldType>
                        name="ConfirmPassword"
                        dependencies={["Password"]}
                        hasFeedback
                        rules={[
                            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("Password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                                },
                            }),
                        ]}>
                        <Input.Password placeholder="Xác nhận mật khẩu" />
                    </Form.Item>

                    <Form.Item<FieldType>
                        name="Role"
                        hasFeedback
                        rules={[
                            { required: true, message: "Vui lòng chon quyen!" },
                        ]}>
                        <Select
                            options={roleList}
                        />
                    </Form.Item>

                    <Form.Item<FieldType>
                        name="DoanhNghiepID"
                        hasFeedback
                    >
                        <Select
                            options={doanhNghiepList}
                        />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" loading={isBusy} block>
                        Tạo tài khoản
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
}
