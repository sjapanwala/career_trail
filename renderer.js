
// Keep track of all jobs for filtering
let allJobs = [];

// Listen for job data sent from the main process
window.electron.onJobData((event, jobData) => {
    console.log("Received Job Data:", jobData);
    if (jobData) {
        allJobs = jobData;
        displayJobs(jobData);
    }
});

// Add search functionality
function setupSearch() {
    const searchInput = document.getElementById('job-search');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const filteredJobs = searchTerm === '' ? allJobs : allJobs.filter(job => {
            // Assuming 'searchableFields' is available in the JSON data
            const searchableFields = job.job_information ? Object.keys(job.job_information) : [];

            return searchableFields.some(field => {
                if (job.job_information.hasOwnProperty(field)) {
                    const fieldValue = job.job_information[field];
                    if (Array.isArray(fieldValue)) {
                        // If it's an array (e.g., keywords), check each element
                        return fieldValue.some(item => item.toString().toLowerCase().includes(searchTerm));
                    } else if (fieldValue && fieldValue.toString().toLowerCase().includes(searchTerm)) {
                        return true;
                    }
                }
                return false;
            });
        });
        displayJobs(filteredJobs);
        const resultsCount = document.getElementById('results-count');
        resultsCount.textContent = `Found ${filteredJobs.length} matching jobs`;
        resultsCount.style.color = "#EEEEEE";
    });
}
function displayJobs(jobs) {
    const jobListContainer = document.getElementById('job-list');
    jobListContainer.innerHTML = '';

    if (jobs.length === 0) {
        jobListContainer.innerHTML = '<div class="no-jobs">No matching jobs found</div>';
        return;
    }

    jobs.forEach((job, index) => {
        const jobContainer = document.createElement('div');
        jobContainer.className = 'job-container';

        const jobHeader = document.createElement('div');
        jobHeader.className = 'job-header';
        
        let job_applied_status = "🔘";
        if (job.user_information?.applied === "True") {
            job_applied_status = "✅";
        }

        const keywords = job.job_information?.keywords || [];
        const keywordDisplay = keywords.length > 0 
            ? `<div class="keywords">${keywords.map(keyword => 
                `<span class="keyword-tag">${keyword}</span>`).join('')}</div>`
            : '';

        let applylink = "";
        if (job.job_source?.job_url) {
            applylink = job.job_source?.job_url;
        }
        applybtn = `<a href="${applylink}" target="_blank" class="btn default-btn">Apply Now!</a>`;

        jobHeader.innerHTML = `
            <a class="status" href="${applylink}" data-job-id="${job.id}">${job_applied_status}</a>
            <div class="job-main-info">
                <span class="title">${job.job_information?.title || 'Untitled Position'}</span>
                <span class="company">${job.job_information?.company || 'Company Not Listed'}</span>
                ${keywordDisplay}
            </div>
            <span class="toggle-btn">▼</span>
        `;

        jobContainer.appendChild(jobHeader);

        const applyLinkElement = jobHeader.querySelector('.status');
        applyLinkElement.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the default link action

            const jobId = applyLinkElement.getAttribute('data-job-id');

            // Update the job status to "view" using the Electron API
            window.electronAPI.updateJobStatus(jobId, "view").then(response => {
                if (response.success) {
                    console.log(`Status for job ${jobId} updated to "view".`);
                    applyLinkElement.textContent = "✅"; // Update the UI
                } else {
                    console.error("Failed to update job status:", response.error);
                }
            });
        });

        jobListContainer.appendChild(jobContainer);
        let jobSiteButton = '';
        // Check if job.job_source.site is defined and is a valid string
        if (job.job_source.site && typeof job.job_source.site === 'string') {
            // Check if job_url contains 'indeed' or 'linkedin'
            if (job.job_source.site.toLowerCase() == ('indeed')) {
                //console.log('Job URL:', job.job_source.site);
                jobSiteButton = `
                    <a href="${job.job_source.site}" target="_blank" class="btn indeed-btn">
                        <img src="https://logos-world.net/wp-content/uploads/2021/02/Indeed-Symbol.png" alt="Indeed" class="btn-logo">
                    </a>
                `;
            } else if (job.job_source.site.toLowerCase() == ('linkedin')) {
                //console.log('Job URL:', job.job_source.site);
                jobSiteButton = `
                    <a href="${job.job_source.site}" target="_blank" class="btn linkedin-btn">
                        <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" class="btn-logo">
                    </a>
                `;
            } else {
                jobSiteButton = `<a href="${job.job_source.site}" target="_blank" class="btn default-btn">${job.job_source.site}</a>`;
            }
        } else {
            // Fallback if job.job_source.site is undefined or empty
            jobSiteButton = `<a href="${job.job_source.site}" target="_blank" class="btn default-btn">${job.job_source.site}</a>`;
        }




        const dropdownContent = document.createElement('div');
        dropdownContent.className = 'dropdown-content';
        dropdownContent.style.display = 'none';
        
        dropdownContent.innerHTML = `
            <div class="job-details">
                <div class="job-details-header">
                    <h3>More Information</h3>
                    <button class="edit-button" onclick="navigateToEdit('${index}')">
                        ✏️
                    </button>
                </div>
                <div class="job-details-content">
                    <p>
                        <strong>Posted By:</strong> ${job.job_information?.company || 'Not specified'}<br>
                        <strong>Location: </strong> ${job.job_information?.location || 'Not specified'}<br>
                        <strong>Salary: </strong> ${job.job_information?.salary || 'Not specified'}<br>
                        <strong>Date Posted:</strong> ${job.job_information?.date_posted || 'Not specified'}<br>
                        <strong>Date Found:</strong> ${job.job_information?.date_posted || 'Not specified'}<br>
                    </p>
                    <p>
                        <strong></strong> ${jobSiteButton} ${applybtn}<br>
                        <strong>Application Sent: </strong> ${job.user_information?.applied || 'Not specified'}<br>
                        <strong>Response Received: </strong> ${job.user_information?.responsded || 'Not specified'}<br>
                    </p>
                </div>
                <details>
                <summary><strong>User Notes</strong></summary>
                    <p>${job.user_information?.user_notes || 'Write Notes...'}</p>
                </details>
                <details>
                <summary><strong>Keywords</strong></summary>
                    <p>${job.job_keywords?.keywords || 'Not specified'}</p>
                </details>
                
            </div>
        `
        ;

        jobHeader.addEventListener('click', () => {
            const isHidden = dropdownContent.style.display === 'none';
            dropdownContent.style.display = isHidden ? 'block' : 'none';
            jobHeader.querySelector('.toggle-btn').textContent = isHidden ? '▲' : '▼';
        });

        jobContainer.appendChild(jobHeader);
        jobContainer.appendChild(dropdownContent);
        jobListContainer.appendChild(jobContainer);
    });
}

// Navigation function to edit page
function navigateToEdit(jobIndex) {
    const job = allJobs[jobIndex];
    // Send the job data to the edit page
    window.electron.navigateToEdit({ jobIndex, jobData: job });
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    setupSearch();
    window.electron.requestJobData();
});

document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('run-scripts');
    
    button.addEventListener('click', function() {
        const job_name = document.getElementById("occupation").value; // Get job name when button is clicked
        const location = document.getElementById("location").value; // Get location when button is clicked
        
        if (!job_name || !location) {
            // Display an error message if any of the fields is empty
            alert("Please Fill Out Both Fields");
            return; // Exit the function early if validation fails
        }

        console.log("Button clicked!");
        console.log("Job name:", job_name);
        console.log("Location:", location);


        
        // Call your function to run the Python script here
    });
});
