
import { FC } from "react";
import { VoiceInput } from "./VoiceInput";
import { ThreadPrimitive, ComposerPrimitive } from "@assistant-ui/react";
import { SendHorizontal } from "lucide-react";
import { Thread } from "@assistant-ui/react-ui";

// 自定义Composer组件，添加语音输入按钮
const CustomComposer: FC = () => {
  return (
    <ComposerPrimitive.Root className="flex w-full items-center rounded-lg border p-0.5 transition-shadow focus-within:shadow-sm">
      <VoiceInput className="m-2 flex h-8 w-8 items-center justify-center" />
      <ComposerPrimitive.Input
        rows={1}
        autoFocus
        placeholder="输入消息或开始语音对话..."
        className="flex-grow resize-none bg-transparent p-3.5 text-sm outline-none"
      />
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send className="bg-foreground m-2 flex h-8 w-8 items-center justify-center rounded-md shadow transition-opacity disabled:opacity-10">
          <SendHorizontal className="text-background size-4" />
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel className="border-foreground m-2 flex h-8 w-8 items-center justify-center rounded-md border shadow">
          <div className="bg-foreground size-2 rounded-[1px]" />
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </ComposerPrimitive.Root>
  );
};

// 自定义欢迎组件
const CustomWelcome: FC = () => {
  return (
    <div className="mb-6 mt-8 max-w-[42rem] px-4 text-center">
      <h3 className="mb-2 text-lg font-medium">您好！我是您的电商助手</h3>
      <p className="text-sm text-gray-500">
        我可以帮您购物和填写表单。现在您还可以通过语音与我交流，点击左下角的麦克风图标开始。
      </p>
    </div>
  );
};

// 自定义Thread组件实现
export const CustomThread: FC = () => {
  return (
    <div className="grid h-full grid-rows-[1fr_auto]">
      <div className="min-h-0 overflow-y-auto">
        <Thread
          components={{
            ThreadWelcome: CustomWelcome,
            Composer: () => null, // 禁用Thread内置的Composer
          }}
        />
      </div>

      <div className="bg-background w-full border-t p-4">
        <div className="mx-auto w-[calc(100%-32px)] max-w-[42rem]">
          <CustomComposer />
        </div>
      </div>
    </div>
  );
};


