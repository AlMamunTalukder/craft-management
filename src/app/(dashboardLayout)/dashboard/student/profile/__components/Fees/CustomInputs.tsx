/* eslint-disable @typescript-eslint/no-explicit-any */
import CraftIntAutoCompleteWithIcon from "@/components/Forms/AutocompleteWithIcon";
import CraftInput from "@/components/Forms/inputWithIcon";

const stopEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
    }
};

export const CustomCraftInput = ({ onKeyDown, ...props }: any) => (
    <CraftInput
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            stopEnter(e);
            onKeyDown?.(e);
        }}
        {...props}
    />
);

export const CustomCraftIntAutoCompleteWithIcon = ({ onKeyDown, ...props }: any) => (
    <div onKeyDown={(e) => { stopEnter(e); onKeyDown?.(e); }}>
        <CraftIntAutoCompleteWithIcon {...props} />
    </div>
);