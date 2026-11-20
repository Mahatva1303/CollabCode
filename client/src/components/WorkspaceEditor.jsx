import useCollaboration from '../collaboration/useCollaboration';
import ConnectionStatus from './collaboration/ConnectionStatus';
import { useState, useEffect, useRef, useCallback } from 'react';
import { MonacoBinding } from 'y-monaco';
import Editor from '@monaco-editor/react';
import './WorkspaceEditor.css';
import ResizableRightPanel from './ResizableRightPanel';
import WingsmanToggle from './wingsman-ai/WingsmanToggle';
import { inviteWorkspaceMemberApi, updateWorkspaceMemberRoleApi, removeWorkspaceMemberApi } from '../api/workspaceApi';
import CollaboratorCursors from './collaboration/CollaboratorCursors';
import ActiveUsers from './collaboration/ActiveUsers';

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
  canEdit,
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
              
              {canEdit && (
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
              )}
            </div>

            {isExpanded && (
              <div className="tree-children">
                <FileTree
                  tree={folderTree}
                  canEdit={canEdit}
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

          {canEdit && (
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
          )}
        </div>
      ))}
    </>
  );
}

export default function WorkspaceEditor({
  user,
  profile,
  activeWorkspace,
  onLocalCodeEdit,
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
  applyWingsmanEdit,
  showPreview,
  setShowPreview,
  previewCode,
}) {
  const [wingsmanEnabled, setWingsmanEnabled] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
const [inviteEmail, setInviteEmail] = useState('');
const [inviteRole, setInviteRole] = useState('Editor');
  const [monacoEditor, setMonacoEditor] = useState(null);
  const [monacoInstance, setMonacoInstance] = useState(null);
const inlineProviderRef = useRef(null);

const updateFileRef = useRef(updateFile);

useEffect(() => {
  updateFileRef.current = updateFile;
}, [updateFile]);

const onLocalCodeEditRef = useRef(onLocalCodeEdit);

useEffect(() => {
  onLocalCodeEditRef.current = onLocalCodeEdit;
}, [onLocalCodeEdit]);

 
  const [firebaseToken, setFirebaseToken] = useState(null);
  const completionRequestRef = useRef(null);
  const requestGhostCompletionRef = useRef(null);

  const workspaceId = activeWorkspace?._id || activeWorkspace?.id;
  const currentMember = activeWorkspace?.members?.find(
  (member) => member.userId === user?.uid
);

const userRole =
  currentMember?.role ||
  (activeWorkspace?.ownerId === user?.uid ? 'Admin' : null);
  const canEdit = userRole === 'Admin' || userRole === 'Editor';

console.log('Current workspace role:', userRole);

  const isValidWorkspaceId = /^[a-f\d]{24}$/i.test(
    String(workspaceId || '')
  );

  async function requestGhostCompletion(cursorContext) {
    if (!firebaseToken || !isValidWorkspaceId || !activeFile) {
      return '';
    }

    if (completionRequestRef.current) {
      completionRequestRef.current.abort();
    }

    const controller = new AbortController();
    completionRequestRef.current = controller;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/wingsman/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${firebaseToken}`,
          },
          body: JSON.stringify({
            workspaceId,
            filePath: activeFile,
            cursorContext,
            workspaceContext: Object.keys(files)
              .filter((path) => !isFolderMarker(path))
              .map((path) => `File: ${path}`)
              .join('\n')
              .slice(0, 20000),
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`Ghost Writing request failed: ${response.status}`);
      }

      const data = await response.json();

      return data.success && typeof data.suggestion === 'string'
        ? data.suggestion
        : '';
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Ghost Writing error:', error);
      }

      return '';
    } finally {
      if (completionRequestRef.current === controller) {
        completionRequestRef.current = null;
      }
    }
  }

  requestGhostCompletionRef.current = requestGhostCompletion;

  // Register Monaco's Ghost Writing provider.
  useEffect(() => {
    if (!monacoInstance || !wingsmanEnabled) return;

    console.log('Wingsman inline provider is registering');

    const inlineProvider =
      monacoInstance.languages.registerInlineCompletionsProvider('*', {
        async provideInlineCompletions(model, position, context, token) {
          console.log('Wingsman inline provider was triggered');

          await new Promise((resolve) => setTimeout(resolve, 700));

          if (token.isCancellationRequested) {
            return { items: [] };
          }

          const fullCode = model.getValue();
          const cursorOffset = model.getOffsetAt(position);

          const prefix = fullCode.slice(
            Math.max(0, cursorOffset - 6000),
            cursorOffset
          );

          const suffix = fullCode.slice(
            cursorOffset,
            cursorOffset + 1500
          );

          const cursorContext = `${prefix}\n/* CURSOR */\n${suffix}`;

          const suggestion =
            await requestGhostCompletionRef.current?.(cursorContext);

          if (token.isCancellationRequested || !suggestion?.trim()) {
            return { items: [] };
          }

          return {
            items: [
              {
                insertText: suggestion,
                range: {
                  startLineNumber: position.lineNumber,
                  startColumn: position.column,
                  endLineNumber: position.lineNumber,
                  endColumn: position.column,
                },
              },
            ],
          };
        },

        freeInlineCompletions() {},
      });

    inlineProviderRef.current = inlineProvider;

    return () => {
      inlineProvider.dispose();
      inlineProviderRef.current = null;

      if (completionRequestRef.current) {
        completionRequestRef.current.abort();
        completionRequestRef.current = null;
      }
    };
  }, [monacoInstance, wingsmanEnabled]);


const {
  document,
  provider,
  status,
  isSynced,
} = useCollaboration({
  workspaceId,
  filePath: activeFile,
  enabled: Boolean(
    firebaseToken &&
    isValidWorkspaceId &&
    activeFile
  ),
  token: firebaseToken,
});


useEffect(() => {
  if (!provider) return;

  provider.awareness.setLocalStateField('user', {
    name:
      profile?.displayName ||
      user?.displayName ||
      user?.email?.split('@')[0] ||
      'User',

    color: profile?.pointerColor || '#388bfd',
  });
}, [provider, profile?.displayName, profile?.pointerColor, user]);


useEffect(() => {
  if (!provider) return;

  const checkAwareness = () => {
    console.log(
      'Connected collaborators:',
      provider.awareness.getStates()
    );
  };

  provider.awareness.on('change', checkAwareness);

  checkAwareness();

  return () => {
    provider.awareness.off('change', checkAwareness);
  };
}, [provider]);

useEffect(() => {
  let isMounted = true;

  async function getUserToken() {
    try {
      if (!user) {
        setFirebaseToken(null);
        return;
      }

      const token = await user.getIdToken();

      if (isMounted) {
        setFirebaseToken(token);
        console.log('Firebase ID token obtained successfully.');
      }
    } catch (error) {
      console.error('Could not obtain Firebase ID token:', error);
    }
  }

  getUserToken();

  return () => {
    isMounted = false;
  };
}, [user]);


// Connect Monaco Editor with the shared Yjs document
useEffect(() => {
    if (!document || !provider || !isSynced || !monacoEditor) {
        return;
    }

        const model = monacoEditor.getModel();

        if (!model) return;

        // Ensure Monaco is displaying the currently selected file.
        const expectedPath = `${activeWorkspace.name}/${activeFile}`;

        if (model.uri.path.replace(/^\/+/, '') !== expectedPath) {
            return;
        }

        const sharedText = document.getText('monaco');

    // Initialize shared content for the first collaborator
    if (sharedText.length === 0 && model.getValue()) {
        sharedText.insert(0, model.getValue());
    }
    // Load existing content for other collaborators
    else if (sharedText.length > 0) {
        model.setValue(sharedText.toString());
    }

    const binding = new MonacoBinding(
        sharedText,
        model,
        new Set([monacoEditor]),
        provider.awareness
    );

    // Detect only local code edits, not remote collaborator edits
    const handleLocalTransaction = (transaction) => {
        if (
            transaction.local &&
            transaction.changed.has(sharedText)
        ) {
            onLocalCodeEditRef.current?.(activeFile);
        }
    };

    document.on('afterTransaction', handleLocalTransaction);

    return () => {
        document.off('afterTransaction', handleLocalTransaction);
        binding.destroy();
    };
}, [
    document,
    provider,
    isSynced,
    monacoEditor,
    activeFile,
]);


// Open editor tabs
const [openTabs, setOpenTabs] = useState(
    activeFile ? [activeFile] : []
);

// Reset tabs when switching workspaces
useEffect(() => {
  setOpenTabs(activeFile ? [activeFile] : []);
}, [activeWorkspace.name]);

// Open the selected file in a tab
useEffect(() => {
  if (!activeFile || files[activeFile] === undefined) return;

  setOpenTabs((current) =>
    current.includes(activeFile)
      ? current
      : [...current, activeFile]
  );
}, [activeFile, activeWorkspace.name]);

// Remove tabs for files that no longer exist
useEffect(() => {
  setOpenTabs((current) =>
    current.filter(
      (path) => files[path] !== undefined && !isFolderMarker(path)
    )
  );
}, [files]);

function closeTab(path) {
  const index = openTabs.indexOf(path);
  const remainingTabs = openTabs.filter((tab) => tab !== path);

  setOpenTabs(remainingTabs);

  if (activeFile === path) {
    const nextFile =
      remainingTabs[Math.min(index, remainingTabs.length - 1)] ||
      Object.keys(files).find(
        (file) => !isFolderMarker(file)
      ) ||
      '';

    setActiveFile(nextFile);
  }
}

  const fileTree = buildFileTree(files);
  async function inviteMember() {
  const email = window.prompt(
    'Enter the email address of the account to invite:'
  );

  if (!email?.trim()) return;

  try {
    await inviteWorkspaceMemberApi(workspaceId, {
      email: email.trim(),
      role: 'Editor',
    });

    window.alert(
      'Member invited successfully! They can now access this workspace.'
    );
  } catch (error) {
    console.error('Member invitation failed:', error);
    window.alert(error.message || 'Could not invite member.');
  }
}

async function sendInvitation() {
  if (!inviteEmail.trim()) {
    window.alert('Please enter an email address.');
    return;
  }

  try {
    await inviteWorkspaceMemberApi(workspaceId, {
      email: inviteEmail.trim(),
      role: inviteRole,
    });

    window.alert(
      `${inviteRole} invited successfully!`
    );

    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('Editor');
  } catch (error) {
    console.error('Member invitation failed:', error);
    window.alert(error.message || 'Could not invite member.');
  }
}


async function handleMemberRoleChange(memberId, newRole) {
  if (userRole !== 'Admin') return;

  try {
    await updateWorkspaceMemberRoleApi(
      workspaceId,
      memberId,
      newRole
    );

    setActiveWorkspace((current) => {
      if (!current || (current._id || current.id) !== workspaceId) {
        return current;
      }

      return {
        ...current,
        members: current.members.map((member) =>
          member.userId === memberId
            ? { ...member, role: newRole }
            : member
        ),
      };
    });

    window.alert('Member role updated successfully.');
  } catch (error) {
    console.error('Member role update failed:', error);
    window.alert(error.message || 'Could not update member role.');
  }
}

async function handleRemoveMember(memberId, memberEmail) {
  if (userRole !== 'Admin') return;

  const confirmed = window.confirm(
    `Are you sure you want to remove ${memberEmail} from this workspace?`
  );

  if (!confirmed) return;

  try {
    await removeWorkspaceMemberApi(workspaceId, memberId);

    setActiveWorkspace((current) => {
      if (!current || (current._id || current.id) !== workspaceId) {
        return current;
      }

      return {
        ...current,
        members: current.members.filter(
          (member) => member.userId !== memberId
        ),
      };
    });

    window.alert('Member removed successfully.');
  } catch (error) {
    console.error('Member removal failed:', error);
    window.alert(error.message || 'Could not remove member.');
  }
}

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

          {userRole === 'Admin' && (
                    <button
            className="editor-back-btn"
            onClick={() => setShowInviteModal(true)}
          >
            + Invite
          </button>
          )}


          {userRole === 'Admin' && (
            <button
              className="editor-back-btn"
              onClick={() => setShowMembersModal(true)}
            >
              👥 Members
            </button>
          )}

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

      {showInviteModal && (
  <div
    className="invite-modal-overlay"
    onClick={() => setShowInviteModal(false)}
  >
    <div
      className="invite-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="invite-modal-header">
        <h2>Invite Member</h2>
        <button
          type="button"
          onClick={() => setShowInviteModal(false)}
        >
          ×
        </button>
      </div>

      <div className="invite-modal-body">
        <label>Email Address</label>
        <input
          type="email"
          placeholder="Enter member's email"
          value={inviteEmail}
          onChange={(event) => setInviteEmail(event.target.value)}
        />

        <label>Select Role</label>
        <select
          value={inviteRole}
          onChange={(event) => setInviteRole(event.target.value)}
        >
          <option value="Editor">Editor — Can edit code</option>
          <option value="Viewer">Viewer — View code only</option>
        </select>
      </div>

      <div className="invite-modal-actions">
        <button
          type="button"
          onClick={() => setShowInviteModal(false)}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={sendInvitation}
        >
          Send Invitation
        </button>
      </div>
    </div>
  </div>
)}

      {showMembersModal && (
  <div
    className="invite-modal-overlay"
    onClick={() => setShowMembersModal(false)}
  >
    <div
      className="invite-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="invite-modal-header">
        <h2>Workspace Members</h2>
        <button
          type="button"
          onClick={() => setShowMembersModal(false)}
        >
          ×
        </button>
      </div>

      <div className="invite-modal-body">
        {(activeWorkspace?.members || []).map((member) => (
          <div
            key={member.userId}
            className="member-list-item"
          >
            <div className="member-details">
              <strong>{member.email || 'Unknown member'}</strong>

              {member.role === 'Admin' ? (
                <span>Admin (Owner)</span>
              ) : (
                <select
                  className="member-role-select"
                  value={member.role}
                  onChange={(event) =>
                    handleMemberRoleChange(member.userId, event.target.value)
                  }
                >
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </select>
              )}
            </div>

            {member.role !== 'Admin' && (
  <button
    type="button"
    className="member-remove-btn"
    onClick={() =>
      handleRemoveMember(member.userId, member.email)
    }
  >
    Remove
  </button>
)}
          </div>
        ))}

        {(!activeWorkspace?.members ||
          activeWorkspace.members.length === 0) && (
          <p>No members found.</p>
        )}
      </div>

      <div className="invite-modal-actions">
        <button
          type="button"
          onClick={() => setShowMembersModal(false)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

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

        <button
  type="button"
  className={mobilePanel === 'assistant' ? 'selected' : ''}
  onClick={() => setMobilePanel('assistant')}
>
  AI / Chat
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
         
         {canEdit && (
          <div className="file-actions">
            <button onClick={() => createFile()} title="New file">
              + File
            </button>

            <button onClick={() => createFolder()} title="New folder">
              + Folder
            </button>
          </div>
          )}

          <div className="file-list">
            <FileTree
              tree={fileTree}
              activeFile={activeFile}
              canEdit={canEdit}
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

          <ActiveUsers provider={provider} />

          <div className="sidebar-bottom">
            <span>◉</span> Saved in this browser
          </div>
        </aside>

        <section
          className={`code-panel ${
            mobilePanel === 'editor' ? 'mobile-visible' : ''
          }`}
        >
          {/* <div className="file-tab-bar">
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
          </div> */}


          <div className="file-tab-bar">
  {openTabs.map((path) => (
    <div
      key={path}
      className={`open-file-tab ${
        activeFile === path ? 'active' : ''
      }`}
      onClick={() => {
        setActiveFile(path);
        setMobilePanel('editor');
      }}
    >
      <span className={`file-type-icon ${getLanguage(path)}`}>
        {getFileIcon(path)}
      </span>

      <span className="open-file-name">
        {path.split('/').pop()}
      </span>

      <span
        className="tab-unsaved-indicator"
        title="Saved locally"
      >
        ●
      </span>

      <button
        type="button"
        className="tab-close"
        title="Close tab"
        onClick={(event) => {
          event.stopPropagation();
          closeTab(path);
        }}
      >
        ×
      </button>
    </div>
  ))}
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
                onMount={(editor, monaco) => {
  setMonacoEditor(editor);
  setMonacoInstance(monaco);
}}
                language={getLanguage(activeFile)}
                theme="vs-dark"
                value={files[activeFile] ?? ''}
                onChange={(value) => {
  console.log('Monaco edited file:', activeFile);
  updateFile(value);
}}
                options={{
                  readOnly: userRole === 'Viewer',
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
                  inlineSuggest: {
                      enabled: true,
                    },
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

            <CollaboratorCursors
   editor={monacoEditor}
  provider={provider}
/>

          </div>

          <div className="editor-statusbar">
            <span>● {outputMessage}</span>
            <ConnectionStatus
  status={status}
  isSynced={isSynced}
/>
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

      <ResizableRightPanel
  workspaceId={workspaceId}
  token={firebaseToken}
  user={user}
  profile={profile}
  files={files}
  activeFile={activeFile}
  applyWingsmanEdit={applyWingsmanEdit}
  mobilePanel={mobilePanel}
/>
      </div>

      <footer className="editor-footer">
        <span>CollabCode</span>
        <span>
  {(Array.isArray(activeWorkspace.tech)
    ? activeWorkspace.tech
    : []
  ).join(' · ')}
</span>

        <div className="editor-footer-actions">
          <WingsmanToggle
            enabled={wingsmanEnabled}
            onChange={setWingsmanEnabled}
          />

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
        </div>
      </footer>
    </div>
  );
}
