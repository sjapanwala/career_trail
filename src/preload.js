const { contextBridge, ipcRenderer } = require('electron');

// Expose ipcRenderer to the renderer process in a safe way
contextBridge.exposeInMainWorld('electron', {
    onJobData: (callback) => ipcRenderer.on('job-data', callback),  // Expose the job data handler
    navigateToEdit: (data) => ipcRenderer.send('navigate-to-edit', data),
    onEditJobData: (callback) => ipcRenderer.on('edit-job-data', callback),
    saveJobChanges: (data) => ipcRenderer.send('save-job-changes', data),
    navigateBack: () => ipcRenderer.send('navigate-back'),
    updateJobStatus: (jobId, newStatus) => ipcRenderer.invoke('update-job-status', jobId, newStatus)
});
