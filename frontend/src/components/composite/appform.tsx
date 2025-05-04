// import { useState } from "react";
// import * as React from "react";
// import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "../ui/checkbox";
import { ComboBox } from "../ui/combobox";
import { useState } from "react";
import axios from "axios";
import { Separator } from "../ui/separator";
import { FormResult } from "./formResult";

interface FormProps {
    className?: string;
    onSubmit?: () => void;
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
    const [distance, setDistance] = useState<number | null>(null);

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

    const calculateDistance = async () => {
        const apiKey = import.meta.env.VITE_API_KEY;
        const origin = payeeInformation.homeAddress;
        const destination = transactionInformation.orderAddress;
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${apiKey}`;
        try {
            const response = await axios.get(url);
            const data = response.data;
            if (data.rows && data.rows[0].elements) {
                const distanceValue =
                    data.rows[0].elements[0].distance.value / 1000; // Convert to kilometers
                setDistance(distanceValue);
            } else {
                console.error("Invalid response format:", data);
            }
        } catch (error) {
            console.error("Error fetching distance:", error);
        }
    };

    function handleSubmit(event: any){
        event.preventDefault();
        if (onSubmit) {
            onSubmit();

        }
    }
    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit}>
                <div className="grid w-full items-center gap-4">
                    {/* Payee Information text element */}
                    <div className="text-lg font-semibold text-gray-700">
                        Payee Information
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="home">Home Address</Label>
                        <ComboBox
                            // make component lightmode, className
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
                        <Input id="cost" placeholder="00.00" />
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
                            onChange={(e) =>
                                setTransactionInformation((prev) => ({
                                    ...prev,
                                    orderAmount: parseFloat(e.target.value),
                                }))
                            }
                        />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="payment_mode">Payment Mode</Label>
                        <RadioGroup
                            defaultValue="online"
                            className="flex flex-col space-y-1"
                            onValueChange={(value) =>
                                setTransactionInformation((prev) => ({
                                    ...prev,
                                    paymentMode: value,
                                }))
                            }
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="offline" id="offline" />
                                <Label htmlFor="offline">Offline</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="online" id="online" />
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
                        <Label htmlFor="first_time">First Time User</Label>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="first_time"
                                checked={transactionInformation.isFirstTime}
                                onCheckedChange={(checked) =>
                                    setTransactionInformation((prev) => ({
                                        ...prev,
                                        isFirstTime: checked == true,
                                    }))
                                }
                            />
                            <Label htmlFor="first_time">Yes</Label>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center w-full mt-4">
                    <button 
                        className="bg-primary text-black px-4 py-2 rounded hover:bg-opacity-90" 
                        type="submit">
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
}
