interface UploadButtonProps {
	onUploadFiles: (blobs: File[]) => void;
}

export default function UploadButton({ onUploadFiles }: UploadButtonProps) {
	const fileInput = document.createElement("input");
	fileInput.type = "file";
	fileInput.multiple = true;


	return <button class="upload-download-button" onClick={() => {
		fileInput.click();
		fileInput.addEventListener("change", () => {
			if (fileInput.files === null) return;
			onUploadFiles([...fileInput.files]);
		});
	}}>Upload</button>
}