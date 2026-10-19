import { afterEach, describe, expect, it, vi } from "vitest";

import { getImageFileError, readImageDataUrl } from "@/lib/image-data-url";

describe("image Data URL helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("accepts supported image types up to the size limit", () => {
    expect(getImageFileError({ type: "image/png", size: 5 * 1024 * 1024 })).toBeNull();
  });

  it("rejects non-image files, empty files, and images larger than 5 MB", () => {
    expect(getImageFileError({ type: "text/plain", size: 10 })).toMatch(/Choose a PNG/);
    expect(getImageFileError({ type: "image/svg+xml", size: 10 })).toMatch(/Choose a PNG/);
    expect(getImageFileError({ type: "image/jpeg", size: 0 })).toMatch(/empty/);
    expect(getImageFileError({ type: "image/jpeg", size: 5 * 1024 * 1024 + 1 })).toMatch(/5 MB/);
  });

  it("reads a valid image as a Data URL", async () => {
    class MockFileReader {
      result: string | null = null;
      error: DOMException | null = null;
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
      onabort: ((event: ProgressEvent<FileReader>) => void) | null = null;

      readAsDataURL(file: Blob) {
        this.result = `data:${file.type};base64,aW1hZ2U=`;
        this.onload?.(new Event("load") as ProgressEvent<FileReader>);
      }
    }

    vi.stubGlobal("FileReader", MockFileReader);
    const file = new File(["image"], "photo.png", { type: "image/png" });

    await expect(readImageDataUrl(file)).resolves.toBe("data:image/png;base64,aW1hZ2U=");
  });

  it("reports browser file-reading errors", async () => {
    class MockFileReader {
      result: string | null = null;
      error: DOMException | null = new DOMException("Read failed");
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
      onabort: ((event: ProgressEvent<FileReader>) => void) | null = null;

      readAsDataURL() {
        this.onerror?.(new Event("error") as ProgressEvent<FileReader>);
      }
    }

    vi.stubGlobal("FileReader", MockFileReader);
    const file = new File(["image"], "photo.png", { type: "image/png" });

    await expect(readImageDataUrl(file)).rejects.toThrow("Read failed");
  });
});
