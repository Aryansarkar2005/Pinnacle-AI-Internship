document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('evaluation-form');
    const fileInput = document.getElementById('resume');
    const fileNameDisplay = document.getElementById('file-name-display');
    const inputSection = document.getElementById('input-section');
    const resultsSection = document.getElementById('results-section');
    const processingOverlay = document.getElementById('processing-overlay');
    const statusText = document.getElementById('processing-status');
    const progressFill = document.getElementById('progress-fill');
    const resetBtn = document.getElementById('reset-btn');

    // File Input change listener
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileNameDisplay.textContent = e.target.files[0].name;
            fileNameDisplay.style.display = 'block';
        } else {
            fileNameDisplay.textContent = '';
            fileNameDisplay.style.display = 'none';
        }
    });

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        // Start simulation
        inputSection.classList.add('hidden');
        processingOverlay.classList.remove('hidden');

        // Simulation Sequence
        const statuses = [
            "Uploading Document...",
            "Initializing AI Engine...",
            "Reading Resume Content...",
            "Extracting Candidate Details...",
            "Highlighting Important Skills...",
            "Evaluating Against Requirements..."
        ];

        let i = 0;
        progressFill.style.width = '0%';

        const simInterval = setInterval(() => {
            if (i < statuses.length) {
                statusText.textContent = statuses[i];
                progressFill.style.width = `${(i + 1) * 16.6}%`;
                i++;
            }
        }, 800); // 800ms per step

        try {
            // Actual API Call
            const response = await fetch('/api/evaluate', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            // Wait for simulation to finish at least 5 seconds total for effect
            setTimeout(() => {
                clearInterval(simInterval);
                progressFill.style.width = '100%';
                statusText.textContent = "Processing Complete!";

                setTimeout(() => {
                    processingOverlay.classList.add('hidden');
                    if (data.error) {
                        alert("Error: " + data.error);
                        inputSection.classList.remove('hidden');
                    } else {
                        displayResults(data);
                    }
                }, 800);
            }, 4800);

        } catch (error) {
            clearInterval(simInterval);
            processingOverlay.classList.add('hidden');
            alert("An error occurred: " + error.message);
            inputSection.classList.remove('hidden');
        }
    });

    // Reset button
    resetBtn.addEventListener('click', () => {
        resultsSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
        form.reset();
        fileNameDisplay.textContent = '';
        fileNameDisplay.style.display = 'none';
    });

    function displayResults(data) {
        // Basic Info
        document.getElementById('res-name').textContent = data.name;
        document.getElementById('res-email').textContent = data.email;
        document.getElementById('res-phone').textContent = data.phone;

        // Score
        const scoreRing = document.getElementById('res-score');
        const scoreContainer = document.getElementById('score-container');

        scoreRing.textContent = data.score;

        // Reset classes
        scoreContainer.className = 'score-container';

        // Add specific class based on score
        const scoreClassMap = {
            'Best': 'score-best',
            'Good': 'score-good',
            'Fair': 'score-fair',
            'Not Best': 'score-notbest'
        };
        scoreContainer.classList.add(scoreClassMap[data.score] || 'score-fair');

        // Render Skills Tags
        renderTags('res-desired-skills', data.desired_skills);
        renderTags('res-matched-skills', data.matched_skills);
        renderTags('res-all-skills', data.candidate_skills);

        resultsSection.classList.remove('hidden');
    }

    function renderTags(elementId, skillsArray) {
        const container = document.getElementById(elementId);
        container.innerHTML = ''; // Clear existing

        if (!skillsArray || skillsArray.length === 0) {
            container.innerHTML = '<span style="color:var(--text-muted); font-size:0.9rem;">None found</span>';
            return;
        }

        skillsArray.forEach(skill => {
            const span = document.createElement('span');
            span.className = 'skill-tag';
            // capitalize first letter
            span.textContent = skill.charAt(0).toUpperCase() + skill.slice(1);
            container.appendChild(span);
        });
    }
});
