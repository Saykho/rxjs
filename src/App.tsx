import {useEffect, useRef, useState} from 'react'
import './App.css'
import {interval, map, take} from "rxjs";
import blueCat from './blue_working_cat_animation.json';
import laughingCat from './laughing_cat.json';
import Lottie from "lottie-react";

function App() {
    const [count, setCount] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [animationData, setAnimationData] = useState<any>(laughingCat);

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
                setAnimationData(blueCat);
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
        setAnimationData(laughingCat)
    };

    const handleComplete = () => {
        setIsRunning(false);
        subscriptionRef.current?.unsubscribe();
        setIsCompleted(true);
        setAnimationData(blueCat)
    };

    return (
        <div>
            <h2>RxJS Counter</h2>
            <p>Текущее значение: {count}</p>

            {(isRunning || isCompleted) &&
                <div style={{width: 200, margin: '0 auto'}}>
                    <Lottie animationData={animationData} loop={isRunning} autoplay/>
                </div>
            }

            {isCompleted && <p style={{color: 'green'}}>✅ Поток завершён</p>}

            <div style={{marginTop: '1rem'}}>
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
