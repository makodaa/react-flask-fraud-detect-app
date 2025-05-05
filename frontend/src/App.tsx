import "./App.css";
import { AppForm } from "./components/composite/appform";
import { PageHeader } from "./components/composite/pageheader";
import { FormResult } from "./components/composite/formResult";
import { useState } from 'react';

function App() {
    const [showResults, setShowResults] = useState(false);
    const [formData, setFormData] = useState(null);

    const handleFormSubmit = (data: any) => {
        setFormData(data);
        setShowResults(true);
    };

    return (
        <>
            <main className="flex flex-col min-h-screen w-full">
                <div className="flex flex-col w-full h-full bg-gray-100">
                    <PageHeader />
                    <div className="flex-grow p-4">
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AppForm 
                                className="bg-white rounded-lg shadow-sm p-6" 
                                onSubmit={handleFormSubmit} 
                            />
                            <div className="h-full">
                                {showResults && formData ? (
                                    <FormResult 
                                        className="h-full" 
                                        formData={formData} 
                                        isSubmitted={showResults}
                                    />
                                ) : (
                                    <div className="h-full flex items-center justify-center bg-white rounded-lg shadow-sm p-8 text-gray-400">
                                        <div className="text-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <h3 className="text-lg font-medium">No Results Yet</h3>
                                            <p className="mt-2">Submit the form to see fraud detection analysis</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default App;
