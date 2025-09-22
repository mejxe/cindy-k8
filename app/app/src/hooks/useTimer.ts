import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

export type CountdownTimer = {
    timer: number,
    setTimer: Dispatch<SetStateAction<number>>
    setStarted: Dispatch<SetStateAction<boolean>>
    callbackRef: React.RefObject<CallableFunction | null>,
    callIn5Seconds: (callback: CallableFunction) => void,
}

export default function useTimer() {
    const [timer, setTimer] = useState<number>(0)
    const [started, setStarted] = useState<boolean>(false)
    const callbackRef = useRef<CallableFunction | null>(null)

    function callIn5Seconds(callback: CallableFunction) {
        callbackRef.current = callback
        setTimer(5)
        setStarted(true)
    }

    useEffect(() => {
        if (!started || timer <= 0) return
        const interval = setInterval(() => {
            setTimer(prev => prev - 1)
            if (timer <= 1) {
                clearInterval(interval)
                setStarted(false)
                if (callbackRef.current) {
                    callbackRef.current()
                }
            }
        }, 1000)

        return () => {
            clearInterval(interval)
        }
    }, [timer, started])

    const cntdwn: CountdownTimer = {
        timer,
        setTimer,
        setStarted,
        callbackRef,
        callIn5Seconds
    }
    return cntdwn
}
