/**
 * studio/EditorPage.jsx
 * Vista del editor: sidebar (video + extractor) + grid de frames.
 */

import { useState } from "react";
import { Icon } from "../../icons/Icons";
import VideoPlayer    from "./VideoPlayer";
import FrameExtractor from "./FrameExtractor";
import FrameGrid      from "./FrameGrid";
import FrameEditor    from "./FrameEditor";
import { useVideoFrames } from "../../hooks/useVideoFrames";

export default function EditorPage({ selectedMovie, onBack }) {
  const [editorOpen, setEditorOpen] = useState(false);

  const {
    frames,
    selectedFrame,
    selectedFrameId,
    isExtracting,
    extractionProgress,
    extractionError,
    videoSrc,
    videoName,
    videoDuration,
    fps,
    videoRef,          // ← ref que se pasa al <video> Y usa captureFrameAtTime
    loadVideoFile,
    loadDefaultMovie,
    handleVideoLoaded,
    extractFrames,
    cancelExtraction,
    updateFrame,
    deleteFrame,
    setSelectedFrameId,
    setFps,
    exportAllFrames,
    loadSavedFrames,
  } = useVideoFrames(selectedMovie);

  const handleSelectFrame = (frameId) => {
    setSelectedFrameId(frameId);
    setEditorOpen(true);
  };

  return (
    <div className="editor-page">

      {/* Breadcrumb */}
      <div className="editor-breadcrumb">
        <button className="breadcrumb-back" onClick={onBack}>
          <Icon.Back size={13} color="currentColor" />
          {selectedMovie ? selectedMovie.title : "Estudio"}
        </button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">
          Editor de fotogramas
          {videoName && ` — ${videoName}`}
        </span>
        {frames.length > 0 && (
          <span style={{
            marginLeft: "auto",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--indigo-bright)",
            background: "var(--indigo-dim)",
            padding: "2px var(--space-3)",
            borderRadius: "var(--r-full)",
            border: "1px solid rgba(80,96,208,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}>
            <Icon.Image size={10} color="currentColor" />
            {frames.length} frames
          </span>
        )}
      </div>

      {/* Body */}
      <div className="editor-page-body">

        {/* Sidebar */}
        <aside className="editor-sidebar">
          <VideoPlayer
            videoRef={videoRef}
            videoSrc={videoSrc}
            videoName={videoName}
            videoDuration={videoDuration}
            onFileLoad={loadVideoFile}
            onDefaultLoad={loadDefaultMovie}
            onVideoLoaded={handleVideoLoaded}
          />
          <FrameExtractor
            fps={fps}
            videoDuration={videoDuration}
            isExtracting={isExtracting}
            extractionProgress={extractionProgress}
            extractionError={extractionError}
            framesCount={frames.length}
            onFpsChange={setFps}
            onExtract={extractFrames}
            onCancel={cancelExtraction}
            onExportAll={exportAllFrames}
            onLoadSaved={loadSavedFrames}
          />
        </aside>

        {/* Grid de frames */}
        <div className="editor-content">
          <FrameGrid
            frames={frames}
            selectedFrameId={selectedFrameId}
            onSelectFrame={handleSelectFrame}
            onDeleteFrame={deleteFrame}
          />
        </div>

      </div>

      {/* Modal editor de frame */}
      {editorOpen && selectedFrame && (
        <FrameEditor
          frame={selectedFrame}
          onSave={(frameId, dataURL) => updateFrame(frameId, dataURL)}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
}