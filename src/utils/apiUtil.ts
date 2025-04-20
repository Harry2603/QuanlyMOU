import axios, { AxiosError } from 'axios'
import { message } from 'antd'
import { RcFile } from 'antd/es/upload'

const getAccessToken = () => {
    const strUserInfo = localStorage.getItem('userInfo')
    if (strUserInfo === null) return ''
    const userInfo: UserInfoType = JSON.parse(strUserInfo)
    return userInfo.AccessToken
}

const axiosInstance = axios.create({
    baseURL: window.__API_URL,
    timeout: 10_000,
    headers: {
        Authorization: `Bearer ${getAccessToken()}`,
    },
})
const executeRequestAsync = async <T>(
    url: string,
    // eslint-disable-next-line
    param: any | null,
    isPost: boolean,
): Promise<ResponseType<T>> => {
    if (isPost) {
        try {
            const newParam = param.param === null ? {} : param
            const resp = await axiosInstance.post<ResponseType<T>>(url, newParam)
            const data = resp.data
            if (data.IsSuccess === false) {
                if (data.Message !== '') {
                    message.error(data.Message)
                }
            }
            return data
        } catch (error) {
            const axiosError = error as AxiosError<ResponseType<T>>
            if (axiosError.response?.status === 401) {
                localStorage.removeItem('userInfo')
                document.location.reload()
                return {
                    IsSuccess: false,
                    Message: '',
                    Result: null,
                }
            }
            const msg = axiosError.response?.data.Message ?? ''
            if (msg !== '') {
                message.error(msg)
            }
            return {
                IsSuccess: false,
                Message: msg,
                Result: null,
            }
        }
    } else {
        try {
            const resp = await axiosInstance.get<ResponseType<T>>(url)
            const data = resp.data
            if (data.IsSuccess === false) {
                if (data.Message !== '') {
                    message.error(data.Message)
                }
            }
            return data
        } catch (error) {
            const axiosError = error as AxiosError<ResponseType<T>>
            if (axiosError.response?.status === 401) {
                localStorage.removeItem('userInfo')
                document.location.reload()
                return {
                    IsSuccess: false,
                    Message: '',
                    Result: null,
                }
            }
            const msg = axiosError.response?.data.Message ?? ''
            if (msg !== '') {
                message.error(msg)
            }
            return {
                IsSuccess: false,
                Message: msg,
                Result: null,
            }
        }
    }
}

