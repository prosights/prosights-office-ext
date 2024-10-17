import * as React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useDropzone } from "react-dropzone";
import { Text, Button } from "@fluentui/react-components";
import { useState, useCallback, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { extractTableFromImage } from "../../helpers/extractImage";
import { createTableFromMarkdown } from "../../helpers/tables";

if (!("withResolvers" in Promise)) {
  (Promise as any).withResolvers = function () {
    let resolve: (value: any) => void, reject: (reason?: any) => void;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve: resolve!, reject: reject! };
  };
}
// Add Promise.allSettled polyfill
if (typeof Promise.allSettled !== "function") {
  Promise.allSettled = function (promises) {
    return Promise.all(
      promises.map((p) =>
        Promise.resolve(p).then(
          (value) => ({ status: "fulfilled", value }),
          (reason) => ({ status: "rejected", reason })
        )
      )
    );
  };
}
// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

export const PdfSnip: React.FC = () => {
  const [pdfFile, setPdfFile] = React.useState<File | null>(null);
  const [numPages, setNumPages] = React.useState<number | null>(null);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [scale, setScale] = React.useState(1);
  const [selection, setSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setPdfFile(acceptedFiles[0]);
      setPageNumber(1);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setScale(1);
  }, []);

  useEffect(() => {
    if (containerRef.current && pdfFile) {
      const containerWidth = containerRef.current.clientWidth;
      setScale(containerWidth / 595);
    }
  }, [pdfFile]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || isExtracting) return;

    const startX = e.clientX - container.getBoundingClientRect().left + container.scrollLeft;
    const startY = e.clientY - container.getBoundingClientRect().top + container.scrollTop;

    const onMouseMove = (e: MouseEvent) => {
      const endX = e.clientX - container.getBoundingClientRect().left + container.scrollLeft;
      const endY = e.clientY - container.getBoundingClientRect().top + container.scrollTop;

      setSelection({
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        width: Math.abs(endX - startX),
        height: Math.abs(endY - startY),
      });
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  const zoomIn = () => setScale((prevScale) => Math.min(prevScale + 0.1, 3));
  const zoomOut = () => setScale((prevScale) => Math.max(prevScale - 0.1, 0.5));

  const extractSelection = useCallback(async () => {
    if (!selection || !containerRef.current || isExtracting) return;

    try {
      const scale = window.devicePixelRatio;
      const canvas = await html2canvas(containerRef.current, {
        scale,
        x: selection.x,
        y: selection.y,
        width: selection.width,
        height: selection.height,
        useCORS: true,
        allowTaint: true,
      });

      setIsExtracting(true);

      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));

      if (blob) {
        // Create "File" object from the blob
        const file = new File([blob], "selection.png", { type: "image/png" });

        // Extract text from the "File" object
        const extractedText = await extractTableFromImage(file);
        console.log("Extracted text:", extractedText);

        await createTableFromMarkdown(extractedText, file);
      } else {
        console.error("Failed to create blob from canvas");
      }
    } catch (error) {
      console.error("Error extracting selection:", error);
    } finally {
      setIsExtracting(false);
    }
  }, [selection]);

  // Add these effect hooks
  useEffect(() => {
    setSelection(null);
  }, [scale]);

  useEffect(() => {
    setSelection(null);
  }, [pageNumber]);

  return (
    <div className="w-full h-full flex flex-col items-center overflow-hidden">
      {!pdfFile ? (
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 rounded-md p-5 text-center cursor-pointer mb-5 w-full h-48 flex items-center justify-center"
        >
          <input {...getInputProps()} />
          <Text>{isDragActive ? "Drop the PDF here ..." : "Drag 'n' drop a PDF here, or click to select a PDF"}</Text>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col justify-center items-center">
          <div className="w-full flex flex-col justify-center gap-2 z-10 py-1">
            <div className="w-full flex justify-center items-center gap-1">
              <Button disabled={pageNumber <= 1} onClick={() => setPageNumber(pageNumber - 1)}>
                Previous
              </Button>
              <Text size={300}>
                Page {pageNumber} of {numPages}
              </Text>
              <Button
                disabled={numPages !== null && pageNumber >= numPages}
                onClick={() => setPageNumber(pageNumber + 1)}
              >
                Next
              </Button>
            </div>
            <div className="flex justify-center items-center gap-1">
              <Button onClick={zoomOut}>-</Button>
              <Text size={300}>{Math.round(scale * 100)}%</Text>
              <Button onClick={zoomIn}>+</Button>
            </div>
          </div>
          <div className="w-full flex-grow overflow-auto relative" ref={containerRef} onMouseDown={handleMouseDown}>
            <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
              <Page
                renderAnnotationLayer={false}
                renderTextLayer={false}
                key={`page_${pageNumber}`}
                pageNumber={pageNumber}
                className="w-full h-auto"
                scale={scale}
              />
            </Document>
            {selection && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-200 z-20 bg-opacity-10"
                style={{
                  left: selection.x,
                  top: selection.y,
                  width: selection.width,
                  height: selection.height,
                }}
              >
                <Button
                  disabled={isExtracting}
                  className="absolute top-0 left-0 translate-y-[-100%]"
                  onClick={extractSelection}
                >
                  Extract
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
