import { Button, Spinner, Text } from "@fluentui/react-components";
import * as React from "react";
import { useDropzone } from "react-dropzone";
import { extractTableFromImage } from "../../helpers/extractImage";
import { createTableFromMarkdown } from "../../helpers/tables";

interface PictureSnipFile {
  file: File;
  preview: string;
}

export const PictureSnip: React.FC = () => {
  const [currentImage, setCurrentImage] = React.useState<PictureSnipFile | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [extractedText, setExtractedText] = React.useState<string | null>(null);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && acceptedFiles[0]) {
      const file = acceptedFiles[0];
      setCurrentImage({
        file,
        preview: URL.createObjectURL(file),
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
  });

  React.useEffect(() => {
    return () => {
      if (currentImage) {
        URL.revokeObjectURL(currentImage.preview);
      }
    };
  }, [currentImage]);

  const handleExtract = async () => {
    if (!currentImage) return;

    setLoading(true);
    try {
      console.log("Extracting text from image");
      const extractedTable = await extractTableFromImage(currentImage.file);
      setExtractedText(JSON.stringify(extractedTable));
      console.log("Extracted text:", extractedTable);
      await createTableFromMarkdown(extractedTable, currentImage.file);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer mb-4"
      >
        <input {...getInputProps()} disabled={loading} />
        {currentImage ? (
          <div className="flex flex-col items-center">
            <img src={currentImage.preview} alt="Preview" className="max-w-full h-auto rounded-lg mb-2" />
            <Text size={300}>{currentImage.file.name}</Text>
          </div>
        ) : isDragActive ? (
          <p>Drop the image here ...</p>
        ) : (
          <p>Drag 'n' drop an image here, or click to select an image</p>
        )}
      </div>
      <Button onClick={handleExtract} disabled={loading || !currentImage}>
        {loading ? <Spinner size="extra-small" /> : "Extract Table"}
      </Button>
    </div>
  );
};
