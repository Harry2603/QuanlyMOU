const numberUtil = {
    toAlphabet: (number: number) => {
        return (number + 9).toString(36).toUpperCase()
    },
}

export default numberUtil
