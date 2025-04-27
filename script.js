// Import the API_KEY from config.js
import { API_KEY } from './config.js';

const BASE_URL = 'https://api.spoonacular.com/recipes';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const dietFilter = document.getElementById('diet-filter');
const mealType = document.getElementById('meal-type');
const resultsContainer = document.getElementById('results-container');
const loadingElement = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const recipeModal = document.getElementById('recipe-modal');
const modalContent = document.getElementById('modal-recipe-content');
const closeModal = document.querySelector('.close-modal');

// Event Listeners
searchBtn.addEventListener('click', searchRecipes);
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchRecipes();
    }
});
closeModal.addEventListener('click', () => {
    recipeModal.classList.add('hidden');
});

// Search Recipes Function
async function searchRecipes() {
    const ingredients = searchInput.value.trim();
    
    if (!ingredients) {
        showError('Please enter at least one ingredient');
        return;
    }
    
    // Clear previous results and errors
    resultsContainer.innerHTML = '';
    errorMessage.classList.add('hidden');
    
    // Show loading spinner
    loadingElement.classList.remove('hidden');
    
    try {
        // Build API URL with parameters for complex search
        const url = new URL(`${BASE_URL}/complexSearch`);
        url.searchParams.append('apiKey', API_KEY);
        url.searchParams.append('query', ingredients);
        url.searchParams.append('number', 12); // Number of results
        url.searchParams.append('addRecipeInformation', true);
        url.searchParams.append('fillIngredients', true);
        
        // Add diet filter if selected
        if (dietFilter.value) {
            url.searchParams.append('diet', dietFilter.value);
        }
        
        // Add meal type filter if selected
        if (mealType.value) {
            url.searchParams.append('type', mealType.value.toLowerCase());
        }
        
        // Fetch recipes from API
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Hide loading spinner
        loadingElement.classList.add('hidden');
        
        if (data.results.length === 0) {
            showError('No recipes found. Try different ingredients.');
            return;
        }
        
        // Display recipes
        displayRecipes(data.results);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        loadingElement.classList.add('hidden');
        showError('Failed to fetch recipes. Please try again later.');
    }
}

// Display Recipes Function
function displayRecipes(recipes) {
    recipes.forEach((recipe) => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');
        
        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-img">
            <div class="recipe-info">
                <h3 class="recipe-title">${recipe.title}</h3>
                <div class="recipe-details">
                    <span><i class="fas fa-clock"></i> ${recipe.readyInMinutes || 'N/A'} mins</span>
                    <span><i class="fas fa-utensils"></i> ${recipe.servings || 'N/A'} servings</span>
                </div>
                <button class="view-recipe-btn" data-recipe-id="${recipe.id}">
                    View Recipe
                </button>
            </div>
        `;
        
        resultsContainer.appendChild(recipeCard);
    });
    
    // Add event listeners to all view recipe buttons
    document.querySelectorAll('.view-recipe-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const recipeId = e.target.getAttribute('data-recipe-id');
            try {
                const recipe = await getRecipeDetails(recipeId);
                showRecipeDetails(recipe);
            } catch (error) {
                console.error('Error fetching recipe details:', error);
                showError('Failed to load recipe details. Please try again.');
            }
        });
    });
}

// Get Recipe Details
async function getRecipeDetails(recipeId) {
    const url = new URL(`${BASE_URL}/${recipeId}/information`);
    url.searchParams.append('apiKey', API_KEY);
    url.searchParams.append('includeNutrition', false);
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    return await response.json();
}

// Show Recipe Details in Modal
function showRecipeDetails(recipe) {
    modalContent.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}" class="modal-recipe-img">
        <h2 class="modal-recipe-title">${recipe.title}</h2>
        <div class="modal-recipe-details">
            <span><i class="fas fa-clock"></i> <strong>Prep Time:</strong> ${recipe.readyInMinutes || 'N/A'} mins</span>
            <span><i class="fas fa-utensils"></i> <strong>Servings:</strong> ${recipe.servings || 'N/A'}</span>
            <span><i class="fas fa-heart"></i> <strong>Likes:</strong> ${recipe.aggregateLikes || 0}</span>
        </div>
        <div class="modal-section">
            <h3>Ingredients</h3>
            <ul class="ingredients-list">
                ${recipe.extendedIngredients.map(ingredient => 
                    `<li>${ingredient.original}</li>`
                ).join('')}
            </ul>
        </div>
        <div class="modal-section">
            <h3>Instructions</h3>
            <ol class="instructions-list">
                ${recipe.analyzedInstructions[0]?.steps.map(step => 
                    `<li>${step.step}</li>`
                ).join('') || '<li>No instructions available. Please check the original recipe.</li>'}
            </ol>
        </div>
        <a href="${recipe.sourceUrl}" target="_blank" class="view-recipe-btn" style="display: inline-block; text-align: center; margin-top: 1rem;">
            View Full Recipe on ${recipe.sourceName || 'Original Site'}
        </a>
    `;
    
    recipeModal.classList.remove('hidden');
}

// Show Error Message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

// Initialize the app
window.addEventListener('DOMContentLoaded', () => {
    // Optional: load some sample recipes on initial load
});