const apiUtil = {
    auth: {
        queryAsync: async <T>(
            apiName: string,
            param: unknown | null = null,
            isPost: boolean = !0,
        ): Promise<ResponseType<T>> => {
            const resp = await executeRequestAsync<T>(
                `/auth/query/${apiName}`,
                {
                    param: param,
                },
                isPost,
            )
            return resp
        },
        querySingleAsync: async <T>(
            apiName: string,
            param: unknown | null = null,
            isPost: boolean = !0,
        ): Promise<ResponseType<T>> => {
            const resp = await executeRequestAsync<T>(
                `/auth/query-single/${apiName}`,
                {
                    param: param,
                },
                isPost,
            )
            return resp
        },
        executeAsync: async <T>(
            apiName: string,
            param: unknown | null = null,
            isPost: boolean = !0,
        ): Promise<ResponseType<T>> => {
            const resp = await executeRequestAsync<T>(
                `/auth/execute/${apiName}`,
                {
                    param: param,
                },
                isPost,
            )
            return resp
        },
        executeScalarAsync: async <T>(
            apiName: string,
            param: unknown | null = null,
            isPost: boolean = !0,
        ): Promise<ResponseType<T>> => {
            const resp = await executeRequestAsync<T>(
                `/auth/execute-scalar/${apiName}`,
                {
                    param: param,
                },
                isPost,
            )
            return resp
        },
        executeReaderAsync: async <T>(
            apiName: string,
            param: unknown | null = null,
            isPost: boolean = !0,
        ): Promise<ResponseType<T>> => {
            const resp = await executeRequestAsync<T>(
                `/auth/execute-reader/${apiName}`,
                {
                    param: param,
                },
                isPost,
            )
            return resp
        },
        executeReaderSingleAsync: async <T>(
            apiName: string,
            param: unknown | null = null,
            isPost: boolean = !0,
        ): Promise<ResponseType<T>> => {
            const resp = await executeRequestAsync<T>(
                `/auth/execute-reader-single/${apiName}`,
                {
                    param: param,
                },
                isPost,
            )
            return resp
        },
        queryMultipleAsync: async <T>(
            apiName: string,
            param: QueryMultipleParamType,
            isPost: boolean = !0,
        ): Promise<ResponseType<T>> => {
            const resp = await executeRequestAsync<T>(`/auth/query-multiple/${apiName}`, param, isPost)
            return resp
        },
        uploadImageAsync: async (file: string | Blob | RcFile): Promise<ResponseType<UploadImageResponseType>> => {
            const accessToken: string = getAccessToken()
            const fmData = new FormData()
            fmData.append('file', file)
            const fileInstance = axios.create({
                baseURL: window.__FILE_URL,
                timeout: 10_000,
                headers: { Authorization: `Bearer ${accessToken}` },
            })
            try {
                const resp = await fileInstance.post<ResponseType<UploadImageResponseType>>(
                    '/file-storage/upload-image',
                    fmData,
                )
                const data = resp.data
                if (data.IsSuccess === false) {
                    if (data.Message !== '') {
                        message.error(data.Message)
                    }
                }
                return data
            } catch (error) {
                const axiosError = error as AxiosError<ResponseType<UploadImageResponseType>>
                const msg = axiosError.response?.data.Message ?? ''
                if (msg !== '') {
                    message.error(msg)
                }
                return {
                    IsSuccess: false,
                    Message: msg,
                    Result: null,
                }
            }
        },
        uploadFileAsync: async (file: string | Blob | RcFile): Promise<ResponseType<UploadFileResponseType>> => {
            const accessToken: string = getAccessToken()
            const fmData = new FormData()
            fmData.append('file', file)
            const fileInstance = axios.create({
                baseURL: window.__FILE_URL,
                timeout: 10_000,
                headers: { Authorization: `Bearer ${accessToken}` },
            })
            try {
                const resp = await fileInstance.post<ResponseType<UploadFileResponseType>>(
                    '/file-storage/upload-file',
                    fmData,
                )
                const data = resp.data
                if (data.IsSuccess === false) {
                    if (data.Message !== '') {
                        message.error(data.Message)
                    }
                }
                return data
            } catch (error) {
                const axiosError = error as AxiosError<ResponseType<UploadFileResponseType>>
                const msg = axiosError.response?.data.Message ?? ''
                if (msg !== '') {
                    message.error(msg)
                }
                return {
                    IsSuccess: false,
                    Message: msg,
                    Result: null,
                }
            }
        },
    },
    any: {
        queryAsync: async <T>(
            apiName: string,
            param: unknown | null = null,
            isPost: boolean = !0,
        ): Promise<ResponseType<T>> => {
            const resp = await executeRequestAsync<T>(
                `/any/query/${apiName}`,
                {
                    param: param,
                },
                isPost,
            )
            return resp
        },
        querySingleAsync: async <T>(
            apiName: string,
            param: unknown | null = null,
            isPost: boolean = !0,
        ): Promise<ResponseType<T>> => {
            const resp = await executeRequestAsync<T>(
                `/any/query-single/${apiName}`,
                {
                    param: param,
                },
                isPost,
            )
            return resp
        },
        executeAsync: async <T>(
            apiName: string,
            param: unknown | null = null,
            isPost: boolean = !0,
        ): Promise<ResponseType<T>> => {
            const resp = await executeRequestAsync<T>(
                `/any/execute/${apiName}`,
                {
                    param: param,
                },
                isPost,
            )
            return resp
        },
        executeScalarAsync: async <T>(
            apiName: string,
            param: unknown | null = null,
            isPost: boolean = !0,
        ): Promise<ResponseType<T>> => {
            const resp = await executeRequestAsync<T>(
                `/any/execute-scalar/${apiName}`,
                {
                    param: param,
                },
                isPost,
            )
            return resp
        },
        executeReaderAsync: async <T>(
            apiName: string,
            param: unknown | null = null,
            isPost: boolean = !0,
        ): Promise<ResponseType<T>> => {
            const resp = await executeRequestAsync<T>(
                `/any/execute-reader/${apiName}`,
                {
                    param: param,
                },
                isPost,
            )
            return resp
        },
        executeReaderSingleAsync: async <T>(
            apiName: string,
            param: unknown | null = null,
            isPost: boolean = !0,
        ): Promise<ResponseType<T>> => {
            const resp = await executeRequestAsync<T>(
                `/any/execute-reader-single/${apiName}`,
                {
                    param: param,
                },
                isPost,
            )
            return resp
        },
        queryMultipleAsync: async <T>(
            apiName: string,
            param: QueryMultipleParamType,
            isPost: boolean = !0,
        ): Promise<ResponseType<T>> => {
            const resp = await executeRequestAsync<T>(`/any/query-multiple/${apiName}`, param, isPost)
            return resp
        },
    },
    user: {
        loginAsync: async (userName: string, password: string): Promise<ResponseType<UserInfoType>> => {
            const url = '/user/login'
            const resp = await axiosInstance.post<ResponseType<UserInfoType>>(url, {
                UserName: userName,
                Password: password,
            })
            const data = resp.data
            if (data.IsSuccess === false) {
                if (data.Message !== '') {
                    message.error(data.Message)
                }
            }
            return data
        },
        refreshTokenAsync: async (refreshToken: string): Promise<ResponseType<UserInfoType>> => {
            const url = '/user/refresh-token'
            const resp = await axiosInstance.post(url, {
                RefreshToken: refreshToken,
            })
            const data = resp.data
            if (data.IsSuccess === false) {
                if (data.Message !== '') {
                    message.error(data.Message)
                }
            }
            return data
        },
        revokeAsync: async (): Promise<ResponseType<null>> => {
            const url = '/user/refresh-token/revoke'
            const resp = await axiosInstance.post(url)
            const data = resp.data
            if (data.IsSuccess === false) {
                if (data.Message !== '') {
                    message.error(data.Message)
                }
            }
            return data
        },
        changePasswordAsync: async (currentPassword: string, newPassword: string): Promise<ResponseType<null>> => {
            const url = '/user/change-password'
            const resp = await axiosInstance.put(url, {
                CurrentPassword: currentPassword,
                NewPassword: newPassword,
            })
            const data = resp.data
            if (data.IsSuccess === false) {
                if (data.Message !== '') {
                    message.error(data.Message)
                }
            }
            return data
        },
        generatePasswordAsync: async (password: string): Promise<ResponseType<null>> => {
            const url = '/user/generate-password'
            const resp = await axiosInstance.post(url, {
                Password: password,
            })
            const data = resp.data
            if (data.IsSuccess === false) {
                if (data.Message !== '') {
                    message.error(data.Message)
                }
            }
            return data
        },
        logOutAsync: async (refreshToken: string): Promise<ResponseType<null>> => {
            const url = '/user/logout'
            const resp = await axiosInstance.post(url, {
                RefreshToken: refreshToken,
            })
            const data = resp.data
            if (data.IsSuccess === false) {
                if (data.Message !== '') {
                    message.error(data.Message)
                }
            }
            return data
        },
    },
    setHeader: (key: string, value: string) => {
        if (key && key !== '' && value && value !== '') {
            axiosInstance.defaults.headers[key] = value
        }
    },
    removeHeader: (key: string) => {
        if (key && key !== '') {
            delete axiosInstance.defaults.headers[key]
        }
    },
    setToken: (token: string) => {
        axiosInstance.defaults.headers.Authorization = `Brearer ${token}`
    },
    clearToken: () => {
        delete axiosInstance.defaults.headers.Authorization
    },
}

export default apiUtil

interface QueryMultipleParamType {
    param: unknown
    table: string[]
}

export interface ResponseType<T> {
    IsSuccess: boolean
    Message: string
    Result: T | null
}

export interface UserInfoType {
    UserName: string
    FullName: string
    AccessToken: string
    RefreshToken: string
}

export interface UploadFileResponseType {
    Url: string
    FullUrl: string
    ThumbnailUrl: string
    FileName: string
}

export interface UploadImageResponseType {
    Url: string
    FullUrl: string
    ThumbnailUrl: string
    FileName: string
}