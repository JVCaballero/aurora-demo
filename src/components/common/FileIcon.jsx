const FileIcon = ({ filename, size = 24 }) => {
  const extension = filename.split('.').pop().toLowerCase();
  
  const getIconColor = () => {
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) return '#10b981';
    if (['pdf'].includes(extension)) return '#ef4444';
    if (['doc', 'docx'].includes(extension)) return '#3b82f6';
    if (['xls', 'xlsx', 'csv'].includes(extension)) return '#22c55e';
    if (['ppt', 'pptx'].includes(extension)) return '#f97316';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return '#a855f7';
    if (['mp3', 'wav', 'ogg', 'flac'].includes(extension)) return '#ec4899';
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension)) return '#8b5cf6';
    return '#6b7280';
  };

  const getIconPath = () => {
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      return 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z';
    }
    if (extension === 'pdf') {
      return 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z';
    }
    return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={getIconColor()}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={getIconPath()} />
    </svg>
  );
};

export default FileIcon;