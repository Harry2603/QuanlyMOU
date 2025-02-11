import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { App } from 'antd'
import { useCallback } from 'react'

const useConfirm = () => {
    const { modal } = App.useApp()

    const modalConfirm = useCallback(
        ({
            title = 'Xác nhận',
            content,
            onOk,
        }: {
            title?: string
            content?: string
            onOk?: () => void
        }) => {
            modal.confirm({
                title: title,
                content: content,
                centered: true,
                onOk: onOk,
                okButtonProps: {
                    icon: <CheckOutlined />,
                },
                cancelButtonProps: {
                    icon: <CloseOutlined />,
                },
                okText: 'Đồng ý',
                cancelText: 'Đóng'
            })
        },
        [modal],
    )

    return modalConfirm
}

export default useConfirm
