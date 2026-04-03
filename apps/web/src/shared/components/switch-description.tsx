import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel,
} from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';

export interface SwitchDescriptionProps extends React.ComponentProps<
    typeof Switch
> {
    id: string;
    label: string;
    description: string;
}

export function SwitchDescription({
    id,
    label,
    description,
    ...props
}: SwitchDescriptionProps) {
    return (
        <Field orientation="horizontal" className="max-w-sm items-center">
            <FieldContent>
                <FieldLabel htmlFor={id}>{label}</FieldLabel>
                <FieldDescription className="text-xs">
                    {description}
                </FieldDescription>
            </FieldContent>
            <Switch id={id} {...props} />
        </Field>
    );
}
