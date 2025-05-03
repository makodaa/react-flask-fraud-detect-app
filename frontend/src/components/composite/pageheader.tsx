export const PageHeader = () => {
    return (
        <header className="bg-white shadow">
            <div className="container px-4 py-3">
                <p className="text-lg font-bold text-gray-800">
                    [ Final Project ] Card Fraud Classification
                </p>
                <p className="text-gray-600">
                    The following web application makes use of the Random Forest
                    algorithm to classify credit card transactions as fraudulent
                    or non-fraudulent.
                </p>
            </div>
        </header>
    );
};
