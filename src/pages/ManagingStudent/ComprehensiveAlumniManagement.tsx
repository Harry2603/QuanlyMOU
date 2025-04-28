import React, { useState } from 'react'
import StandardUploadFile from '../../components/StandardUploadFile'
import { Button, Form } from 'antd'



const ComprehensiveAlumniManagement: React.FC = () => {
    const [fileNames, setFileNames] = useState<{ [key: string]: string | null }>({
        FileDangKyDuThiName: null,
        FileMoTaName: null,
        FileToanVanName: null,
        FileMoHinhName: null,
        FileKhacName: null,
    })

    const [form] = Form.useForm()

    const handleFileUpload = (keyUrl: string, keyName: string, resp: UploadResult) => {
        form.setFieldsValue({
            [keyUrl]: resp.Result?.FullUrl,
            [keyName]: resp.Result?.FileName,
        })
        setFileNames(prev => ({
            ...prev,
            [keyName]: resp.Result?.FileName || null,
        }))
    }

    return <div>
        <StandardUploadFile
            isUseSpin
            onStart={() => {
                console.log('onStart')
            }}
            onCompleted={resp => {
                handleFileUpload(
                    'FileDangKyDuThiUrl',
                    'FileDangKyDuThiName',
                    resp,
                )
                // form.setFieldsValue({
                //     FileDangKyDuThiID: resp.Result?.FullUrl,
                //     FileDangKyDuThiName: resp.Result?.FileName,
                // })
                console.log('resp', resp)
            }}>
            <Button>Upload</Button>
        </StandardUploadFile>
    </div>
}

export default ComprehensiveAlumniManagement
