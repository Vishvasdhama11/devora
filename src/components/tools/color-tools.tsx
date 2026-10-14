"use client";

import { useMemo, useState } from "react";
import { Copy, Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  const bigint = Number.parseInt(value, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

export function ColorTools() {
  const [value, setValue] = useState("#7C3AED");
  const rgb = useMemo(() => {
    try {
      const { r, g, b } = hexToRgb(value);
      return { r, g, b, hex: rgbToHex(r, g, b) };
    } catch {
      return { r: 124, g: 58, b: 237, hex: "#7C3AED" };
    }
  }, [value]);

  const hsl = useMemo(() => {
    const { r, g, b } = rgb;
    const red = r / 255;
    const green = g / 255;
    const blue = b / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;
    let h = 0;
    const l = (max + min) / 2;
    const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    if (delta !== 0) {
      switch (max) {
        case red:
          h = ((green - blue) / delta) % 6;
          break;
        case green:
          h = (blue - red) / delta + 2;
          break;
        default:
          h = (red - green) / delta + 4;
      }
    }

    h = Math.round(h * 60);
    const hs = Math.round(s * 100);
    const hl = Math.round(l * 100);
    return { h: h < 0 ? h + 360 : h, s: hs, l: hl };
  }, [rgb]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Color Studio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <input type="color" value={value} onChange={(e) => setValue(e.target.value)} className="h-14 w-20 cursor-pointer rounded-lg border border-white/10 bg-transparent" />
            <Input value={value} onChange={(e) => setValue(e.target.value)} className="max-w-xs uppercase" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
              <div className="mb-3 h-24 rounded-xl" style={{ background: value }} />
              <div className="text-sm text-zinc-400">HEX</div>
              <div className="flex items-center justify-between gap-3 text-lg font-semibold text-white">
                <span>{value.toUpperCase()}</span>
                <Copy className="h-4 w-4 text-zinc-400" />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
              <div className="mb-3 h-24 rounded-xl" style={{ background: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }} />
              <div className="text-sm text-zinc-400">RGB</div>
              <div className="text-lg font-semibold text-white">{rgb.r}, {rgb.g}, {rgb.b}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
              <div className="mb-3 h-24 rounded-xl" style={{ background: `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)` }} />
              <div className="text-sm text-zinc-400">HSL</div>
              <div className="text-lg font-semibold text-white">{hsl.h}°, {hsl.s}%, {hsl.l}%</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setValue("#7C3AED")}>Primary</Button>
            <Button variant="secondary" onClick={() => setValue("#22C55E")}>Success</Button>
            <Button variant="secondary" onClick={() => setValue("#38BDF8")}>Sky</Button>
            <Button variant="secondary" onClick={() => setValue("#F59E0B")}>Amber</Button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
            <div className="mb-2 flex items-center gap-2 text-zinc-300"><Palette className="h-4 w-4" /> CSS variables</div>
            <pre className="overflow-x-auto text-sm text-violet-200">{`--primary: ${value.toUpperCase()};\n--primary-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
