import { useState } from 'react';

interface FormProps {
    className?: string;
}

interface result {
    className?: string;
}

export function FormResult({ className }: FormProps) {
    const [result, setResult] = useState<result>()

    return (<>
        <div className="result-conatiner col p-3">
            <div className="flex flex-col w-full h-full bg-gray-100">
                <div className="grid w-full items-center gap-4">
                    <div className="text-lg font-semibold text-gray-700">
                        Classification:
                    </div>
                    <div className="result-container">
                        <div className="flex flex-col space-y-1.5">
                            Fruadulent
                        </div>
                    </div>
                    <div className="grid w-full items-center gap-4">
                        <div className="text-lg font-semibold text-gray-700">
                            Confidence Level:
                        </div>
                        <div className="percentage-level">
                            <p>%</p>
                        </div>
                    </div>
                    <div className="grid w-full items-center gap-4">
                        <div className="text-lg font-semibold text-gray-700">
                            Decision tree:
                        </div>
                        <div className="container">
                            <p>Puno toh boss</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}