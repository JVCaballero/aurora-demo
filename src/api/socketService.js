import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(serverUrl = 'http://localhost:3001') {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Project room management
  joinProject(projectId) {
    if (this.socket) {
      this.socket.emit('join-project', projectId);
      console.log(`Joined project room: ${projectId}`);
    }
  }

  leaveProject(projectId) {
    if (this.socket) {
      this.socket.emit('leave-project', projectId);
      console.log(`Left project room: ${projectId}`);
    }
  }

  // Task updates
  emitTaskUpdate(data) {
    if (this.socket) {
      this.socket.emit('task-update', data);
    }
  }

  onTaskUpdate(callback) {
    if (this.socket) {
      this.socket.on('task-updated', callback);
    }
    return () => {
      if (this.socket) {
        this.socket.off('task-updated', callback);
      }
    };
  }

  // Project updates
  emitProjectUpdate(data) {
    if (this.socket) {
      this.socket.emit('project-update', data);
    }
  }

  onProjectUpdate(callback) {
    if (this.socket) {
      this.socket.on('project-updated', callback);
    }
    return () => {
      if (this.socket) {
        this.socket.off('project-updated', callback);
      }
    };
  }

  // User activity tracking
  emitUserActivity(data) {
    if (this.socket) {
      this.socket.emit('user-activity', data);
    }
  }

  onUserActivity(callback) {
    if (this.socket) {
      this.socket.on('user-activity', callback);
    }
    return () => {
      if (this.socket) {
        this.socket.off('user-activity', callback);
      }
    };
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

// Singleton instance
export const socketService = new SocketService();
export default socketService;
