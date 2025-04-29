import type { Message, TranscriptMessage } from '@/features/mock-test/types/vapi-conversation';
import { vapi } from '@/core/ai/Vapi';
import { Env } from '@/core/config/Env';
import { fetchCallById } from '@/features/mock-test/actions/vapi/vapi-actions';
import { MessageTypeEnum, TranscriptMessageTypeEnum } from '@/features/mock-test/types/vapi-conversation';
import { useCallback, useEffect, useState } from 'react';

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

  // Store the current call ID
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);

  // Store call details including recording URL
  const [callDetails, setCallDetails] = useState<any | null>(null);

  // Track if we're fetching call details
  const [isFetchingCallDetails, setIsFetchingCallDetails] = useState(false);

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
      // Store the call ID for later use
      if (res && res.id) {
        setCurrentCallId(res.id);
        // Store the call ID in localStorage for persistence
        localStorage.setItem('lastVapiCallId', res.id);
      }
    }).catch((error) => {
      console.error('Error starting call:', error);
      setCallStatus(CALL_STATUS.INACTIVE);
    });

    return response;
  };

  /**
   * Fetch call details from the VAPI API
   * @param callId Optional call ID to fetch. If not provided, uses the current call ID
   * @returns Promise that resolves to the call details
   */
  const getCallDetails = useCallback(async (callId?: string) => {
    const idToFetch = callId || currentCallId || localStorage.getItem('lastVapiCallId');

    if (!idToFetch) {
      throw new Error('No call ID available');
    }

    try {
      setIsFetchingCallDetails(true);
      const response = await fetchCallById({ id: idToFetch });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch call details');
      }

      setCallDetails(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching call details:', error);
      throw error;
    } finally {
      setIsFetchingCallDetails(false);
    }
  }, [currentCallId]);

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
    currentCallId,
    callDetails,
    isFetchingCallDetails,
    getCallDetails,
  };
}
