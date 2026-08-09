// Store console window references to prevent duplicates
let activeConsoleWindow = null;

// Get the Py3 console trigger element
const py3Trigger = document.getElementById('py3-console-trigger');

if (!py3Trigger) {
    console.warn('Py3 console trigger not found');
}

// Generate a short UUID
function generateUUID() {
    return 'xxxxxxxxxxxx'.replace(/[x]/g, function(c) {
        const r = Math.random() * 16 | 0;
        return r.toString(16);
    });
}

// Create the console window
function createConsoleWindow() {
    // If window already exists, focus it and return
    if (activeConsoleWindow && document.body.contains(activeConsoleWindow)) {
        activeConsoleWindow.style.display = 'flex';
        activeConsoleWindow.focus();
        return;
    }

    const uuid = generateUUID();
    const windowId = uuid + '-window-holder';

    // Create the main window container
    const windowHolder = document.createElement('div');
    windowHolder.id = windowId;
    windowHolder.className = 'console-window';

    // --- Header ---
    const header = document.createElement('div');
    header.className = 'console-header';

    const headerTitle = document.createElement('span');
    headerTitle.className = 'console-header-title';
    headerTitle.textContent = 'Py3 console';

    const headerRight = document.createElement('div');
    headerRight.className = 'console-header-right';

    const clearBtn = document.createElement('button');
    clearBtn.className = 'console-btn console-btn-clear';
    clearBtn.textContent = 'Clear';
    clearBtn.id = uuid + '-clear-btn';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'console-btn console-btn-close';
    closeBtn.textContent = 'X';
    closeBtn.id = uuid + '-close-btn';

    headerRight.appendChild(clearBtn);
    headerRight.appendChild(closeBtn);

    header.appendChild(headerTitle);
    header.appendChild(headerRight);

    // --- Body (uneditable textfield) ---
    const body = document.createElement('div');
    body.className = 'console-body';
    body.id = uuid + '-console-body';
    body.contentEditable = false;
    body.setAttribute('role', 'log');

    // Initial welcome message
    const welcomeLine = document.createElement('div');
    welcomeLine.className = 'console-output-line console-prompt';
    welcomeLine.textContent = 'Py3 console ready.';
    body.appendChild(welcomeLine);

    const promptLine = document.createElement('div');
    promptLine.className = 'console-output-line console-prompt';
    promptLine.textContent = '>>> ';
    body.appendChild(promptLine);

    // --- Footer ---
    const footer = document.createElement('div');
    footer.className = 'console-footer';

    const commandInput = document.createElement('input');
    commandInput.type = 'text';
    commandInput.placeholder = 'Command...';
    commandInput.id = uuid + '-cmd-input';

    const sendBtn = document.createElement('button');
    sendBtn.className = 'console-send-btn';
    sendBtn.textContent = 'Send';
    sendBtn.id = uuid + '-send-btn';

    footer.appendChild(commandInput);
    footer.appendChild(sendBtn);

    // Assemble window
    windowHolder.appendChild(header);
    windowHolder.appendChild(body);
    windowHolder.appendChild(footer);

    // Add to body
    document.body.appendChild(windowHolder);

    // Store reference
    activeConsoleWindow = windowHolder;

    // --- Event Handlers ---

    // Clear button
    const clearHandler = function() {
        const bodyEl = document.getElementById(uuid + '-console-body');
        if (bodyEl) {
            // Keep only the welcome message and the prompt
            const children = bodyEl.children;
            const toRemove = [];
            for (let i = 0; i < children.length; i++) {
                if (i > 1) {
                    toRemove.push(children[i]);
                }
            }
            toRemove.forEach(function(child) {
                bodyEl.removeChild(child);
            });
            // Ensure prompt is the last child
            const promptLineCheck = bodyEl.querySelector('.console-prompt:last-child');
            if (!promptLineCheck || promptLineCheck.textContent !== '>>> ') {
                const newPrompt = document.createElement('div');
                newPrompt.className = 'console-output-line console-prompt';
                newPrompt.textContent = '>>> ';
                bodyEl.appendChild(newPrompt);
            }
            bodyEl.scrollTop = bodyEl.scrollHeight;
        }
    };
    document.getElementById(uuid + '-clear-btn').addEventListener('click', clearHandler);

    // Close button
    const closeHandler = function() {
        if (windowHolder && document.body.contains(windowHolder)) {
            document.body.removeChild(windowHolder);
            activeConsoleWindow = null;
        }
    };
    document.getElementById(uuid + '-close-btn').addEventListener('click', closeHandler);

    // Send button - simple echo without any predefined commands
    const sendHandler = function() {
        const input = document.getElementById(uuid + '-cmd-input');
        const bodyEl = document.getElementById(uuid + '-console-body');
        if (!input || !bodyEl) return;

        const command = input.value.trim();
        
        if (command === '') return;

        // Remove the last prompt line
        const children = bodyEl.children;
        if (children.length > 0) {
            const lastChild = children[children.length - 1];
            if (lastChild.textContent === '>>> ') {
                bodyEl.removeChild(lastChild);
            }
        }

        // Add the command as a new line
        const cmdLine = document.createElement('div');
        cmdLine.className = 'console-output-line console-prompt';
        cmdLine.textContent = '>>> ' + command;
        bodyEl.appendChild(cmdLine);

        // Simple placeholder response
        const resultLine = document.createElement('div');
        resultLine.className = 'console-output-line';
        resultLine.textContent = "";
        postMsgPayload("/eval", {pvl: command}).then((asw) => {
             asw.json().then(jsobj => {
                if (jsobj.code == 0) {
                    resultLine.textContent = jsobj.body;
                } else {
                    resultLine.textContent = jsobj.status;
                }
             })
        }).finally(aw => {
            if (resultLine.textContent === "") {
                resultLine.textContent = "wtf?!";
            }
        });
        
        bodyEl.appendChild(resultLine);

        // Add new prompt
        const newPrompt = document.createElement('div');
        newPrompt.className = 'console-output-line console-prompt';
        newPrompt.textContent = '>>> ';
        bodyEl.appendChild(newPrompt);

        // Clear input and scroll
        input.value = '';
        bodyEl.scrollTop = bodyEl.scrollHeight;
    };
    document.getElementById(uuid + '-send-btn').addEventListener('click', sendHandler);

    // Enter key on input
    commandInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendHandler();
        }
    });

    // Focus the input when window is created
    setTimeout(function() {
        commandInput.focus();
    }, 100);

    // --- Dragging logic ---
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    header.addEventListener('mousedown', function(e) {
        // Only drag if not clicking on a button
        if (e.target.closest('.console-btn')) return;

        isDragging = true;
        const rect = windowHolder.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        windowHolder.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        const newX = e.clientX - dragOffsetX;
        const newY = e.clientY - dragOffsetY;
        windowHolder.style.left = newX + 'px';
        windowHolder.style.top = newY + 'px';
        windowHolder.style.transform = 'none';
        if (!windowHolder.dataset.dragged) {
            windowHolder.dataset.dragged = 'true';
            windowHolder.style.transform = 'none';
        }
    });

    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            windowHolder.style.cursor = '';
        }
    });

    // Close on Escape
    const escHandler = function(e) {
        if (e.key === 'Escape' && document.body.contains(windowHolder)) {
            closeHandler();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    // Store cleanup reference
    windowHolder._cleanup = function() {
        document.removeEventListener('keydown', escHandler);
    };
}

// Trigger on click of the Py3 console menu item
py3Trigger.addEventListener('click', function(e) {
    e.preventDefault();
    createConsoleWindow();
});
