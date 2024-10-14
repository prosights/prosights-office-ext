import * as React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useDropzone } from "react-dropzone";
import { Text, makeStyles } from "@fluentui/react-components";
import { useState, useCallback, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { extractTableFromImage } from "../../helpers/api";
import { createTableFromMarkdown } from "../../helpers/cells";

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

const useStyles = makeStyles({
  container: {
    width: "100%",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflow: "hidden",
  },
  dropzone: {
    border: "2px dashed #cccccc",
    borderRadius: "4px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    marginBottom: "20px",
    width: "100%",
    height: "200px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pageControls: {
    width: "100%",
    padding: "10px",
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    backgroundColor: "#f0f0f0",
    zIndex: 1,
  },
  pdfContainer: {
    width: "100%",
    flex: 1,
    overflow: "auto",
    position: "relative",
  },
  pdfPage: {
    width: "100%",
    height: "auto",
  },
  selectionOverlay: {
    position: "absolute",
    border: "2px solid blue",
    background: "rgba(0, 0, 255, 0.1)",
    pointerEvents: "none",
  },
});

const PDFViewer: React.FC = () => {
  const styles = useStyles();
  const [pdfFile, setPdfFile] = React.useState<File | null>(null);
  const [numPages, setNumPages] = React.useState<number | null>(null);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [scale, setScale] = React.useState(1);
  const [selection, setSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
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
    setScale(1); // Reset scale when a new document is loaded
  }, []);

  useEffect(() => {
    if (containerRef.current && pdfFile) {
      const containerWidth = containerRef.current.clientWidth;
      setScale(containerWidth / 595); // Assuming a default PDF width of 595 points (A4)
    }
  }, [pdfFile]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

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
    if (!selection || !containerRef.current) return;

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
  }, [selection]);

  return (
    <div className={styles.container}>
      <h2>PDF Viewer</h2>
      {!pdfFile ? (
        <div {...getRootProps({ className: styles.dropzone })}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <Text>Drop the PDF here ...</Text>
          ) : (
            <Text>Drag 'n' drop a PDF here, or click to select a PDF</Text>
          )}
        </div>
      ) : (
        <>
          <div className={styles.pageControls}>
            <button disabled={pageNumber <= 1} onClick={() => setPageNumber(pageNumber - 1)}>
              Previous
            </button>
            <Text>
              Page {pageNumber} of {numPages}
            </Text>
            <button
              disabled={numPages !== null && pageNumber >= numPages}
              onClick={() => setPageNumber(pageNumber + 1)}
            >
              Next
            </button>
            <button onClick={zoomOut}>-</button>
            <Text>{Math.round(scale * 100)}%</Text>
            <button onClick={zoomIn}>+</button>
            {selection && <button onClick={extractSelection}>Extract</button>}
          </div>
          <div className={styles.pdfContainer} ref={containerRef} onMouseDown={handleMouseDown}>
            <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
              <Page key={`page_${pageNumber}`} pageNumber={pageNumber} className={styles.pdfPage} scale={scale} />
            </Document>
            {selection && (
              <div
                className={styles.selectionOverlay}
                style={{
                  left: selection.x,
                  top: selection.y,
                  width: selection.width,
                  height: selection.height,
                }}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PDFViewer;
