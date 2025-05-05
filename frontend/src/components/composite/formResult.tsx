import { useState, useEffect } from 'react';
import axios from 'axios';

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
    tree_visualization: string | null;  // Base64 encoded image or null
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
                    const response = await axios.post('http://localhost:5000/api/classify', formData);
                    setResult(response.data);
                } catch (err) {
                    console.error('Error fetching prediction:', err);
                    setError('Failed to get prediction. Please try again.');
                } finally {
                    setLoading(false);
                }
            }
        };
        
        fetchPrediction();
    }, [formData, isSubmitted]);

    if (loading) {
        return (
            <div className="w-full p-6 mt-6 bg-gray-50 rounded-lg shadow-sm animate-pulse">
                <div className="flex items-center justify-center h-40">
                    <div className="text-lg text-gray-500">Analyzing transaction...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full p-6 mt-6 bg-red-50 rounded-lg shadow-sm">
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="text-lg font-semibold text-red-600">Analysis Error</div>
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    if (!result) {
        return null; // Don't show anything before submission
    }

    return (
        <div className={`result-container w-full mt-8 bg-gray-50 rounded-lg shadow-md overflow-hidden ${className || ''}`}>
            <div className="bg-primary p-4">
                <h2 className="text-xl font-bold text-white">Transaction Analysis Results</h2>
            </div>
            
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Classification Result */}
                    <div className={`bg-white rounded-lg shadow p-5 border-l-4 border-solid 
                        ${result.fraudulent ? 'border-red-500' : 'border-green-500'}`}>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Classification</h3>
                        <div className={`text-2xl font-bold ${result.fraudulent ? 'text-red-600' : 'text-green-600'}`}>
                            {result.fraudulent ? '⚠️ Fraudulent' : '✅ Not Fraudulent'}
                        </div>
                        <div className={`mt-2 text-sm ${result.fraudulent ? 'text-red-500' : 'text-green-500'}`}>
                            {result.fraudulent 
                                ? 'This transaction has been flagged as potentially fraudulent' 
                                : 'This transaction appears to be legitimate'}
                        </div>
                    </div>
                    
                    {/* Confidence Level */}
                    <div className="bg-white rounded-lg shadow p-5">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Confidence Level</h3>
                        <div className="flex items-end gap-2">
                            <div className="text-2xl font-bold">{result.confidence}%</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                            <div 
                                className={`h-2.5 rounded-full ${result.fraudulent ? 'bg-red-500' : 'bg-green-500'}`} 
                                style={{width: `${result.confidence}%`}}>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Transaction Details */}
                <div className="mt-6 bg-white rounded-lg shadow p-5">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Transaction Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Distance from Home</p>
                            <p className="font-medium">{formData.distance.toFixed(2)} km</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Payment Method</p>
                            <p className="font-medium capitalize">{formData.transactionInformation.paymentMode}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Transaction Amount</p>
                            <p className="font-medium">₱{formData.transactionInformation.orderAmount?.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                
                {/* Decision Tree Visualization */}
                {result.tree_visualization && (
                    <div className="mt-6 bg-white rounded-lg shadow p-5">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Decision Process Visualization</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            This visualization shows a sample decision tree from the Random Forest model.
                            It illustrates how the algorithm evaluates different features to make a decision.
                        </p>
                        <div className="flex justify-center overflow-x-auto py-2">
                            <img 
                                src={`data:image/png;base64,${result.tree_visualization}`}
                                alt="Decision Tree Visualization" 
                                className="max-w-none"
                                style={{ maxHeight: '500px' }}
                            />
                        </div>
                        <div className="flex justify-center mt-3">
                            <a 
                                href={`data:image/png;base64,${result.tree_visualization}`} 
                                download="decision_tree.png"
                                className="text-primary hover:text-primary-dark text-sm"
                            >
                                Download Visualization
                            </a>
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                            <p>Tips for reading the tree:</p>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                <li>Each node shows the feature and threshold value used for decision</li>
                                <li>Colors indicate the predicted class (fraud/not fraud)</li>
                                <li>Percentages show the proportion of samples in each class</li>
                                <li>Follow the path from top to bottom to see how the algorithm classified this transaction</li>
                            </ul>
                        </div>
                    </div>
                )}
                
                {/* Feature Importance */}
                {result.feature_importance && (
                    <div className="mt-6 bg-white rounded-lg shadow p-5">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Feature Importance</h3>
                        <div className="space-y-3">
                            {Object.entries(result.feature_importance)
                                .sort(([, a], [, b]) => b - a)
                                .map(([feature, importance]) => (
                                    <div key={feature} className="flex flex-col">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium">{feature}</span>
                                            <span className="text-sm font-medium">{(importance * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div 
                                                className="bg-blue-600 h-1.5 rounded-full" 
                                                style={{width: `${importance * 100}%`}}>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}