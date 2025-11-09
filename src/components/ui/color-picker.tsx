"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
    const [isValidHex, setIsValidHex] = useState(true);

    return (
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-20 h-10 p-1"
                    >
                        <div className="w-full h-full rounded" style={{ backgroundColor: value }} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                    <HexColorPicker color={value} onChange={onChange} />
                </PopoverContent>
            </Popover>
            <Input
                type="text"
                value={value}
                onChange={(e) => {
                    const newColor = e.target.value;
                    const isValid = /^#[0-9A-Fa-f]{6}$/.test(newColor);
                    setIsValidHex(isValid || newColor.length < 7); // Allow partial input

                    if (/^#[0-9A-Fa-f]{0,6}$/.test(newColor)) {
                        onChange(newColor);
                    }
                }}
                placeholder="#6366f1"
                className={cn(
                    "flex-1 font-mono",
                    !isValidHex && "border-destructive focus-visible:ring-destructive"
                )}
                maxLength={7}
            />
        </div>
    );
}
