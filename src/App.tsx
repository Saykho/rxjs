import {useEffect, useRef, useState} from 'react'
import './App.css'
import {interval, map, take} from "rxjs";
import blueCat from './blue_working_cat_animation.json';
import laughingCat from './laughing_cat.json';
import Lottie from "lottie-react";
import * as THREE from "three";

function App() {
    const [count, setCount] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [animationData, setAnimationData] = useState<any>(laughingCat);

    const subscriptionRef = useRef<any>(null);
    const threeContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!threeContainerRef.current) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);

        const camera = new THREE.PerspectiveCamera(
            75,
            threeContainerRef.current.clientWidth /
            threeContainerRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 3;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(
            threeContainerRef.current.clientWidth,
            threeContainerRef.current.clientHeight
        );

        threeContainerRef.current.innerHTML = "";
        threeContainerRef.current.appendChild(renderer.domElement);

        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff88 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        const light = new THREE.PointLight(0xffffff, 1);
        light.position.set(3, 3, 3);
        scene.add(light);

        const animate = () => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
            if (!threeContainerRef.current) return;
            camera.aspect =
                threeContainerRef.current.clientWidth /
                threeContainerRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(
                threeContainerRef.current.clientWidth,
                threeContainerRef.current.clientHeight
            );
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            threeContainerRef.current?.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

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

            <div
                ref={threeContainerRef}
                style={{
                    width: "300px",
                    height: "300px",
                    margin: "20px auto",
                    border: "1px solid #444",
                    borderRadius: "8px",
                }}
            />

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
