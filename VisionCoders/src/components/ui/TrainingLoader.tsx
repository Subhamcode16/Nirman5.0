import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Brain, Database, Sparkles, CheckCircle } from 'lucide-react';

const steps = [
    { icon: Database, text: "Ingesting Knowledge...", color: "text-blue-500" },
    { icon: Brain, text: "Building Neural Pathways...", color: "text-purple-500" },
    { icon: Sparkles, text: "Finalizing Study Buddy...", color: "text-yellow-500" },
];

export default function TrainingLoader({ onComplete }: { onComplete: () => void }) {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev >= steps.length - 1) {
                    clearInterval(timer);
                    setTimeout(onComplete, 1000); // Wait a bit after last step
                    return prev;
                }
                return prev + 1;
            });
        }, 2000); // 2 seconds per step

        return () => clearInterval(timer);
    }, [onComplete]);

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="relative w-24 h-24 mb-8">
                {/* Pulsing Background */}
                <motion.div
                    className="absolute inset-0 bg-blue-100 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Active Icon */}
                <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full shadow-lg border-2 border-blue-50">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            index === currentStep && (
                                <motion.div
                                    key={index}
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 180 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                >
                                    <Icon className={`w-10 h-10 ${step.color}`} />
                                </motion.div>
                            )
                        );
                    })}
                </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">Training Your Bot</h3>

            <div className="space-y-3 w-full max-w-xs">
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                            opacity: index <= currentStep ? 1 : 0.3,
                            x: 0,
                            scale: index === currentStep ? 1.05 : 1
                        }}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${index === currentStep ? 'bg-gray-50 border border-gray-200 shadow-sm' : ''
                            }`}
                    >
                        {index < currentStep ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                            <div className={`w-5 h-5 rounded-full border-2 ${index === currentStep ? 'border-blue-500 border-t-transparent animate-spin' : 'border-gray-200'}`} />
                        )}
                        <span className={`text-sm font-medium ${index === currentStep ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.text}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
