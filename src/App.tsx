import {useEffect, useState} from 'react'
import './App.css'
import {interval, map} from "rxjs";

function App() {
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        // 1. Создаём Observable (генерирует число каждую секунду)
       const source$ = interval(1000).pipe(map(value => value * 2));

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
                console.log("Поток завершен")
            }
        }

        // 3. Подписываемся
        const subscription = source$.subscribe(observer);

        // 4. Отприсываемся при размонтирвоании компонента
        return () => {
            subscription.unsubscribe();
            console.log("Отписка от потока")
        }
    }, []);

    return (
        <div>
            <h2>RxJS Counter</h2>
            <p>Текущее значение: {count}</p>
        </div>
    )
}

export default App
