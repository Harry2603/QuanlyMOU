import { QuestionOutlined } from '@ant-design/icons'
import React, { memo, useMemo } from 'react'

const RowAction = ({
    onClick,
    icon = <QuestionOutlined />,
    title = 'Tiêu đề',
    type = 'primary',
}: PropType): React.JSX.Element => {
    const className = useMemo(() => {
        return `cursor-pointer text-${type}`
    }, [type])

    return (
        <div className={className} onClick={onClick}>
            {icon} {title}
        </div>
    )
}

export default memo(
    RowAction,
    (prev, next) => prev.icon === next.icon && prev.title === next.title && prev.type === next.type,
)

interface PropType {
    onClick?: () => void
    icon?: React.JSX.Element
    title?: string
    type?: 'primary' | 'success' | 'warning' | 'danger'
}
