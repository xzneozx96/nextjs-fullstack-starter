import type { Message, TranscriptMessage } from '@/types/vapi-conversation';
import { Env } from '@/libs/Env';
import { vapi } from '@/libs/Vapi';
import { MessageTypeEnum, TranscriptMessageTypeEnum } from '@/types/vapi-conversation';
import { useEffect, useState } from 'react';

export enum CALL_STATUS {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  LOADING = 'loading',
}

export function useVapi() {
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const [callStatus, setCallStatus] = useState<CALL_STATUS>(
    CALL_STATUS.INACTIVE,
  );

  const [messages, setMessages] = useState<Message[]>([]);

  const [activeTranscript, setActiveTranscript]
    = useState<TranscriptMessage | null>(null);

  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    const onSpeechStart = () => setIsSpeechActive(true);
    const onSpeechEnd = () => {
      console.log('Speech has ended');
      setIsSpeechActive(false);
    };

    const onCallStartHandler = () => {
      console.log('Call has started');
      setCallStatus(CALL_STATUS.ACTIVE);
    };

    const onCallEnd = () => {
      console.log('Call has stopped');
      setCallStatus(CALL_STATUS.INACTIVE);
    };

    const onVolumeLevel = (volume: number) => {
      setAudioLevel(volume);
    };

    const onMessageUpdate = (message: Message) => {
      console.log('message', message);
      if (
        message.type === MessageTypeEnum.TRANSCRIPT
        && message.transcriptType === TranscriptMessageTypeEnum.PARTIAL
      ) {
        setActiveTranscript(message);
      } else {
        setMessages(prev => [...prev, message]);
        setActiveTranscript(null);
      }
    };

    const onError = (e: any) => {
      setCallStatus(CALL_STATUS.INACTIVE);
      console.error(e);
    };

    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('call-start', onCallStartHandler);
    vapi.on('call-end', onCallEnd);
    vapi.on('volume-level', onVolumeLevel);
    vapi.on('message', onMessageUpdate);
    vapi.on('error', onError);

    return () => {
      vapi.off('speech-start', onSpeechStart);
      vapi.off('speech-end', onSpeechEnd);
      vapi.off('call-start', onCallStartHandler);
      vapi.off('call-end', onCallEnd);
      vapi.off('volume-level', onVolumeLevel);
      vapi.off('message', onMessageUpdate);
      vapi.off('error', onError);
    };
  }, []);

  /**
   * Start a call with the Vapi assistant
   * @param assistantVariables Optional overrides for the assistant configuration
   * @returns Promise that resolves to the call object
   */
  const start = async (assistantVariables?: { variableValues: Record<string, any> } | undefined) => {
    setCallStatus(CALL_STATUS.LOADING);

    const response = vapi.start(Env.NEXT_PUBLIC_VAPI_ASSISTANT_ID, assistantVariables);

    response.then((res) => {
      console.log('call', res);
    });

    return response;
  };

  const stop = () => {
    setCallStatus(CALL_STATUS.LOADING);
    vapi.stop();
  };

  /**
   * Toggle the call status - start a new call or stop the current one
   * @param assistantVariables Optional variables to pass to the assistant
   */
  const toggleCall = (assistantVariables?: Record<string, any>) => {
    if (callStatus === CALL_STATUS.ACTIVE) {
      stop();
    } else {
      // If we have variables, convert them to the proper format
      let overrides: { variableValues: Record<string, any> } | undefined;

      if (assistantVariables) {
        // Convert variables to the overrides format expected by Vapi
        overrides = {
          variableValues: assistantVariables,
        };
      }

      start(overrides);
    }
  };

  return {
    isSpeechActive,
    callStatus,
    audioLevel,
    activeTranscript,
    messages,
    start,
    stop,
    toggleCall,
  };
}
