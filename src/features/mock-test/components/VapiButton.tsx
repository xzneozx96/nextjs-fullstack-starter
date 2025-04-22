import type { useVapi } from '@/shared/hooks/useVapi';
import Button from '@/shared/components/ui/button/Button';
import { CALL_STATUS } from '@/shared/hooks/useVapi';

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
          ? 'bg-red-600 hover:bg-red-700'
          : callStatus === CALL_STATUS.INACTIVE
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-blue-600 hover:bg-blue-700'
      } text-white relative`}
      onClick={() => toggleCall && toggleCall(assistantVariables)}
      disabled={callStatus === CALL_STATUS.LOADING}
    >
      {callStatus === CALL_STATUS.LOADING && (
        <span className="absolute inset-0 rounded-full animate-ping bg-blue-500/50 opacity-75"></span>
      )}

      <span>
        {callStatus === CALL_STATUS.ACTIVE
          ? 'End Session'
          : callStatus === CALL_STATUS.LOADING
            ? 'Connecting...'
            : callStatus === CALL_STATUS.INACTIVE
              ? 'New Session'
              : 'Start Session'}
      </span>
    </Button>
  );
};

export { VapiButton };
