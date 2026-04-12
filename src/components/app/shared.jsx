import { Star, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { CANCEL_BUTTON_STYLE, SAVE_BUTTON_STYLE } from "@/lib/app/constants";

export function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function ModalHeader({ title, onClose }) {
  return (
    <DialogHeader className="pr-12">
      <DialogTitle className="text-xl font-bold tracking-tight">{title}</DialogTitle>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 h-9 w-9 rounded-full border border-slate-400 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        onClick={onClose}
      >
        <span className="text-sm font-semibold leading-none">X</span>
      </Button>
    </DialogHeader>
  );
}

export function ModalActions({ onCancel, onSave, saveLabel, cancelLabel = "Cancel" }) {
  return (
    <div className="mt-6 flex justify-end gap-3">
      <Button type="button" variant="outline" className={CANCEL_BUTTON_STYLE} onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button type="button" className={SAVE_BUTTON_STYLE} onClick={onSave}>
        {saveLabel}
      </Button>
    </div>
  );
}

export function Stars({ value, size = "md" }) {
  const n = Number(value || 0);
  const starSizeClass = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const gapClass = size === "sm" ? "gap-0.5" : "gap-1";
  return (
    <div className={`flex items-center ${gapClass}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${starSizeClass} ${i < Math.round(n) ? "fill-current text-yellow-500" : "text-slate-300"}`} />
      ))}
    </div>
  );
}

export function TagInput({ label, color = "slate", values, setValues, inputValue, setInputValue, suggestions = [] }) {
  const filteredSuggestions = suggestions
    .filter((s) => inputValue.trim() && s.toLowerCase().includes(inputValue.trim().toLowerCase()) && !values.includes(s))
    .slice(0, 6);

  function addValue(raw) {
    const value = raw.trim();
    if (!value) return;
    if (values.some((v) => v.toLowerCase() === value.toLowerCase())) {
      setInputValue("");
      return;
    }
    setValues([...values, value]);
    setInputValue("");
  }

  function onKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addValue(inputValue);
    }
  }

  const colorClasses = color === "red"
    ? "bg-red-100 text-red-700 border-red-200"
    : color === "blue"
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={onKeyDown} placeholder="Type and press Enter" />
      {filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filteredSuggestions.map((s) => (
            <button key={s} type="button" className="rounded-full border px-3 py-1 text-xs text-slate-600" onClick={() => addValue(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Badge key={value} variant="outline" className={`${colorClasses} flex items-center gap-1`}>
            {value}
            <button type="button" onClick={() => setValues(values.filter((v) => v !== value))}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
