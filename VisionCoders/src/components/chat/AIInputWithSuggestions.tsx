"use client";

import type { LucideIcon } from "lucide-react";
import {
    Text,
    CheckCheck,
    ArrowDownWideNarrow,
    CornerRightDown,
} from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/components/hooks/use-auto-resize-textarea";

interface ActionItem {
    text: string;
    icon: LucideIcon;
    colors: {
        icon: string;
        border: string;
        bg: string;
    };
}

interface AIInputWithSuggestionsProps {
    id?: string;
    placeholder?: string;
    minHeight?: number;
    maxHeight?: number;
    actions?: ActionItem[];
    defaultSelected?: string;
    onSubmit?: (text: string, action?: string) => void;
    className?: string;
}

const DEFAULT_ACTIONS: ActionItem[] = [
    {
        text: "Summary",
        icon: Text,
        colors: {
            icon: "text-orange-600",
            border: "border-orange-500",
            bg: "bg-orange-100",
        },
    },
    {
        text: "Fix Spelling and Grammar",
        icon: CheckCheck,
        colors: {
            icon: "text-emerald-600",
            border: "border-emerald-500",
            bg: "bg-emerald-100",
        },
    },
    {
        text: "Make shorter",
        icon: ArrowDownWideNarrow,
        colors: {
            icon: "text-purple-600",
            border: "border-purple-500",
            bg: "bg-purple-100",
        },
    },
];

export function AIInputWithSuggestions({
    id = "ai-input-with-actions",
    placeholder = "Enter your text here...",
    minHeight = 64,
    maxHeight = 200,
    actions = DEFAULT_ACTIONS,
    defaultSelected,
    onSubmit,
    className
}: AIInputWithSuggestionsProps) {
    const [inputValue, setInputValue] = useState("");
    const [selectedItem, setSelectedItem] = useState<string | null>(defaultSelected ?? null);

    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight,
        maxHeight,
    });

    /**
     * Check if action should auto-send (doesn't need text input)
     */
    const shouldAutoSend = (action: string): boolean => {
        const autoSendActions = ['Summary', 'Quiz me', 'Short notes'];
        return autoSendActions.includes(action);
    };

    /**
     * Get default command text for an action
     */
    const getDefaultCommandText = (action: string): string => {
        const commandMap: Record<string, string> = {
            'Summary': 'summarize',
            'Quiz me': 'quiz',
            'Short notes': 'short notes',
            'Explain': 'explain',
        };
        return commandMap[action] || action.toLowerCase();
    };

    /**
     * Toggle action selection and auto-send if applicable
     */
    const toggleItem = (itemText: string) => {
        const newSelection = selectedItem === itemText ? null : itemText;
        setSelectedItem(newSelection);

        // Auto-send for commands that don't need text
        if (newSelection && shouldAutoSend(newSelection)) {
            const commandText = getDefaultCommandText(newSelection);
            onSubmit?.(commandText, newSelection);
            setSelectedItem(null); // Clear selection after auto-send
        }
    };

    const currentItem = selectedItem
        ? actions.find((item) => item.text === selectedItem)
        : null;

    /**
     * Handle form submission
     */
    const handleSubmit = () => {
        // Allow submission with text OR with selected action
        if (inputValue.trim() || selectedItem) {
            const text = inputValue.trim() || getDefaultCommandText(selectedItem!);
            onSubmit?.(text, selectedItem ?? undefined);
            setInputValue("");
            setSelectedItem(null);
            adjustHeight(true);
        }
    };

    return (
        <div className={cn("w-full py-4", className)}>
            <div className="relative max-w-xl w-full mx-auto">
                <div className="relative border border-black/10 dark:border-white/10 focus-within:border-black/20 dark:focus-within:border-white/20 rounded-2xl bg-black/5 dark:bg-white/5 backdrop-blur-sm transition-colors duration-200">
                    <div className="flex flex-col">
                        <div
                            className="overflow-y-auto"
                            style={{ maxHeight: `${maxHeight - 48}px` }}
                        >
                            <Textarea
                                ref={textareaRef}
                                id={id}
                                placeholder={placeholder}
                                className={cn(
                                    "max-w-xl w-full rounded-2xl pr-10 pt-3 pb-3 placeholder:text-gray-500 dark:placeholder:text-white/40 border-none focus:ring text-gray-900 dark:text-white resize-none text-wrap bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 leading-[1.2]",
                                    `min-h-[${minHeight}px]`
                                )}
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                    adjustHeight();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                            />
                        </div>

                        <div className="h-12 bg-transparent">
                            {currentItem && (
                                <div className="absolute left-3 bottom-3 z-10">
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        className={cn(
                                            "inline-flex items-center gap-1.5",
                                            "border shadow-sm rounded-md px-2 py-0.5 text-xs font-medium",
                                            "animate-fadeIn hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200",
                                            currentItem.colors.bg,
                                            currentItem.colors.border
                                        )}
                                    >
                                        <currentItem.icon
                                            className={`w-3.5 h-3.5 ${currentItem.colors.icon}`}
                                        />
                                        <span
                                            className={currentItem.colors.icon}
                                        >
                                            {selectedItem}
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <CornerRightDown
                        className={cn(
                            "absolute right-3 top-3 w-4 h-4 transition-all duration-200 text-gray-400 dark:text-white/50",
                            inputValue
                                ? "opacity-100 scale-100"
                                : "opacity-30 scale-95"
                        )}
                    />
                </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2 max-w-xl mx-auto justify-start px-1">
                {actions.filter((item) => item.text !== selectedItem).map(
                    ({ text, icon: Icon, colors }) => (
                        <button
                            type="button"
                            key={text}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-full",
                                "border transition-all duration-200",
                                "border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
                                "flex-shrink-0"
                            )}
                            onClick={() => toggleItem(text)}
                        >
                            <div className="flex items-center gap-1.5">
                                <Icon className={cn("h-3.5 w-3.5 opacity-70", colors.icon)} />
                                <span className="whitespace-nowrap">
                                    {text}
                                </span>
                            </div>
                        </button>
                    )
                )}
            </div>
        </div>
    );
}
