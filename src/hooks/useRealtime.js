import { useState, useEffect, useCallback } from 'react';
import socketService from '../api/socketService';

export function useRealtime(projectId, userId = null) {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    // Connect to socket server
    socketService.connect();
    
    const checkConnection = () => {
      setIsConnected(socketService.isConnected());
    };

    checkConnection();

    // Join project room if projectId is provided
    if (projectId) {
      socketService.joinProject(projectId);
    }

    // Listen for user activity
    const unsubscribeActivity = socketService.onUserActivity((data) => {
      console.log('User activity received:', data);
      // Could update active users list or show notifications
    });

    return () => {
      if (projectId) {
        socketService.leaveProject(projectId);
      }
      unsubscribeActivity();
    };
  }, [projectId]);

  const emitTaskUpdate = useCallback((taskData) => {
    if (projectId) {
      socketService.emitTaskUpdate({
        projectId,
        ...taskData
      });
    }
  }, [projectId]);

  const emitProjectUpdate = useCallback((projectData) => {
    if (projectId) {
      socketService.emitProjectUpdate({
        projectId,
        ...projectData
      });
    }
  }, [projectId]);

  const emitUserActivity = useCallback((activity) => {
    if (projectId && userId) {
      socketService.emitUserActivity({
        projectId,
        userId,
        userName: userId, // Replace with actual user name
        activity
      });
    }
  }, [projectId, userId]);

  return {
    isConnected,
    emitTaskUpdate,
    emitProjectUpdate,
    emitUserActivity
  };
}

export default useRealtime;
