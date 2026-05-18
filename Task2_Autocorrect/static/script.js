document.addEventListener('DOMContentLoaded', () => {
    // Custom Illuminating Cursor
    const cursorDot = document.getElementById('cursor-dot');
    document.addEventListener('mousemove', (e) => {
        if (cursorDot) {
            cursorDot.style.left = `${e.clientX}px`;
            cursorDot.style.top = `${e.clientY}px`;
        }
    });
    document.addEventListener('mousedown', () => {
        if (cursorDot) cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
    });
    document.addEventListener('mouseup', () => {
        if (cursorDot) cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    const textInput = document.getElementById('text-input');
    const processBtn = document.getElementById('process-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    const inputSection = document.getElementById('input-section');
    const animationSection = document.getElementById('animation-section');
    const roboticStatus = document.getElementById('robotic-status');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const revealControls = document.getElementById('reveal-controls');
    const revealBtn = document.getElementById('reveal-btn');
    
    const outputContainer = document.getElementById('output-container');
    const textOutput = document.getElementById('text-output');
    const metricsDisplay = document.getElementById('metrics');

    let currentData = null; // Store data from API
    let modificationsCount = 0;

    const resetHomeBtn = document.getElementById('reset-home-btn');
    if (resetHomeBtn) {
        resetHomeBtn.addEventListener('click', () => {
            textInput.value = '';
            resetUI();
        });
    }

    clearBtn.addEventListener('click', () => {
        textInput.value = '';
        resetUI();
    });

    function resetUI() {
        inputSection.classList.remove('hidden');
        animationSection.classList.add('hidden');
        outputContainer.classList.add('hidden');
        roboticStatus.textContent = '';
        roboticStatus.classList.remove('error');
        progressContainer.classList.add('hidden');
        progressFill.style.width = '0%';
        revealControls.classList.add('hidden');
        textOutput.innerHTML = '';
        metricsDisplay.textContent = '';
        processBtn.disabled = false;
        processBtn.querySelector('span').textContent = 'INITIATE SCAN';
    }

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    processBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text) return;

        // Start Animation Flow
        inputSection.classList.add('hidden');
        animationSection.classList.remove('hidden');
        
        roboticStatus.textContent = '[SCANNING DATA STREAM FOR ANOMALIES...]';
        roboticStatus.classList.remove('error');

        try {
            // API Call while "Scanning"
            const response = await fetch('/api/correct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });

            currentData = await response.json();
            
            if (currentData.error) {
                roboticStatus.textContent = `[SYSTEM ERROR: ${currentData.error}]`;
                roboticStatus.classList.add('error');
                await sleep(3000);
                return resetUI();
            }

            modificationsCount = currentData.tokens.filter(t => t.changed).length;

            await sleep(1500); // Initial scan time

            if (modificationsCount > 0) {
                // Step 2: Show Scan Results
                roboticStatus.textContent = `[WARNING: ${modificationsCount} CORRUPTIONS DETECTED]`;
                roboticStatus.classList.add('error');
                
                await sleep(1500); // Read time for warning
                
                // Step 3: Repair Protocol
                roboticStatus.textContent = '[INITIATING REPAIR PROTOCOL...]';
                roboticStatus.classList.remove('error');
                progressContainer.classList.remove('hidden');
                
                // Trigger progress bar
                // Small delay to ensure display:block applies before width change
                await sleep(50);
                progressFill.style.width = '100%';
                
                await sleep(1500); // Wait for progress bar animation
                
                // Step 4: Ready to Reveal
                roboticStatus.textContent = '[REPAIRS COMPLETE. DATA READY.]';
                revealControls.classList.remove('hidden');
            } else {
                roboticStatus.textContent = '[DATA STREAM OPTIMAL. NO CORRUPTIONS FOUND.]';
                await sleep(3000);
                resetUI();
            }

        } catch (error) {
            roboticStatus.textContent = `[CRITICAL FAILURE: CONNECTION LOST]`;
            roboticStatus.classList.add('error');
            await sleep(3000);
            resetUI();
        }
    });

    // Final Reveal
    revealBtn.addEventListener('click', () => {
        animationSection.classList.add('hidden');
        outputContainer.classList.remove('hidden');
        
        textOutput.innerHTML = '';
        
        // Render word by word
        currentData.tokens.forEach((token, index) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word';
            wordSpan.textContent = token.corrected;
            
            if (token.changed) {
                // Add tooltip
                const tooltip = document.createElement('span');
                tooltip.className = 'original-text';
                tooltip.textContent = token.original;
                wordSpan.appendChild(tooltip);
            }

            wordSpan.style.opacity = '0';
            textOutput.appendChild(wordSpan);

            // Matrix reveal
            setTimeout(() => {
                wordSpan.style.opacity = '1';
                if (token.changed) {
                    wordSpan.classList.add('corrected');
                }
            }, index * 100);
        });

        // Show metrics at end
        setTimeout(() => {
            metricsDisplay.textContent = `[REPAIRS EXECUTED: ${modificationsCount}]`;
        }, currentData.tokens.length * 100 + 300);
    });
});
