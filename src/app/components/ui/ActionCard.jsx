import { Card } from "./Card";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const ActionCard = ({
  icon,
  text,
  subtext,
  handleClick,
  isDismissable = false,
  onDismiss,
  customClassName = ""
}) => {
  return (
    <Card
      className={`flex flex-row bg-white rounded-2xl max-w-xl w-full h-auto p-4 gap-4 mx-auto items-center ${customClassName}`}
      handleOnClick={handleClick}
    >
      <div className="rounded-full gradient-button p-3 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col items-start w-full">
        <div className="flex flex-row w-full">
          <p className="text-base font-semibold flex-1">{text}</p>
          {isDismissable && (
            <button className="flex items-start" onClick={(e) => {
                e.stopPropagation()
                onDismiss()
            }}>
              <XMarkIcon className="w-4 text-text-secondary" />
            </button>
          )}
        </div>
        <p className="text-text-secondary text-xs">{subtext}</p>
      </div>
    </Card>
  );
};
