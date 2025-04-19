export enum MessageTypeEnum {
  TRANSCRIPT = 'transcript',
  FUNCTION_CALL = 'function-call',
  FUNCTION_CALL_RESULT = 'function-call-result',
  ADD_MESSAGE = 'add-message',
}

export enum MessageRoleEnum {
  USER = 'user',
  SYSTEM = 'system',
  ASSISTANT = 'assistant',
}

export enum TranscriptMessageTypeEnum {
  PARTIAL = 'partial',
  FINAL = 'final',
}

export type TranscriptMessage = {
  type: MessageTypeEnum.TRANSCRIPT;
  role: MessageRoleEnum;
  transcriptType: TranscriptMessageTypeEnum;
  transcript: string;
} & BaseMessage;

export type FunctionCallMessage = {
  type: MessageTypeEnum.FUNCTION_CALL;
  functionCall: {
    name: string;
    parameters: any;
  };
} & BaseMessage;

export type FunctionCallResultMessage = {
  type: MessageTypeEnum.FUNCTION_CALL_RESULT;
  functionCallResult: {
    forwardToClientEnabled?: boolean;
    result: any;
    [a: string]: any;
  };
} & BaseMessage;

export type BaseMessage = {
  type: MessageTypeEnum;
};

export type Message =
  | TranscriptMessage
  | FunctionCallMessage
  | FunctionCallResultMessage;
