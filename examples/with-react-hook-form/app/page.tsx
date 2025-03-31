"use client";

import { SignupForm } from "@/components/SignupForm";
import { AssistantSidebar } from "@/components/ui/assistant-ui/assistant-sidebar";
import { Form } from "@/components/ui/form";
import { useAssistantForm } from "@assistant-ui/react-hook-form";
import { useAssistantInstructions } from "@assistant-ui/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBagIcon } from "lucide-react";

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
  useAssistantInstructions("Help users sign up for Simon's hackathon.");
  const form = useAssistantForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      cityAndCountry: "",
      projectIdea: "",
      proficientTechnologies: "",
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
            <div>
              <h1 className="mb-2 text-2xl font-semibold">
                Simon&apos;s Hackathon
              </h1>
              <p>
                I&apos;m hosting a Hackathon on AI UX. Be the first to get an
                invite!
              </p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="flex items-center gap-2">
                <ShoppingBagIcon className="h-4 w-4" />
                查看产品
              </Button>
            </Link>
          </div>

          <div className="my-4 font-bold">
            Built with{" "}
            <Link
              href="https://github.com/assistant-ui/assistant-ui"
              className="text-blue-600 underline"
            >
              assistant-ui
            </Link>
            .
          </div>

          <Form {...(form as any)}>
            <SignupForm />
          </Form>
        </main>
      </div>
    </AssistantSidebar>
  );
}
