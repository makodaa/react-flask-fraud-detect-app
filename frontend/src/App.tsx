import "./App.css";
import { AppForm } from "./components/composite/appform";
import { PageHeader } from "./components/composite/pageheader";

function App() {
    return (
        <>
            <main className="flex flex-col min-h-screen w-full">
                <div className="flex flex-col w-full h-full bg-gray-100">
                    <PageHeader />
                    <div className="flex-grow">
                        <div className="w-full grid grid-cols-2 gap-0">
                            <AppForm className="col p-3" />
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default App;
