import './ConnectionStatus.css';

function ConnectionStatus({ status = 'disconnected' }) {
    const statusDetails = {
        connected: {
            label: 'Connected',
            className: 'connected',
        },
        connecting: {
            label: 'Connecting...',
            className: 'connecting',
        },
        disconnected: {
            label: 'Disconnected',
            className: 'disconnected',
        },
    };

    const currentStatus =
        statusDetails[status] || statusDetails.disconnected;

    return (
        <div className={`collaboration-status ${currentStatus.className}`}>
            <span className="status-indicator"></span>
            <span>{currentStatus.label}</span>
        </div>
    );
}

export default ConnectionStatus;