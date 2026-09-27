import Input from '../common/Input';
import Select from '../common/Select';

export default function FormField({ field, value, error, onChange }) {
  const commonProps = {
    name: field.name,
    label: field.label,
    value: value ?? '',
    onChange,
    error,
    required: true,
    helperText: field.helperText,
    normalRange: field.normalRange,
    unit: field.unit,
  };

  if (field.type === 'select') {
    return <Select {...commonProps} options={field.options} placeholder={field.placeholder} />;
  }

  return (
    <Input
      {...commonProps}
      type={field.type}
      min={field.min}
      max={field.max}
      step={field.step}
      placeholder={field.placeholder}
    />
  );
}
