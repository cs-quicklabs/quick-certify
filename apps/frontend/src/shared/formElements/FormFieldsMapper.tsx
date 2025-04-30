import React, { useEffect, useState } from 'react';
import InputField from './InputField';
import { Path, useForm, UseFormReset, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TypeOf, z } from 'zod';
import { FieldConfig, TFieldTrigger } from '../types/formTypes';
import ImageInput from './ImageInput';
import { Loader } from '../components/UIElements';
import { AxiosSuccessResponse } from '@/apiServices/axios';
import { FileUploadResponse } from '../types/utilTypes';
import en from '@/constants/lang/en';

interface Props<T extends z.ZodTypeAny> {
  readonly fields: (FieldConfig | FieldConfig[])[];
  readonly schema: T;
  readonly onSubmit: (
    data: z.infer<T>,
    reset?: UseFormReset<TypeOf<T>>
  ) => void;
  readonly buttonDisabled?: boolean;
  readonly buttonText?: string;
  readonly bigButton?: boolean;
  readonly methods?: UseFormReturn<z.TypeOf<T>>;
  readonly isLoading?: boolean;
  readonly resetFormOnSubmit?: boolean;
  readonly mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
  readonly onChangeImage?: (
    res: AxiosSuccessResponse<FileUploadResponse> | undefined
  ) => void;
  readonly id?: string;
  readonly cancelButton?: () => void;
  readonly triggers?: TFieldTrigger[];
}

function FormFieldsMapper<T extends z.ZodTypeAny>({
  fields,
  schema,
  onSubmit,
  buttonText = 'Submit',
  buttonDisabled = false,
  bigButton = false,
  isLoading = false,
  methods,
  resetFormOnSubmit = false,
  mode = 'onChange',
  onChangeImage,
  id,
  cancelButton,
  triggers,
}: Props<T>) {
  // Call useForm unconditionally
  const defaultMethods = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode,
  });
  const [resetState, setResetState] = useState(false);

  // Use methods if provided, otherwise fall back to defaultMethods
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    getValues,
    reset,
    formState: { errors, isValid, isDirty },
  } = methods || defaultMethods;

  const handleFormSubmit = (data: z.infer<T>) => {
    onSubmit(data, reset);
    if (resetFormOnSubmit) {
      reset();
      setResetState(true); // Trigger reset for InputField components
      setTimeout(() => setResetState(false), 0); // Reset the state back to false
    }
  };
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (triggers && triggers.length > 0) {
        const customTrigger = triggers.find((item) => item.name === name);

        const allTriggersAreValid =
          customTrigger?.triggers?.every((ele) => value?.[ele].length > 0) ??
          false;

        if (
          customTrigger?.triggers &&
          name === customTrigger.name &&
          allTriggersAreValid
        ) {
          trigger((customTrigger.triggers as Path<TypeOf<T>>[]) ?? []);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, trigger, triggers]);

  return (
    <>
      <div className="mb-2">
        {fields.map((field) => {
          if (!Array.isArray(field) && field.type === 'image')
            return (
              <ImageInput
                key={field.label}
                watch={watch}
                setValue={setValue}
                name={field.name}
                src={
                  getValues(
                    field.name as unknown as readonly Path<TypeOf<T>>[]
                  ) as unknown as string
                }
                imageType={field?.image_type ?? 'misc'}
                label={field.label}
                firstName={field.firstName}
                lastName={field.lastName}
                onChangeImage={onChangeImage}
              />
            );
        })}
      </div>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4"
        noValidate
      >
        {fields.map((field) => {
          if (Array.isArray(field)) {
            return (
              <div
                key={field[0].name}
                className="flex gap-4 mb-0"
              >
                {field.map((item) => (
                  <InputField
                    key={item.name}
                    label={item.label}
                    name={item.name}
                    type={item.type}
                    placeholder={item.placeholder ?? ''}
                    options={item.options}
                    height={item.height}
                    width={item.width}
                    className={item.className}
                    register={register}
                    disabled={isLoading || item.disabled}
                    errorMsg={errors[item.name]?.message as string}
                    id={id}
                  />
                ))}
              </div>
            );
          } else if (field.type !== 'image') {
            return (
              <InputField
                key={field.name}
                label={field.label}
                sub_label={field.sub_label}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder ?? ''}
                options={field.options}
                height={field.height}
                width={field.width}
                className={field.className}
                register={register}
                disabled={isLoading || field.disabled}
                errorMsg={errors[field.name]?.message as string}
                id={id}
                resetState={resetState}
              />
            );
          }
        })}
        <div className="flex flex-wrap mt-4 gap-2">
          <button
            type="submit"
            disabled={buttonDisabled || isLoading || !isValid || !isDirty}
            className={`${bigButton && 'w-full'
              } text-white bg-primary-600 hover:bg-primary-700 flex items-center justify-center focus:ring-4 focus:outline-hidden focus:ring-blue-300 font-medium  text-sm px-5 py-2.5 align-middle disabled:bg-gray-500`}
          >
            {isLoading ? <Loader /> : buttonText}
          </button>
          {cancelButton && (
            <button
              className={`${bigButton && 'w-full'
                } py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-hidden bg-white  border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-1 focus:ring-gray-200`}
              onClick={() => cancelButton()}
              type="button"
              disabled={isLoading}
            >
              {en.common.cancel}
            </button>
          )}
        </div>
      </form>
    </>
  );
}

export default FormFieldsMapper;
