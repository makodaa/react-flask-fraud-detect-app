import "./App.css";
import { AppForm } from "./components/composite/appform";
import { PageHeader } from "./components/composite/pageheader";
import { FormResult } from "./components/composite/formResult";
import {useState} from 'react';

function App() {

    const [showResults, setShowResults] = useState(false);

    const handleFormSubmit = () => {
        setShowResults(true);
    };

    return (
        <>
            <main className="flex flex-col min-h-screen w-full">
                <div className="flex flex-col w-full h-full bg-gray-100">
                    <PageHeader />
                    <div className="flex-grow">
                        <div className="w-full grid grid-cols-2 gap-0">
                        <AppForm className="col p-3" onSubmit={handleFormSubmit} />
                        {showResults && <FormResult className="col p-3" />}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default App;
