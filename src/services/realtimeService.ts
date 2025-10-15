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

const groupName: string = 'realtime'

const sendAsync = async (data: string) => {
    await handleMessage("Send", {
        GroupName: groupName,
        Data: data
    })
}

const joinAsync = async () => {
    await handleMessage('Join', {
        GroupName: groupName
    })
}

const leaveAsync = () => {
    handleMessage('Leave', {
        GroupName: groupName
    })
}

const onMessage = (callback: (data: { Data: string }) => void) => {
    connection.on('OnMessage', callback)
}

const handleMessage = async (method: string, param?: unknown) => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        if (param === undefined) {
            await connection.invoke(method)
            return
        }
        await connection.invoke(method, param)
    } else {
        //
    }
}

const realtimeService = {
    startAsync,
    stopAsync,
    onMessage,
    sendAsync,
    joinAsync,
    leaveAsync,
}

export default realtimeService
