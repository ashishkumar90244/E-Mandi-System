// JavaScript for search functionality
const searchInput = document.getElementById('searchInput');
const suggestionsList = document.getElementById('suggestions');

// Dummy suggestions for demonstration
const dummySuggestions = [
  'Apple',
  'Banana',
  'Guvava',
  'Papaya',
  'Potato',
  'Tomato',
  'Brinjal',
  'Lemon',
  'Cardamon',
  'Black Pepper',
  'Almond',
  

'Mango',

'Pineapple',

'Pomegranate',

'Orange',

'Sweet lime (Mosambi)',

'Watermelon',

'Kiwi',

'Custard apple (Sitaphal)',

'Sapota (Chikoo)'


  
];

// Event listener for input in search box
searchInput.addEventListener('input', function() {
  const query = this.value.trim();
  if (query.length === 0) {
    suggestionsList.innerHTML = '';
    suggestionsList.style.display = 'none';
    return;
  }

  // Generate suggestions based on the query
  const suggestions = dummySuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  );

  // Display suggestions
  displaySuggestions(suggestions);
});

// Function to display suggestions
function displaySuggestions(suggestions) {
  if (suggestions.length === 0) {
    suggestionsList.innerHTML = '';
    suggestionsList.style.display = 'none';
    return;
  }

  const html = suggestions.map(suggestion =>
    `<li>${suggestion}</li>`
  ).join('');

  suggestionsList.innerHTML = html;
  suggestionsList.style.display = 'block';

  // Event listener for clicking on suggestions
  suggestionsList.querySelectorAll('li').forEach(suggestion => {
    suggestion.addEventListener('click', function() {
      searchInput.value = this.textContent;
      suggestionsList.innerHTML = '';
      suggestionsList.style.display = 'none';
      // Here you can perform the search based on the selected suggestion
      // For demonstration, let's just log the selected suggestion
      console.log('Searching for:', this.textContent);
    });
  });
}
