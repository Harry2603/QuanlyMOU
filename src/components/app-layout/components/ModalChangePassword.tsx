import { App, Form, FormProps, Input } from 'antd'
import React, { useState } from 'react'
import { StandardForm, StandardModal } from '../..'
// import { userService } from '../../../services'
// import { UserChangePasswordParamType } from '../../../services/userService'

const ModalChangePassword: React.FC<PropType> = ({ isShow, setIsShow }) => {
    const { message } = App.useApp()

    const [form] = Form.useForm<FieldType>()

    const [isBusy, setIsBusy] = useState(false)

    const onSave: FormProps<FieldType>['onFinish'] = formData => {
        // console.log(formData)
        message.info('Under development')
        setIsBusy(true)
        setTimeout(() => {
            setIsBusy(false)
        }, 1000)
        // setIsBusy(true)
        // const param: UserChangePasswordParamType = {
        //     CurrentPassword: formData.CurrentPassword,
        //     NewPassword: formData.NewPassword,
        // }
        // userService
        //     .changePasswordAsync(param)
        //     .then(resp => {
        //         if (!resp.IsSuccess) return
        //         message.success('Thành công')
        //         setIsShow(false)
        //     })
        //     .finally(() => setIsBusy(false))
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
