import { useState, useCallback } from 'react';

const useTaskActivity = (initialTasks = []) => {
  const [tasks, setTasks] = useState(initialTasks);

  const addComment = useCallback((taskId, comment) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, comments: [...(task.comments || []), comment] }
          : task
      )
    );
  }, []);

  const deleteComment = useCallback((taskId, commentId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              comments: (task.comments || []).filter(c => c.id !== commentId)
            }
          : task
      )
    );
  }, []);

  const addAttachment = useCallback((taskId, attachment) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, attachments: [...(task.attachments || []), attachment] }
          : task
      )
    );
  }, []);

  const deleteAttachment = useCallback((taskId, attachmentId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              attachments: (task.attachments || []).filter(a => a.id !== attachmentId)
            }
          : task
      )
    );
  }, []);

  const updateTask = useCallback((updatedTask) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  }, []);

  return {
    tasks,
    addComment,
    deleteComment,
    addAttachment,
    deleteAttachment,
    updateTask
  };
};

export default useTaskActivity;
