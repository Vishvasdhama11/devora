"use client";

import { useRef, useState } from "react";
import { Check, Copy, Image as ImageIcon, RotateCcw } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readImageDataUrl } from "@/lib/image-data-url";

export function ImageDataUrlTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dataUrl, setDataUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isReading, setIsReading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setStatus("");
    setDataUrl("");
    setFileName(file.name);
    setIsReading(true);

    try {
      setDataUrl(await readImageDataUrl(file));
    } catch (cause) {
      setFileName("");
      setError(cause instanceof Error ? cause.message : "The image could not be read.");
    } finally {
      setIsReading(false);
    }
  }

  async function copyDataUrl() {
    try {
      await navigator.clipboard.writeText(dataUrl);
      setStatus("Data URL copied to clipboard.");
      setError("");
    } catch {
      setError("Clipboard access failed. Select and copy the Data URL manually.");
      setStatus("");
    }
  }

  function reset() {
    setDataUrl("");
    setFileName("");
    setError("");
    setStatus("");
    setIsReading(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-violet-300" />
          Image to Data URL
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-zinc-400">
          Convert a local image into a Base64 Data URL for HTML or CSS. Nothing is uploaded; use a public image
          hosting service if you need a shareable web link.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            id="image-data-url-file"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/bmp"
            onChange={handleFileChange}
            disabled={isReading}
            className="block w-full max-w-sm text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-violet-500"
            aria-label="Choose an image to convert"
          />
          <Button type="button" variant="secondary" onClick={reset} disabled={!dataUrl && !error}>
            <RotateCcw className="h-4 w-4" />
            Clear
          </Button>
        </div>
        <p className="text-xs text-zinc-500">Supported: PNG, JPEG, WebP, GIF, AVIF, BMP. Maximum file size: 5 MB.</p>

        {isReading ? <p role="status" className="text-sm text-violet-200">Reading image locally...</p> : null}
        {error ? <p role="alert" className="text-sm text-rose-300">{error}</p> : null}
        {status ? <p role="status" className="flex items-center gap-2 text-sm text-emerald-300"><Check className="h-4 w-4" />{status}</p> : null}

        {dataUrl ? (
          <>
            <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
              <p className="mb-3 text-sm font-medium text-zinc-200">{fileName}</p>
              <Image
                src={dataUrl}
                alt={`Preview of ${fileName}`}
                width={640}
                height={480}
                unoptimized
                className="max-h-64 max-w-full rounded-lg object-contain"
              />
            </div>
            <label htmlFor="image-data-url-output" className="block text-sm font-medium text-zinc-300">
              Data URL
            </label>
            <textarea
              id="image-data-url-output"
              readOnly
              value={dataUrl}
              rows={5}
              className="w-full resize-y rounded-xl border border-white/10 bg-zinc-950 p-3 font-mono text-xs text-violet-200 focus:border-violet-500 focus:outline-none"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={copyDataUrl}>
                <Copy className="h-4 w-4" />
                Copy Data URL
              </Button>
              <span className="text-xs text-zinc-500">Data URLs embed the image and can make HTML or CSS files larger.</span>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
