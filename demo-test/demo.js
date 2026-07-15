const url = "https://www.searchapi.io/api/v1/search";
const params = new URLSearchParams({
  "engine": "google",
  "q": "west bengal current cm name",
  "api_key": "wxgWYqeWcJKsevFnuNKu9zMx"
});

fetch(`${url}?${params}`)
  .then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });