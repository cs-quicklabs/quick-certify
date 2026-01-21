import { Facebook, Globe, Linkedin, Twitter } from 'lucide-react';

interface FieldIconProps {
    icon?: string;
}

export function FieldIcon({ icon }: FieldIconProps) {
    if (!icon) return null;

    const iconClass = "w-4 h-4 text-gray-500 dark:text-gray-400";
    const wrapperClass = "inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-sm dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600";

    const renderIcon = () => {
        switch (icon) {
            case 'linkedin': return <Linkedin className={iconClass} />;
            case 'facebook': return <Facebook className={iconClass} />;
            case 'twitter': return <Twitter className={iconClass} />;
            case 'globe': return <Globe className={iconClass} />;
            default: return null;
        }
    };

    const Icon = renderIcon();
    if (!Icon) return null;

    return (
        <span className={wrapperClass}>
            {Icon}
        </span>
    );
}
