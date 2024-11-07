const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');  // Import child_process to run scripts
const { spawn } = require('child_process');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
        },
    });

    mainWindow.loadFile('index.html');
    mainWindow.webContents.openDevTools();

    // Send job data after each page reload
    mainWindow.webContents.on('did-finish-load', () => {
        sendJobData();
    });
}

// Function to read and send job data to renderer
function sendJobData() {
    const jsonFilePath = path.join(__dirname, 'python-assets', 'jobs.json');
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading JSON file:", err);
            return;
        }
        const jobData = JSON.parse(data);
        mainWindow.webContents.send('job-data', jobData);
    });
}



app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


// Handle navigation to edit page
ipcMain.on('navigate-to-edit', (event, data) => {
    mainWindow.loadFile('src/edit.html');
    mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.webContents.send('edit-job-data', data);
    });
});

// Handle saving job changes
ipcMain.on('save-job-changes', (event, { jobIndex, updatedJob }) => {
    mainWindow.loadFile('index.html');
});

// Handle navigation back to main page
ipcMain.on('navigate-back', () => {
    mainWindow.loadFile('index.html');
});




// Handle job status update requests from renderer
// Handle job status update requests from renderer
ipcMain.handle('update-job-status', async (event, jobId, newStatus) => {
    const jobsFilePath = path.join(__dirname, 'src', 'python-assets', 'jobs.json'); // Check if path is correct

    try {
        // Read and update the JSON file
        const data = await fs.promises.readFile(jobsFilePath, 'utf8');
        const jobs = JSON.parse(data);

        // Find the job by ID and update its status
        const job = jobs.find(job => job.id === jobId);
        if (job) {
            // Ensure that the status is only updated from "nan" to "view"
            if (job.user_information.status === "nan") {
                job.user_information.status = newStatus; // newStatus should be "view"
            }
        } else {
            throw new Error(`Job with ID ${jobId} not found.`);
        }

        // Write the updated data back to the file
        await fs.promises.writeFile(jobsFilePath, JSON.stringify(jobs, null, 2));
        console.log(`Job ${jobId} status updated to ${newStatus}`);
        return { success: true }; // Send a success response
    } catch (error) {
        console.error("Failed to update JSON file:", error);
        return { success: false, error: error.message }; // Return error details if something fails
    }
});

app.whenReady().then(createWindow);
