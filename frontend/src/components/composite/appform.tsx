// import { useState } from "react";
// import * as React from "react";
// import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ComboBox } from "../ui/combobox";
import { useState } from "react";
import axios from "axios";
import { Separator } from "../ui/separator";

interface FormProps {
    className?: string;
    onSubmit?: (data: any) => void; // Changed from () => void to (data: any) => void
}

interface PayeeInformation {
    homeAddress: string | null;
    averageSpending: number | null;
}
interface TransactionInformation {
    orderAmount: number | null;
    orderAddress: string | null;
    paymentMode: string | null;
    personLocation: string | null;
    isFirstTime: boolean;
}

export function AppForm({ className, onSubmit }: FormProps) {
    const [distanceFromHome, setDistanceFromHome] = useState<number | null>(
        null
    );
    const [distanceFromLastTransaction, setDistanceFromLastTransaction] =
        useState<number | null>(null);

    // Payee Information
    const [payeeInformation, setPayeeInformation] = useState<PayeeInformation>({
        homeAddress: null,
        averageSpending: 0,
    });

    // Transaction Information
    const [transactionInformation, setTransactionInformation] =
        useState<TransactionInformation>({
            orderAmount: null,
            orderAddress: null,
            personLocation: null,
            paymentMode: null,
            isFirstTime: false,
        });

    // Add these state variables after your other useState declarations
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    // Add this handler for numeric input validation
    const handleNumberInput = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: Function,
        field: string
    ) => {
        const value = e.target.value;
        // Only allow digits and decimal point
        if (value === "" || /^\d+(\.\d*)?$/.test(value)) {
            setter((prev: any) => ({
                ...prev,
                [field]: value === "" ? null : parseFloat(value),
            }));
        }
    };

    // Update with a proper API-based distance calculation
    const calculateDistance = async (origin: string, destination: string) => {
        // Prevent API calls with empty values
        if (
            !payeeInformation.homeAddress ||
            !transactionInformation.orderAddress
        ) {
            console.error("Home address or order address is missing");
            return null;
        }

        try {
            // Try the API call first with a CORS proxy
            const apiKey = import.meta.env.VITE_DISTANCE_AI_API_KEY;
            const originUri = encodeURIComponent(origin);
            const destinationUri = encodeURIComponent(destination);

            // Use alternative CORS proxy
            const corsProxyUrl = "https://api.allorigins.win/raw?url=";
            const apiUrl = `https://api-v2.distancematrix.ai/maps/api/distancematrix/json?origins=${originUri}&destinations=${destinationUri}&key=${apiKey}`;
            const proxiedUrl = `${corsProxyUrl}${encodeURIComponent(apiUrl)}`;

            console.log("Attempting distance calculation via API...");
            const response = await axios.get(proxiedUrl);
            const data = response.data;

            if (
                data.rows &&
                data.rows[0].elements &&
                data.rows[0].elements[0].status === "OK" &&
                data.rows[0].elements[0].distance
            ) {
                const distanceValue =
                    data.rows[0].elements[0].distance.value / 1000; // Convert to kilometers
                console.log(
                    "API distance calculation successful:",
                    distanceValue
                );
                return distanceValue;
            } else {
                console.warn(
                    "API returned invalid format, using fallback method:",
                    data
                );
                // Fallback to basic calculation if API fails
                return fallbackDistanceCalculation(origin, destination);
            }
        } catch (error) {
            console.error("Error fetching distance from API:", error);
            console.log("Falling back to basic distance calculation...");
            return fallbackDistanceCalculation(origin, destination);
        }
    };

    // Move the hard-coded distance logic to a fallback function
    const fallbackDistanceCalculation = (
        origin: string,
        destination: string
    ) => {
        try {
            // Create keys for lookup by normalizing city names
            const city1 = origin?.toLowerCase().trim().split(",")[0] || "";
            const city2 = destination?.toLowerCase().trim().split(",")[0] || "";

            console.log(
                `Fallback: Calculating distance between ${city1} and ${city2}`
            );

            // Simple check: if cities are the same, distance is minimal
            if (city1 === city2) {
                const distanceValue = 5; // Default small distance for same city
                return distanceValue;
            } else {
                // Just a reasonable default distance for testing purposes
                // In production, this should be replaced with a more accurate method
                const distanceValue = 500; // Default large distance for different cities
                return distanceValue;
            }
        } catch (err) {
            console.error("Error in fallback distance calculation:", err);
            return 250; // Last resort default
        }
    };

    // Replace your existing handleSubmit with this improved version
    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        // Validate required fields
        if (
            !payeeInformation.homeAddress ||
            payeeInformation.averageSpending === null ||
            !transactionInformation.orderAmount ||
            !transactionInformation.orderAddress ||
            !transactionInformation.paymentMode ||
            !transactionInformation.personLocation
        ) {
            console.log(payeeInformation, transactionInformation);
            alert("Please fill in all required fields");
            return;
        }

        const calculatedDistanceFromHome = await calculateDistance(
            payeeInformation.homeAddress,
            transactionInformation.orderAddress
        );
        const calculatedDistanceFromTransaction = await calculateDistance(
            transactionInformation.personLocation,
            transactionInformation.orderAddress
        );

        setDistanceFromHome(calculatedDistanceFromHome);
        setDistanceFromLastTransaction(calculatedDistanceFromTransaction);

        if (calculatedDistanceFromHome === null) {
            alert(
                "Could not calculate distance between addresses. Please check the addresses and try again."
            );
            return;
        }

        // Create data object with all form data and calculated distance
        const formData = {
            payeeInformation: {
                ...payeeInformation,
            },
            transactionInformation: {
                ...transactionInformation,
            },
            distance_from_home: calculatedDistanceFromHome,
            distance_from_last_transaction: calculatedDistanceFromTransaction,
        };

        console.log("Form data to be submitted:", formData);

        // Set the submitted data and flag for the FormResult component
        setIsSubmitted(true);

        // Call the onSubmit callback with the formData if provided
        if (onSubmit) {
            onSubmit(formData); // Pass the formData to the onSubmit callback
        }
    }

    // Update the return statement with a side-by-side layout
    return (
        <div className={`${className} w-full max-w-full overflow-visible`}>
            <div className="w-full">
                <form
                    onSubmit={handleSubmit}
                    className="w-full overflow-visible"
                >
                    <div className="grid w-full items-center gap-4">
                        {/* Payee Information text element */}
                        <div className="text-lg font-semibold text-gray-700">
                            Payee Information
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="home">Home Address</Label>
                            <ComboBox
                                id="home"
                                placeholder="Home Address"
                                onChange={(value: string) =>
                                    setPayeeInformation((prev) => ({
                                        ...prev,
                                        homeAddress: value,
                                    }))
                                }
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="median_spending">
                                Average Spending
                            </Label>
                            <Input
                                id="cost"
                                placeholder="00.00"
                                value={payeeInformation.averageSpending ?? ""}
                                onChange={(e) =>
                                    handleNumberInput(
                                        e,
                                        setPayeeInformation,
                                        "averageSpending"
                                    )
                                }
                            />
                        </div>
                        <Separator />
                        <div className="text-lg font-semibold text-gray-700">
                            Transaction Information
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="order">Order Amount</Label>
                            <Input
                                id="order"
                                placeholder="00.00"
                                value={transactionInformation.orderAmount ?? ""}
                                onChange={(e) =>
                                    handleNumberInput(
                                        e,
                                        setTransactionInformation,
                                        "orderAmount"
                                    )
                                }
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="payment_mode">Payment Mode</Label>
                            <RadioGroup
                                value={transactionInformation.paymentMode || ""}
                                className="flex flex-col space-y-1"
                                onValueChange={(value) =>
                                    setTransactionInformation((prev) => ({
                                        ...prev,
                                        paymentMode: value,
                                    }))
                                }
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="chip" id="chip" />
                                    <Label htmlFor="chip">Chip</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="pin" id="pin" />
                                    <Label htmlFor="pin">PIN</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="online"
                                        id="online"
                                    />
                                    <Label htmlFor="online">Online</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="orderAddress">Order Address</Label>
                            <ComboBox
                                id="orderAddress"
                                placeholder="Order Address"
                                onChange={(value: string) =>
                                    setTransactionInformation((prev) => ({
                                        ...prev,
                                        orderAddress: value,
                                    }))
                                }
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="location">
                                Location During Transaction
                            </Label>
                            <ComboBox
                                id="location"
                                placeholder="Location"
                                onChange={(value: string) =>
                                    setTransactionInformation((prev) => ({
                                        ...prev,
                                        personLocation: value,
                                    }))
                                }
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="first_time">First Time Buyer</Label>
                            <RadioGroup
                                value={
                                    transactionInformation.isFirstTime
                                        ? "yes"
                                        : "no"
                                }
                                className="flex flex-col space-y-1"
                                onValueChange={(value) =>
                                    setTransactionInformation((prev) => ({
                                        ...prev,
                                        isFirstTime: value === "yes",
                                    }))
                                }
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="yes"
                                        id="first_time_yes"
                                    />
                                    <Label htmlFor="first_time_yes">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="no"
                                        id="first_time_no"
                                    />
                                    <Label htmlFor="first_time_no">No</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        {distanceFromHome !== null && !isSubmitted && (
                            <div className="flex flex-col space-y-1.5">
                                <Label>Distance from Home</Label>
                                <div className="p-2 bg-gray-100 rounded">
                                    <span className="font-semibold">
                                        {distanceFromHome.toFixed(2)} km
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    This is the calculated distance between home
                                    address and order address
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end w-full mt-8 mb-8">
                        <button
                            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 shadow-sm"
                            type="submit"
                            id="submit-button"
                        >
                            Submit Transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
