import type { FormProps } from 'antd'
import { Form } from 'antd'
import React from 'react'

const StandardForm = ({
    layout = 'vertical',
    autoComplete = 'off',
    labelAlign = 'left',
    size = 'middle',
    disabled,
    className,
    children,
    ...props
}: PropType): React.JSX.Element => {
    return (
        <Form
            layout={layout}
            autoComplete={autoComplete}
            labelAlign={labelAlign}
            size={size}
            disabled={disabled}
            className={className}
            {...props}
            validateMessages={{
                required: 'Bắt buộc nhập',
                string: {
                    len: 'Yêu cầu ${len} ký tự',
                    min: 'Tối thiểu ${min} ký tự',
                    max: 'Tối đa ${max} ký tự',
                    range: 'Trong khoảng ${min}-${max} ký tự',
                },
                number: {
                    len: 'Bắt buộc bằng ${len}',
                    min: 'Tối thiểu ${min}',
                    max: 'Tối đa ${max}',
                    range: 'Trong khoảng ${min}-${max}',
                },
                types: {
                    email: 'Email không hợp lệ',
                },
            }}>
            {children}
        </Form>
    )
}

export default StandardForm

interface PropType extends Omit<FormProps, 'validateMessages'> {
    children?: React.JSX.Element | Array<React.JSX.Element>
}
