import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';

import { COLLABORATION_SERVER_URL } from './collaborationConfig';
import { createDocumentName } from './collaborationUtils';

export default function useCollaboration({
    workspaceId,
    filePath,
    enabled = false,
    token = null,
}) {
    const [document, setDocument] = useState(null);
    const [provider, setProvider] = useState(null);
    const [status, setStatus] = useState('disconnected');
    const [isSynced, setIsSynced] = useState(false);

    const documentName =
        workspaceId && filePath
            ? createDocumentName(workspaceId, filePath)
            : null;

    useEffect(() => {
        if (!enabled || !documentName) {
            setDocument(null);
            setProvider(null);
            setStatus('disconnected');
            setIsSynced(false);
            return;
        }

        const ydoc = new Y.Doc();

        setDocument(ydoc);
        setStatus('connecting');

        const connection = new HocuspocusProvider({
            url: COLLABORATION_SERVER_URL,
            name: documentName,
            document: ydoc,
            ...(token ? { token } : {}),

            onStatus: ({ status: connectionStatus }) => {
                setStatus(connectionStatus);
            },

            onSynced: ({ state }) => {
                setIsSynced(state);
            },
        });

        setProvider(connection);

        return () => {
            connection.destroy();
            ydoc.destroy();

            setDocument(null);
            setProvider(null);
            setStatus('disconnected');
            setIsSynced(false);
        };
    }, [documentName, enabled, token]);

    return {
        document,
        provider,
        status,
        isSynced,
    };
}