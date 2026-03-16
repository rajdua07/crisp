"use client";

import { useState, useRef } from "react";
import { useAppStore, DEFAULT_BRANDING } from "@/lib/store";
import {
  Upload,
  X,
  Type,
  Palette,
  Image,
  FileText,
  RotateCcw,
} from "lucide-react";

const FONT_OPTIONS = [
  "Helvetica",
  "Arial",
  "Times New Roman",
  "Georgia",
  "Calibri",
  "Garamond",
  "Verdana",
  "Trebuchet MS",
  "Courier New",
];

const HEADER_STYLES: { value: "minimal" | "branded" | "full"; label: string; desc: string }[] = [
  { value: "minimal", label: "Minimal", desc: "Clean, no logo in header" },
  { value: "branded", label: "Branded", desc: "Logo + company name" },
  { value: "full", label: "Full", desc: "Logo, name, and accent bar" },
];

export function BrandingEditor() {
  const { documentBranding, setDocumentBranding } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string>(documentBranding.logoUrl);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500_000) {
      alert("Logo must be under 500KB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      setLogoPreview(dataUri);
      setDocumentBranding({ logoUrl: dataUri });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview("");
    setDocumentBranding({ logoUrl: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetToDefaults = () => {
    setDocumentBranding(DEFAULT_BRANDING);
    setLogoPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Company Name */}
      <div className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-dark-400" />
          <h3 className="text-sm font-medium text-dark-200">Company Name</h3>
        </div>
        <input
          type="text"
          value={documentBranding.companyName}
          onChange={(e) => setDocumentBranding({ companyName: e.target.value })}
          placeholder="Your Company"
          className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-dark-700/50 text-sm text-dark-200 placeholder-dark-600 outline-none focus:border-crisp-500/30 transition-colors"
        />
      </div>

      {/* Logo Upload */}
      <div className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Image className="w-4 h-4 text-dark-400" />
          <h3 className="text-sm font-medium text-dark-200">Logo</h3>
          <span className="text-xs text-dark-600">PNG or SVG, max 500KB</span>
        </div>

        {logoPreview ? (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-dark-800 border border-dark-700/50 flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoPreview}
                alt="Company logo preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <button
              onClick={removeLogo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 bg-red-400/10 border border-red-400/20 hover:bg-red-400/20 transition-colors"
            >
              <X className="w-3 h-3" />
              Remove
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-6 rounded-xl border-2 border-dashed border-dark-700/50 text-dark-500 hover:text-dark-300 hover:border-dark-600/50 transition-colors flex flex-col items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            <span className="text-xs">Click to upload logo</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/svg+xml,image/jpeg"
          onChange={handleLogoUpload}
          className="hidden"
        />
      </div>

      {/* Colors */}
      <div className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-dark-400" />
          <h3 className="text-sm font-medium text-dark-200">Colors</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-dark-500 mb-1.5 block">Primary</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={documentBranding.primaryColor}
                onChange={(e) => setDocumentBranding({ primaryColor: e.target.value })}
                className="w-8 h-8 rounded-lg border border-dark-700/50 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={documentBranding.primaryColor}
                onChange={(e) => setDocumentBranding({ primaryColor: e.target.value })}
                className="flex-1 px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700/50 text-xs text-dark-300 font-mono outline-none focus:border-crisp-500/30 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-dark-500 mb-1.5 block">Accent</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={documentBranding.accentColor}
                onChange={(e) => setDocumentBranding({ accentColor: e.target.value })}
                className="w-8 h-8 rounded-lg border border-dark-700/50 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={documentBranding.accentColor}
                onChange={(e) => setDocumentBranding({ accentColor: e.target.value })}
                className="flex-1 px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700/50 text-xs text-dark-300 font-mono outline-none focus:border-crisp-500/30 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fonts */}
      <div className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Type className="w-4 h-4 text-dark-400" />
          <h3 className="text-sm font-medium text-dark-200">Fonts</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-dark-500 mb-1.5 block">Headings</label>
            <select
              value={documentBranding.fontHeading}
              onChange={(e) => setDocumentBranding({ fontHeading: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-dark-700/50 text-sm text-dark-200 outline-none focus:border-crisp-500/30 transition-colors"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-dark-500 mb-1.5 block">Body</label>
            <select
              value={documentBranding.fontBody}
              onChange={(e) => setDocumentBranding({ fontBody: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-dark-700/50 text-sm text-dark-200 outline-none focus:border-crisp-500/30 transition-colors"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Header Style */}
      <div className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-5">
        <h3 className="text-sm font-medium text-dark-200 mb-3">Header Style</h3>
        <div className="grid grid-cols-3 gap-2">
          {HEADER_STYLES.map((style) => (
            <button
              key={style.value}
              onClick={() => setDocumentBranding({ headerStyle: style.value })}
              className={`px-3 py-3 rounded-xl text-center transition-all ${
                documentBranding.headerStyle === style.value
                  ? "bg-crisp-500/10 border border-crisp-500/20 text-crisp-400"
                  : "bg-dark-800 border border-dark-700/50 text-dark-400 hover:text-dark-200"
              }`}
            >
              <div className="text-xs font-medium">{style.label}</div>
              <div className="text-[10px] text-dark-500 mt-0.5">{style.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer & Page Numbers */}
      <div className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-5 space-y-4">
        <div>
          <label className="text-xs text-dark-500 mb-1.5 block">Footer Text</label>
          <input
            type="text"
            value={documentBranding.footerText}
            onChange={(e) => setDocumentBranding({ footerText: e.target.value })}
            placeholder="Generated by Crisp"
            className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-dark-700/50 text-sm text-dark-200 placeholder-dark-600 outline-none focus:border-crisp-500/30 transition-colors"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-dark-300">Show page numbers</span>
          <button
            onClick={() => setDocumentBranding({ showPageNumbers: !documentBranding.showPageNumbers })}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              documentBranding.showPageNumbers ? "bg-crisp-500" : "bg-dark-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                documentBranding.showPageNumbers ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={resetToDefaults}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-dark-500 hover:text-dark-300 transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        Reset to defaults
      </button>
    </div>
  );
}
