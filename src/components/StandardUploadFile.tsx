import { LoadingOutlined } from '@ant-design/icons'
import { Upload } from 'antd'
import { RcFile } from 'antd/es/upload'
import React, { useState } from 'react'
import { ResponseType, UploadFileResponseType } from '../types'
import { apiUtil } from '../utils'

const StandardUploadFile = ({
    children,
    onStart,
    onCompleted,
    isUseSpin,
}: // isPdf,
// isDocx,
// isZip,
// isXlsx,
PropType): React.JSX.Element => {
    // const { message } = App.useApp()

    const [isBusy, setIsBusy] = useState(false)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const beforeUpload = useCallback(
    //     (file: RcFile) => {
    //         let isValid = false
    //         const exts = []
    //         if (isPdf) {
    //             exts.push('pdf')
    //             isValid = file.type === 'application/pdf'
    //         }
    //         if (isDocx) {
    //             exts.push('docx')
    //             isValid =
    //                 file.type ===
    //                 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    //         }
    //         if (isZip) {
    //             exts.push('zip')
    //             isValid = file.type === 'application/x-zip-compressed'
    //         }
    //         if (isXlsx) {
    //             exts.push('xlsx')
    //             isValid =
    //                 file.type ===
    //                 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    //         }
    //         if (!isValid) {
    //             const str = exts.map(ext => ext).join(' ')
    //             message.info(`Please choose a ${str} file`)
    //             return false
    //         }
    //         const isLt2M = file.size / 1024 / 1024 < 10
    //         if (!isLt2M) {
    //             message.info('Please choose a file smaller than 10MB')
    //             return false
    //         }
    //         return isValid && isLt2M
    //     },
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    //     [isDocx, isPdf, isXlsx, isZip],
    // )

    return (
        <Upload
            disabled={isBusy}
            showUploadList={false}
            // beforeUpload={beforeUpload}
            customRequest={options => {
                const { file } = options
                const filename = (options.file as RcFile).name
                setIsBusy(true)
                onStart && onStart()
                apiUtil.auth
                    .uploadFileAsync(file)
                    .then(resp => {
                        const result = resp.Result!
                        result.FileName = filename ?? ''
                        onCompleted && onCompleted(resp)
                    })
                    .finally(() => setIsBusy(false))
            }}>
            {isBusy && isUseSpin ? <LoadingOutlined /> : children}
        </Upload>
    )
}

export default StandardUploadFile

interface PropType {
    children?: React.JSX.Element
    onStart?: () => void
    onCompleted?: (resp: ResponseType<UploadFileResponseType>) => void
    isUseSpin?: boolean
    isPdf?: boolean
    isDocx?: boolean
    isZip?: boolean
    isXlsx?: boolean
}
