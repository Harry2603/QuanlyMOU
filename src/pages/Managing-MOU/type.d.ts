interface CategoryType {
    Id: number
    Name: string
    Description: string

}
type NotificationItem = {
    id: string;
    fileId: number;
    fileName: string;
    fromUser: string;
    time: string;
    action: string;
    isRead: boolean;
};
interface FileDataType {
    FileID: number,
    FileName: string,
    FullUrl: string,
    Url: string,
    TenPartner: string,
    CreateUser: string,
    NguoiTao: string,
    NguoiCapNhat: string,
    Status_BothSide: boolean,
    Status_Side: boolean,
    Status_SignatureA: boolean,
    Status_SignatureB: boolean,
    UsernameAuthor: string,
    UsernamePartner: string
}
interface EditDetailProps {
    isHideEnd?: boolean;
    isCreate?: boolean;
    isModalOpen: boolean;
    isFileAdmin: boolean;
    Url: string | null;
    fileID: number | undefined
    fileDataSelect: FileDataType | null | any
    onClose: () => void;
    onFetch: () => void
    userAccess: "Viewer" | "Editor";
}
interface ExcelFileType {
    FileId: number,
    Name: string,
    FullUrl: string,
    Url: string,
    TenPartner: string,
    CreateUser: string,
    NguoiTao: string,
    NguoiCapNhat: string,
    Status_BothSide: boolean,
    Status_Side: boolean,
    Status_SignatureA: boolean,
    Status_SignatureB: boolean,
    UsernameAuthor: string,
    UsernamePartner: string,
}
interface DetailProps {
    isHideEnd?: boolean;
    isCreate?: boolean;
    isModalOpen: boolean;
    isFileAdmin: boolean;
    Url: string | null;
    fileID: number | undefined
    fileDataSelect: ExcelFileType | null | any
    onClose: () => void;
    onFetch: () => void
    userAccess: "Viewer" | "Editor";
}
interface AccessTypeResponse {
    AccessType: "Viewer" | "Editor";
}
interface AccessType {
    ID: number;              // khóa chính
    FileId: number;          // ID file Excel
    UserId: number;          // ID user được phân quyền
    AccessType: string;      // viewer / editor / ...
    ViewerName: string;   // tên nếu quyền viewer
    EditorName: string;
}
interface AccessTypes {
    ID: number;              // khóa chính
    FileID: number;          // ID file FileData
    UserId: number;          // ID user được phân quyền
    AccessType: string;      // viewer / editor / ...
    ViewerName: string;   // tên nếu quyền viewer
    EditorName: string;
}
interface UserInfoType {
    AccessToken: string
    FullName: string
    RefreshToken: string
    RoleId: number
    UserId: number
    UserName: string
}

interface FileDetail {
    FileID: number
    FileName: string
    Url: string
    FullUrl: string
    author: string
}
interface ExcelDetail {
    FileId: number
    Name: string
    Url: string
    FullUrl: string
    Author: string
}
interface UserListType {
    TenDangNhap: string
    UserId: number
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