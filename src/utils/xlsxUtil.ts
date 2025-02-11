import * as xlsx from 'xlsx'
import { numberUtil } from '.'

const xlsxUtil = {
    read: (e: ProgressEvent<FileReader>): ReadXLSXType[] => {
        const data = e.target?.result
        const workbook = xlsx.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        const result: ReadXLSXType[] = []
        const jsonArray = xlsx.utils.sheet_to_json<ReadXLSXType>(worksheet)
        jsonArray.forEach(item => {
            const newItem: ReadXLSXType = {}
            let rowNumber: number = 1
            for (const [, value] of Object.entries(item)) {
                const letter: string = numberUtil.toAlphabet(rowNumber)
                newItem[letter] = value
                rowNumber += 1
            }
            result.push(newItem)
        })

        return result
    }
}

export default xlsxUtil

export interface ReadXLSXType {
    // eslint-disable-next-line
    [key: string]: any
}
