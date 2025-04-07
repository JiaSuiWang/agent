
import {
  useAssistantRuntime,
  useAssistantToolUI,
  Tool,
  ModelContext,
} from "@assistant-ui/react";
import { useEffect } from "react";
import {
  useForm,
  UseFormReturn,
  FieldValues,
  DefaultValues,
  Path,
  PathValue,
} from "react-hook-form";
import { useCartStore } from "@/lib/store";

const SetFormFieldTool = () => {
  return (
    <p className="text-center font-mono text-sm font-bold text-blue-500">
      set_form_field(...)
    </p>
  );
};

const SubmitFormTool = () => {
  return (
    <p className="text-center font-mono text-sm font-bold text-blue-500">
      submit_form(...)
    </p>
  );
};

export const useFormTools = <TFieldValues extends FieldValues = FieldValues>(
  formDefaultValues: DefaultValues<TFieldValues>,
  setIsSubmitted: (value: boolean) => void,
): UseFormReturn<TFieldValues> => {
  const assistantRuntime = useAssistantRuntime();
  const { clearCart } = useCartStore();

  // Initialize form with default values
  const form = useForm<TFieldValues>({
    defaultValues: formDefaultValues,
  });

  const { control, getValues, setValue } = form;

  useEffect(() => {
    // Form tools config - 直接定义工具逻辑
    const toolsConfig = {
      set_form_field: {
        description: "Set a field value in the form",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the field to set",
            },
            value: {
              type: "string",
              description: "The value to set",
            },
          },
          required: ["name", "value"],
        },
        execute: async (args: { name: string; value: string }) => {
          setValue(
            args.name as Path<TFieldValues>,
            args.value as PathValue<TFieldValues, Path<TFieldValues>>,
          );
          return { success: true };
        },
      } as Tool<any, any>,
      submit_form: {
        description: "Submit the form",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
        execute: async () => {
          // 设置提交状态
          setIsSubmitted(true);

          return {
            success: true,
            message:
              "Order Submitted Successfully! Thank you for your order. We will contact you shortly.",
          };
        },
      } as Tool<any, any>,
    };

    // Form-specific system message
    const systemMessage = `Form State:\n${JSON.stringify(getValues())}`;

    const value: ModelContext = {
      system: systemMessage,
      tools: toolsConfig,
    };

    return assistantRuntime.registerModelContextProvider({
      getModelContext: () => value,
    });
  }, [
    assistantRuntime,
    form,
    setValue,
    control,
    getValues,
    clearCart,
    setIsSubmitted,
  ]);

  // Register form tool UIs
  useAssistantToolUI({
    toolName: "set_form_field",
    render: SetFormFieldTool,
  });

  useAssistantToolUI({
    toolName: "submit_form",
    render: SubmitFormTool,
  });

  return form;
};


