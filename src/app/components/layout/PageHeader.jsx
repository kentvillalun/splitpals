import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { hapticTrigger } from "ios-haptics";

export const PageHeader = ({ onBack, children }) => {
  return (
    <div className="gradient-button w-full px-4 pt-5 pb-6 rounded-b-3xl fixed top-0 left-0 right-0 z-30 lg:hidden">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
        <button
          ref={hapticTrigger}
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors duration-150 shrink-0"
        >
          <ArrowLeftIcon className="w-4 stroke-white" />
        </button>

        {children}

        <div className="w-8 h-8 shrink-0" />
      </div>
    </div>
  );
};
