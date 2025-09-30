import { useCallback } from "react"

export default function useWakeLock() {
    const requestWakeLock = async () => {
        try {
            return await navigator.wakeLock.request('screen')
        }
        catch (err) {
            console.error("failed to get screenlock: ", err)
        }
    }
    const wakelockRequest = useCallback(async () => { await requestWakeLock() }, [])
    return {
        wakelockRequest
    }
}
