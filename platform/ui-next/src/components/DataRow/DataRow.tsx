import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/Button/Button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../../components/DropdownMenu';
import { Icons } from '../../components/Icons/Icons';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../components/Tooltip/Tooltip';

interface DataRowProps {
  key: string;
  number: number;
  disableEditing: boolean;
  description: string;
  details?: { primary: string[]; secondary: string[]; description: string };
  isSelected?: boolean;
  onSelect?: () => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  isLocked: boolean;
  onToggleLocked: () => void;
  title: string;
  onRename: () => void;
  onDelete: () => void;
  colorHex?: string;
  onColor: () => void;
  onDescribe?: (uid: string, description: string) => void;
  measurementUID: string;
  measurementDescription: any;
}

const DataRow: React.FC<DataRowProps> = ({
  key,
  number,
  title,
  colorHex,
  details,
  onSelect,
  isLocked,
  onToggleVisibility,
  onToggleLocked,
  onRename,
  onDelete,
  onColor,
  onDescribe,
  isSelected = false,
  isVisible = true,
  disableEditing = false,
  measurementUID,
  measurementDescription,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isTitleLong = title?.length > 25;
  const rowRef = useRef<HTMLDivElement>(null);

  const handleAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    switch (action) {
      case 'Rename':
        onRename();
        break;
      case 'Lock':
        onToggleLocked();
        break;
      case 'Delete':
        onDelete();
        break;
      case 'Color':
        onColor();
        break;
      case 'Describe':
        if (onDescribe) onDescribe(measurementUID, '');
        break;
    }
  };

  const decodeHTML = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  const renderDetailText = (text: string, indent: number = 0) => {
    const indentation = '  '.repeat(indent);
    if (text === '') {
      return (
        <div
          key={`empty-${indent}`}
          className="h-2"
        ></div>
      );
    }
    const cleanText = decodeHTML(text);
    return (
      <div
        key={cleanText}
        className="whitespace-pre-wrap"
      >
        {indentation}
        <span className="font-medium">{cleanText}</span>
      </div>
    );
  };

  const renderDetails = (details: string[]) => {
    const visibleLines = details.slice(0, 4);
    const hiddenLines = details.slice(4);

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <div className="flex flex-col space-y-1">
              {visibleLines.map((line, lineIndex) =>
                renderDetailText(line, line.startsWith('  ') ? 1 : 0)
              )}
            </div>
            {hiddenLines.length > 0 && (
              <div className="text-muted-foreground mt-1 flex items-center text-sm">
                <span>...</span>
                <Icons.Info className="mr-1 h-5 w-5" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          align="start"
          className="max-w-md"
        >
          <div className="text-secondary-foreground flex flex-col space-y-1 text-sm leading-normal">
            {details.map((line, lineIndex) =>
              renderDetailText(line, line.startsWith('  ') ? 1 : 0)
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div
      ref={rowRef}
      className={`flex flex-col ${isVisible ? '' : 'opacity-60'}`}
    >
      <div
        className={`flex items-center ${
          isSelected ? 'bg-popover' : 'bg-muted'
        } group relative cursor-pointer`}
        onClick={onSelect}
        data-cy="data-row"
      >
        <div className="bg-primary/20 pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"></div>

        <div
          className={`flex h-7 max-h-7 w-7 flex-shrink-0 items-center justify-center rounded-l border-r border-black text-base ${
            isSelected ? 'bg-highlight text-black' : 'bg-muted text-muted-foreground'
          } overflow-hidden`}
        >
          {number}
        </div>

        {colorHex && (
          <div className="flex h-7 w-5 items-center justify-center">
            <span
              className="ml-2 h-2 w-2 rounded-full"
              style={{ backgroundColor: colorHex }}
            ></span>
          </div>
        )}

        <div className="ml-2 flex-1 overflow-hidden">
          {isTitleLong ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={`cursor-default text-base ${
                    isSelected ? 'text-highlight' : 'text-muted-foreground'
                  } [overflow:hidden] [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]`}
                >
                  {title}
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="center"
              >
                {title}
              </TooltipContent>
            </Tooltip>
          ) : (
            <span
              className={`text-base ${
                isSelected ? 'text-highlight' : 'text-muted-foreground'
              } [overflow:hidden] [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]`}
            >
              {title}
            </span>
          )}
        </div>

        <div className="relative ml-2 flex items-center space-x-1">
          <Button
            size="icon"
            variant="ghost"
            className={`h-6 w-6 transition-opacity ${
              isSelected || !isVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            aria-label={isVisible ? 'Hide' : 'Show'}
            onClick={e => {
              e.stopPropagation();
              onToggleVisibility();
            }}
          >
            {isVisible ? <Icons.Hide className="h-6 w-6" /> : <Icons.Show className="h-6 w-6" />}
          </Button>

          {isLocked && !disableEditing && <Icons.Lock className="text-muted-foreground h-6 w-6" />}

          {disableEditing && <div className="h-6 w-6"></div>}
          {!disableEditing && (
            <DropdownMenu onOpenChange={open => setIsDropdownOpen(open)}>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className={`h-6 w-6 transition-opacity ${
                    isSelected || isDropdownOpen
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100'
                  }`}
                  aria-label="Actions"
                  onClick={e => e.stopPropagation()}
                >
                  <Icons.More className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onCloseAutoFocus={e => e.preventDefault()}
              >
                <DropdownMenuItem onClick={e => handleAction('Rename', e)}>
                  <Icons.Rename className="text-foreground" />
                  <span className="pl-2">Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={e => handleAction('Delete', e)}>
                  <Icons.Delete className="text-foreground" />
                  <span className="pl-2">Delete</span>
                </DropdownMenuItem>
                {onColor && (
                  <DropdownMenuItem onClick={e => handleAction('Color', e)}>
                    <Icons.ColorChange className="text-foreground" />
                    <span className="pl-2">Change Color</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={e => handleAction('Lock', e)}>
                  <Icons.Lock className="text-foreground" />
                  <span className="pl-2">{isLocked ? 'Unlock' : 'Lock'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={e => handleAction('Describe', e)}>
                  <Icons.Info className="text-foreground" />
                  <span className="pl-2">Describe</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {details && (details.primary?.length > 0 || details.secondary?.length > 0) && (
        <div className="ml-7 px-2 py-2">
          <div className="text-secondary-foreground flex items-center gap-1 text-base leading-normal">
            {details.primary?.length > 0 && renderDetails(details.primary)}
            {details.secondary?.length > 0 && (
              <div className="text-muted-foreground ml-auto text-sm">
                {renderDetails(details.secondary)}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="ml-7 px-2 py-1">
        {measurementDescription?.description &&
        Array.isArray(measurementDescription.description.features) &&
        measurementDescription.description.features.length > 0 ? (
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-secondary-foreground font-semibold">Cechy:</span>
              {measurementDescription.description.features.map((feature, idx, arr) => (
                <React.Fragment key={feature.uuid || feature.name + idx}>
                  <span className="rounded-2xl bg-[#23274a] px-3 py-1 text-sm font-medium text-white">
                    {feature.name}
                  </span>
                  {idx !== arr.length - 1 && <span className="mx-1 text-xl text-[#888]">→</span>}
                </React.Fragment>
              ))}
            </div>

            {Array.isArray(measurementDescription.description.conclusions) &&
              measurementDescription.description.conclusions.length > 0 && (
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-pink-300">Wnioski:</span>
                  {measurementDescription.description.conclusions.map((conclusion, idx) => (
                    <span
                      key={conclusion.uuid || conclusion.name + idx}
                      className="rounded-2xl bg-pink-900 px-3 py-1 text-sm font-medium text-pink-200"
                    >
                      {conclusion.name}
                    </span>
                  ))}
                </div>
              )}

            {Array.isArray(measurementDescription.description.diagnoses) &&
              measurementDescription.description.diagnoses.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[#ffdcb0]">Rozpoznania:</span>
                  {measurementDescription.description.diagnoses.map((diagnosis, idx) => (
                    <span
                      key={diagnosis.uuid || diagnosis.name + idx}
                      className="rounded-2xl bg-[#653828] px-3 py-1 text-sm font-medium text-[#ffdcb0]"
                    >
                      {diagnosis.name}
                    </span>
                  ))}
                </div>
              )}
          </div>
        ) : (
          <div className="text-secondary-foreground text-base">
            <strong>Brak opisu</strong>
          </div>
        )}
      </div>

      <div className="ml-7 px-2 py-1">
        {Array.isArray(measurementDescription?.localization) &&
        measurementDescription.localization.length > 0 ? (
          <div className="text-secondary-foreground text-base">
            <strong>Lokalizacja:</strong>{' '}
            {measurementDescription.localization.map(d => d.name).join(' → ')}
          </div>
        ) : (
          <div className="text-secondary-foreground text-base">
            <strong>Brak Lokalizacji</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataRow;
