import {useEffect, useRef, useState} from 'react'
import './App.css'
import {interval, map, take} from "rxjs";

function App() {
    const [count, setCount] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);

    const subscriptionRef = useRef<any>(null);

    useEffect(() => {
        if (!isRunning) {
            return;
        }

        // 1. Создаём Observable (каждую секунду, *2, максимум 10 значений)
        const source$ = interval(1000).pipe(
            map(value => value * 2),
            take(10)
        );

        // 2. Создаём кастомный Observer
        const observer = {
            next: (value: number) => {
                console.log(value, "Полученро значение");
                setCount(value);
            },
            error: (error: any) => {
                console.error("Ошибка:", error);
            },
            complete: () => {
                console.log("Поток завершен");
                setIsCompleted(true);
                setIsRunning(false);
            }
        }

        // 3. Подписываемся
        const subscription = source$.subscribe(observer);
        subscriptionRef.current = subscription;

        // 4. Отприсываемся при размонтирвоании компонента
        return () => {
            subscription.unsubscribe();
            console.log("Отписка от потока")
        }
    }, [isRunning]);

    const handleStart = () => {
        setIsCompleted(false);
        setIsRunning(true);
    };

    const handleComplete = () => {
        setIsRunning(false);
        subscriptionRef.current?.unsubscribe();
        setIsCompleted(true);
    };

    return (
        <div>
            <h2>RxJS Counter</h2>
            <p>Текущее значение: {count}</p>

            {isCompleted && <p style={{ color: 'green' }}>✅ Поток завершён</p>}

            <div style={{ marginTop: '1rem' }}>
                <button onClick={handleStart} disabled={isRunning}>
                    ▶ Старт
                </button>
                <button onClick={handleComplete} disabled={!isRunning}>
                    ⏹ Стоп
                </button>
            </div>
        </div>
    )
}

export default App
