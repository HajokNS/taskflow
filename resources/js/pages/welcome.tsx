import { motion, AnimatePresence } from "framer-motion";
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const features = [
        {
            icon: '⏱️',
            title: 'Інтелектуальне планування',
            description: 'Адаптивна система планування, що враховує ваші звички та продуктивні години.',
        },
        {
            icon: '👥',
            title: 'Командні робочі простори',
            description: 'Ефективна колаборація з колегами з інтеграцією основних інструментів.',
        },
        {
            icon: '📈',
            title: 'Глибока аналітика',
            description: 'Детальні звіти та прогнози продуктивності на основі штучного інтелекту.',
        },
        {
            icon: '📱',
            title: 'Крос-платформна синхронізація',
            description: 'Миттєва синхронізація між всіма вашими пристроями без затримок.',
        },
    ];

    const testimonials = [
        {
            name: 'Анна Коваленко',
            role: 'CEO, TechSolutions',
            quote: 'TaskFlow перевершив усі наші очікування. Продуктивність команди зросла на 40% за перші 3 місяці.',
            stats: 'Зростання продуктивності: 40%'
        },
        {
            name: 'Олексій Петренко',
            role: 'CTO, FinTech Startup',
            quote: 'Інтуїтивний інтерфейс і потужний функціонал. Найкращий інструмент для технічних команд.',
            stats: 'Економить: 8 год/тиждень'
        },
    ];

    const stats = [
        { value: '15K+', label: 'Щасливих користувачів' },
        { value: '98%', label: 'Задоволені клієнти' },
        { value: '4.9/5', label: 'Середня оцінка' },
        { value: '5+', label: 'Років на ринку' }
    ];

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Анімації
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                when: "beforeChildren"
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    const featureCardVariants = {
        hover: {
            y: -10,
            scale: 1.02,
            boxShadow: "0 20px 25px -5px rgba(245, 158, 11, 0.2)"
        }
    };

    const statsVariants = {
        hover: {
            scale: 1.05,
            transition: { type: "spring", stiffness: 300 }
        }
    };

    // Глобальний анімований фон
    const GlobalBackground = () => (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                {/* Великі анімовані круги */}
                <circle cx="15%" cy="25%" r="180" fill="none" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.15">
                    <animate attributeName="r" values="180;200;180" dur="12s" repeatCount="indefinite" />
                    <animate attributeName="cx" values="15%;17%;15%" dur="15s" repeatCount="indefinite" />
                </circle>
                <circle cx="85%" cy="35%" r="150" fill="none" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.15">
                    <animate attributeName="r" values="150;170;150" dur="14s" repeatCount="indefinite" />
                    <animate attributeName="cy" values="35%;40%;35%" dur="18s" repeatCount="indefinite" />
                </circle>

                {/* Складні геометричні фігури */}
                <polygon points="10%,10% 30%,5% 25%,25%" fill="none" stroke="#8B5CF6" strokeWidth="0.8" strokeOpacity="0.1">
                    <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="50s" repeatCount="indefinite" />
                </polygon>
                
                <path d="M90%,80% Q95%,70% 100%,80% T110%,80%" fill="none" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="5,3">
                    <animate attributeName="d" values="M90%,80% Q95%,70% 100%,80% T110%,80%; M90%,80% Q95%,90% 100%,80% T110%,80%" dur="15s" repeatCount="indefinite" />
                </path>

                {/* Дрібні круги */}
                {Array.from({ length: 50 }).map((_, i) => {
                    const size = Math.random() * 60 + 20;
                    const duration = Math.random() * 15 + 10;
                    return (
                        <circle
                            key={`bg-circle-${i}`}
                            cx={`${Math.random() * 100}%`}
                            cy={`${Math.random() * 100}%`}
                            r={size}
                            fill="none"
                            stroke={i % 2 === 0 ? "#8B5CF6" : "#F59E0B"}
                            strokeWidth="0.5"
                            strokeOpacity="0.1"
                        >
                            <animate
                                attributeName="r"
                                values={`${size};${size * 1.2};${size}`}
                                dur={`${duration}s`}
                                repeatCount="indefinite"
                            />
                            <animate
                                attributeName="cx"
                                values={`${Math.random() * 100}%;${Math.random() * 100}%`}
                                dur={`${duration * 2}s`}
                                repeatCount="indefinite"
                            />
                        </circle>
                    );
                })}

                {/* Абстрактні лінії */}
                <path
                    d="M0,30 Q50,80 100,30 T200,30 T300,30"
                    stroke="url(#lineGradient)"
                    fill="none"
                    strokeWidth="1"
                    strokeOpacity="0.1"
                >
                    <animate
                        attributeName="d"
                        values="M0,30 Q50,80 100,30 T200,30 T300,30;
                                M0,30 Q50,-20 100,30 T200,30 T300,30"
                        dur="25s"
                        repeatCount="indefinite"
                    />
                </path>

                {/* Хвилясті форми */}
                <path
                    d="M0,80 C20,60 40,100 60,70 S100,90 120,70 S160,100 180,70 S220,90 240,70"
                    stroke="#8B5CF6"
                    strokeWidth="0.8"
                    strokeOpacity="0.1"
                    fill="none"
                >
                    <animate
                        attributeName="d"
                        values="M0,80 C20,60 40,100 60,70 S100,90 120,70 S160,100 180,70 S220,90 240,70;
                                M0,80 C20,100 40,60 60,90 S100,70 120,90 S160,60 180,90 S220,70 240,90"
                        dur="20s"
                        repeatCount="indefinite"
                    />
                </path>

                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                    
                    <radialGradient id="radialGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.1" />
                    </radialGradient>
                </defs>
            </svg>
        </div>
    );

    // Декорації для Hero секції
    const HeroDecorations = () => (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" opacity="0.2">
                {/* Концентричні круги */}
                <circle cx="20%" cy="40%" r="120" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="5,5" />
                <circle cx="20%" cy="40%" r="80" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="5,5" />
                <circle cx="20%" cy="40%" r="40" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="5,5" />
                
                {/* Діагональні лінії */}
                <line x1="10%" y1="10%" x2="40%" y2="40%" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="70%" y1="20%" x2="90%" y2="50%" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="30%" y1="70%" x2="60%" y2="90%" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="5,5" />
                
                {/* Точки */}
                {Array.from({ length: 50 }).map((_, i) => (
                    <circle
                        key={`hero-dot-${i}`}
                        cx={`${10 + (Math.random() * 80)}%`}
                        cy={`${10 + (Math.random() * 80)}%`}
                        r={Math.random() * 3 + 1}
                        fill="#FFFFFF"
                    >
                        <animate
                            attributeName="opacity"
                            values="0.2;0.8;0.2"
                            dur={`${Math.random() * 10 + 5}s`}
                            repeatCount="indefinite"
                        />
                    </circle>
                ))}
                
                {/* Абстрактні трикутники */}
                <path d="M80%,20% L90%,10% L85%,25% Z" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.3" />
                <path d="M15%,70% L25%,65% L20%,80% Z" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.3" />
                
                {/* Анімовані хвилі */}
                <path 
                    d="M0,90 Q25,80 50,90 T100,90"
                    stroke="#FFFFFF" 
                    strokeWidth="1" 
                    fill="none"
                    strokeOpacity="0.3"
                >
                    <animate
                        attributeName="d"
                        values="M0,90 Q25,80 50,90 T100,90;
                                M0,90 Q25,100 50,90 T100,90"
                        dur="8s"
                        repeatCount="indefinite"
                    />
                </path>
            </svg>
            
            {/* Додаткові плаваючі елементи */}
            <div className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-purple-500/10 blur-xl"></div>
            <div className="absolute top-1/3 right-1/3 w-24 h-24 rounded-full bg-amber-400/10 blur-xl"></div>
            <div className="absolute bottom-1/4 left-1/2 w-20 h-20 rounded-full bg-white/5 blur-xl"></div>
        </div>
    );

    // Декорації для Stats секції
    const StatsDecorations = () => (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" opacity="0.15">
                {/* Графіки */}
                <polyline 
                    points="10,100 50,60 90,120 130,80 170,140" 
                    fill="none" 
                    stroke="#8B5CF6" 
                    strokeWidth="2"
                />
                <polyline 
                    points="10,150 50,110 90,170 130,130 170,190" 
                    fill="none" 
                    stroke="#F59E0B" 
                    strokeWidth="2"
                />
                
                {/* Процентні позначки */}
                {[0, 25, 50, 75, 100].map((percent) => (
                    <line
                        key={`stat-line-${percent}`}
                        x1={`${percent}%`}
                        y1="10%"
                        x2={`${percent}%`}
                        y2="90%"
                        stroke="#6B7280"
                        strokeWidth="0.5"
                        strokeDasharray="2,2"
                    />
                ))}
                
                {/* Діаграми */}
                <rect x="15%" y="60%" width="10" height="40" fill="#8B5CF6" opacity="0.2">
                    <animate attributeName="height" values="40;20;40" dur="5s" repeatCount="indefinite" />
                </rect>
                <rect x="25%" y="50%" width="10" height="50" fill="#F59E0B" opacity="0.2">
                    <animate attributeName="height" values="50;30;50" dur="7s" repeatCount="indefinite" />
                </rect>
                <rect x="35%" y="40%" width="10" height="60" fill="#8B5CF6" opacity="0.2">
                    <animate attributeName="height" values="60;40;60" dur="6s" repeatCount="indefinite" />
                </rect>
                
                {/* Кругові діаграми */}
                <circle cx="75%" cy="30%" r="20" fill="none" stroke="#8B5CF6" strokeWidth="10" strokeDasharray="60,100" strokeOpacity="0.2">
                    <animate attributeName="stroke-dasharray" values="60,100;100,60;60,100" dur="8s" repeatCount="indefinite" />
                </circle>
                <circle cx="85%" cy="40%" r="15" fill="none" stroke="#F59E0B" strokeWidth="10" strokeDasharray="30,100" strokeOpacity="0.2">
                    <animate attributeName="stroke-dasharray" values="30,100;70,100;30,100" dur="6s" repeatCount="indefinite" />
                </circle>
                
                {/* Точки даних */}
                {Array.from({ length: 15 }).map((_, i) => (
                    <circle
                        key={`stat-dot-${i}`}
                        cx={`${10 + (Math.random() * 80)}%`}
                        cy={`${30 + (Math.random() * 60)}%`}
                        r={Math.random() * 2 + 1}
                        fill={i % 2 === 0 ? "#8B5CF6" : "#F59E0B"}
                        opacity="0.3"
                    >
                        <animate 
                            attributeName="cy" 
                            values={`${30 + (Math.random() * 60)}%;${30 + (Math.random() * 60)}%`} 
                            dur={`${Math.random() * 10 + 5}s`} 
                            repeatCount="indefinite" 
                        />
                    </circle>
                ))}
            </svg>
            
            {/* Плавучі елементи */}
            <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full bg-purple-500/5 blur-xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-amber-400/5 blur-xl"></div>
        </div>
    );

    // Декорації для Features секції
    const FeaturesDecorations = () => (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" opacity="0.15">
                {/* Шестикутна сітка */}
                <path
                    d="M50,0 L100,25 L100,75 L50,100 L0,75 L0,25 Z"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="1"
                    transform="translate(10%, 10%) scale(0.4)"
                />
                <path
                    d="M50,0 L100,25 L100,75 L50,100 L0,75 L0,25 Z"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="1"
                    transform="translate(60%, 30%) scale(0.6)"
                />
                
                {/* Квадратні елементи */}
                <rect x="70%" y="60%" width="60" height="60" rx="10" fill="none" stroke="#8B5CF6" strokeWidth="1" />
                <rect x="20%" y="20%" width="80" height="80" rx="15" fill="none" stroke="#F59E0B" strokeWidth="1" />
                
                {/* Анімовані шеврони */}
                <path d="M40%,70% L50%,60% L60%,70% L50%,80% Z" fill="none" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.3">
                    <animateTransform attributeName="transform" type="translate" values="0,0; 0,10; 0,0" dur="6s" repeatCount="indefinite" />
                </path>
                <path d="M80%,30% L90%,20% L100%,30% L90%,40% Z" fill="none" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.3">
                    <animateTransform attributeName="transform" type="translate" values="0,0; 0,-10; 0,0" dur="7s" repeatCount="indefinite" />
                </path>
                
                {/* Пунктирні кола */}
                <circle cx="30%" cy="40%" r="25" fill="none" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="5,3" strokeOpacity="0.3" />
                <circle cx="70%" cy="50%" r="35" fill="none" stroke="#F59E0B" strokeWidth="1" strokeDasharray="5,3" strokeOpacity="0.3" />
                
                {/* Анімовані лінії */}
                <line x1="10%" y1="20%" x2="30%" y2="20%" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.3">
                    <animate attributeName="x2" values="30%;40%;30%" dur="5s" repeatCount="indefinite" />
                </line>
                <line x1="80%" y1="80%" x2="90%" y2="80%" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.3">
                    <animate attributeName="x1" values="80%;70%;80%" dur="4s" repeatCount="indefinite" />
                </line>
                
                {/* Точковий фон */}
                {Array.from({ length: 30 }).map((_, i) => (
                    <circle
                        key={`feature-dot-${i}`}
                        cx={`${Math.random() * 100}%`}
                        cy={`${Math.random() * 100}%`}
                        r={Math.random() * 2 + 0.5}
                        fill={i % 2 === 0 ? "#8B5CF6" : "#F59E0B"}
                        opacity="0.2"
                    />
                ))}
            </svg>
            
            {/* Плавучі елементи */}
            <div className="absolute top-1/3 left-1/3 w-48 h-48 rounded-full bg-purple-500/5 blur-xl"></div>
            <div className="absolute bottom-1/3 right-1/3 w-36 h-36 rounded-full bg-amber-400/5 blur-xl"></div>
        </div>
    );

    // Декорації для Testimonials секції
    const TestimonialsDecorations = () => (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" opacity="0.15">
                {/* Лапки цитат */}
                <path d="M20%,30% Q30%,20% 40%,30%" fill="none" stroke="#8B5CF6" strokeWidth="2" />
                <path d="M20%,40% Q30%,30% 40%,40%" fill="none" stroke="#8B5CF6" strokeWidth="2" />
                <path d="M80%,30% Q70%,20% 60%,30%" fill="none" stroke="#F59E0B" strokeWidth="2" />
                <path d="M80%,40% Q70%,30% 60%,40%" fill="none" stroke="#F59E0B" strokeWidth="2" />
                
                {/* Хвилі */}
                <path 
                    d="M10%,70% C30%,60% 50%,80% 70%,60% S90%,80% 100%,60%"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="1"
                    strokeDasharray="5,3"
                />
                
                {/* Анімовані зірки */}
                {Array.from({ length: 10 }).map((_, i) => (
                    <path
                        key={`testimonial-star-${i}`}
                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        fill="none"
                        stroke={i % 2 === 0 ? "#8B5CF6" : "#F59E0B"}
                        strokeWidth="0.5"
                        strokeOpacity="0.3"
                        transform={`translate(${Math.random() * 90 + 5}%, ${Math.random() * 80 + 10}%) scale(0.5)`}
                    >
                        <animate
                            attributeName="opacity"
                            values="0.3;0.8;0.3"
                            dur={`${Math.random() * 5 + 3}s`}
                            repeatCount="indefinite"
                        />
                    </path>
                ))}
                
                {/* Плавучі круги */}
                <circle cx="25%" cy="65%" r="15" fill="none" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.2">
                    <animate attributeName="r" values="15;20;15" dur="8s" repeatCount="indefinite" />
                </circle>
                <circle cx="75%" cy="75%" r="10" fill="none" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.2">
                    <animate attributeName="r" values="10;15;10" dur="6s" repeatCount="indefinite" />
                </circle>
                
                {/* Абстрактні форми */}
                <path d="M40%,80% L50%,75% L60%,85% L55%,90% Z" fill="none" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.2" />
                <path d="M70%,20% Q80%,15% 85%,25% T90%,30%" fill="none" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.2" />
            </svg>
            
            {/* Плавучі елементи */}
            <div className="absolute top-1/4 left-1/4 w-24 h-24 rounded-full bg-purple-500/5 blur-xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-amber-400/5 blur-xl"></div>
        </div>
    );

    // Декорації для CTA секції
    const CTADecorations = () => (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" opacity="0.2">
                {/* Стрілки */}
                <path d="M10%,50% L25%,50% L20%,45% M25%,50% L20%,55%" stroke="#FFFFFF" strokeWidth="2" />
                <path d="M90%,50% L75%,50% L80%,45% M75%,50% L80%,55%" stroke="#FFFFFF" strokeWidth="2" />
                
                {/* Рухливі круги */}
                <circle cx="30%" cy="30%" r="20" fill="none" stroke="#FFFFFF" strokeWidth="1">
                    <animate attributeName="r" values="20;25;20" dur="8s" repeatCount="indefinite" />
                    <animate attributeName="cx" values="30%;32%;30%" dur="12s" repeatCount="indefinite" />
                </circle>
                <circle cx="70%" cy="70%" r="15" fill="none" stroke="#FFFFFF" strokeWidth="1">
                    <animate attributeName="r" values="15;20;15" dur="6s" repeatCount="indefinite" />
                    <animate attributeName="cy" values="70%;68%;70%" dur="10s" repeatCount="indefinite" />
                </circle>
                
                {/* Анімовані хвилі */}
                <path 
                    d="M0,80 Q25,70 50,80 T100,80"
                    stroke="#FFFFFF" 
                    strokeWidth="1" 
                    fill="none"
                    strokeOpacity="0.3"
                >
                    <animate
                        attributeName="d"
                        values="M0,80 Q25,70 50,80 T100,80;
                                M0,80 Q25,90 50,80 T100,80"
                        dur="10s"
                        repeatCount="indefinite"
                    />
                </path>
                
                {/* Пунктирні лінії */}
                <line x1="20%" y1="20%" x2="40%" y2="40%" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="5,3" strokeOpacity="0.3" />
                <line x1="60%" y1="60%" x2="80%" y2="80%" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="5,3" strokeOpacity="0.3" />
                
                {/* Абстрактні форми */}
                <rect x="15%" y="15%" width="30" height="30" rx="5" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.3">
                    <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="30s" repeatCount="indefinite" />
                </rect>
                <polygon points="85%,85% 95%,75% 90%,90%" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.3" />
            </svg>
            
            {/* Плавучі елементи */}
            <div className="absolute top-1/3 left-1/3 w-48 h-48 rounded-full bg-white/5 blur-xl"></div>
            <div className="absolute bottom-1/3 right-1/3 w-36 h-36 rounded-full bg-white/5 blur-xl"></div>
        </div>
    );

    // Декорації для Footer
    const FooterDecorations = () => (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" opacity="0.1">
                {/* Хвиляста лінія */}
                <path 
                    d="M0,20 C30,10 70,30 100,20 S170,10 200,20"
                    stroke="#8B5CF6"
                    strokeWidth="1"
                    fill="none"
                >
                    <animate
                        attributeName="d"
                        values="M0,20 C30,10 70,30 100,20 S170,10 200,20;
                                M0,20 C30,30 70,10 100,20 S170,30 200,20"
                        dur="15s"
                        repeatCount="indefinite"
                    />
                </path>
                
                {/* Точки */}
                {Array.from({ length: 30 }).map((_, i) => (
                    <circle
                        key={`footer-dot-${i}`}
                        cx={`${Math.random() * 100}%`}
                        cy={`${Math.random() * 100}%`}
                        r={Math.random() * 3 + 1}
                        fill={i % 2 === 0 ? "#8B5CF6" : "#F59E0B"}
                        opacity="0.2"
                    >
                        <animate
                            attributeName="opacity"
                            values="0.2;0.5;0.2"
                            dur={`${Math.random() * 10 + 5}s`}
                            repeatCount="indefinite"
                        />
                    </circle>
                ))}
                
                {/* Анімовані квадрати */}
                <rect x="10%" y="10%" width="15" height="15" fill="none" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.3">
                    <animateTransform attributeName="transform" type="rotate" from="0 17 17" to="360 17 17" dur="20s" repeatCount="indefinite" />
                </rect>
                <rect x="80%" y="80%" width="20" height="20" fill="none" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.3">
                    <animateTransform attributeName="transform" type="rotate" from="360 90 90" to="0 90 90" dur="25s" repeatCount="indefinite" />
                </rect>
                
                {/* Діагональні лінії */}
                <line x1="20%" y1="80%" x2="40%" y2="60%" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="5,3" />
                <line x1="60%" y1="40%" x2="80%" y2="20%" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="5,3" />
            </svg>
        </div>
    );

    return (
        <>
            <Head title="TaskFlow | Професійний менеджер завдань">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700" rel="stylesheet" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <GlobalBackground />

            <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white/30 dark:from-gray-900/50 dark:to-gray-800/30 relative z-10">
                {/* Hero Section */}
<motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8 }}
    className="relative overflow-hidden"
