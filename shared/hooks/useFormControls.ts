import React, {useState} from 'react';

interface IFormControls<T> {
  updateFieldString: (field: keyof T, autoSave?: boolean) => (value: string) => void;
  updateField: (
    field: keyof T,
    autoSave?: boolean
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const useFormControls = <T>(data: T, onSubmit?: (data: T) => void): [T, IFormControls<T>] => {
  const [formData, commitFormData] = useState(data);

  const updateFieldString = (field: keyof T, autoSave = true) => (value: string) => {
    commitFormData((e) => {
      const newFormData = {...e, [field]: value};

      if (autoSave) {
        onSubmit?.(newFormData);
      }

      return newFormData;
    });
  };

  const updateField = (field: keyof T, autoSave = false) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateFieldString(field, autoSave)(event.target.value);
  };

  return [formData, {updateFieldString, updateField}];
};
