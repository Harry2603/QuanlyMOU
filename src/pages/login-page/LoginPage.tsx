import type { FormProps } from 'antd'
import { Button, Form, Input } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { StandardForm } from '../../components'
import { useAppState } from '../../hooks'
import { apiUtil } from '../../utils'
import { UserInfoType } from './../../utils/apiUtil'
import './style.css'

const LoginPage = (): React.JSX.Element => {
    const [setIsLogin, setUsername] = useAppState(useShallow(s => [s.setIsLogin, s.setUsername]))

    const navigate = useNavigate()

    const [isBusy, setIsBusy] = useState(false)

    const [form] = Form.useForm()

    useEffect(() => {
        const strUserInfo = localStorage.getItem('userInfo')
        if (strUserInfo === null) return
        const userInfo: UserInfoType = JSON.parse(strUserInfo)
        setIsBusy(true)
        apiUtil.user
            .refreshTokenAsync(userInfo.RefreshToken)
            .then(resp => {
                if (!resp.IsSuccess) return
                const newUserInfo = resp.Result
                if (newUserInfo === null) return
                if (newUserInfo == null) return
                const str = JSON.stringify(newUserInfo)
                localStorage.setItem('userInfo', str)
                apiUtil.setToken(newUserInfo.AccessToken)
                setIsLogin(true)
                setUsername(newUserInfo.UserName)
                navigate('/Managing-MOU')
            })
            .finally(() => {
                setIsBusy(false)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onKeyDown = useCallback((key: string) => {
        if (key === 'Enter') {
            form.submit()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onFinish: FormProps<FieldType>['onFinish'] = formData => {
        setIsBusy(true)
        const { Username, Password } = formData
        apiUtil.user
            .loginAsync(Username, Password)
            .then(resp => {
                if (!resp.IsSuccess) return
                const result = resp.Result
                if (result === null) return
                localStorage.setItem('userInfo', JSON.stringify(result))
                apiUtil.setToken(result.AccessToken)
                setIsLogin(true)
                setUsername(result.UserName)
                navigate('/Managing-MOU')
            })
            .finally(() => {
                setIsBusy(false)
            })
    }

    return (
        <div className='login-form'>
            <div className='form'>
                <div className='logo'>
                    {/* <img alt='logo' src='/assets/imgs/logo.svg' /> */}
                    <span className='text-gradient'>Đăng Nhập</span>
                </div>
                <StandardForm form={form} onFinish={onFinish}>
                    <Form.Item<FieldType>
                        name='Username'
                        hasFeedback
                        rules={[{ required: true }, { min: 3 }, { max: 70 }]}
                        initialValue=''>
                        <Input
                            placeholder='Tên đăng nhập'
                            autoFocus
                            readOnly={isBusy}
                            onKeyDown={e => onKeyDown(e.key)}
                        />
                    </Form.Item>
                    <Form.Item<FieldType>
                        name='Password'
                        hasFeedback
                        rules={[{ required: true }, { min: 6 }, { max: 70 }]}
                        initialValue=''>
                        <Input
                            type='password'
                            placeholder='Mật khẩu'
                            readOnly={isBusy}
                            onKeyDown={e => onKeyDown(e.key)}
                        />
                    </Form.Item>
                </StandardForm>
                <Button type='primary' htmlType='submit' loading={isBusy} onClick={() => form.submit()}>
                    Đăng nhập
                </Button>
            </div>
        </div>
    )
}

export default LoginPage

interface FieldType {
    Username: string
    Password: string
}