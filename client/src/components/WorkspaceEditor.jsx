
import { useState } from 'react';
import Editor from '@monaco-editor/react';
import './WorkspaceEditor.css';

const FOLDER_MARKER = '/.__collabcode_folder__';

function isFolderMarker(path) {
  return path.endsWith(FOLDER_MARKER);
}

function buildFileTree(files) {
  const root = { folders: {}, files: [] };

  Object.keys(files).forEach((path) => {
    if (isFolderMarker(path)) return;

    const segments = path.split('/');
    let current = root;

    segments.slice(0, -1).forEach((segment) => {
      if (!current.folders[segment]) {
        current.folders[segment] = {
          folders: {},
          files: [],
        };
      }

      current = current.folders[segment];
    });

    current.files.push({
      name: segments[segments.length - 1],
      path,
    });
  });

  // Keep explicitly created empty folders in the tree.
  Object.keys(files)
    .filter(isFolderMarker)
    .forEach((markerPath) => {
      const folderPath = markerPath.slice(0, -FOLDER_MARKER.length);
      const segments = folderPath.split('/');
      let current = root;

      segments.forEach((segment) => {
        if (!current.folders[segment]) {
          current.folders[segment] = {
            folders: {},
            files: [],
          };
        }

        current = current.folders[segment];
      });
    });

  return root;
}

function FileTree({
  tree,
  parentPath = '',
  activeFile,
  setActiveFile,
  setMobilePanel,
  getLanguage,
  getFileIcon,
  createFile,
  createFolder,
  renameFile,
  renameFolder,
  deleteFile,
  deleteFolder,
}) {
  const [expanded, setExpanded] = useState({});

  const folderEntries = Object.entries(tree.folders).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const fileEntries = [...tree.files].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <>
      {folderEntries.map(([folderName, folderTree]) => {
        const folderPath = parentPath
          ? `${parentPath}/${folderName}`
          : folderName;

        const isExpanded = expanded[folderName] ?? true;

        return (
          <div className="tree-folder" key={folderPath}>
            <div
              className="tree-row folder-row"
              onClick={() =>
                setExpanded((current) => ({
                  ...current,
                  [folderName]: !isExpanded,
                }))
              }
              title={folderPath}
            >
              <span className="tree-chevron">
                {isExpanded ? '⌄' : '›'}
              </span>

              <span className="tree-folder-icon">
                {isExpanded ? '📂' : '📁'}
              </span>

              <span className="tree-item-name">{folderName}</span>

              <span className="tree-actions">
                <button
                  type="button"
                  title="New file in folder"
                  onClick={(event) => {
                    event.stopPropagation();
                    createFile(folderPath);
                  }}
                >
                  +
                </button>

                <button
                  type="button"
                  title="New subfolder"
                  onClick={(event) => {
                    event.stopPropagation();
                    createFolder(folderPath);
                  }}
                >
                  📁
                </button>

                <button
                  type="button"
                  title="Rename folder"
                  onClick={(event) => {
                    event.stopPropagation();
                    renameFolder(folderPath);
                  }}
                >
                  ✎
                </button>

                <button
                  type="button"
                  title="Delete folder and contents"
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteFolder(folderPath);
                  }}
                >
                  ×
                </button>
              </span>
            </div>

            {isExpanded && (
              <div className="tree-children">
                <FileTree
                  tree={folderTree}
                  parentPath={folderPath}
                  activeFile={activeFile}
                  setActiveFile={setActiveFile}
                  setMobilePanel={setMobilePanel}
                  getLanguage={getLanguage}
                  getFileIcon={getFileIcon}
                  createFile={createFile}
                  createFolder={createFolder}
                  renameFile={renameFile}
                  renameFolder={renameFolder}
                  deleteFile={deleteFile}
                  deleteFolder={deleteFolder}
                />
              </div>
            )}
          </div>
        );
      })}

      {fileEntries.map(({ name, path }) => (
        <div
          className={`tree-row tree-file-row ${
            activeFile === path ? 'active' : ''
          }`}
          key={path}
          title={path}
        >
          <button
            type="button"
            className="tree-file-select"
            onClick={() => {
              setActiveFile(path);
              setMobilePanel('editor');
            }}
          >
            <span className={`file-type-icon ${getLanguage(path)}`}>
              {getFileIcon(path)}
            </span>

            <span className="tree-item-name">{name}</span>
          </button>

          <span className="tree-actions">
            <button
              type="button"
              title="Rename file"
              onClick={() => renameFile(path)}
            >
              ✎
            </button>

            <button
              type="button"
              title="Delete file"
              onClick={() => deleteFile(path)}
            >
              ×
            </button>
          </span>
        </div>
      ))}
    </>
  );
}

