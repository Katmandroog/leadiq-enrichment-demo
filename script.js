document.getElementById('firstName').addEventListener('input', debounce(handleInput, 500));
document.getElementById('lastName').addEventListener('input', debounce(handleInput, 500));
document.getElementById('email').addEventListener('input', debounce(handleInput, 500));

function handleInput() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    
    if (firstName && lastName && email) {
        fetchLeadIQData(firstName, lastName, email);
    }
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

function fetchLeadIQData(firstName, lastName, email) {
    const apiUrl = 'https://api.leadiq.com/graphql'; // LeadIQ GraphQL endpoint
    const apiKey = 'aG1fcHJvZF9iYzRmZjk4YjQ2YjFmN2ZmMmUzNmEzMWUxOTZiOTczNTk3NWNmYTUyMzRiODcyMjczOTRkYTlmN2JiMjVhYzNj'; // Replace with your actual Secret Base64 API key

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
                        status
                        updatedAt
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

    console.log("Sending request to LeadIQ API with variables:", JSON.stringify(variables));

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
                throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(error)}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("Received response from LeadIQ API:", data);
        displayResults(data);
    })
    .catch(error => {
        console.error('Error:', error);
        document.querySelector('.results').innerHTML = `<p style="color:red;">Error fetching data: ${error.message}</p>`;
    });
}

function displayResults(data) {
    console.log("Displaying results:", data);
    if (data && data.data && data.data.searchPeople && data.data.searchPeople.results.length > 0) {
        const person = data.data.searchPeople.results[0];
        const position = person.currentPositions && person.currentPositions.length > 0 ? person.currentPositions[0] : {};
        const email = position.emails && position.emails.length > 0 ? position.emails[0].value : 'N/A';
        const phone = position.phones && position.phones.length > 0 ? position.phones[0].value : 'N/A';
        const profile = person.profiles && person.profiles.length > 0 ? person.profiles[0].url : 'N/A';
        const location = person.location ? `${person.location.city || ''}, ${person.location.state || ''}, ${person.location.country || ''}, ${person.location.postalCode || ''}`.trim() : 'N/A';
        const education = person.education && person.education.length > 0 ? `${person.education[0].school || ''}, ${person.education[0].degree || ''}, ${person.education[0].fieldOfStudy || ''}`.trim() : 'N/A';
        const experience = person.workExperience && person.workExperience.length > 0 ? `${person.workExperience[0].title || ''} at ${person.workExperience[0].company || ''}`.trim() : 'N/A';

        if (document.getElementById('title')) {
            document.getElementById('title').value = position.title || 'N/A';
        }
        if (document.getElementById('company')) {
            document.getElementById('company').value = position.companyInfo && position.companyInfo.name ? position.companyInfo.name : 'N/A';
        }
        if (document.getElementById('resultEmail')) {
            document.getElementById('resultEmail').value = email;
        }
        if (document.getElementById('phone')) {
            document.getElementById('phone').value = phone;
        }
        if (document.getElementById('profile')) {
            document.getElementById('profile').value = profile;
        }
        if (document.getElementById('location')) {
            document.getElementById('location').value = location;
        }
        if (document.getElementById('education')) {
            document.getElementById('education').value = education;
        }
        if (document.getElementById('experience')) {
            document.getElementById('experience').value = experience;
        }
    } else {
        // If no results are found
        document.getElementById('title').value = 'No match found';
        document.getElementById('company').value = 'No match found';
        document.getElementById('resultEmail').value = 'No match found';
        document.getElementById('phone').value = 'No match found';
        document.getElementById('profile').value = 'No match found';
        document.getElementById('location').value = 'No match found';
        document.getElementById('education').value = 'No match found';
        document.getElementById('experience').value = 'No match found';
    }
}


