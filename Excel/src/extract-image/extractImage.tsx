import * as React from "react";
import { createRoot } from "react-dom/client";
import { useDropzone } from "react-dropzone";
import { FluentProvider, webLightTheme, Text, makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
  dropzone: {
    border: "2px dashed #cccccc",
    borderRadius: "4px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
  },
});

const ExtractImage: React.FC = () => {
  const styles = useStyles();

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log("File reading was aborted");
      reader.onerror = () => console.log("File reading has failed");
      reader.onload = () => {
        const base64String = reader.result as string;
        Office.context.ui.messageParent(base64String);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
  });

  return (
    <div {...getRootProps({ className: styles.dropzone })}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <Text>Drop the image here ...</Text>
      ) : (
        <Text>Drag 'n' drop an image here, or click to select an image</Text>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById("extract-image-container"));

Office.onReady(() => {
  root.render(
    <FluentProvider theme={webLightTheme}>
      <ExtractImage />
    </FluentProvider>
  );
});
