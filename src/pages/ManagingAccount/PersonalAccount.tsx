import { Input, Button, Form, Input as AntInput, DatePicker, Row, Col, Modal } from 'antd';
import React, { useState, useEffect } from 'react';
import { apiUtil } from '../../utils';
import { StandardForm } from "../../components";
import dayjs, { Dayjs } from 'dayjs';



const PersonalAccount: React.FC = () => {
    const [form] = Form.useForm<FieldType>()


    const getUserInfo = (): any | null => {
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

    const getInfor = async () => {
        try {
            const res = await apiUtil.auth.queryAsync('CoreUsers_Select', {}) as any;
            // console.log('res = ', res);

            // Lấy đúng object trong Result
            const data = res?.Result?.[0];

            if (!data) return;

            form.setFieldsValue({
                Username: data.UserName,
                MaDN: data.MaDN,
                TenDN: data.TenDN,
                DiaChi: data.DiaChi,
                SDT: data.SDT,
                Email: data.Email,
                NguoiDaiDien: data.NguoiDaiDien,
                Website: data.Website,
                NgayThanhLap: data.NgayThanhLap ? dayjs(data.NgayThanhLap) : null,
                GhiChu: data.GhiChu,
            });
        } catch (error) {
            console.error('getInfor error: ', error);
        }
    };
    const updateInfor = async (values: FieldType) => {
        const payload = {
            UserName: values.Username,
            MaDN: values.MaDN,
            TenDN: values.TenDN,
            DiaChi: values.DiaChi,
            SDT: values.SDT,
            Email: values.Email,
            NguoiDaiDien: values.NguoiDaiDien,
            Website: values.Website,
            NgayThanhLap: values.NgayThanhLap
                ? values.NgayThanhLap.format("YYYY-MM-DD")
                : null,
            GhiChu: values.GhiChu
        };

        // console.log("Payload Update:", payload);

        const res = await apiUtil.auth.executeAsync(
            "CoreUsers_Update",
            payload
        );

        if (!res?.IsSuccess) {
            console.error("Update failed:", res?.Message);
            return;
        }
        Modal.success({
            title: "Update Successful!",
            content: `Update information for user "${values.Username}" successfully!`,
            okButtonProps: { style: { display: "none" } } // Ẩn nút OK
        });
        setTimeout(() => {
            Modal.destroyAll();
        }, 1000);
        // console.log("Cập nhật thành công!");

    };

    useEffect(() => {
        getUserInfo();
        getInfor();
    }, []);
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 32px',
                background: '#f5f5f5',
                minHeight: 'calc(100vh - 65px)', // trừ header nếu cần
            }}
        >
            <p
                style={{
                    fontSize: '1.4rem',
                    fontWeight: 600,
                    marginBottom: 16,
                    textAlign: 'center',
                }}
            >
                Personal Account
            </p>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: 8,
                }}
            >
                {/* Khung trắng của form */}
                <div
                    style={{
                        width: '100%',
                        maxWidth: 900,
                        background: '#ffffff',
                        padding: '24px 32px',
                        borderRadius: 8,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                >
                    <StandardForm form={form} onFinish={updateInfor}>
                        {/* Hàng 1 */}
                        <Row gutter={[24, 16]}>
                            <Col span={12}>
                                <Form.Item<FieldType>
                                    label="User Name"
                                    name="Username"
                                    // hasFeedback
                                    rules={[
                                        { required: true, message: 'Please enter your Username!' },
                                        { min: 3, max: 70 },
                                    ]}
                                >
                                    <Input placeholder="Username" autoFocus />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item<FieldType>
                                    label="Company Code"
                                    name="MaDN"
                                    rules={[
                                        { required: true, message: 'Please input Company Code!' },
                                    ]}
                                >
                                    <Input placeholder="Enter Company Code" />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Hàng 2 */}
                        <Row gutter={[24, 16]}>
                            <Col span={12}>
                                <Form.Item<FieldType>
                                    label="The Name Of Company"
                                    name="TenDN"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Please input Company Name or similar with UserName!',
                                        },
                                    ]}
                                >
                                    <Input placeholder="Enter Company Name" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item<FieldType>
                                    label="Adress"
                                    name="DiaChi">
                                    <Input placeholder="Enter Address" />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Hàng 3 */}
                        <Row gutter={[24, 16]}>
                            <Col span={12}>
                                <Form.Item<FieldType>
                                    label="Phone Number"
                                    name="SDT">
                                    <Input placeholder="Enter Phone Number" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item<FieldType>
                                    label="Email"
                                    name="Email">
                                    <Input placeholder="Enter Email" />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Hàng 4 */}
                        <Row gutter={[24, 16]}>
                            <Col span={12}>
                                <Form.Item<FieldType>
                                    label="Representative"
                                    name="NguoiDaiDien">
                                    <Input placeholder="Enter Representative" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item<FieldType>
                                    label="Website"
                                    name="Website">
                                    <Input placeholder="Enter Website" />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Hàng 5 */}
                        <Row gutter={[24, 16]}>
                            <Col span={12}>
                                <Form.Item<FieldType>
                                    label="Founding date"
                                    name="NgayThanhLap">
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        placeholder="Select Establish Date"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Note"
                                    name="GhiChu">
                                    <Input.TextArea rows={3} placeholder="Enter Note" />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Hàng nút Save */}
                        <Row justify="end">
                            <Col>
                                <Button type="primary" htmlType="submit">
                                    Update
                                </Button>
                            </Col>
                        </Row>
                    </StandardForm>
                </div>
            </div>
        </div>
    );

};
export default PersonalAccount;

interface FieldType {
    Username: string;
    Password: string;
    ConfirmPassword: string;
    Role: number
    DoanhNghiepID: number
    MaDN: string
    TenDN: string
    DiaChi: string
    SDT: number
    Email: string
    NguoiDaiDien: string
    Website: string
    NgayThanhLap: Dayjs | null
    GhiChu: string
}