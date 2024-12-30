document.addEventListener('DOMContentLoaded', () => {
    const membersContainer = document.getElementById('members-container');
    const queryForm = document.getElementById('query-form');
    const responsesDiv = document.getElementById('responses');
    const setMembersButton = document.getElementById('set-members');
    const numMembersInput = document.getElementById('num-members');

    // Default number of Board Members
    const defaultNumMembers = 3;

    // Function to create input fields for board members
    function createMemberInputs(num, memberNames = []) {
        membersContainer.innerHTML = ''; // Clear existing inputs

        for (let i = 1; i <= num; i++) {
            const memberDiv = document.createElement('div');
            memberDiv.className = 'board-member';

            const nameLabel = document.createElement('label');
            nameLabel.innerText = `Member ${i} Name: `;
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.name = `member-name-${i}`;
            nameInput.required = true;
            nameInput.placeholder = `Enter name for Member ${i}`;

            // Set default names if provided
            if (memberNames[i - 1]) {
                nameInput.value = memberNames[i - 1];
            }

            memberDiv.appendChild(nameLabel);
            memberDiv.appendChild(nameInput);

            membersContainer.appendChild(memberDiv);
        }
    }

    // Function to parse URL parameters
    function getUrlParameters() {
        const params = new URLSearchParams(window.location.search);
        const numMembers = parseInt(params.get('num-members'), 10);
        const geminiKey = params.get('gemini-key') || '';
        const userQuery = params.get('user-query') || '';
        const memberNames = [];

        // Collect member names based on the number of members
        if (!isNaN(numMembers) && numMembers > 0) {
            for (let i = 1; i <= numMembers; i++) {
                const name = params.get(`member-name-${i}`);
                if (name) {
                    memberNames.push(name);
                } else {
                    memberNames.push(''); // Placeholder for missing names
                }
            }
        }

        return { numMembers, geminiKey, userQuery, memberNames };
    }

    // Function to update the URL without reloading the page
    function updateUrl(params) {
        const url = new URL(window.location);
        Object.keys(params).forEach(key => {
            if (Array.isArray(params[key])) {
                params[key].forEach((value, index) => {
                    url.searchParams.set(`${key}-${index + 1}`, value);
                });
            } else {
                url.searchParams.set(key, params[key]);
            }
        });
        window.history.replaceState({}, '', url);
    }

    // Initialize the form based on URL parameters
    function initializeForm() {
        const { numMembers, geminiKey, userQuery, memberNames } = getUrlParameters();

        // Set number of members
        const num = (!isNaN(numMembers) && numMembers >=1 && numMembers <=10) ? numMembers : defaultNumMembers;
        numMembersInput.value = num;

        // Create member inputs with names if provided
        createMemberInputs(num, memberNames);

        // Set Gemini API key if provided
        if (geminiKey) {
            document.getElementById('gemini-key').value = geminiKey;
        }

        // Set user query if provided
        if (userQuery) {
            document.getElementById('user-query').value = userQuery;
        }
    }

    // Initialize the form on page load
    initializeForm();

    // Event listener to set number of board members
    setMembersButton.addEventListener('click', () => {
        const num = parseInt(numMembersInput.value, 10);
        if (isNaN(num) || num < 1 || num > 10) {
            alert('Please enter a valid number of board members (1-10).');
            return;
        }
        createMemberInputs(num);

        // Optionally, update the URL to reflect the new number of members
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.set('num-members', num);
        window.history.replaceState({}, '', `${window.location.pathname}?${currentParams.toString()}`);
    });

    // Function to send a request to Gemini API using fetch with API key in URL
    async function queryGemini(apiKey, prompt) {
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

        try {
            const response = await fetch(geminiApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // Note: Authorization header is omitted as API key is passed in URL
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                    // Add other necessary parameters as per Gemini API documentation
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || 'Unknown Gemini API error');
            }

            const data = await response.json();

            // Updated parsing logic to match the actual API response structure
            if (
                data &&
                data.candidates &&
                Array.isArray(data.candidates) &&
                data.candidates.length > 0 &&
                data.candidates[0].content &&
                data.candidates[0].content.parts &&
                Array.isArray(data.candidates[0].content.parts) &&
                data.candidates[0].content.parts.length > 0 &&
                data.candidates[0].content.parts[0].text
            ) {
                return data.candidates[0].content.parts[0].text.trim();
            } else {
                throw new Error('Invalid response structure from Gemini API.');
            }
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw new Error(error.message);
        }
    }

    // Function to send a request to a Board Member
    async function queryBoardMember(memberName, userQuery, apiKey) {
        // Generate prompt based on member's name
        const fullPrompt = `You are ${memberName}, an expert in your field. Provide insightful and relevant advice based on the following user query.\n\nUser Query: ${userQuery}\n\nYour Advice:`;
        const responseText = await queryGemini(apiKey, fullPrompt);
        return responseText;
    }

    // Function to sanitize HTML to prevent XSS attacks (Optional but recommended)
    function sanitizeHTML(html) {
        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML;
    }

    // Function to generate a shareable URL based on current form inputs
    function generateShareableURL() {
        const formData = new FormData(queryForm);
        const numMembers = parseInt(formData.get('num-members'), 10) || defaultNumMembers;
        const geminiKey = formData.get('gemini-key').trim();
        const userQuery = formData.get('user-query').trim();
        const memberNames = [];

        for (let i = 1; i <= numMembers; i++) {
            const name = formData.get(`member-name-${i}`);
            if (name) {
                memberNames.push(name.trim());
            } else {
                memberNames.push('');
            }
        }

        const params = new URLSearchParams();

        params.set('num-members', numMembers);
        if (geminiKey) {
            params.set('gemini-key', geminiKey);
        }
        if (userQuery) {
            params.set('user-query', userQuery);
        }

        memberNames.forEach((name, index) => {
            if (name) {
                params.set(`member-name-${index + 1}`, name);
            }
        });

        const shareableURL = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        return shareableURL;
    }

    // Event listener for submitting the query
    queryForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent form submission

        // Clear previous responses
        responsesDiv.innerHTML = '';

        const formData = new FormData(queryForm);
        const apiKey = formData.get('gemini-key').trim();
        const userQuery = formData.get('user-query').trim();

        // Validate API key and user query
        if (!apiKey) {
            alert('Please provide the Gemini access key.');
            return;
        }

        if (!userQuery) {
            alert('Please enter your query.');
            return;
        }

        // Gather board members' information
        const boardMembers = [];
        const numMembers = parseInt(formData.get('num-members'), 10) || defaultNumMembers;

        for (let i = 1; i <= numMembers; i++) {
            const name = formData.get(`member-name-${i}`);

            // Check if the inputs exist and are not null
            if (name === null) {
                alert(`Missing input for Member ${i}. Please ensure all fields are filled out.`);
                return;
            }

            const trimmedName = name.trim();

            if (!trimmedName) {
                alert(`Please provide a name for Member ${i}.`);
                return;
            }

            boardMembers.push({ name: trimmedName });
        }

        // Display loading messages for each board member
        boardMembers.forEach(member => {
            const memberDiv = document.createElement('div');
            // Replace spaces with hyphens for valid HTML IDs
            const memberId = `response-${member.name.replace(/\s+/g, '-')}`;
            memberDiv.id = memberId;
            memberDiv.className = 'response';
            memberDiv.innerHTML = `<strong>${member.name}:</strong> <span class="loading">Loading...</span>`;
            responsesDiv.appendChild(memberDiv);
        });

        // Display Gemini (Summary) loading message
        const geminiDiv = document.createElement('div');
        geminiDiv.id = 'response-gemini-summary';
        geminiDiv.className = 'gemini-response';
        geminiDiv.innerHTML = `<strong>Gemini Summary:</strong> <span class="loading">Loading summary...</span>`;
        responsesDiv.appendChild(geminiDiv);

        // Array to hold individual responses
        const individualResponses = [];

        // Create an array of Promises for all board members
        const boardPromises = boardMembers.map(member => {
            const memberId = `response-${member.name.replace(/\s+/g, '-')}`;
            return queryBoardMember(member.name, userQuery, apiKey)
                .then(responseText => {
                    individualResponses.push({ name: member.name, advice: responseText });

                    // Convert Markdown to HTML using Marked.js
                    const htmlContent = marked.parse(responseText);
                    // Sanitize the HTML using DOMPurify
                    const sanitizedContent = DOMPurify.sanitize(htmlContent);
                    // Insert the sanitized HTML
                    const memberDiv = document.getElementById(memberId);
                    if (memberDiv) {
                        memberDiv.innerHTML = `<strong>${member.name}:</strong> ${sanitizedContent}`;
                    }
                })
                .catch(error => {
                    const memberDiv = document.getElementById(memberId);
                    if (memberDiv) {
                        memberDiv.innerHTML = `<strong>${member.name}:</strong> <span class="error">Error: ${error.message}</span>`;
                    }
                });
        });

        // Wait for all board member Promises to complete
        Promise.all(boardPromises)
            .then(() => {
                // After collecting all individual responses, create a summary prompt
                const summaryPrompt = `Please provide a concise summary of the following advice from each board member regarding the user's query:\n\n` +
                    individualResponses.map(member => `**${member.name}**:\n${member.advice}`).join('\n\n');

                // Fetch the summary from Gemini
                queryGemini(apiKey, summaryPrompt)
                    .then(summaryText => {
                        // Convert Markdown to HTML using Marked.js
                        const summaryHtml = marked.parse(summaryText);
                        // Sanitize the HTML using DOMPurify
                        const sanitizedSummary = DOMPurify.sanitize(summaryHtml);
                        // Insert the sanitized summary into the Gemini summary div
                        geminiDiv.innerHTML = `<strong>Gemini Summary:</strong> ${sanitizedSummary}`;
                    })
                    .catch(error => {
                        geminiDiv.innerHTML = `<strong>Gemini Summary:</strong> <span class="error">Error: ${error.message}</span>`;
                    });
            })
            .catch(error => {
                // Handle any unexpected errors
                console.error('Unexpected Error:', error);
                geminiDiv.innerHTML = `<strong>Gemini Summary:</strong> <span class="error">An unexpected error occurred while processing your request.</span>`;
            });

        // Optionally, generate and display a shareable URL
        const shareableURL = generateShareableURL();
        const shareDiv = document.createElement('div');
        shareDiv.className = 'response';
        shareDiv.innerHTML = `<strong>Shareable URL:</strong> <a href="${shareableURL}" target="_blank">${shareableURL}</a>`;
        responsesDiv.appendChild(shareDiv);
    });
});
