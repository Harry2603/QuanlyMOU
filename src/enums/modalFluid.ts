import { ModalProps } from 'antd'

const modalFluid: ModalProps['styles'] = {
    body: {
        padding: 0,
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 300px)',
    },
    content: {
        padding: 0,
    },
    header: {
        paddingTop: 20,
        paddingLeft: 24,
        paddingRight: 24,
    },
    footer: {
        paddingBottom: 20,
        paddingLeft: 24,
        paddingRight: 24,
    },
}

export default modalFluid