>
    <HeroDecorations />
    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-amber-600/80 backdrop-blur-sm z-0"></div>
    
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 z-10">
        <div className="text-center">
            <motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8,
      ease: "easeOut"
    }
  }}
>
  <span className="inline-block px-5 py-2 text-lg font-bold bg-white/10 backdrop-blur-sm rounded-full border border-amber-300/30 text-amber-300">
    TaskFlow
  </span>
</motion.div>

<motion.h1 
  initial={{ opacity: 0, y: 30 }}
  animate={{ 
    opacity: 1, 
    y: 0,
    transition: { 
      delay: 0.2,
      duration: 0.8,
      ease: "easeOut"
    }
  }}
  className="mt-6 text-4xl md:text-6xl font-bold text-white"
>
  <span className="block">Професійне</span>
  <motion.span 
    className="block"
    animate={{
      backgroundPosition: ["0% 50%", "100% 50%"],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "linear"
      }
    }}
    style={{
      backgroundSize: "200% 200%",
      backgroundImage: "linear-gradient(45deg, #f59e0b, #fcd34d, #f59e0b)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent"
    }}
  >
    керування завданнями
  </motion.span>
</motion.h1>

            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 max-w-2xl mx-auto text-xl text-amber-100 dark:text-amber-200"
            >
                Інструмент нового покоління для амбітних команд та професіоналів
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="block mt-2 text-amber-200/80 text-sm"
                >
                    Підвищте продуктивність на 40% вже за перший місяць
                </motion.span>
            </motion.p>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
            >
                {auth.user ? (
                    <Link
                        href={route('tasks.index')}
                        className="relative overflow-hidden group flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-amber-900 bg-amber-400 hover:bg-amber-500 md:py-4 md:text-lg md:px-10 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-400/30"
                    >
                        <span className="relative z-10 flex items-center">
                            Панель керування
                            <span className="ml-2">→</span>
                        </span>
                        <motion.span
                            className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '0%' }}
                            transition={{ duration: 0.6 }}
                        />
                    </Link>
                ) : (
                    <Link
                        href={route('register')}
                        className="relative overflow-hidden group flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-amber-900 bg-amber-400 hover:bg-amber-500 md:py-4 md:text-lg md:px-10 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-400/30"
                    >
                        <span className="relative z-10 flex items-center">
                            Почати
                            <span className="ml-2">→</span>
                        </span>
                        <motion.span
                            className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '0%' }}
                            transition={{ duration: 0.6 }}
                        />
                    </Link>
                )}
                <motion.button
                    whileHover={{ 
                        scale: 1.05,
                        backgroundColor: 'rgba(255, 255, 255, 0.15)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollTo('features')}
                    className="relative overflow-hidden group flex items-center justify-center px-8 py-3 border border-amber-300 text-base font-medium rounded-md text-white bg-transparent hover:bg-white/10 md:py-4 md:text-lg md:px-10 transition-all duration-300 backdrop-blur-sm"
                >
                    <span className="relative z-10">Детальніше</span>
                    <motion.span
                        className="absolute inset-0 border-2 border-transparent group-hover:border-amber-300/30 rounded-md"
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileHover={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    />
                </motion.button>
            </motion.div>
        </div>

        {/* Animated floating elements */}
        <motion.div 
            initial={{ y: 0 }}
            animate={{ y: [0, -15, 0] }}
            transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className="absolute left-10 bottom-20 opacity-30"
        >
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#F59E0B"/>
            </svg>
        </motion.div>

        <motion.div 
            initial={{ y: 0 }}
            animate={{ y: [0, 15, 0] }}
            transition={{ 
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
            }}
            className="absolute right-20 top-1/3 opacity-30"
        >
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#8B5CF6"/>
            </svg>
        </motion.div>

        <motion.div 
            initial={{ x: 0 }}
            animate={{ x: [0, 15, 0] }}
            transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3
            }}
            className="absolute left-1/4 bottom-1/4 opacity-20"
        >
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="#F59E0B"/>
            </svg>
        </motion.div>
    </div>
</motion.div>
                

                {/* Stats Section */}
                <motion.section
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="py-12 sm:py-16 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm relative"
                >
                    <StatsDecorations />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <motion.h2 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl"
                            >
                                Довіряють команди з усього світу
                            </motion.h2>
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="mt-3 text-xl text-gray-600 dark:text-gray-300"
                            >
                                Наші результати говорять самі за себе
                                <motion.span 
                                    className="block mt-2 text-sm text-amber-600 dark:text-amber-400"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.6 }}
                                >
                                    *На основі даних за 2025 рік
                                </motion.span>
                            </motion.p>
                        </div>

                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4"
                        >
                            {stats.map((stat, index) => (
                                <motion.div 
                                    key={index}
                                    variants={itemVariants}
                                    whileHover="hover"
                                    variants={statsVariants}
                                    className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-white dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl shadow-sm backdrop-blur-sm"
                                >
                                    {/* Animated background element */}
                                    <motion.div 
                                        className="absolute -right-10 -top-10 w-20 h-20 rounded-full bg-amber-200/20 dark:bg-amber-600/20"
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 + 0.4 }}
                                    />
                                    <p className="relative text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                                        {stat.value}
                                        <motion.span 
                                            className="absolute -bottom-1 left-0 w-full h-1 bg-amber-400/30 rounded-full"
                                            initial={{ scaleX: 0 }}
                                            whileInView={{ scaleX: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.1 + 0.6, duration: 0.6 }}
                                        />
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-300">{stat.label}</p>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Animated connecting lines */}
                        <svg className="w-full h-20 mt-8 hidden md:block" xmlns="http://www.w3.org/2000/svg">
                            <motion.path
                                d="M10,10 C150,50 350,30 490,10"
                                stroke="url(#statsGradient)"
                                strokeWidth="2"
                                fill="none"
                                strokeDasharray="1000"
                                strokeDashoffset="1000"
                                initial={{ strokeDashoffset: 1000 }}
                                whileInView={{ strokeDashoffset: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, delay: 0.8 }}
                            />
                            <defs>
                                <linearGradient id="statsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.5" />
                                    <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.5" />
                                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.5" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </motion.section>

                {/* Features Section */}
                <motion.section 
                    id="features"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="py-12 sm:py-24 bg-amber-50/50 dark:bg-gray-900/50 backdrop-blur-sm relative"
                >
                    <FeaturesDecorations />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                        <div className="lg:text-center">
                            <motion.h2 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-base text-amber-600 dark:text-amber-400 font-semibold tracking-wide uppercase"
                            >
                                Можливості
                            </motion.h2>
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
                            >
                                Потужний інструмент для професіоналів
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6 }}
                                className="mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-300 lg:mx-auto"
                            >
                                Розширені функції, які допоможуть вам досягти більшого за менший час
                            </motion.p>
                        </div>

                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2"
                        >
                            {features.map((feature, index) => (
                                <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover="hover"
                                variants={featureCardVariants}
                                className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                              >
                                <motion.div 
                                  className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-amber-200/10 dark:bg-amber-600/10"
                                  initial={{ scale: 0 }}
                                  whileInView={{ scale: 1 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: index * 0.1 + 0.4 }}
                                  style={{
                                    right: '1rem',
                                    bottom: '1rem',
                                    width: '5rem',
                                    height: '5rem'
                                  }}
                                />
                                
                                <motion.div 
                                  className="absolute -top-4 left-6 flex items-center justify-center h-14 w-14 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 text-white text-2xl shadow-md z-10"
                                  whileTap={{ scale: 0.9 }}
                                  whileHover={{ rotate: 15 }}
                                  transition={{ type: "spring", stiffness: 300 }}
                                >
                                  {feature.icon}
                                </motion.div>
                                    
                                    <motion.h3 
                                        className="mt-6 text-lg font-medium text-gray-900 dark:text-white"
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 + 0.2 }}
                                    >
                                        {feature.title}
                                    </motion.h3>
                                    
                                    <motion.p 
                                        className="mt-2 text-base text-gray-600 dark:text-gray-300"
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 + 0.4 }}
                                    >
                                        {feature.description}
                                    </motion.p>
                                    
                                    {/* Animated underline */}
                                    <motion.div 
                                        className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"
                                        initial={{ scaleX: 0 }}
                                        whileInView={{ scaleX: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 + 0.6, duration: 0.6 }}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Animated separator */}
                        <motion.div 
                            className="mt-16 flex justify-center"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.8 }}
                        >
                            <svg width="200" height="20" viewBox="0 0 200 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <motion.path
                                    d="M10,10 C50,15 150,5 190,10"
                                    stroke="url(#featuresSeparator)"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeDasharray="200"
                                    strokeDashoffset="200"
                                    initial={{ strokeDashoffset: 200 }}
                                    whileInView={{ strokeDashoffset: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, delay: 1 }}
                                />
                                <defs>
                                    <linearGradient id="featuresSeparator" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#8B5CF6" />
                                        <stop offset="50%" stopColor="#F59E0B" />
                                        <stop offset="100%" stopColor="#8B5CF6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Testimonials */}
                <motion.section
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="py-16 sm:py-24 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm relative"
                >
                    <TestimonialsDecorations />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                        <div className="text-center">
                            <motion.h2 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl"
                            >
                                Що кажуть наші клієнти
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-300 mx-auto"
                            >
                                Реальні результати від реальних людей
                            </motion.p>
                        </div>

                        <AnimatePresence>
                            <motion.div 
                                className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2"
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                {testimonials.map((testimonial, index) => (
                                    <motion.div
                                        key={index}
                                        variants={itemVariants}
                                        whileHover={{ y: -5 }}
                                        className="relative overflow-hidden bg-gradient-to-br from-amber-50/50 to-white/80 dark:from-gray-700/80 dark:to-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
                                    >
                                        {/* Floating abstract shapes */}
                                        <motion.div 
                                            className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-amber-200/10 dark:bg-amber-600/10"
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.2 + 0.4 }}
                                        />
                                        
                                        <div className="relative">
                                            <svg
                                                className="absolute top-0 left-0 transform -translate-x-3 -translate-y-2 h-8 w-8 text-amber-200 dark:text-amber-800/50"
                                                fill="currentColor"
                                                viewBox="0 0 32 32"
                                                aria-hidden="true"
                                            >
                                                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                                            </svg>
                                            <motion.p 
                                                className="relative text-lg text-gray-700 dark:text-gray-300"
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: index * 0.2 + 0.2 }}
                                            >
                                                {testimonial.quote}
                                            </motion.p>
                                        </div>
                                        <div className="mt-6 flex items-center">
                                            <div className="flex-shrink-0">
                                                <motion.div 
                                                    className="h-12 w-12 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold shadow-md"
                                                    whileHover={{ rotate: 360 }}
                                                    transition={{ duration: 0.5 }}
                                                    initial={{ opacity: 0 }}
                                                    whileInView={{ opacity: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: index * 0.2 + 0.4 }}
                                                >
                                                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                                                </motion.div>
                                            </div>
                                            <div className="ml-4">
                                                <motion.div 
                                                    className="text-base font-medium text-gray-900 dark:text-white"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: index * 0.2 + 0.4 }}
                                                >
                                                    {testimonial.name}
                                                </motion.div>
                                                <motion.div 
                                                    className="text-sm text-amber-600 dark:text-amber-400"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: index * 0.2 + 0.5 }}
                                                >
                                                    {testimonial.role}
                                                </motion.div>
                                                <motion.div 
                                                    className="text-xs text-gray-500 dark:text-gray-400 mt-1"
                                                    initial={{ opacity: 0, y: 5 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: index * 0.2 + 0.6 }}
                                                >
                                                    {testimonial.stats}
                                                </motion.div>
                                            </div>
                                        </div>
                                        
                                        {/* Animated rating stars */}
                                        <motion.div 
                                            className="absolute bottom-4 right-4 flex"
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.2 + 0.8 }}
                                        >
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <motion.svg
                                                    key={star}
                                                    className="w-4 h-4 text-amber-400"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    initial={{ scale: 0 }}
                                                    whileInView={{ scale: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ 
                                                        delay: index * 0.2 + star * 0.1,
                                                        type: "spring",
                                                        stiffness: 300
                                                    }}
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </motion.svg>
                                            ))}
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {/* Animated logo showcase */}
                        <motion.div
                            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 items-center"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6 }}
                        >
                            {['TechCrunch', 'Forbes', 'Wired', 'TheVerge'].map((logo, index) => (
                                <motion.div
                                    key={logo}
                                    className="flex justify-center"
                                    whileHover={{ y: -5 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 + 0.6 }}
                                >
                                    <div className="text-gray-400 dark:text-gray-500 text-xl font-bold tracking-wider">
                                        {logo}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.section>

                {/* CTA Section */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative bg-gradient-to-r from-purple-900/90 to-amber-700/90 overflow-hidden"
                >
                    <CTADecorations />
                    <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:flex lg:items-center lg:justify-between z-10">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-center lg:text-left"
                        >
                            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                <span className="block">Готові трансформувати</span>
                                <span className="block">свій робочий процес?</span>
                            </h2>
                            <motion.p 
                                className="mt-4 text-lg leading-6 text-amber-100"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                            >
                                Використовуйте TaskFlow безкоштовно - без обмежень та прихованих платежів
                            </motion.p>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 flex lg:mt-0 lg:flex-shrink-0 justify-center"
                        >
                            <div className="inline-flex rounded-md shadow-lg">
                                <Link
                                    href={auth.user ? route('tasks.index') : route('register')}
                                    className="relative overflow-hidden group inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-purple-900 bg-amber-400 hover:bg-amber-500 md:py-4 md:text-lg md:px-10 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-400/30"
                                >
                                    <span className="relative z-10">
                                        {auth.user ? 'Панель керування' : 'Зареєструватись'}
                                    </span>
                                    {/* Animated background */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        initial={{ x: '-100%' }}
                                        whileHover={{ x: '0%' }}
                                        transition={{ duration: 0.6 }}
                                    />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.footer 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-gray-900/90 backdrop-blur-sm relative overflow-hidden"
                >
                    <FooterDecorations />
                    <div className="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 z-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div className="col-span-2">
                                <motion.h3 
                                    className="text-white text-lg font-semibold"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                >
                                    TaskFlow
                                </motion.h3>
                                <motion.p 
                                    className="mt-4 text-gray-300 text-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 }}
                                >
                                    Професійне програмне забезпечення для керування завданнями нового покоління.
                                </motion.p>
                                <motion.div 
                                    className="mt-4 flex space-x-6"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.6 }}
                                >
                                    {['Facebook', 'Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                                        <motion.a 
                                            key={social} 
                                            href="#" 
                                            className="text-gray-400 hover:text-amber-400 transition-colors"
                                            whileHover={{ y: -2 }}
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            <span className="sr-only">{social}</span>
                                            <span className="text-lg">{social[0]}</span>
                                        </motion.a>
                                    ))}
                                </motion.div>
                            </div>

                            <div>
                                <motion.h3 
                                    className="text-white text-sm font-semibold tracking-wider uppercase"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Навігація
                                </motion.h3>
                                <ul className="mt-4 space-y-2">
                                    {['Головна', 'Можливості', 'Ціни', 'Блог'].map((item, index) => (
                                        <motion.li
                                            key={item}
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                        >
                                            <motion.a 
                                                href={item === 'Можливості' ? '#features' : '#'} 
                                                className="text-gray-300 hover:text-amber-400 transition-colors text-sm"
                                                whileHover={{ x: 5 }}
                                            >
                                                {item}
                                            </motion.a>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <motion.h3 
                                    className="text-white text-sm font-semibold tracking-wider uppercase"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Підтримка
                                </motion.h3>
                                <ul className="mt-4 space-y-2">
                                    {['Документація', 'Посібники', 'API', 'Контакти'].map((item, index) => (
                                        <motion.li
                                            key={item}
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                        >
                                            <motion.a 
                                                href="#" 
                                                className="text-gray-300 hover:text-amber-400 transition-colors text-sm"
                                                whileHover={{ x: 5 }}
                                            >
                                                {item}
                                                </motion.a>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <motion.div 
                            className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6 }}
                        >
                            <motion.p 
                                className="text-gray-400 text-sm"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6 }}
                            >
                                &copy; {new Date().getFullYear()} TaskFlow. Усі права захищені.
                            </motion.p>
                            <motion.div 
                                className="mt-4 md:mt-0 flex space-x-6"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.8 }}
                            >
                                <motion.a 
                                    href="#" 
                                    className="text-gray-400 hover:text-amber-400 transition-colors text-sm"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    Політика конфіденційності
                                </motion.a>
                                <motion.a 
                                    href="#" 
                                    className="text-gray-400 hover:text-amber-400 transition-colors text-sm"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    Умови використання
                                </motion.a>
                            </motion.div>
                        </motion.div>

                        {/* Floating back to top button */}
                        <motion.button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-amber-500 text-white shadow-lg hover:bg-amber-600 transition-colors"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        </motion.button>
                    </div>
                </motion.footer>
            </div>
        </>
    );
}
                                       