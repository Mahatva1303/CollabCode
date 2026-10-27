
import { useState, useEffect, useRef } from 'react';
import './App.css';
import logo from './assets/collabcode-logo.png';
import CreateWorkspaceModal from './components/CreateWorkspaceModal';
import ProfilePage from './components/ProfilePage';
import Sidebar from './components/Sidebar';
import HomeDashboard from './components/HomeDashboard';
import FeedPage from './components/FeedPage';
import WorkspaceEditor from './components/WorkspaceEditor';

const STORAGE_KEYS = {
  workspaces: 'collabcode-workspaces',
  projects: 'collabcode-project-files',
  profile: 'collabcode-user-profile',
};

const FOLDER_MARKER = '/.__collabcode_folder__';

const initialWorkspaces = [
  {
    name: 'My First Website',
    description: 'A collaborative web development workspace.',
    tech: ['HTML', 'CSS', 'JavaScript'],
    status: 'Personal',
    icon: '◈',
    template: 'HTML',
  },
  {
    name: 'React Starter',
    description: 'Build modern interfaces with React.',
    tech: ['React', 'JavaScript'],
    status: 'Personal',
    icon: '⚛',
    template: 'React',
  },
  {
    name: 'Full Stack App',
    description: 'Frontend and backend in one workspace.',
    tech: ['React', 'Node.js', 'Express'],
    status: 'Team',
    icon: '⌘',
    template: 'Full Stack',
  },
];

const starterFiles = {
  HTML: {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="container">
    <h1>Hello, CollabCode!</h1>
    <p>Start building something amazing.</p>
    <button id="helloButton">Click me</button>
    <p id="message"></p>
  </main>
  <script src="script.js"></script>
</body>
</html>`,
    'style.css': `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: Arial, sans-serif;
  background: #f0f4ff;
  color: #172033;
}

.container {
  text-align: center;
  padding: 40px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 12px 35px #00000012;
}

h1 {
  color: #6c63ff;
}

button {
  padding: 10px 18px;
  border: 0;
  border-radius: 8px;
  background: #6c63ff;
  color: white;
  cursor: pointer;
}`,
    'script.js': `const button = document.getElementById('helloButton');
const message = document.getElementById('message');

button.addEventListener('click', () => {
  message.textContent = 'Your JavaScript is working!';
});`,
  },

  React: {
    'App.jsx': `import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <main>
      <h1>Hello, CollabCode!</h1>
      <p>Your React workspace is ready.</p>
      <button onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </button>
    </main>
  );
}`,
    'style.css': `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: Arial, sans-serif;
  background: #101827;
  color: #f1f5f9;
}

main {
  text-align: center;
  padding: 32px;
}

h1 {
  color: #61dafb;
}

button {
  padding: 10px 16px;
  border: 0;
  border-radius: 8px;
  background: #61dafb;
  cursor: pointer;
}`,
    'package.json': `{
  "name": "collabcode-react-project",
  "private": true,
  "scripts": {
    "dev": "vite"
  },
  "dependencies": {
    "react": "latest",
    "react-dom": "latest",
    "vite": "latest"
  }
}`,
  },

  'Full Stack': {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Full Stack App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main>
    <h1>Full Stack Workspace</h1>
    <p>Frontend and backend development starts here.</p>
    <button id="statusButton">Check frontend</button>
    <p id="status"></p>
  </main>
  <script src="script.js"></script>
</body>
</html>`,
    'style.css': `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: Arial, sans-serif;
  background: #111827;
  color: #f9fafb;
}

main {
  text-align: center;
  padding: 32px;
}

h1 {
  color: #34d399;
}

button {
  padding: 10px 16px;
  border: 0;
  border-radius: 8px;
  background: #34d399;
  cursor: pointer;
}`,
    'script.js': `document.getElementById('statusButton').addEventListener('click', () => {
  document.getElementById('status').textContent =
    'Frontend is running successfully!';
});`,
    'server.js': `const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});`,
  },
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function isFolderMarker(path) {
  return path.endsWith(FOLDER_MARKER);
}

