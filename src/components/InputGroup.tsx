import React, { useMemo } from 'react'

const InputGroup = ({ before = '', after = '', children }: PropType): React.JSX.Element => {
    const isBefore = useMemo(() => {
        return before !== ''
    }, [before])

    const isAfter = useMemo(() => {
        return after !== ''
    }, [after])

    const containerClassName = useMemo(() => {
        let className = 'iot-input-group ant-input-group-wrapper ant-input-group-wrapper-outlined'
        if (isBefore) {
            className += ' addon-text-border-radius-left-0'
        }
        if (isAfter) {
            className += ' addon-text-border-radius-right-0'
        }
        return className
    }, [isBefore, isAfter])

    const renderBefore = useMemo(() => {
        if (before === '' || before === undefined) return ''
        else return <span className='ant-input-group-addon'>{before}</span>
    }, [before])

    const renderAfter = useMemo(() => {
        if (after === '' || after === undefined) return ''
        else return <span className='ant-input-group-addon'>{after}</span>
    }, [after])

    return (
        <div className={containerClassName}>
            <div className='ant-input-wrapper ant-input-group'>
                {renderBefore}
                {children}
                {renderAfter}
            </div>
        </div>
    )
}

export default InputGroup

interface PropType {
    before?: string | ''
    after?: string | ''
    children: React.JSX.Element
}
