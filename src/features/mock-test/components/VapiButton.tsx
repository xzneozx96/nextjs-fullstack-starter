import type { useVapi } from '@/features/mock-test/hooks/useVapi';
import { CALL_STATUS } from '@/features/mock-test/hooks/useVapi';
import { Button } from '@/shared/components/ui/button';
import { MicOff, MicrophoneIcon } from '@/shared/icons';

type VapiButtonProps = Partial<ReturnType<typeof useVapi>> & {
  assistantVariables?: Record<string, any>;
};

const VapiButton = ({
  toggleCall,
  callStatus,
  assistantVariables,
}: VapiButtonProps) => {
  return (
    <Button
      className={`${
        callStatus === CALL_STATUS.ACTIVE
          ? '!bg-red-600 !hover:bg-red-700'
          : '!bg-brand-600 !hover:bg-brand-700'
      } text-white relative`}
      onClick={() => toggleCall && toggleCall(assistantVariables)}
      disabled={callStatus === CALL_STATUS.LOADING}
    >
      {callStatus === CALL_STATUS.LOADING && (
        <span className="absolute inset-0 rounded-full animate-ping bg-blue-500/50 opacity-75"></span>
      )}

      {callStatus === CALL_STATUS.ACTIVE
        ? (
            <MicOff className="size-5" />
          )
        : callStatus === CALL_STATUS.LOADING
          ? (
              <MicrophoneIcon className="size-5" />
            )
          : (
              <MicrophoneIcon className="size-5" />
            )}
    </Button>
  );
};

export { VapiButton };