function isSafePath(path) {
  const normalized = path.trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  const segments = normalized.split('/');

  return (
    Boolean(normalized) &&
    segments.every(
      (segment) =>
        segment &&
        segment !== '.' &&
        segment !== '..' &&
        !segment.startsWith('.') &&
        /^[\w.-]+$/.test(segment)
    )
  );
}

function getFolderMarkerPath(folderPath) {
  return `${folderPath}${FOLDER_MARKER}`;
}

function App() {
  const [workspaces, setWorkspaces] = useState(() =>
    readStorage(STORAGE_KEYS.workspaces, initialWorkspaces)
  );

  const [savedProjects, setSavedProjects] = useState(() =>
    readStorage(STORAGE_KEYS.projects, {})
  );

  const [profile, setProfile] = useState(() =>
    readStorage(STORAGE_KEYS.profile, {
      displayName: 'Mahatva1303',
      avatar: '',
      bio: '',
    })
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [template, setTemplate] = useState('HTML');

  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState('');
  const [previewCode, setPreviewCode] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [outputMessage, setOutputMessage] = useState('Ready');
  const [mobilePanel, setMobilePanel] = useState('editor');

  const [currentPage, setCurrentPage] = useState('home');
  const [editDisplayName, setEditDisplayName] = useState(profile.displayName);
  const [editBio, setEditBio] = useState(profile.bio || '');
  const [profileMessage, setProfileMessage] = useState('');

  const avatarInputRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.workspaces,
        JSON.stringify(workspaces)
      );
    } catch {
      console.error('Could not save workspaces.');
    }
  }, [workspaces]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.projects,
        JSON.stringify(savedProjects)
      );
    } catch {
      console.error('Could not save project files.');
    }
  }, [savedProjects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
    } catch {
      console.error('Could not save profile.');
    }
  }, [profile]);

  useEffect(() => {
    if (!activeWorkspace) return;

    const selectedTemplate =
      activeWorkspace.template ||
      (activeWorkspace.tech.includes('HTML') ? 'HTML' : 'React');

    const existingFiles = savedProjects[activeWorkspace.name];

    const projectFiles =
      existingFiles && Object.keys(existingFiles).length > 0
        ? existingFiles
        : { ...(starterFiles[selectedTemplate] || starterFiles.HTML) };

    setFiles(projectFiles);

    const editablePaths = Object.keys(projectFiles).filter(
      (path) => !isFolderMarker(path)
    );

    setActiveFile((current) =>
      editablePaths.includes(current) ? current : editablePaths[0] || ''
    );

    setPreviewCode('');
    setOutputMessage('Ready');
    setShowPreview(false);
    setMobilePanel('editor');
  }, [activeWorkspace]);

  function openProfile() {
    setEditDisplayName(profile.displayName);
    setEditBio(profile.bio || '');
    setProfileMessage('');
    setCurrentPage('profile');
  }

  function saveProfile(event) {
    event.preventDefault();

    const name = editDisplayName.trim();

    if (!name) {
      setProfileMessage('Display name cannot be empty.');
      return;
    }

    setProfile((current) => ({
      ...current,
      displayName: name,
      bio: editBio.trim(),
    }));

    setProfileMessage('Profile saved successfully.');
  }

  function selectAvatar(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setProfileMessage('Please select an image file.');
      event.target.value = '';
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      setProfileMessage('Please choose an image smaller than 2 MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setProfile((current) => ({
        ...current,
        avatar: reader.result,
      }));

      setProfileMessage('Profile picture updated.');
    };

    reader.onerror = () => {
      setProfileMessage('Could not load that image.');
    };

    reader.readAsDataURL(selectedFile);
    event.target.value = '';
  }

  function removeAvatar() {
    setProfile((current) => ({
      ...current,
      avatar: '',
    }));

    setProfileMessage('Profile picture removed.');
  }

  function persistProjectFiles(updatedFiles) {
    setFiles(updatedFiles);

    if (activeWorkspace) {
      setSavedProjects((current) => ({
        ...current,
        [activeWorkspace.name]: updatedFiles,
      }));
    }
  }

  function updateFile(value) {
    if (!activeFile || isFolderMarker(activeFile)) return;

    const updatedFiles = {
      ...files,
      [activeFile]: value ?? '',
    };

    persistProjectFiles(updatedFiles);
    setOutputMessage('Changes saved locally');
  }

  function editWorkspace(workspace) {
    setEditingWorkspace(workspace);
    setWorkspaceName(workspace.name);
    setTemplate(workspace.template || 'HTML');
    setShowCreateModal(true);
  }

  function createWorkspace(event) {
    event.preventDefault();

    const name = workspaceName.trim();

    if (!name) return;

    if (
      workspaces.some(
        (workspace) => workspace.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      alert('A workspace with this name already exists.');
      return;
    }

    const templateTech = {
      HTML: ['HTML', 'CSS', 'JavaScript'],
      React: ['React', 'JavaScript'],
      'Full Stack': ['React', 'Node.js', 'Express'],
    };

    const newWorkspace = {
      name,
      description: 'Your new development workspace.',
      tech: templateTech[template],
      status: 'Personal',
      icon: template === 'React' ? '⚛' : template === 'HTML' ? '◈' : '⌘',
      template,
    };

    const newFiles = {
      ...(starterFiles[template] || starterFiles.HTML),
    };

    setWorkspaces((current) => [...current, newWorkspace]);

    setSavedProjects((current) => ({
      ...current,
      [name]: newFiles,
    }));

    setWorkspaceName('');
    setShowCreateModal(false);
    setEditingWorkspace(null);
    setActiveWorkspace(newWorkspace);
  }

  function saveWorkspaceChanges(event) {
    event.preventDefault();

    if (!editingWorkspace) return;

    const name = workspaceName.trim();

    if (!name) return;

    const oldName = editingWorkspace.name;

    const duplicate = workspaces.some(
      (workspace) =>
        workspace.name.toLowerCase() === name.toLowerCase() &&
        workspace.name !== oldName
    );

    if (duplicate) {
      alert('A workspace with this name already exists.');
      return;
    }

    const updatedWorkspace = {
      ...editingWorkspace,
      name,
    };

    setWorkspaces((current) =>
      current.map((workspace) =>
        workspace.name === oldName ? updatedWorkspace : workspace
      )
    );

    setSavedProjects((current) => {
      const updatedProjects = { ...current };

      if (
        oldName !== name &&
        Object.prototype.hasOwnProperty.call(updatedProjects, oldName)
      ) {
        updatedProjects[name] = updatedProjects[oldName];
        delete updatedProjects[oldName];
      }

      return updatedProjects;
    });

    setActiveWorkspace((current) =>
      current?.name === oldName ? updatedWorkspace : current
    );

    setEditingWorkspace(null);
    setWorkspaceName('');
    setShowCreateModal(false);
  }

  function closeWorkspaceModal() {
    setShowCreateModal(false);
    setEditingWorkspace(null);
    setWorkspaceName('');
  }

  function createFile(folderPath = '') {
    const input = prompt(
      'Enter a file name or relative path (e.g. App.jsx or components/Header.jsx):',
      folderPath ? `${folderPath}/` : ''
    );

    if (input === null) return;

    const enteredPath = input.trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');

    if (!isSafePath(enteredPath)) {
      alert('Enter a valid path, such as src/App.jsx or src/components/Header.jsx.');
      return;
    }

    const name =
      folderPath && !enteredPath.startsWith(`${folderPath}/`)
        ? `${folderPath}/${enteredPath}`
        : enteredPath;

    if (Object.prototype.hasOwnProperty.call(files, name)) {
      alert('A file with this path already exists.');
      return;
    }

    if (Object.keys(files).some((path) => path.startsWith(`${name}/`))) {
      alert('A folder already exists at this path.');
      return;
    }

    const newFiles = { ...files };
    const segments = name.split('/');

    for (let i = 1; i < segments.length; i += 1) {
      const parentPath = segments.slice(0, i).join('/');
      const markerPath = getFolderMarkerPath(parentPath);

      if (
        !Object.prototype.hasOwnProperty.call(newFiles, markerPath) &&
        !Object.keys(newFiles).some((path) => path.startsWith(`${parentPath}/`))
      ) {
        newFiles[markerPath] = '';
      }
    }

    newFiles[name] = '';

    persistProjectFiles(newFiles);
    setActiveFile(name);
    setMobilePanel('editor');
    setOutputMessage(`Created ${name}`);
  }

  function createFolder(parentPath = '') {
    const input = prompt(
      parentPath
        ? `Enter a folder name or relative path inside "${parentPath}":`
        : 'Enter a folder name or relative path (e.g. src/components):'
    );

    if (input === null) return;

    const enteredPath = input.trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');

    if (!isSafePath(enteredPath)) {
      alert('Enter a valid folder path, such as src or src/components.');
      return;
    }

    const folderPath =
      parentPath && !enteredPath.startsWith(`${parentPath}/`)
        ? `${parentPath}/${enteredPath}`
        : enteredPath;

    if (
      Object.prototype.hasOwnProperty.call(files, folderPath) ||
      Object.keys(files).some((path) => path.startsWith(`${folderPath}/`))
    ) {
      alert('A file or folder already exists at this path.');
      return;
    }

    const newFiles = { ...files };
    const segments = folderPath.split('/');

    for (let i = 1; i <= segments.length; i += 1) {
      const currentFolder = segments.slice(0, i).join('/');
      const markerPath = getFolderMarkerPath(currentFolder);

      if (
        !Object.prototype.hasOwnProperty.call(newFiles, markerPath) &&
        !Object.keys(newFiles).some((path) => path.startsWith(`${currentFolder}/`))
      ) {
        newFiles[markerPath] = '';
      }
    }

    persistProjectFiles(newFiles);
    setOutputMessage(`Created folder ${folderPath}`);
  }

  function renameFile(oldPath) {
    const oldName = oldPath.split('/').pop();
    const input = prompt(`Rename "${oldPath}" to:`, oldName);

    if (input === null) return;

    const newName = input.trim();

    if (
      !newName ||
      newName.includes('/') ||
      newName.includes('\\') ||
      newName === '.' ||
      newName === '..' ||
      newName.startsWith('.') ||
      !/^[\w.-]+$/.test(newName)
    ) {
      alert('Enter a valid file name without folder separators.');
      return;
    }

    const parentPath = oldPath.includes('/')
      ? oldPath.slice(0, oldPath.lastIndexOf('/'))
      : '';

    const newPath = parentPath ? `${parentPath}/${newName}` : newName;

    if (newPath === oldPath) return;

    if (
      Object.prototype.hasOwnProperty.call(files, newPath) ||
      Object.keys(files).some((path) => path.startsWith(`${newPath}/`))
    ) {
      alert('A file or folder already exists at that path.');
      return;
    }

    const newFiles = { ...files };
    newFiles[newPath] = newFiles[oldPath];
    delete newFiles[oldPath];

    persistProjectFiles(newFiles);

    if (activeFile === oldPath) {
      setActiveFile(newPath);
    }

    setOutputMessage(`Renamed to ${newPath}`);
  }

  function renameFolder(folderPath) {
    const oldName = folderPath.split('/').pop();
    const input = prompt(`Rename folder "${folderPath}" to:`, oldName);

    if (input === null) return;

    const newName = input.trim();

    if (
      !newName ||
      newName.includes('/') ||
      newName.includes('\\') ||
      newName === '.' ||
      newName === '..' ||
      newName.startsWith('.') ||
      !/^[\w.-]+$/.test(newName)
    ) {
      alert('Enter a valid folder name without folder separators.');
      return;
    }

    const parentPath = folderPath.includes('/')
      ? folderPath.slice(0, folderPath.lastIndexOf('/'))
      : '';

    const newFolderPath = parentPath
      ? `${parentPath}/${newName}`
      : newName;

    if (newFolderPath === folderPath) return;

    const destinationExists = Object.keys(files).some(
      (path) =>
        path === newFolderPath ||
        path.startsWith(`${newFolderPath}/`)
    );

    if (destinationExists) {
      alert('A file or folder already exists at the destination.');
      return;
    }

    const newFiles = {};

    Object.entries(files).forEach(([path, content]) => {
      if (path === folderPath || path.startsWith(`${folderPath}/`)) {
        newFiles[`${newFolderPath}${path.slice(folderPath.length)}`] = content;
      } else {
        newFiles[path] = content;
      }
    });

    persistProjectFiles(newFiles);

    if (activeFile === folderPath || activeFile.startsWith(`${folderPath}/`)) {
      setActiveFile(`${newFolderPath}${activeFile.slice(folderPath.length)}`);
    }

    setOutputMessage(`Renamed folder to ${newFolderPath}`);
  }

  function deleteFile(filePath) {
    const editablePaths = Object.keys(files).filter(
      (path) => !isFolderMarker(path)
    );

    if (editablePaths.length <= 1) {
      alert('A workspace must contain at least one file.');
      return;
    }

    if (!window.confirm(`Delete "${filePath}"?`)) return;

    const newFiles = { ...files };
    delete newFiles[filePath];

    // Remove empty folder markers, working from deepest folders upwards.
    Object.keys(newFiles)
      .filter(isFolderMarker)
      .sort((a, b) => b.length - a.length)
      .forEach((markerPath) => {
        const folderPath = markerPath.slice(0, -FOLDER_MARKER.length);

        const hasContents = Object.keys(newFiles).some(
          (path) => path !== markerPath && path.startsWith(`${folderPath}/`)
        );

        if (!hasContents) {
          delete newFiles[markerPath];
        }
      });

    persistProjectFiles(newFiles);

    if (activeFile === filePath) {
      setActiveFile(
        Object.keys(newFiles).find((path) => !isFolderMarker(path)) || ''
      );
    }

    setOutputMessage(`Deleted ${filePath}`);
  }

  function deleteFolder(folderPath) {
    const containedPaths = Object.keys(files).filter(
      (path) => path === folderPath || path.startsWith(`${folderPath}/`)
    );

    if (!containedPaths.length) return;

    const remainingEditablePaths = Object.keys(files).filter(
      (path) =>
        !isFolderMarker(path) &&
        path !== folderPath &&
        !path.startsWith(`${folderPath}/`)
    );

    if (!remainingEditablePaths.length) {
      alert('A workspace must contain at least one file.');
      return;
    }

    if (!window.confirm(`Delete folder "${folderPath}" and all its contents?`)) {
      return;
    }

    const newFiles = { ...files };

    containedPaths.forEach((path) => {
      delete newFiles[path];
    });

    // Remove any parent folder markers that have become empty.
    Object.keys(newFiles)
      .filter(isFolderMarker)
      .sort((a, b) => b.length - a.length)
      .forEach((markerPath) => {
        const parentPath = markerPath.slice(0, -FOLDER_MARKER.length);

        const hasContents = Object.keys(newFiles).some(
          (path) => path !== markerPath && path.startsWith(`${parentPath}/`)
        );

        if (!hasContents) delete newFiles[markerPath];
      });

    persistProjectFiles(newFiles);

    if (activeFile === folderPath || activeFile.startsWith(`${folderPath}/`)) {
      setActiveFile(
        Object.keys(newFiles).find((path) => !isFolderMarker(path)) || ''
      );
    }

    setOutputMessage(`Deleted folder ${folderPath}`);
  }

  function runPreview() {
    if (!files['index.html']) {
      setOutputMessage('No root index.html file found.');
      return;
    }

    const html = files['index.html'];
    const css = files['style.css'] || '';
    const js = files['script.js'] || '';

    const safeCss = css.replace(/<\/style/gi, '<\\/style');
    const safeScript = js.replace(/<\/script/gi, '<\\/script');

    const injectedHtml = html.replace(
      /<\/body\s*>/i,
      `<style>${safeCss}</style><script>${safeScript}<\/script></body>`
    );

    const finalHtml = /<\/body\s*>/i.test(html)
      ? injectedHtml
      : `${html}<style>${safeCss}</style><script>${safeScript}<\/script>`;

    setPreviewCode(finalHtml);
    setOutputMessage('Preview updated');
    setShowPreview(true);
    setMobilePanel('preview');
  }

  function getLanguage(fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase();

    const languages = {
      html: 'html',
      css: 'css',
      js: 'javascript',
      jsx: 'javascript',
      json: 'json',
      ts: 'typescript',
      tsx: 'typescript',
      md: 'markdown',
      txt: 'plaintext',
      xml: 'xml',
      sql: 'sql',
    };

    return languages[extension] || 'plaintext';
  }

  function getFileIcon(fileName) {
    const icons = {
      html: '5',
      css: '#',
      js: 'JS',
      jsx: 'JS',
      json: '{}',
      ts: 'TS',
      tsx: 'TS',
      md: 'M',
      xml: '<>',
      sql: 'DB',
    };

    const extension = fileName.split('.').pop()?.toLowerCase();

    return icons[extension] || 'TXT';
  }

  function renderAvatar(size = 'normal') {
    return (
      <span className={`account-avatar ${size}`}>
        {profile.avatar ? (
          <img src={profile.avatar} alt="Profile" />
        ) : (
          <span className="avatar-placeholder">
            {profile.displayName.trim().charAt(0).toUpperCase() || 'U'}
          </span>
        )}
      </span>
    );
  }

  function openWorkspace(workspace) {
    setActiveWorkspace(workspace);
  }

  function deleteWorkspace(workspaceToDelete) {
    setWorkspaces((current) =>
      current.filter(
        (workspace) => workspace.name !== workspaceToDelete.name
      )
    );

    setSavedProjects((current) => {
      const updatedProjects = { ...current };
      delete updatedProjects[workspaceToDelete.name];
      return updatedProjects;
    });

    if (activeWorkspace?.name === workspaceToDelete.name) {
      setActiveWorkspace(null);
    }
  }

  if (activeWorkspace) {
    return (
      <WorkspaceEditor
        activeWorkspace={activeWorkspace}
        logo={logo}
        mobilePanel={mobilePanel}
        setMobilePanel={setMobilePanel}
        runPreview={runPreview}
        setActiveWorkspace={setActiveWorkspace}
        files={files}
        activeFile={activeFile}
        setActiveFile={setActiveFile}
        createFile={createFile}
        createFolder={createFolder}
        renameFile={renameFile}
        renameFolder={renameFolder}
        deleteFile={deleteFile}
        deleteFolder={deleteFolder}
        getLanguage={getLanguage}
        getFileIcon={getFileIcon}
        outputMessage={outputMessage}
        updateFile={updateFile}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        previewCode={previewCode}
      />
    );
  }

  return (
    <div className="app home-shell">
      <Sidebar
        profile={profile}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        workspaces={workspaces}
        openProfile={openProfile}
        openWorkspace={openWorkspace}
        setShowCreateModal={setShowCreateModal}
        renderAvatar={renderAvatar}
      />

      <main className="home-main">
        <header className="home-topbar">
          <div className="home-brand">
            <img src={logo} alt="CollabCode logo" />
            <strong>CollabCode</strong>
          </div>

          <button
            className="home-create-button"
            onClick={() => {
              setEditingWorkspace(null);
              setWorkspaceName('');
              setTemplate('HTML');
              setShowCreateModal(true);
            }}
          >
            + New workspace
          </button>
        </header>

        {currentPage === 'profile' ? (
          <ProfilePage
            profile={profile}
            editDisplayName={editDisplayName}
            setEditDisplayName={setEditDisplayName}
            editBio={editBio}
            setEditBio={setEditBio}
            profileMessage={profileMessage}
            avatarInputRef={avatarInputRef}
            selectAvatar={selectAvatar}
            removeAvatar={removeAvatar}
            saveProfile={saveProfile}
            renderAvatar={renderAvatar}
            setCurrentPage={setCurrentPage}
          />
        ) : currentPage === 'feed' ? (
          <FeedPage setCurrentPage={setCurrentPage} />
        ) : (
          <HomeDashboard
            profile={profile}
            workspaces={workspaces}
            openWorkspace={openWorkspace}
            setShowCreateModal={setShowCreateModal}
            openProfile={openProfile}
            renderAvatar={renderAvatar}
            deleteWorkspace={deleteWorkspace}
            editWorkspace={editWorkspace}
          />
        )}
      </main>

      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={closeWorkspaceModal}
        onSubmit={
          editingWorkspace ? saveWorkspaceChanges : createWorkspace
        }
        workspaceName={workspaceName}
        setWorkspaceName={setWorkspaceName}
        template={template}
        setTemplate={setTemplate}
        editingWorkspace={editingWorkspace}
      />
    </div>
  );
}

export default App;
