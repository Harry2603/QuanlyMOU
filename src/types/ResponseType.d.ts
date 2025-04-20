type ResponseType<T> = {
    IsSuccess: boolean
    Message: string
    Result: T | null
}

export default ResponseType
