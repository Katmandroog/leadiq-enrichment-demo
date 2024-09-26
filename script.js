

 document.getElementById('enrichButton').addEventListener('click', function() {
    logMessage("🟢 Enrich Data button activated. We're off to the races!");

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();

    // Ensure all fields are filled before making the API call
    if (firstName && lastName && validateEmail(email)) {
        logMessage(`🚀 Starting API call for ${firstName} ${lastName} with email: ${email}. Hold on to your pipeline.`);
        fetchLeadIQData(firstName, lastName, email);
    } else {
        logMessage("❌ Please fill out all fields with valid data before submitting.", true);
        alert("Please fill out all fields with valid data before submitting.");
    }
});

// Helper function to validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function fetchLeadIQData(firstName, lastName, email) {
    const apiUrl = 'https://api.leadiq.com/graphql';
    const apiKey = 'aG1fcHJvZF9iYzRmZjk4YjQ2YjFmN2ZmMmUzNmEzMWUxOTZiOTczNTk3NWNmYTUyMzRiODcyMjczOTRkYTlmN2JiMjVhYzNj';

    logMessage("📡 Making API request to LeadIQ... Fingers crossed!");

    const query = `
        query SearchPeople($input: SearchPeopleInput!) {
            searchPeople(input: $input) {
                totalResults
                hasMore
                results {
                    name {
                        fullName
                    }
                    currentPositions {
                        title
                        emails {
                            value
                        }
                        phones {
                            value
                        }
                        companyInfo {
                            name
                            industry
                            linkedinUrl
                        }
                    }
                    profiles {
                        network
                        id
                        username
                        url
                    }
                    education {
                        name
                        degrees
                    }
                }
            }
        }
    `;

    const variables = {
        input: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            limit: 1
        }
    };

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${apiKey}`
        },
        body: JSON.stringify({ query, variables, operationName: "SearchPeople" })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                logMessage(`❌ API Error: ${response.status}. Details: ${JSON.stringify(error)}`, true);
                throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(error)}`);
            });
        }
        logMessage("✅ API response received. Processing... let's reel in the results!");
        return response.json();
    })
    .then(data => {
        logMessage("📊 API response processed. Displaying your shiny new data!");
        displayResults(data);
    })
    .catch(error => {
        logMessage(`❌ Error fetching data: ${error.message}`, true);
        document.querySelector('.results').innerHTML = `<p style="color:red;">Error fetching data: ${error.message}</p>`;
    });
}

function displayResults(data) {
    if (data && data.data && data.data.searchPeople && data.data.searchPeople.results.length > 0) {
        const person = data.data.searchPeople.results[0];
        const position = person.currentPositions && person.currentPositions.length > 0 ? person.currentPositions[0] : {};
        const email = position.emails && position.emails.length > 0 ? position.emails[0].value : 'N/A';
        const phone = position.phones && position.phones.length > 0 ? position.phones[0].value : 'N/A';
        const profile = person.profiles && person.profiles.length > 0 ? person.profiles[0].url : 'N/A';
        const education = person.education && person.education.length > 0 ? person.education.map(ed => ed.name).join(', ') : 'N/A';
        const industry = position.companyInfo && position.companyInfo.industry ? position.companyInfo.industry : 'N/A';
        const linkedinUrl = position.companyInfo && position.companyInfo.linkedinUrl ? position.companyInfo.linkedinUrl : 'N/A';

        // Update form fields with the data
        document.getElementById('title').value = position.title || 'N/A';
        document.getElementById('company').value = position.companyInfo && position.companyInfo.name ? position.companyInfo.name : 'N/A';
        document.getElementById('resultEmail').value = email;
        document.getElementById('phone').value = phone;
        document.getElementById('linkedin').value = linkedinUrl;
        document.getElementById('education').value = education;
        document.getElementById('profiles').value = profile;
        document.getElementById('industry').value = industry;

        logMessage("✅ Results displayed successfully!");
        logMessage("🔥 Holy Smokes that was Fast!");
    } else {
        logMessage("❌ No results found or incomplete response.", true);
        document.querySelector('.results').innerHTML = `<p style="color:red;">No match found or incomplete response.</p>`;
    }
}

// Helper function to log messages in the log-container
function logMessage(message, isError = false) {
    const logContainer = document.getElementById('log-messages');
    const logEntry = document.createElement('div');
    logEntry.textContent = message;
    logEntry.classList.add('log-entry');
    logEntry.style.color = isError ? 'red' : 'black';
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight; // Auto-scroll to the bottom
}
