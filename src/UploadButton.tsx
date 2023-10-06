interface UploadButtonProps {
	onClick: (blobs: File[]) => void;
}

export default function UploadButton({ onClick }: UploadButtonProps) {
	const fileInput = document.createElement("input");
	fileInput.type = "file";
	fileInput.multiple = true;


	return <button class="download-download-button" onClick={() => {
		fileInput.click();
		if (fileInput.files === null) return;
		onClick([...fileInput.files]);
	}}>Upload</button>
}