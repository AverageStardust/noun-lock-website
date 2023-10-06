interface DownloadButtonProps {
	onClick: () => void;
}

export default function DownloadButton({onClick}: DownloadButtonProps) {
	return <button class="download-download-button" onClick={onClick}>Download</button>
}