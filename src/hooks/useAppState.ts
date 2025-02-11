import { create } from 'zustand'
import { storeEnum } from '../enums'
import { LoginInfoType } from '../utils/apiUtil'

const initState: StateType = {
    isLogin: false,
    username: '',
    pageTitle: '',
}

const useAppState = create<StateType & ActionType>(set => {
    const strUserInfo = localStorage.getItem(storeEnum.userInfo)
    let isLogin = false
    let username = ''
    if (strUserInfo !== null) {
        const userInfo: LoginInfoType = JSON.parse(strUserInfo)
        isLogin = true
        username = userInfo.UserName
    }
    return {
        ...initState,
        isLogin: isLogin,
        username: username,
        setIsLogin: isLogin => set({ isLogin: isLogin }),
        setUsername: username => set({ username: username }),
        setPageTitle: title => set({ pageTitle: title }),
        resetState: () => set(initState),
    }
})

export default useAppState

interface StateType {
    isLogin: boolean
    username: string
    pageTitle: string
}

interface ActionType {
    setIsLogin: (isLogin: boolean) => void
    setUsername: (username: string) => void
    setPageTitle: (title: string) => void
    resetState: () => void
}
