import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cities } from "../data/cities";
import { Button } from "./button";

interface ComboBoxProps {
    id?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    className?: string;
}

export function ComboBox({
    id,
    placeholder,
    onChange,
    className,
}: ComboBoxProps) {
    const [open, setOpen] = React.useState(false);
    const [selectedCity, setSelectedCity] = React.useState<string | null>(null);
    const [inputValue, setInputValue] = React.useState("");

    const handleSelect = (city: string) => {
        setSelectedCity(city);
        setInputValue(city);
        setOpen(false);
        if (onChange) {
            onChange(city);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between text-left",
                        className
                    )}
                >
                    {selectedCity ? (
                        selectedCity
                    ) : (
                        <span className="text-muted-foreground">
                            {placeholder}
                        </span>
                    )}
                    <span className="ml-auto">
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                    <CommandInput
                        placeholder={placeholder}
                        value={inputValue}
                        onValueChange={(value) => {
                            setInputValue(value);
                            setOpen(true);
                        }}
                    />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {cities
                                .filter((city) =>
                                    city
                                        .toLowerCase()
                                        .includes(inputValue.toLowerCase())
                                )
                                .map((city) => (
                                    <CommandItem
                                        key={city}
                                        onSelect={() => handleSelect(city)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedCity === city
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {city}
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
