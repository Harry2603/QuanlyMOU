/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DATE_FORMAT_VIEW: string
    readonly VITE_DATE_FORMAT_API: string
    readonly VITE_MAX_EXCEL_FILE_SIZE: number
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}