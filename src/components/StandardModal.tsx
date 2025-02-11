import { CloseOutlined, SaveOutlined } from '@ant-design/icons'
import { Button, Modal, ModalProps } from 'antd'
import React from 'react'

const StandardModal = ({
    title = 'Tiêu đề',
    isShow,
    onCancel,
    cancelIcon = <CloseOutlined />,
    cancelText = 'Đóng',
    onOk,
    okIcon = <SaveOutlined />,
    okText = 'Lưu',
    isBusy,
    width = 520,
    isHideCancel = false,
    isHideOk = false,
    rightButtons = [],
    children,
    ...props
}: PropType): React.JSX.Element => {
    return (
        <Modal
            title={title}
            footer={[
                ...rightButtons,
                !isHideCancel && (
                    <Button
                        type='default'
                        key='back'
                        onClick={onCancel}
                        icon={cancelIcon}
                        tabIndex={-1}
                        className='min-w-100px'>
                        {cancelText}
                    </Button>
                ),
                !isHideOk && (
                    <Button
                        type='primary'
                        key='submit'
                        onClick={onOk}
                        icon={okIcon}
                        loading={isBusy}
                        className='min-w-100px'>
                        {okText}
                    </Button>
                ),
            ]}
            onCancel={onCancel}
            width={width}
            {...props}
            open={isShow}
            destroyOnClose
            maskClosable={false}>
            {children}
        </Modal>
    )
}

export default StandardModal

interface PropType extends Omit<ModalProps, 'open' | 'maskClosable' | 'footer'> {
    isShow?: boolean
    cancelIcon?: React.JSX.Element
    okIcon?: React.JSX.Element
    isBusy?: boolean
    isHideCancel?: boolean
    isHideOk?: boolean
    rightButtons?: Array<React.JSX.Element>
}
