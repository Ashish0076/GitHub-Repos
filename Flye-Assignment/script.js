document.addEventListener("DOMContentLoaded", function () {
    const githubForm = document.getElementById("githubForm");
    const repositoriesContainer = document.getElementById("repositories");
    const paginationContainer = document.getElementById("pagination");
    const loader = document.getElementById("loader");
    const userProfileContainer = document.getElementById("userProfile");

    githubForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const username = document.getElementById("username").value.trim();

        if (username !== "") {
            loader.style.display = "block";
            repositoriesContainer.innerHTML = "";
            paginationContainer.innerHTML = "";

            try {
                const userData = await fetchUserData(username);
                displayUserProfile(userData);

                const repositoriesData = await fetchRepositories(username, 10);
                if (repositoriesData.length > 0) {
                    displayRepositories(repositoriesData);
                    createPagination((await fetchNoOfRepositories(username)).length, 10);
                } else {
                    repositoriesContainer.innerHTML = "<p>No repositories found for this user.</p>";
                }
            } catch (error) {
                console.error("Error:", error);
                repositoriesContainer.innerHTML = "<p>An error occurred while fetching user data or repositories.</p>";
            } finally {
                loader.style.display = "none";
            }
        }
    });

    async function fetchUserData(username) {
        const userApiUrl = `https://api.github.com/users/${username}`;
        const response = await fetch(userApiUrl);
        return response.json();
    }

    async function fetchRepositories(username, perPage) {
        const repositoriesApiUrl = `https://api.github.com/users/${username}/repos?per_page=${perPage}`;
        const response = await fetch(repositoriesApiUrl);
        return response.json();
    }

    async function fetchNoOfRepositories(username) {
        const repositoriesApiUrl2 = `https://api.github.com/users/${username}/repos`;
        const response2 = await fetch(repositoriesApiUrl2);
        return response2.json();
    }

    function displayUserProfile(user) {
        userProfileContainer.innerHTML = `
            <div class="card mt-4">
                <div class="card-body d-flex">
                    <img src="${user.avatar_url}" alt="${user.login}'s Avatar" class="img-fluid mr-3">
                    <div>
                        <h2 class="card-title">${user.login}</h2>
                        <p>${user.bio || "No bio available."}</p>
                        <p>Location: ${user.location}</p>
                        <p>Profile URL: ${user.html_url}</p>
                        <p>Public Repositories: ${user.public_repos}</p>
                    </div>
                </div>
            </div>
        `;
    }

    function displayRepositories(repositories) {
        repositories.forEach(repository => {
            const repositoryElement = document.createElement("div");
            repositoryElement.classList.add("repository");

            const languagesUrl = repository.languages_url;

            fetch(languagesUrl)
                .then(response => response.json())
                .then(languagesData => {
                    const languages = Object.keys(languagesData);
                    const languagesList = languages.map(language => `<span class="language-box">${language}</span>`).join(" ");

                    repositoryElement.innerHTML = `
                        <h3>${repository.name}</h3>
                        <p>${repository.description || "No description available."}</p>
                        <p>${languagesList}</p>
                        <a href="${repository.html_url}" target="_blank">View on GitHub</a>
                    `;
                    repositoriesContainer.appendChild(repositoryElement);
                })
                .catch(error => {
                    console.error("Error fetching repository languages:", error);
                    repositoryElement.innerHTML = "<p>An error occurred while fetching repository languages.</p>";
                    repositoriesContainer.appendChild(repositoryElement);
                });
        });
    }

    function createPagination(totalItems, itemsPerPage) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        for (let i = 1; i <= totalPages; i++) {
            const pageItem = document.createElement("li");
            pageItem.classList.add("page-item");
            const pageLink = document.createElement("a");
            pageLink.classList.add("page-link");
            pageLink.href = "#";
            pageLink.innerText = i;
            pageLink.addEventListener("click", function () {
                loader.style.display = "block";
                repositoriesContainer.innerHTML = "";
                fetchRepositoriesWithPage(document.getElementById("username").value, i, itemsPerPage);
            });
            pageItem.appendChild(pageLink);
            paginationContainer.appendChild(pageItem);
        }
    }

    async function fetchRepositoriesWithPage(username, page, perPage) {
        const apiUrl = `https://api.github.com/users/${username}/repos?page=${page}&per_page=${perPage}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.length > 0) {
                displayRepositories(data);
            } else {
                repositoriesContainer.innerHTML = "<p>No repositories found for this user on this page.</p>";
            }
        } catch (error) {
            console.error("Error fetching repositories:", error);
            repositoriesContainer.innerHTML = "<p>An error occurred while fetching repositories.</p>";
        } finally {
            loader.style.display = "none";
        }
    }
});
