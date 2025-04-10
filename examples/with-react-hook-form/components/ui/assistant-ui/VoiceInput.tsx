
import { useState, useRef, useEffect } from "react";
import { MicIcon, StopCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceInputProps {
  className?: string;
}

export const VoiceInput = ({ className }: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);

  // 清理WebRTC连接
  const cleanupWebRTC = () => {
    if (dataChannel.current) {
      dataChannel.current.close();
    }

    if (peerConnection.current) {
      peerConnection.current.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
      peerConnection.current.close();
    }

    if (audioElement.current) {
      audioElement.current.remove();
      audioElement.current = null;
    }

    peerConnection.current = null;
    dataChannel.current = null;
    setIsRecording(false);
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanupWebRTC();
    };
  }, []);

  // 启动语音模式
  const startVoiceMode = async () => {
    try {
      setIsConnecting(true);

      // 创建WebRTC连接
      const pc = new RTCPeerConnection();
      peerConnection.current = pc;

      // 设置音频元素播放AI的声音
      audioElement.current = document.createElement("audio");
      audioElement.current.autoplay = true;
      audioElement.current.controls = false;
      audioElement.current.style.display = "none";
      document.body.appendChild(audioElement.current);

      // 接收AI的音频
      pc.ontrack = (e) => {
        if (audioElement.current && e.streams[0]) {
          audioElement.current.srcObject = e.streams[0];
        }
      };

      // 创建数据通道
      const dc = pc.createDataChannel("oai-events");
      dataChannel.current = dc;

      // 获取麦克风权限并添加音轨
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => {
        pc.addTransceiver(track, { direction: "sendrecv" });
      });

      // 创建WebRTC offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 发送SDP到服务器 - 注意这里修改为/api/rtc-connect
      const response = await fetch("/api/rtc-connect", {
        method: "POST",
        body: offer.sdp || "",
        headers: {
          "Content-Type": "application/sdp",
        },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // 设置远程描述
      const sdpAnswer = await response.text();
      await pc.setRemoteDescription({
        sdp: sdpAnswer,
        type: "answer",
      });

      // 配置数据通道事件处理
      dc.addEventListener("open", () => {
        setIsConnecting(false);
        setIsRecording(true);

        // 设置会话配置
        const sessionConfig = {
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
          },
        };
        dc.send(JSON.stringify(sessionConfig));
      });

      // 处理数据通道消息
      dc.addEventListener("message", (event) => {
        console.log("收到消息:", JSON.parse(event.data));
      });
    } catch (error) {
      console.error("启动语音模式错误:", error);
      cleanupWebRTC();
      setIsConnecting(false);
    }
  };

  // 停止语音模式
  const stopVoiceMode = () => {
    cleanupWebRTC();
  };

  // 切换语音模式
  const toggleVoiceMode = () => {
    if (isRecording) {
      stopVoiceMode();
    } else {
      startVoiceMode();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={toggleVoiceMode}
      disabled={isConnecting}
      aria-label={isRecording ? "停止语音" : "开始语音"}
      title={isRecording ? "停止语音" : "开始语音"}
    >
      {isRecording ? (
        <StopCircleIcon className="h-5 w-5 text-red-500" />
      ) : (
        <MicIcon
          className={`h-5 w-5 ${isConnecting ? "animate-pulse text-gray-400" : ""}`}
        />
      )}
    </Button>
  );
};


