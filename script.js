const inputSearch = document.getElementById('inputSearch');
const searchBtn = document.getElementById('searchBtn');
const favoriteContainer = document.getElementById('favoriteContainer');
const randomMeal = document.getElementById('randomMeal');
const randomIngredientsList = document.getElementById('randomIngredientsList');
const randomPreparationInfo = document.getElementById('randomPreparationInfo');
const randomLikeBtn = document.getElementById('randomLikeBtn');
const searchedListSection = document.querySelector('.searchedList-section');
const searchedListContainer = document.getElementById('searchedListContainer');
const searchedListTitle = document.getElementById('searchedList-title');
const dialog = document.getElementById('selected-meal-dialog');
const closeDialogBtn = document.getElementById('closeDialogBtn');
const selectedMealEl = document.getElementById('selectedMeal');
const selectedIngredientsList = document.getElementById('selectedIngredientsList');
const selectedPreparationInfo = document.getElementById('selectedPreparationInfo');
const selectedLikeBtn = document.getElementById('selectedLikeBtn');

let favoriteMeals = JSON.parse(localStorage.getItem('favList')) || [];
let favMeal = null;
let selMeal = null;
let searchLikeBtns = null;
let searchedMeals = null;




// DISPLAY MEAL FUNCTION
async function displayMeal(type, id) {

  let data;

  if(type === 'random') {
    try {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
      data = await response.json();  
    } catch(error) {
      console.error(error);
    }
    
  } else if (type === 'selected') {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      data = await response.json();
    } catch(error) {
      console.error(error);
    }    
  }  


  const meal = type === 'random' ? randomMeal : selectedMealEl;

  const mealImage = meal.querySelector('img');
  const mealName = meal.querySelector('span h2');

  mealImage.src = data.meals[0].strMealThumb;
  mealImage.alt = data.meals[0].strMeal;
  mealName.innerText = data.meals[0].strMeal;

  const ingredients = [];
  
  for(let i = 1; i <= 20; i++) {

    let ingredient = data.meals[0][`strIngredient${i}`];
    let measurement = data.meals[0][`strMeasure${i}`];

    if(ingredient !== "" && ingredient !== null) ingredients.push(measurement + ' ' + ingredient)
  }

  const ingredientsList = type === 'random' ? randomIngredientsList : selectedIngredientsList;
  const preparationInfo = type === 'random' ? randomPreparationInfo : selectedPreparationInfo;

  ingredients.forEach(ingredient => {
    const listItem = document.createElement('li');
    listItem.innerText = ingredient;
    ingredientsList.appendChild(listItem);
  });

  preparationInfo.innerText = data.meals[0].strInstructions;

  if(type === 'random'){
    favMeal = {
      favId: data.meals[0].idMeal,
      favImage: data.meals[0].strMealThumb,
      favName: data.meals[0].strMeal
    }   
  } else if (type === 'selected') {
    selMeal = {      
      selId: data.meals[0].idMeal,
      selImage: data.meals[0].strMealThumb,
      selName: data.meals[0].strMeal
    }   
  }  
  
  checkLikeStatus();
}



// CHECK LIKE STATUS FOR RANDOM, SEARCHED AND SELECTED MEALS 
function checkLikeStatus() {

  //Random Meal like-button status
  if (favMeal && favoriteMeals.some(meal => meal.favId === favMeal.favId)) {
    randomLikeBtn.classList.remove('fa-regular');
    randomLikeBtn.classList.add('fa-solid');
  } else {
    randomLikeBtn.classList.remove('fa-solid');
    randomLikeBtn.classList.add('fa-regular');
  }  

  //Selected Meal like-button status
  if (selMeal && favoriteMeals.some(meal => meal.favId === selMeal.selId)) {
    selectedLikeBtn.classList.remove('fa-regular');
    selectedLikeBtn.classList.add('fa-solid');
  } else {
    selectedLikeBtn.classList.remove('fa-solid');
    selectedLikeBtn.classList.add('fa-regular');
  } 

  //Searched Meals like-button status
  if(searchLikeBtns) {   
    searchLikeBtns.forEach(searchLikeBtn => {
      if (favoriteMeals.some(meal => meal.favId === searchLikeBtn.parentElement.id)) {         
        searchLikeBtn.classList.remove('fa-regular');
        searchLikeBtn.classList.add('fa-solid');
        
      } else {
        searchLikeBtn.classList.remove('fa-solid');
        searchLikeBtn.classList.add('fa-regular');
      }  
    })  
  }
}



