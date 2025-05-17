interface CategoryType {
    Id: number
    Name: string
    Description: string
   
}

interface FileDataType {
    FileID: number,
    FileName: string,
    FullUrl: string,
    Url: string,
    TenPartner: string,
    CreateUser:string,
    NguoiTao: string,
    NguoiCapNhat: string,
    Status_BothSide: boolean,
    Status_Side: boolean,
    Status_SignatureA: boolean,
    Status_SignatureB: boolean,
    UsernameAuthor: string,
    UsernamePartner: string
}

interface UserInfoType {
    AccessToken: string
    FullName: string
    RefreshToken: string
    RoleId: number
    UserName: string
}

interface EditDetailProps {
    isHideEnd?: boolean;
    isCreate?: boolean;
    isModalOpen: boolean;
    Url: string | null;
    fileID: number | undefined
    fileDataSelect: FileDataType | null | any
    onClose: () => void;
    onFetch: () => void
}

interface FileDetail {
    FileID: number
    FileName: string
    Url: string
    FullUrl: string
    author: string
}

interface UserListType {
    TenDangNhap: string

}

interface UploadResult {
    IsSuccess: boolean
    Message: string
    Result: {
        FileName: string;
        FullUrl: string;
        Url: string;
    } | null;
}
interface DNDataType {
    DoanhNghiepID: number;
    MaDN: string;
    TenDN: string;
    DiaChi: string;
    SDT: number;
    Email: string;
    NguoiDaiDien: string;
    Website: string;
    NgayThanhLap: string;
    GhiChu: string
}