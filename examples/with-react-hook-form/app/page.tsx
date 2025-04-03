"use client";

import { SignupForm } from "@/components/SignupForm";
import { AssistantSidebar } from "@/components/ui/assistant-ui/assistant-sidebar";
import { Form } from "@/components/ui/form";
import { useAssistantForm } from "@assistant-ui/react-hook-form";
import { useAssistantInstructions } from "@assistant-ui/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAssistantTools } from "../lib/useAssistantTool";
import { useEventListeners } from "../lib/evetListener";

const SetFormFieldTool = () => {
  return (
    <p className="text-center font-mono text-sm font-bold text-blue-500">
      set_form_field(...)
      {/* set_form_field(hello) */}
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

export default function Home() {
  useAssistantInstructions("帮助用户填写订单配送信息。");
  useAssistantTools();
  useEventListeners([], undefined);

  const form = useAssistantForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      note: "",
    },
    assistant: {
      tools: {
        set_form_field: {
          render: SetFormFieldTool,
        },
        submit_form: {
          render: SubmitFormTool,
        },
      },
    },
  });

  return (
    <AssistantSidebar>
      <div className="h-full overflow-y-scroll">
        <main className="container py-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/cart">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="mb-2 text-2xl font-semibold">填写配送信息</h1>
                <p>请填写您的收货信息，以便我们为您配送商品</p>
              </div>
            </div>
          </div>

          <Form {...(form as any)}>
            <SignupForm />
          </Form>
        </main>
      </div>
    </AssistantSidebar>
  );
}