// UPDATE FAVORITE SECTION FUNCTION
function updateFavorites() {
  
  favoriteContainer.innerHTML = '';

  localStorage.setItem('favList', JSON.stringify(favoriteMeals));

  favoriteMeals.forEach(meal => {
    favoriteContainer.innerHTML += `
    <div id="${meal.favId}" class="favorites-card">
      <img class="favorite-meal-image" src="${meal.favImage}" alt="${meal.favName}">
      <span><h4>${meal.favName.length > 25 ? meal.favName.slice(0, 25) + '...' : meal.favName}</h4></span>
      <i class="fa-solid fa-heart favLikeBtn"></i>
    </div>
    `  
  })
  
  const favMealImages = Array.from(document.getElementsByClassName('favorite-meal-image'));
  const favLikeBtns = Array.from(document.getElementsByClassName('favLikeBtn'));


  // Open dialog when clicking in favorite img
  favMealImages.forEach(img => {
    img.addEventListener('click', () => {
      const selectedMealId = img.parentElement.id; 
      displayMeal('selected', selectedMealId);
      dialog.showModal();
    })
  })

  // Favorite Meals like-button behavior
  favLikeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const btnMealId = (btn.parentElement.id);
      favoriteMeals = favoriteMeals.filter(meal => meal.favId !== btnMealId)
      updateFavorites();
    });
  })    
  
  checkLikeStatus();
}



// GET SEARCH RESULTS
async function getSearchResults(search) {

  if(search === '') {
    alert('The input field cannot be empty. Please, enter a meal or ingredient name.')
    searchedListSection.style.display = 'none';
    return
  }

  const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${search}`);
  const data = await response.json();

  searchedListSection.style.display = 'flex';

  if(data.meals){

    searchedMeals = []

    for(let i = 0; i < data.meals.length; i++) {
      searchedMeals.push({
        favImage: data.meals[i].strMealThumb,
        favName: data.meals[i].strMeal,
        favId: data.meals[i].idMeal
      })
    }

    searchedMeals.forEach(meal => {
      searchedListContainer.innerHTML += `
        <div id="${meal.favId}" class="searchedList-image">
          <img class="searched-meal-image" src="${meal.favImage}" alt="${meal.favName}">
          <span class="searchedList-image-title"><h2>${meal.favName}</h2></span>
          <i class="fa-regular fa-heart fa-2x searchLikeBtns"></i>
        </div>
        `  
    }) 

    searchedListTitle.innerText = data.meals.length > 1 ? `${data.meals.length} meals found with "${search}"` : `1 meal found with "${search}"`

  } else {
    searchedListTitle.innerText = `No results found with "${search}"`
  }

  const searchMealImages = Array.from(document.getElementsByClassName('searched-meal-image'));
  searchLikeBtns = Array.from(document.getElementsByClassName('searchLikeBtns'));

  checkLikeStatus()


  // Open dialog when clicking in searched meal img
  searchMealImages.forEach(img => {
    img.addEventListener('click', () => {
      displayMeal('selected', img.parentElement.id)
      dialog.showModal();
    })
  })


  // Searched meal like-button behavior
  searchLikeBtns.forEach(btn => {
    btn.addEventListener('click', () => {   
      const btnMealId = (btn.parentElement.id);

      btn.classList.toggle('fa-regular');
      btn.classList.toggle('fa-solid');  

      if(btn.classList.contains('fa-solid')) {
        favoriteMeals.push(searchedMeals.find(meal => meal.favId === btnMealId));
      } else {
        favoriteMeals = favoriteMeals.filter(meal => meal.favId !== btnMealId)
      }
      
      updateFavorites();
    })
  });
}



// SEARCH BUTTON LISTENER
searchBtn.addEventListener('click', () => {
  searchedListContainer.innerHTML = '';
  getSearchResults(inputSearch.value)})



// LOADING THE PAGE
window.addEventListener('load', () => {
  randomIngredientsList.innerText = '';
  randomPreparationInfo.innerText = '';
  displayMeal('random');
  updateFavorites();
})  



// MEAL OF THE DAY LIKE BUTTON LISTENER
randomLikeBtn.addEventListener('click', function () {
  this.classList.toggle('fa-regular');
  this.classList.toggle('fa-solid');  

  if(this.classList.contains('fa-solid')) {
    favoriteMeals.push(favMeal)
  } else {
    favoriteMeals = favoriteMeals.filter(meal => meal.favId !== favMeal.favId)
  }
  updateFavorites();
});



// SELECTED MEAL LIKE BUTTON LISTENER
selectedLikeBtn.addEventListener('click', function () {
  this.classList.toggle('fa-regular');
  this.classList.toggle('fa-solid');  

  if(this.classList.contains('fa-solid')) {
    const favMeal = {
      favImage: selMeal.selImage,
      favName: selMeal.selName,
      favId: selMeal.selId
    }
    favoriteMeals.push(favMeal)
  } else {
    favoriteMeals = favoriteMeals.filter(meal => meal.favId !== selMeal.selId)
  }
  updateFavorites();
});



// CLOSE DIALOG
closeDialogBtn.addEventListener('click', () => {  
  selectedIngredientsList.innerText = '';
  selectedPreparationInfo.innerText = '';
  dialog.close();
})









































