import * as React from "react";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
const buttonVariants = cva("inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background", {
    variants: {
        variant: {
            default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
            destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
            outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
            secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
            ghost: "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
            link: "underline-offset-4 hover:underline text-blue-600",
        },
        size: {
            default: "h-10 py-2 px-4",
            sm: "h-9 px-3 rounded-lg",
            lg: "h-11 px-8 rounded-xl",
            icon: "h-10 w-10",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    return (<button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}/>);
});
Button.displayName = "Button";
export { Button, buttonVariants };
export function Card({ className, ...props }) {
    return <div className={cn("bg-white rounded-2xl border border-slate-200 shadow-sm", className)} {...props}/>;
}
export function CardHeader({ className, ...props }) {
    return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}/>;
}
export function CardTitle({ className, ...props }) {
    return <h3 className={cn("text-lg font-bold leading-none tracking-tight text-slate-900", className)} {...props}/>;
}
export function CardDescription({ className, ...props }) {
    return <p className={cn("text-sm text-slate-500", className)} {...props}/>;
}
export function CardContent({ className, ...props }) {
    return <div className={cn("p-6 pt-0", className)} {...props}/>;
}
export function CardFooter({ className, ...props }) {
    return <div className={cn("flex items-center p-6 pt-0", className)} {...props}/>;
}
export function Badge({ className, variant = "default", ...props }) {
    const variants = {
        default: "bg-blue-600 text-white",
        secondary: "bg-slate-100 text-slate-900",
        destructive: "bg-red-100 text-red-600",
        outline: "border border-slate-200 text-slate-600",
        success: "bg-emerald-100 text-emerald-700",
    };
    return <div className={cn("inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)} {...props}/>;
}
