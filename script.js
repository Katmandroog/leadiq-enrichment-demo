document.getElementById('enrichButton').addEventListener('click', function() {
    console.log("Enrich Data button clicked");

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();

    // Ensure all fields are filled before making the API call
    if (firstName && lastName && validateEmail(email)) {
        fetchLeadIQData(firstName, lastName, email);
    } else {
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

    console.log("Making API call to LeadIQ with:", firstName, lastName, email);

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
                throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(error)}`);
            });
        }
        return response.json();
    })
    .then(data => {
        // Log the full API response for debugging
        console.log("Full API response received:", JSON.stringify(data, null, 2));

        // Log the searchPeople object specifically
        if (data && data.data && data.data.searchPeople) {
            console.log("Full searchPeople response:", JSON.stringify(data.data.searchPeople, null, 2));
        }

        // Call the function to display results on the page
        displayResults(data);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
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
        const education = person.education && person.education.length > 0 ? person.education[0].name : 'N/A';
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

        // Log any missing data fields for debugging
        if (industry === 'N/A') console.log("Missing industry data");
        if (linkedinUrl === 'N/A') console.log("Missing LinkedIn URL");
        if (education === 'N/A') console.log("Missing education data");
        if (profile === 'N/A') console.log("Missing social profile data");

    } else {
        console.warn("No results found.");
        document.querySelector('.results').innerHTML = `<p style="color:red;">No match found or incomplete response.</p>`;
    }
}
