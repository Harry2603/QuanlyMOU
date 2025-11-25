import { App, Form, FormProps, Input } from 'antd'
import React, { useState } from 'react'
import { StandardForm, StandardModal } from '../..'
import { apiUtil } from '../../../utils'
// import { userService } from '../../../services'
// import { UserChangePasswordParamType } from '../../../services/userService'

const ModalChangePassword: React.FC<PropType> = ({ isShow, setIsShow }) => {
    const { message } = App.useApp()

    const [form] = Form.useForm<FieldType>()

    const [isBusy, setIsBusy] = useState(false)

    // const onSave: FormProps<FieldType>['onFinish'] = async formData => {
    //     setIsBusy(true);

    //     const param = {
    //         CurrentPassword: formData.CurrentPassword,
    //         NewPassword: formData.NewPassword,
    //     };

    //     try {
    //         const resp = await apiUtil.changePasswordAsync(param);

    //         if (!resp.IsSuccess) {
    //             message.error(resp.Message || 'Đổi mật khẩu thất bại!');
    //             return;
    //         }

    //         message.success('Đổi mật khẩu thành công!');
    //         setIsShow(false);
    //     } catch (err) {
    //         message.error('Lỗi kết nối máy chủ!');
    //     } finally {
    //         setIsBusy(false);
    //     }
    // };
    const onSave: FormProps<FieldType>['onFinish'] = formData => {
        setIsBusy(true)
        const { CurrentPassword, NewPassword } = formData
        apiUtil.user
            .changePasswordAsync(CurrentPassword, NewPassword)
            .then(resp => {
                if (!resp.IsSuccess) return
                const result = resp.Result
                if (result === null) return
                localStorage.setItem('userInfo', JSON.stringify(result))
            })
            .finally(() => {
                setIsBusy(false)
            })
    }

    return (
        <StandardModal
            title='Thay đổi mật khẩu'
            isShow={isShow}
            isBusy={isBusy}
            onCancel={() => setIsShow(false)}
            onOk={() => form.submit()}
            afterClose={() => form.resetFields()}>
            <StandardForm form={form} onFinish={onSave}>
                <Form.Item<FieldType>
                    label='Mật khẩu hiện tại'
                    name='CurrentPassword'
                    rules={[{ required: true }, { min: 3 }]}
                    initialValue=''>
                    <Input.Password maxLength={70} />
                </Form.Item>
                <Form.Item<FieldType>
                    label='Mật khẩu mới'
                    name='NewPassword'
                    rules={[{ required: true }, { min: 3 }]}
                    initialValue=''>
                    <Input.Password maxLength={70} />
                </Form.Item>
                <Form.Item<FieldType>
                    label='Nhập lại mật khẩu mới'
                    name='NewPasswordConfirm'
                    rules={[
                        { required: true },
                        { min: 3 },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('NewPassword') === value) {
                                    return Promise.resolve()
                                }
                                return Promise.reject(new Error('Không chính xác'))
                            },
                        }),
                    ]}
                    initialValue=''>
                    <Input.Password maxLength={70} />
                </Form.Item>
            </StandardForm>
        </StandardModal>
    )
}

export default ModalChangePassword

interface PropType {
    isShow: boolean
    setIsShow: (isShow: React.SetStateAction<boolean>) => void
}

interface FieldType {
    CurrentPassword: string
    NewPassword: string
    NewPasswordConfirm: string
}
