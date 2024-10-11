import * as React from "react";
import { useDropzone } from "react-dropzone";
import { Text, makeStyles, Image, Button } from "@fluentui/react-components";
import { getUploadUrl } from "../../helpers/api";

const useStyles = makeStyles({
  dropzone: {
    border: "2px dashed #cccccc",
    borderRadius: "4px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    marginBottom: "20px",
    width: "100%",
    height: "200px",
  },
  previewContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  previewImage: {
    width: "200px",
    height: "200px",
    objectFit: "cover",
    borderRadius: "4px",
  },
  extractButton: {
    marginTop: "20px",
  },
});

interface ImageFile {
  file: File;
  preview: string;
}

const PictureSnip: React.FC = () => {
  const styles = useStyles();
  const [image, setImage] = React.useState<ImageFile | null>(null);
  const [extracting, setExtracting] = React.useState(false);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setImage({
        file,
        preview: URL.createObjectURL(file),
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxFiles: 1,
  });

  React.useEffect(() => {
    // Clean up object URL when component unmounts or image changes
    return () => {
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
    };
  }, [image]);

  const handleExtract = async () => {
    if (!image) return;

    setExtracting(true);
    try {
      const { uploadUrl, bucket_name, path } = await getUploadUrl();

      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: await image.file.arrayBuffer(),
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Image uploaded successfully");
      console.log("Bucket:", bucket_name);
      console.log("Path:", path);
      // Here you can add further processing or UI updates
    } catch (error) {
      console.error("Error during extraction:", error);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <h2>Picture Snip Tool</h2>
      <div {...getRootProps({ className: styles.dropzone })}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <Text>Drop the image here ...</Text>
        ) : (
          <Text>Drag 'n' drop an image here, or click to select an image</Text>
        )}
      </div>
      {image && (
        <div className={styles.previewContainer}>
          <Image src={image.preview} alt="Preview" className={styles.previewImage} />
        </div>
      )}
      <Button className={styles.extractButton} onClick={handleExtract} disabled={!image || extracting}>
        {extracting ? "Extracting..." : "Extract"}
      </Button>
    </div>
  );
};

export default PictureSnip;
