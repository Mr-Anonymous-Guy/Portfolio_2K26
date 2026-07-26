import React, { useState, useRef, useEffect } from "react";
import { COLOR_PALETTES, type ColorPalette } from "@/data/palettes";
import { useUI } from "@/store/ui";
import { audioManager } from "@/services/audio/audioManager";
import "./PalettePicker.scss";

interface PalettePickerProps {
  onSelectPalette: (palette: ColorPalette) => void;
}

export const PalettePicker: React.FC<PalettePickerProps> = ({ onSelectPalette }) => {
  const [isOpen, setIsOpen] = useState(false);
  const activePaletteId = useUI((s) => s.activePalette);
  const containerRef = useRef<HTMLDivElement>(null);

  const activePalette = COLOR_PALETTES.find((p) => p.id === activePaletteId) || COLOR_PALETTES[0];

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const togglePopover = () => {
    audioManager.play("hover");
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (palette: ColorPalette) => {
    if (palette.id === activePaletteId) {
      setIsOpen(false);
      return;
    }
    audioManager.play("transition");
    setIsOpen(false);
    onSelectPalette(palette);
  };

  return (
    <div ref={containerRef} className="sb-palette-picker">
      <button
        className={`sb-palette-btn ${isOpen ? "is-open" : ""}`}
        type="button"
        title="Change Color Palette"
        aria-label="Change Color Palette"
        onClick={togglePopover}
        onMouseEnter={() => audioManager.play("hover")}
      >
        <span className="sb-palette-btn__swatch">
          <span
            className="sb-palette-btn__dot sb-palette-btn__dot--contrast"
            style={{ backgroundColor: activePalette.contrastedHex }}
          />
          <span
            className="sb-palette-btn__dot sb-palette-btn__dot--root"
            style={{ backgroundColor: activePalette.rootHex }}
          />
        </span>
        <svg
          className="sb-palette-btn__icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
          <path d="M12 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
          <path d="M6.5 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
          <path d="M17.5 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
          <path d="M8.5 16.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
          <path d="M15.5 16.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
        </svg>
      </button>

      {isOpen && (
        <div className="sb-palette-popover">
          <div className="sb-palette-popover__header">
            <span className="sb-palette-popover__title">Pick your colours</span>
          </div>

          <div className="sb-palette-popover__list">
            {COLOR_PALETTES.map((palette) => {
              const isSelected = palette.id === activePaletteId;
              return (
                <button
                  key={palette.id}
                  type="button"
                  className={`sb-palette-item ${isSelected ? "is-selected" : ""}`}
                  onClick={() => handleSelect(palette)}
                  onMouseEnter={() => audioManager.play("hover")}
                >
                  <div className="sb-palette-item__preview">
                    <span
                      className="sb-palette-item__swatch"
                      style={{ backgroundColor: palette.contrastedHex }}
                      title={`Contrasted: ${palette.contrastedHex}`}
                    />
                    <span
                      className="sb-palette-item__swatch"
                      style={{ backgroundColor: palette.rootHex }}
                      title={`Root: ${palette.rootHex}`}
                    />
                  </div>

                  <div className="sb-palette-item__info">
                    <div className="sb-palette-item__name">{palette.name}</div>
                    <div className="sb-palette-item__desc">{palette.description}</div>
                  </div>

                  {isSelected && (
                    <span className="sb-palette-item__check">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
