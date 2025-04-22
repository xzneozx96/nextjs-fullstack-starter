import type {
  TranscriptMessage,
} from '../types/vapi-conversation';
import { cn } from '@/shared/libs/utils';
import {
  MessageRoleEnum,
} from '../types/vapi-conversation';

type ConversationMessageProps = {
  message: TranscriptMessage;
};

export function VapiMessage({ message }: ConversationMessageProps) {
  return (
    <div
      className={`flex w-full sm:w-11/12 md:w-4/5 text-xs sm:text-sm mb-3 sm:mb-4 justify-end ${
        message.role === MessageRoleEnum.USER ? 'ml-auto' : 'mr-auto'
      }`}
    >
      <div
        className={`p-2 sm:p-3 relative ${
          message.role !== MessageRoleEnum.USER
            ? 'rounded-r-xl bg-blue-50 mr-auto'
            : 'rounded-l-xl bg-orange-50 ml-auto'
        } rounded-t-xl`}
      >
        <p className="leading-relaxed">{message.transcript}</p>
        <span
          className={cn(
            'text-gray-400 text-xs sm:text-sm absolute bottom-0',
            message.role === MessageRoleEnum.USER
              ? 'hidden sm:inline-block sm:-left-[50px]'
              : 'hidden sm:inline-block sm:-right-[50px]',
          )}
        >
          ~
          {message.role === MessageRoleEnum.USER ? ' You' : ' Mark'}
        </span>
      </div>
    </div>
  );
}