export default function WorkspaceEditor({
  activeWorkspace,
  logo,
  mobilePanel,
  setMobilePanel,
  runPreview,
  setActiveWorkspace,
  files,
  activeFile,
  setActiveFile,
  createFile,
  createFolder,
  renameFile,
  renameFolder,
  deleteFile,
  deleteFolder,
  getLanguage,
  getFileIcon,
  outputMessage,
  updateFile,
  showPreview,
  setShowPreview,
  previewCode,
}) {
  const fileTree = buildFileTree(files);

  return (
    <div className="editor-app">
      <header className="editor-topbar">
        <div className="editor-brand">
          <img src={logo} alt="CollabCode" />
          <span>CollabCode</span>
          <span className="editor-divider">/</span>
          <strong>{activeWorkspace.name}</strong>
        </div>

        <div className="editor-top-actions">
          <span className="editor-status-dot" />
          <span className="editor-status-text">Auto Save</span>

          <button className="editor-run-btn" onClick={runPreview}>
            ▶ Run
          </button>

          <button
            className="editor-back-btn"
            onClick={() => setActiveWorkspace(null)}
          >
            Dashboard
          </button>
        </div>
      </header>

      <div className="editor-tabs-mobile">
        <button
          className={mobilePanel === 'files' ? 'selected' : ''}
          onClick={() => setMobilePanel('files')}
        >
          Explorer
        </button>

        <button
          className={mobilePanel === 'editor' ? 'selected' : ''}
          onClick={() => setMobilePanel('editor')}
        >
          Editor
        </button>

        <button
          className={mobilePanel === 'preview' ? 'selected' : ''}
          onClick={() => {
            setShowPreview(true);
            setMobilePanel('preview');
          }}
        >
          Preview
        </button>
      </div>

      <div
        className={`editor-layout ${
          showPreview ? 'preview-open' : 'preview-closed'
        }`}
      >
        <aside
          className={`file-sidebar ${
            mobilePanel === 'files' ? 'mobile-visible' : ''
          }`}
        >
          <div className="sidebar-heading">EXPLORER</div>

          <div className="project-folder">
            <span>⌄</span>
            <span>📂</span>
            <strong>{activeWorkspace.name}</strong>
          </div>

          <div className="file-actions">
            <button onClick={() => createFile()} title="New file">
              + File
            </button>

            <button onClick={() => createFolder()} title="New folder">
              + Folder
            </button>
          </div>

          <div className="file-list">
            <FileTree
              tree={fileTree}
              activeFile={activeFile}
              setActiveFile={setActiveFile}
              setMobilePanel={setMobilePanel}
              getLanguage={getLanguage}
              getFileIcon={getFileIcon}
              createFile={createFile}
              createFolder={createFolder}
              renameFile={renameFile}
              renameFolder={renameFolder}
              deleteFile={deleteFile}
              deleteFolder={deleteFolder}
            />

            {Object.keys(files).filter((path) => !isFolderMarker(path))
              .length === 0 && (
              <p className="no-file-message">
                No files yet. Create a file to start coding.
              </p>
            )}
          </div>

          <div className="sidebar-bottom">
            <span>◉</span> Saved in this browser
          </div>
        </aside>

        <section
          className={`code-panel ${
            mobilePanel === 'editor' ? 'mobile-visible' : ''
          }`}
        >
          <div className="file-tab-bar">
            {activeFile && (
              <div className="open-file-tab">
                <span className={`file-type-icon ${getLanguage(activeFile)}`}>
                  {getFileIcon(activeFile)}
                </span>

                <span className="open-file-name">
                  {activeFile.split('/').pop()}
                </span>

                <span className="tab-unsaved-indicator" title="Auto-saved">
                  ●
                </span>
              </div>
            )}
          </div>

          <div className="editor-breadcrumb">
            <span>{activeWorkspace.name}</span>

            {activeFile &&
              activeFile.split('/').map((segment, index) => (
                <span key={`${segment}-${index}`}>
                  {' › '}
                  {segment}
                </span>
              ))}
          </div>

          <div className="monaco-container">
            {activeFile && files[activeFile] !== undefined ? (
              <Editor
                height="100%"
                path={`${activeWorkspace.name}/${activeFile}`}
                language={getLanguage(activeFile)}
                theme="vs-dark"
                value={files[activeFile] ?? ''}
                onChange={updateFile}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  fontFamily: "'Cascadia Code', Consolas, monospace",
                  fontLigatures: true,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 14 },
                  tabSize: 2,
                  wordWrap: 'on',
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: true,
                  folding: true,
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  smoothScrolling: true,
                }}
              />
            ) : (
              <p className="no-file-message">
                Create or select a file to start coding.
              </p>
            )}
          </div>

          <div className="editor-statusbar">
            <span>● {outputMessage}</span>
            <span>{activeFile ? getLanguage(activeFile) : 'Plain Text'}</span>
            <span>UTF-8</span>
            <span>Spaces: 2</span>
          </div>
        </section>

        {showPreview && (
          <section
            className={`preview-panel ${
              mobilePanel === 'preview' ? 'mobile-visible' : ''
            }`}
          >
            <div className="preview-header">
              <div>
                <span className="preview-live-dot" />
                <strong>Live Preview</strong>
              </div>

              <button
                className="preview-refresh"
                onClick={runPreview}
                title="Refresh preview"
              >
                ↻
              </button>

              <button
                className="preview-hide"
                onClick={() => {
                  setShowPreview(false);
                  setMobilePanel('editor');
                }}
                title="Close preview"
              >
                ×
              </button>
            </div>

            <div className="preview-address">
              <span>◉</span>
              <span>Local preview</span>
            </div>

            {previewCode ? (
              <iframe
                title="Website preview"
                srcDoc={previewCode}
                sandbox="allow-scripts"
                className="preview-frame"
              />
            ) : (
              <div className="preview-empty">
                <div className="preview-empty-icon">◇</div>
                <h3>Ready to preview</h3>
                <p>
                  Edit your HTML, CSS and JavaScript, then click Run to see
                  your website here.
                </p>
                <button className="editor-run-btn" onClick={runPreview}>
                  ▶ Run project
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      <footer className="editor-footer">
        <span>CollabCode</span>
        <span>{activeWorkspace.tech.join(' · ')}</span>

        <button
          className={`go-live-button ${showPreview ? 'is-live' : ''}`}
          onClick={() => {
            if (showPreview) {
              setShowPreview(false);
              setMobilePanel('editor');
            } else {
              setShowPreview(true);
              setMobilePanel('preview');
            }
          }}
          title={showPreview ? 'Close live preview' : 'Open live preview'}
        >
          <span className="go-live-icon">◉</span>
          {showPreview ? 'Close Preview' : 'Go Live'}
        </button>
      </footer>
    </div>
  );
}
