import { useState, useEffect } from "react";
import axios from "axios";

interface FormProps {
    className?: string;
    formData?: any;
    isSubmitted?: boolean;
}

interface PredictionResult {
    fraudulent: boolean;
    confidence: number;
    feature_importance: Record<string, number>;
    processed_features: Record<string, any>;
    tree_visualization: string | null; // Base64 encoded image or null
}

export function FormResult({ className, formData, isSubmitted }: FormProps) {
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrediction = async () => {
            if (formData && isSubmitted) {
                setLoading(true);
                setError(null);

                try {
                    const response = await axios.post(
                        "http://localhost:5000/api/classify",
                        formData
                    );
                    setResult(response.data);
                } catch (err) {
                    console.error("Error fetching prediction:", err);
                    setError("Failed to get prediction. Please try again.");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchPrediction();
    }, [formData, isSubmitted]);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center h-full">
                <div className="flex items-center justify-center">
                    <div className="text-lg text-gray-500">
                        Analyzing transaction...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="text-lg font-semibold text-red-600">
                        Analysis Error
                    </div>
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    if (!result) {
        return null; // Don't show anything before submission
    }

    return (
        <div
            className={`bg-white rounded-lg shadow-sm p-6 overflow-auto ${
                className || ""
            }`}
        >
            <h2 className="text-xl font-bold mb-6">
                Transaction Analysis Results
            </h2>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Classification Result */}
                    <div
                        className={`p-4 rounded-lg border-l-4 border-solid 
                        ${
                            result.fraudulent
                                ? "border-red-500 bg-red-50"
                                : "border-green-500 bg-green-50"
                        }`}
                    >
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">
                            Classification
                        </h3>
                        <div
                            className={`text-2xl font-bold ${
                                result.fraudulent
                                    ? "text-red-600"
                                    : "text-green-600"
                            }`}
                        >
                            {result.fraudulent
                                ? "⚠️ Fraudulent"
                                : "✅ Not Fraudulent"}
                        </div>
                        <div
                            className={`mt-2 text-sm ${
                                result.fraudulent
                                    ? "text-red-500"
                                    : "text-green-500"
                            }`}
                        >
                            {result.fraudulent
                                ? "This transaction has been flagged as potentially fraudulent"
                                : "This transaction appears to be legitimate"}
                        </div>
                    </div>

                    {/* Confidence Level */}
                    <div className="p-4 rounded-lg bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">
                            Confidence Level
                        </h3>
                        <div className="flex items-end gap-2">
                            <div className="text-2xl font-bold">
                                {result.confidence}%
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                            <div
                                className={`h-2.5 rounded-full ${
                                    result.fraudulent
                                        ? "bg-red-500"
                                        : "bg-green-500"
                                }`}
                                style={{ width: `${result.confidence}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Transaction Details */}
                <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">
                        Transaction Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <p className="text-sm text-gray-500">
                                Distance from Home
                            </p>
                            <div className="p-2 bg-gray-100 rounded">
                                <span className="font-medium">
                                    {formData.distance_from_home.toFixed(2)} km
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <p className="text-sm text-gray-500">
                                Payment Method
                            </p>
                            <div className="p-2 bg-gray-100 rounded">
                                <span className="font-medium capitalize">
                                    {
                                        formData.transactionInformation
                                            .paymentMode
                                    }
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <p className="text-sm text-gray-500">
                                Transaction Amount
                            </p>
                            <div className="p-2 bg-gray-100 rounded">
                                <span className="font-medium">
                                    ₱
                                    {formData.transactionInformation.orderAmount?.toFixed(
                                        2
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex flex-col space-y-1.5">
                            <p className="text-sm text-gray-500">
                                First Time Buyer
                            </p>
                            <div className="p-2 bg-gray-100 rounded">
                                <span className="font-medium">
                                    {formData.transactionInformation.isFirstTime
                                        ? "Yes"
                                        : "No"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
