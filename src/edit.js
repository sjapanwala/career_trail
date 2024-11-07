let currentJob = null;
let jobIndex = null;

// Listen for job data from main process
window.electron.onEditJobData((event, data) => {
    currentJob = data.jobData;
    jobIndex = data.jobIndex;
    populateEditForm();
});

function populateEditForm() {
    if (!currentJob) return;

    document.getElementById('job-title').value = currentJob.job_information?.title || '';
    document.getElementById('job-company').value = currentJob.job_information?.company || '';
    document.getElementById('job-location').value = currentJob.job_information?.location || '';
    document.getElementById('job-salary').value = currentJob.job_information?.salary || '';
    document.getElementById('job-description').value = currentJob.job_information?.description || '';
    document.getElementById('job-requirements').value = currentJob.job_information?.requirements || '';
    document.getElementById('job-applied').checked = currentJob.user_information?.applied === "True";
    document.getElementById('job-date-applied').value = currentJob.user_information?.date_applied || '';
    document.getElementById('job-keywords').value = (currentJob.job_information?.keywords || []).join(', ');
}

function saveJobChanges() {
    const updatedJob = {
        job_information: {
            title: document.getElementById('job-title').value,
            company: document.getElementById('job-company').value,
            location: document.getElementById('job-location').value,
            salary: document.getElementById('job-salary').value,
            description: document.getElementById('job-description').value,
            requirements: document.getElementById('job-requirements').value,
            keywords: document.getElementById('job-keywords').value.split(',').map(k => k.trim()).filter(k => k)
        },
        user_information: {
            applied: document.getElementById('job-applied').checked ? "True" : "False",
            date_applied: document.getElementById('job-date-applied').value
        }
    };

    // Send updated job data to main process
    window.electron.saveJobChanges({ jobIndex, updatedJob });
}

function goBack() {
    window.electron.navigateBack();
}

document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners for buttons
    document.getElementById('save-button').addEventListener('click', saveJobChanges);
    document.getElementById('back-button').addEventListener('click', goBack);
});