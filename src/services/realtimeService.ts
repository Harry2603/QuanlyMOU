import * as signalR from '@microsoft/signalr'
import { apiUtil } from '../utils'

let connection: signalR.HubConnection

const startAsync = async () => {
    const url = `${window.__API_URL}/hub/realtime`
    const accessToken = apiUtil.getToken()

    connection = new signalR.HubConnectionBuilder()
        .withUrl(url, {
            accessTokenFactory: () => accessToken,
        })
        .withAutomaticReconnect()
        .build()

    connection.onreconnecting(() => { })

    connection.onreconnected(() => { })

    connection.onclose(() => { })

    try {
        await connection.start()
    } catch {
        //
    }
}

const stopAsync = async () => {
    await connection.stop()
}

// const groupName: string = 'realtime'
const getGroupName = (fileId: number) => `file:${fileId}`

const sendAsync = async (fileId: number, data: string) => {
    await handleMessage("Send", {
        GroupName: getGroupName(fileId),
        Data: data
    })
}

const joinAsync = async (fileId: number) => {
    if (connection.state !== signalR.HubConnectionState.Connected) {
        // console.log("WAITING FOR CONNECTION BEFORE JOIN...");
        await new Promise(res => setTimeout(res, 200));
    }
    await handleMessage('Join', {
        GroupName: getGroupName(fileId)
    })
}

const leaveAsync = (fileId: number) => {
    handleMessage('Leave', {
        GroupName: getGroupName(fileId)
    })
}

const onMessage = (callback: (data: { Data: string }) => void) => {
    connection.on('OnMessage', callback)
}
const handleMessage = async (method: string, param?: unknown) => {
    // 1. log xem connection đã tạo chưa
    // console.log(
    //     `%c[SignalR] CALL ${method}`,
    //     "color: #00aaff; font-weight: bold",
    //     {
    //         state: connection?.state,
    //         param
    //     }
    // );

    // 2. nếu connection không tồn tại
    if (!connection) {
        console.warn("[SignalR] ❌ connection is NULL when calling", method);
        return;
    }

    // 3. nếu connection chưa Connected
    if (connection.state !== signalR.HubConnectionState.Connected) {
        console.warn(
            `[SignalR] ❌ NOT CONNECTED when calling ${method}. state =`,
            connection.state
        );
        return;
    }

    // 4. invoke lên server
    try {
        if (param === undefined) {
            await connection.invoke(method);
        } else {
            await connection.invoke(method, param);
        }

        // console.log(
        //     `%c[SignalR] ✔ invoke SUCCESS ${method}`,
        //     "color: #28a745; font-weight: bold"
        // );
    } catch (error) {
        console.error(
            `%c[SignalR] ❌ invoke ERROR in ${method}`,
            "color: red; font-weight: bold",
            error
        );
    }
};

// const handleMessage = async (method: string, param?: unknown) => {
//     if (connection && connection.state === signalR.HubConnectionState.Connected) {
//         if (param === undefined) {
//             await connection.invoke(method)
//             return
//         }
//         await connection.invoke(method, param)
//     } else {
//         //
//     }
// }

const realtimeService = {
    startAsync,
    stopAsync,
    onMessage,
    sendAsync,
    joinAsync,
    leaveAsync,
}

export default realtimeService
