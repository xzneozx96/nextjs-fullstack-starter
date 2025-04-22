import type {
  Message,
  TranscriptMessage,
} from '../types/vapi-conversation';
import {
  MessageTypeEnum,
} from '../types/vapi-conversation';
import { VapiMessage } from './VapiMessage';

type MessageListProps = {
  messages: Message[];
  activeTranscript?: TranscriptMessage | null;
};

export function VapiConversation({ messages, activeTranscript }: MessageListProps) {
  return (
    <>
      {messages.map((message, index) =>
        message.type === MessageTypeEnum.TRANSCRIPT
          ? (
              <VapiMessage
                message={message}
                key={message.type + message?.role + index}
              />
            )
          : null,
      )}
      {activeTranscript
        ? (
            <VapiMessage message={activeTranscript} />
          )
        : null}
    </>
  );
}
