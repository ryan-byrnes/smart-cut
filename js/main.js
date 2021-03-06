var date = new Date();

var dateToday = date.toLocaleDateString();

data.date = dateToday;
var dateText = document.querySelector('.todays-date');
dateText.textContent = dateToday;

var modalDate = document.querySelector('.todays-date-modal');
modalDate.textContent = dateToday;

var targetSubmitButton = document.querySelector('.daily-target-submit');
targetSubmitButton.addEventListener('click', submitTargets);

if (data.targets.date !== data.date) {
  data.view = 'target-input-form';
  data.targets = {
    calories: 0,
    protein: 0,
    fats: 0,
    carbohydrates: 0,
    date: data.date
  };
  data.dailyTotals = {
    calories: 0,
    protein: 0,
    fats: 0,
    carbohydrates: 0
  };
  switchViews();
}

function requiredFields() {
  var errorDiv = document.createElement('div');
  errorDiv.setAttribute('class', 'row width-100 padding-right margin-top-10');

  var errorText = document.createElement('p');
  errorText.setAttribute('class', 'color-red font-size-error');
  errorText.textContent = 'Positive integer values required for Calories, Protein, Fats, and Carbs fields.';
  errorDiv.append(errorText);

  return errorDiv;
}

function submitTargets() {
  event.preventDefault();

  var inputForm = document.querySelector('#target-input-form');
  var inputValue = inputForm.elements;
  var calorieInput = inputValue.calories;
  var proteinInput = inputValue.protein;
  var fatsInput = inputValue.fats;
  var carbInput = inputValue.carbohydrates;

  if (parseInt(calorieInput.value) < 0 || parseInt(proteinInput.value) < 0 || parseInt(fatsInput.value) < 0 || parseInt(carbInput.value) < 0 || !Number.isInteger(parseInt(calorieInput.value)) || !Number.isInteger(parseInt(proteinInput.value)) || !Number.isInteger(parseInt(fatsInput.value)) || !Number.isInteger(parseInt(carbInput.value)) || !calorieInput.value || !proteinInput.value || !fatsInput.value || !carbInput.value) {
    const submitButton = document.querySelector('.error-message');
    if (!document.querySelector('.error-message').firstElementChild) {
      submitButton.append(requiredFields());
    }
    return;
  }

  data.targets.calories = calorieInput.value;
  data.targets.protein = proteinInput.value;
  data.targets.fats = fatsInput.value;
  data.targets.carbohydrates = carbInput.value;
  data.targets.date = data.date;

  data.view = 'daily-targets';
  inputForm.reset();

  var dataViewDiv = document.querySelector('div[data-view = daily-targets]');
  trackTargetProgress(dataViewDiv);
  switchViews();
  var currentMealView = document.querySelector('div[data-view="current-day-meals"');
  currentMealView.classList.remove('hidden');
  updateProgress();

}

var addMealButton = document.querySelector('.add-meal-button');
addMealButton.addEventListener('click', function () {
  var modalDiv = document.querySelector('div[data-view=new-meal-modal');
  modalDiv.classList.toggle('hidden');
});

var closeMealModalButton = document.querySelector('.add-meal-modal-window');
closeMealModalButton.addEventListener('click', function closeModal(event) {
  if (event.target === closeMealModalButton) {
    var modalDiv = document.querySelector('div[data-view=new-meal-modal');
    modalDiv.classList.toggle('hidden');
  }
});

var newMealButton = document.querySelector('.add-meal-submit');

newMealButton.addEventListener('submit', submitNewMeal);

function submitNewMeal() {

  event.preventDefault();

  data.mealEntries.push({
    date: '',
    mealName: '',
    foodItem: [{}],
    foodEntryId: 1,
    entryId: ''
  });

  data.mealEntries[data.nextMealEntryId - 1].date = dateToday;

  var inputForm = document.querySelector('.new-meal-modal-form');
  var inputValue = inputForm.elements;

  data.mealEntries[data.nextMealEntryId - 1].mealName = inputValue['meal-name'].value;
  data.mealEntries[data.nextMealEntryId - 1].foodItem[0].name = inputValue['food-item'].value;
  data.mealEntries[data.nextMealEntryId - 1].entryId = data.nextMealEntryId;

  var xhr = new XMLHttpRequest();

  xhr.open('GET', 'https://api.edamam.com/api/food-database/v2/parser?app_id=c2713387&app_key=4ef3b4c8226f2708aa7e3b8b470ed40e&ingr=' + encodeURI(inputValue['food-item'].value) + '&nutrition-type=cooking');
  xhr.responseType = 'json';
  var spinner = document.querySelector('.spinner');
  spinner.classList.toggle('hidden');
  xhr.addEventListener('load', function () {

    data.xhrResponse = xhr.response;
    var tableBody = document.querySelectorAll('tbody');

    if (tableBody.length === 1) {
      tableBody[0].append(addFoodItem(data.xhrResponse));
    } else {
      tableBody[tableBody.length - 1].append(addFoodItem(data.xhrResponse));
    }

    data.mealEntries[data.mealEntries.length - 1].foodItem[0].calories = Math.round(data.xhrResponse.hints[0].food.nutrients.ENERC_KCAL);
    data.mealEntries[data.mealEntries.length - 1].foodItem[0].protein = Math.round(data.xhrResponse.hints[0].food.nutrients.PROCNT);
    data.mealEntries[data.mealEntries.length - 1].foodItem[0].fats = Math.round(data.xhrResponse.hints[0].food.nutrients.FAT);
    data.mealEntries[data.mealEntries.length - 1].foodItem[0].carbohydrates = Math.round(data.xhrResponse.hints[0].food.nutrients.CHOCDF);

    data.dailyTotals.calories += Math.round(data.xhrResponse.hints[0].food.nutrients.ENERC_KCAL);
    data.dailyTotals.protein += Math.round(data.xhrResponse.hints[0].food.nutrients.PROCNT);
    data.dailyTotals.fats += Math.round(data.xhrResponse.hints[0].food.nutrients.FAT);
    data.dailyTotals.carbohydrates += Math.round(data.xhrResponse.hints[0].food.nutrients.CHOCDF);

    if (data.targets.calories !== 0) {
      updateProgress();
    }
    data.nextMealEntryId += 1;
    var spinner = document.querySelector('.spinner');
    spinner.classList.toggle('hidden');
  });
  xhr.send();

  var dataViewDiv = document.querySelector('div[data-view = current-day-meals');
  dataViewDiv.append(createNewMealEntry(data.mealEntries[data.mealEntries.entryId - 1]));

  inputForm.reset();

  var modalDiv = document.querySelector('div[data-view=new-meal-modal');
  modalDiv.classList.toggle('hidden');
}

function trackTargetProgress(element) {

  var calorieRow = document.createElement('div');
  calorieRow.setAttribute('class', 'row align-items-center padding-top-20');
  element.appendChild(calorieRow);

  var calorieColumnThird = document.createElement('div');
  calorieColumnThird.setAttribute('class', 'flex-basis-40 flex-media');
  calorieRow.appendChild(calorieColumnThird);

  var calorieP = document.createElement('p');
  calorieP.setAttribute('class', 'calorie-numbers font-size-h');
  calorieP.textContent = 'Calories: ' + data.dailyTotals.calories + '/' + data.targets.calories + ' kcal';
  calorieColumnThird.appendChild(calorieP);

  var calorieTwoThirds = document.createElement('div');
  calorieTwoThirds.setAttribute('class', 'column-66 padding-right');
  calorieRow.appendChild(calorieTwoThirds);

  var progressBarDiv = document.createElement('div');
  progressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  calorieTwoThirds.appendChild(progressBarDiv);

  var progressFillDiv = document.createElement('div');
  progressFillDiv.setAttribute('style', 'width: ' + Math.round(data.dailyTotals.calories / data.targets.calories * 100) + '%');
  progressFillDiv.setAttribute('class', 'fill-progress-calories progress text-align-center padding-top-3');
  progressBarDiv.appendChild(progressFillDiv);

  var progressFillText = document.createElement('p');
  progressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold calories-text');
  progressFillText.textContent = progressFillDiv.style.width;
  progressFillDiv.appendChild(progressFillText);

  var proteinRow = document.createElement('div');
  proteinRow.setAttribute('class', 'row align-items-center padding-top-30');
  element.appendChild(proteinRow);

  var proteinColumnThird = document.createElement('div');
  proteinColumnThird.setAttribute('class', 'flex-basis-40 flex-media');
  proteinRow.appendChild(proteinColumnThird);

  var proteinP = document.createElement('p');
  proteinP.setAttribute('class', 'protein-numbers font-size-h');
  proteinP.textContent = 'Protein: ' + data.dailyTotals.protein + '/' + data.targets.protein + ' g';
  proteinColumnThird.appendChild(proteinP);

  var proteinTwoThirds = document.createElement('div');
  proteinTwoThirds.setAttribute('class', 'column-66 padding-right');
  proteinRow.appendChild(proteinTwoThirds);

  var proteinProgressBarDiv = document.createElement('div');
  proteinProgressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  proteinTwoThirds.appendChild(proteinProgressBarDiv);

  var proteinProgressFillDiv = document.createElement('div');
  proteinProgressFillDiv.setAttribute('style', 'width: ' + Math.round(data.dailyTotals.protein / data.targets.protein * 100) + '%');
  proteinProgressFillDiv.setAttribute('class', 'fill-progress-protein progress text-align-center padding-top-3');
  proteinProgressBarDiv.appendChild(proteinProgressFillDiv);

  var proteinProgressFillText = document.createElement('p');
  proteinProgressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold protein-progress-text');
  proteinProgressFillText.textContent = proteinProgressFillDiv.style.width;
  proteinProgressFillDiv.appendChild(proteinProgressFillText);

  var fatsRow = document.createElement('div');
  fatsRow.setAttribute('class', 'row align-items-center padding-top-30');
  element.appendChild(fatsRow);

  var fatsColumnThird = document.createElement('div');
  fatsColumnThird.setAttribute('class', 'flex-basis-40 flex-media');
  fatsRow.appendChild(fatsColumnThird);

  var fatsP = document.createElement('p');
  fatsP.setAttribute('class', 'fats-numbers font-size-h');
  fatsP.textContent = 'Fats: ' + data.dailyTotals.fats + '/' + data.targets.fats + ' g';
  fatsColumnThird.appendChild(fatsP);

  var fatsTwoThirds = document.createElement('div');
  fatsTwoThirds.setAttribute('class', 'column-66 padding-right');
  fatsRow.appendChild(fatsTwoThirds);

  var fatsProgressBarDiv = document.createElement('div');
  fatsProgressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  fatsTwoThirds.appendChild(fatsProgressBarDiv);

  var fatsProgressFillDiv = document.createElement('div');
  fatsProgressFillDiv.setAttribute('style', 'width: ' + Math.round(data.dailyTotals.fats / data.targets.fats * 100) + '%');
  fatsProgressFillDiv.setAttribute('class', 'fill-progress-fats progress text-align-center padding-top-3');
  fatsProgressBarDiv.appendChild(fatsProgressFillDiv);

  var fatsProgressFillText = document.createElement('p');
  fatsProgressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold fats-progress-text');
  fatsProgressFillText.textContent = fatsProgressFillDiv.style.width;
  fatsProgressFillDiv.appendChild(fatsProgressFillText);

  var carbohydratesRow = document.createElement('div');
  carbohydratesRow.setAttribute('class', 'row align-items-center padding-top-30');
  element.appendChild(carbohydratesRow);

  var carbohydratesColumnThird = document.createElement('div');
  carbohydratesColumnThird.setAttribute('class', 'flex-basis-40 flex-media');
  carbohydratesRow.appendChild(carbohydratesColumnThird);

  var carbohydratesP = document.createElement('p');
  carbohydratesP.setAttribute('class', 'carbohydrates-numbers font-size-h');
  carbohydratesP.textContent = 'Carbs: ' + data.dailyTotals.carbohydrates + '/' + data.targets.carbohydrates + ' g';
  carbohydratesColumnThird.appendChild(carbohydratesP);

  var carbohydratesTwoThirds = document.createElement('div');
  carbohydratesTwoThirds.setAttribute('class', 'column-66 padding-right');
  carbohydratesRow.appendChild(carbohydratesTwoThirds);

  var carbohydratesProgressBarDiv = document.createElement('div');
  carbohydratesProgressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  carbohydratesTwoThirds.appendChild(carbohydratesProgressBarDiv);

  var carbohydratesProgressFillDiv = document.createElement('div');
  carbohydratesProgressFillDiv.setAttribute('style', 'width: ' + Math.round(data.dailyTotals.carbohydrates / data.targets.carbohydrates * 100) + '%');
  carbohydratesProgressFillDiv.setAttribute('class', 'fill-progress-carbohydrates progress text-align-center padding-top-3');
  carbohydratesProgressBarDiv.appendChild(carbohydratesProgressFillDiv);

  var carbohydratesProgressFillText = document.createElement('p');
  carbohydratesProgressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold carbohydrates-progress-text');
  carbohydratesProgressFillText.textContent = carbohydratesProgressFillDiv.style.width;
  carbohydratesProgressFillDiv.appendChild(carbohydratesProgressFillText);

  return element;

}

function switchViews() {
  var dataViewElements = document.querySelectorAll('div[data-view]');
  for (var i = 0; i < dataViewElements.length; i++) {
    if (data.view === dataViewElements[i].getAttribute('data-view')) {
      dataViewElements[i].classList.remove('hidden');
    } else {
      dataViewElements[i].classList.add('hidden');
    }
  }
}

function createNewMealEntry(entry) {

  var showMeal = document.querySelector('div[data-view="current-day-meals"]');
  showMeal.classList.remove('hidden');

  var tableDiv = document.createElement('div');
  tableDiv.setAttribute('class', 'table-div row justify-content-center');

  var table = document.createElement('table');
  table.setAttribute('class', 'table');
  tableDiv.append(table);

  var tableHead = document.createElement('thead');
  table.append(tableHead);

  var tableHeadRow = document.createElement('tr');
  tableHeadRow.setAttribute('class', 'margin-top-50 padding-left-10 padding-right form-header row justify-content-space-between background-color-navy margin-top-50 align-items-center color-white font-weight-bold');
  tableHead.append(tableHeadRow);

  var addMealName = document.createElement('td');
  addMealName.setAttribute('class', 'meal-name-td');
  for (var i = 0; i < data.mealEntries.length; i++) {
    if (i === data.mealEntries[i].entryId - 1) {
      addMealName.textContent = data.mealEntries[i].mealName;
    }
  }
  tableHeadRow.appendChild(addMealName);

  var dateDiv = document.createElement('div');
  dateDiv.setAttribute('class', 'meal-date-td');
  tableHeadRow.append(dateDiv);

  var tdDate = document.createElement('td');
  tdDate.setAttribute('class', 'meal-date-td');
  for (i = 0; i < data.mealEntries.length; i++) {
    if (i === data.mealEntries[i].entryId - 1) {
      tdDate.textContent = data.mealEntries[i].date;
    }
  }
  tableHeadRow.append(tdDate);

  var tableHeadRow2 = document.createElement('tr');
  tableHeadRow2.setAttribute('class', 'heading-row row font-weight-bold');
  tableHead.append(tableHeadRow2);

  var foodItemDiv = document.createElement('div');
  foodItemDiv.setAttribute('class', 'flex-basis-40');
  tableHeadRow2.append(foodItemDiv);

  var tdFoodItem = document.createElement('td');
  tdFoodItem.setAttribute('class', 'font-size-h padding-left-10');
  tdFoodItem.textContent = 'Food Item';
  foodItemDiv.append(tdFoodItem);

  var calorieDiv = document.createElement('div');
  calorieDiv.setAttribute('class', 'row justify-content-center flex-basis-15 margin-right');
  tableHeadRow2.append(calorieDiv);

  var tdCalories = document.createElement('td');
  tdCalories.setAttribute('class', 'font-size-h');
  tdCalories.textContent = 'Calories';
  calorieDiv.append(tdCalories);

  var proteinDiv = document.createElement('div');
  proteinDiv.setAttribute('class', 'row justify-content-center flex-basis-15');
  tableHeadRow2.append(proteinDiv);

  var tdProtein = document.createElement('td');
  tdProtein.setAttribute('class', 'font-size-h padding-left-media');
  tdProtein.textContent = 'Protein';
  proteinDiv.append(tdProtein);

  var fatsDiv = document.createElement('div');
  fatsDiv.setAttribute('class', 'row justify-content-center flex-basis-15');
  tableHeadRow2.append(fatsDiv);

  var tdFats = document.createElement('td');
  tdFats.setAttribute('class', 'font-size-h padding-left-media');
  tdFats.textContent = 'Fats';
  fatsDiv.append(tdFats);

  var carbsDiv = document.createElement('div');
  carbsDiv.setAttribute('class', 'row justify-content-center flex-basis-15');
  tableHeadRow2.append(carbsDiv);

  var tdCarbohydrates = document.createElement('td');
  tdCarbohydrates.setAttribute('class', 'font-size-h padding-left-media');
  tdCarbohydrates.textContent = 'Carbs';
  carbsDiv.append(tdCarbohydrates);

  var spaceDiv = document.createElement('div');
  spaceDiv.setAttribute('class', 'row justify-content-center flex-basis-15');
  tableHeadRow2.append(spaceDiv);

  var tableBody = document.createElement('tbody');
  tableBody.setAttribute('class', 'table-body-append');
  table.append(tableBody);

  var tableBodyRow2 = document.createElement('tr');
  tableBody.append(tableBodyRow2);

  var tdAddFoodItem = document.createElement('td');
  tdAddFoodItem.setAttribute('class', 'font-weight-bold add-new-food-item color-navy padding-left-10');
  tdAddFoodItem.setAttribute('id', 'add-new-food-item');
  tdAddFoodItem.textContent = 'Add Food Item';
  tableBodyRow2.append(tdAddFoodItem);

  return tableDiv;

}

function addFoodItem(entry) {
  var tableBodyRow = document.createElement('tr');
  tableBodyRow.setAttribute('class', 'row');

  var foodItemDiv = document.createElement('div');
  foodItemDiv.setAttribute('class', 'flex-basis-40');
  tableBodyRow.append(foodItemDiv);

  var tdFoodItemName = document.createElement('td');
  tdFoodItemName.setAttribute('class', 'font-size-h padding-left-10');
  tdFoodItemName.textContent = data.xhrResponse.text;
  foodItemDiv.append(tdFoodItemName);

  var calorieDiv = document.createElement('div');
  calorieDiv.setAttribute('class', 'row justify-content-center calories align-items-end flex-basis-15 margin-right');
  tableBodyRow.append(calorieDiv);

  var tdCaloriesValue = document.createElement('td');
  tdCaloriesValue.setAttribute('class', 'font-size-h');
  tdCaloriesValue.textContent = Math.round(data.xhrResponse.hints[0].food.nutrients.ENERC_KCAL);
  calorieDiv.append(tdCaloriesValue);

  var proteinDiv = document.createElement('div');
  proteinDiv.setAttribute('class', 'row justify-content-center protein align-items-end flex-basis-15');
  tableBodyRow.append(proteinDiv);

  var tdProteinValue = document.createElement('td');
  tdProteinValue.setAttribute('class', 'font-size-h padding-left-media');
  tdProteinValue.textContent = Math.round(data.xhrResponse.hints[0].food.nutrients.PROCNT);
  proteinDiv.append(tdProteinValue);

  var fatsDiv = document.createElement('div');
  fatsDiv.setAttribute('class', 'row justify-content-center fats align-items-end flex-basis-15');
  tableBodyRow.append(fatsDiv);

  var tdFatsValue = document.createElement('td');
  tdFatsValue.setAttribute('class', 'font-size-h padding-left-media');
  tdFatsValue.textContent = Math.round(data.xhrResponse.hints[0].food.nutrients.FAT);
  fatsDiv.append(tdFatsValue);

  var carbsDiv = document.createElement('div');
  carbsDiv.setAttribute('class', 'row justify-content-center carbs align-items-end flex-basis-15');
  tableBodyRow.append(carbsDiv);

  var tdCarbohydratesValue = document.createElement('td');
  tdCarbohydratesValue.setAttribute('class', 'flex-basis-15 font-size-h padding-left-media');
  tdCarbohydratesValue.textContent = Math.round(data.xhrResponse.hints[0].food.nutrients.CHOCDF);
  carbsDiv.append(tdCarbohydratesValue);

  var deleteDiv = document.createElement('div');
  deleteDiv.setAttribute('class', 'row justify-content-flex-end align-items-end flex-basis-15');
  tableBodyRow.append(deleteDiv);

  var deleteIcon = document.createElement('i');
  deleteIcon.setAttribute('class', 'fas fa-minus-circle delete-icon font-size-h padding-right');
  deleteDiv.append(deleteIcon);

  data.mealEntries[data.mealEntries.length - 1].foodEntryId += 1;

  return tableBodyRow;

}
var eventTarget;
document.addEventListener('click', function openAddFoodItemModal() {
  if (event.target.id === 'add-new-food-item') {
    eventTarget = event.target;
    var showModal = document.querySelector('.add-food-item-modal');
    showModal.classList.toggle('hidden');
  }
});

var closeAddFoodButton = document.querySelector('.add-food-item-modal');
closeAddFoodButton.addEventListener('click', function closeModal(event) {
  if (event.target === closeAddFoodButton) {
    var showModal = document.querySelector('.add-food-item-modal');
    showModal.classList.toggle('hidden');
  }
});

var addNewItemButton = document.querySelector('.add-next-food-item');
addNewItemButton.addEventListener('submit', addNextFoodItem);

function addNextFoodItem() {
  event.preventDefault();
  var inputForm = document.querySelector('.next-item-modal-form');
  var inputValue = inputForm.elements;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.edamam.com/api/food-database/v2/parser?app_id=c2713387&app_key=4ef3b4c8226f2708aa7e3b8b470ed40e&ingr=' + encodeURI(inputValue['new-food-item'].value) + '&nutrition-type=cooking');
  xhr.responseType = 'json';
  var spinner = document.querySelector('.spinner');
  spinner.classList.toggle('hidden');
  xhr.addEventListener('load', function () {

    data.xhrResponse = xhr.response;
    eventTarget.closest('tbody').append(addFoodItem(data.xhrResponse));

    data.dailyTotals.calories += Math.round(data.xhrResponse.hints[0].food.nutrients.ENERC_KCAL);
    data.dailyTotals.protein += Math.round(data.xhrResponse.hints[0].food.nutrients.PROCNT);
    data.dailyTotals.fats += Math.round(data.xhrResponse.hints[0].food.nutrients.FAT);
    data.dailyTotals.carbohydrates += Math.round(data.xhrResponse.hints[0].food.nutrients.CHOCDF);

    for (var i = 0; i < data.mealEntries.length; i++) {

      if (data.mealEntries[i].mealName === eventTarget.closest('table').querySelector('.meal-name-td').textContent) {
        data.mealEntries[i].foodItem.push({
          name: data.xhrResponse.text,
          calories: Math.round(data.xhrResponse.hints[0].food.nutrients.ENERC_KCAL),
          protein: Math.round(data.xhrResponse.hints[0].food.nutrients.PROCNT),
          fats: Math.round(data.xhrResponse.hints[0].food.nutrients.FAT),
          carbohydrates: Math.round(data.xhrResponse.hints[0].food.nutrients.CHOCDF)
        });
      }
    }
    if (data.view === 'meal-log' && eventTarget.closest('table').querySelector('.meal-name-td').nextSibling.nextSibling.textContent === data.date) {
      updateProgress();
    } else if (data.view !== 'meal-log') {
      updateProgress();
    }
    var spinner = document.querySelector('.spinner');
    spinner.classList.toggle('hidden');
  });
  xhr.send();
  inputForm.reset();
  var showModal = document.querySelector('.add-food-item-modal');
  showModal.classList.toggle('hidden');
}

function showTodaysMeals(entry) {

  var tableDiv = document.createElement('div');
  tableDiv.setAttribute('class', 'table');

  var table = document.createElement('table');
  tableDiv.append(table);

  var tableHead = document.createElement('thead');
  table.append(tableHead);

  var tableHeadRow = document.createElement('tr');
  tableHeadRow.setAttribute('class', 'margin-top-50 padding-left-10 padding-right form-header row justify-content-space-between background-color-navy margin-top-50 align-items-center color-white font-weight-bold');
  tableHead.append(tableHeadRow);

  var addMealName = document.createElement('td');
  addMealName.setAttribute('class', 'meal-name-td');
  for (var i = 0; i < data.mealEntries.length; i++) {
    if (data.mealEntries[i].entryId === entry.entryId) {
      addMealName.textContent = data.mealEntries[i].mealName;
    }
  }
  tableHeadRow.appendChild(addMealName);

  var dateDiv = document.createElement('div');
  tableHeadRow.append(dateDiv);

  var tdDate = document.createElement('td');
  tdDate.setAttribute('class', 'td-date');
  for (i = 0; i < data.mealEntries.length; i++) {
    if (data.mealEntries[i].entryId === entry.entryId) {
      tdDate.textContent = data.mealEntries[i].date;
    }
  }
  tableHeadRow.append(tdDate);

  var tableHeadRow2 = document.createElement('tr');
  tableHeadRow2.setAttribute('class', 'heading-row row width-100 font-weight-bold');
  tableHead.append(tableHeadRow2);

  var foodItemDiv = document.createElement('div');
  foodItemDiv.setAttribute('class', 'flex-basis-40');
  tableHeadRow2.append(foodItemDiv);

  var tdFoodItem = document.createElement('td');
  tdFoodItem.setAttribute('class', 'font-size-h padding-left-10');
  tdFoodItem.textContent = 'Food Item';
  foodItemDiv.append(tdFoodItem);

  var calorieDiv = document.createElement('div');
  calorieDiv.setAttribute('class', 'row justify-content-center flex-basis-15 margin-right');
  tableHeadRow2.append(calorieDiv);

  var tdCalories = document.createElement('td');
  tdCalories.setAttribute('class', 'font-size-h');
  tdCalories.textContent = 'Calories';
  calorieDiv.append(tdCalories);

  var proteinDiv = document.createElement('div');
  proteinDiv.setAttribute('class', 'row justify-content-center flex-basis-15');
  tableHeadRow2.append(proteinDiv);

  var tdProtein = document.createElement('td');
  tdProtein.setAttribute('class', 'font-size-h padding-left-media');
  tdProtein.textContent = 'Protein';
  proteinDiv.append(tdProtein);

  var fatsDiv = document.createElement('div');
  fatsDiv.setAttribute('class', 'row justify-content-center flex-basis-15');
  tableHeadRow2.append(fatsDiv);

  var tdFats = document.createElement('td');
  tdFats.setAttribute('class', 'font-size-h padding-left-media');
  tdFats.textContent = 'Fats';
  fatsDiv.append(tdFats);

  var carbsDiv = document.createElement('div');
  carbsDiv.setAttribute('class', 'row justify-content-center flex-basis-15');
  tableHeadRow2.append(carbsDiv);

  var tdCarbohydrates = document.createElement('td');
  tdCarbohydrates.setAttribute('class', 'font-size-h padding-left-media');
  tdCarbohydrates.textContent = 'Carbs';
  carbsDiv.append(tdCarbohydrates);

  var spaceDiv = document.createElement('div');
  spaceDiv.setAttribute('class', 'row justify-content-center flex-basis-15');
  tableHeadRow2.append(spaceDiv);

  var tableBody = document.createElement('tbody');
  tableBody.setAttribute('class', 'table-body-append');
  table.append(tableBody);

  var tableBodyRow2 = document.createElement('tr');
  tableBody.append(tableBodyRow2);

  var tdAddFoodItem = document.createElement('td');
  tdAddFoodItem.setAttribute('class', 'padding-left-10 font-weight-bold add-new-food-item color-navy font-size-h');
  tdAddFoodItem.setAttribute('id', 'add-new-food-item');
  tdAddFoodItem.textContent = 'Add Food Item';
  tableBodyRow2.append(tdAddFoodItem);

  function createFoodItem() {

    var tableBodyRow = document.createElement('tr');
    tableBodyRow.setAttribute('class', 'row align-items-end');
    tableBody.append(tableBodyRow);

    var foodItemDiv = document.createElement('div');
    foodItemDiv.setAttribute('class', 'flex-basis-40');
    tableBodyRow.append(foodItemDiv);

    var tdFoodItemName = document.createElement('td');
    tdFoodItemName.setAttribute('class', 'padding-left-10 font-size-h');
    tdFoodItemName.textContent = data.mealEntries[i].foodItem[item].name;
    foodItemDiv.append(tdFoodItemName);

    var calorieDiv = document.createElement('div');
    calorieDiv.setAttribute('class', 'calories row justify-content-center flex-basis-15 margin-right');
    tableBodyRow.append(calorieDiv);

    var tdCaloriesValue = document.createElement('td');
    tdCaloriesValue.setAttribute('class', 'font-size-h');
    tdCaloriesValue.textContent = data.mealEntries[i].foodItem[item].calories;
    calorieDiv.append(tdCaloriesValue);

    var proteinDiv = document.createElement('div');
    proteinDiv.setAttribute('class', 'protein row justify-content-center flex-basis-15');
    tableBodyRow.append(proteinDiv);

    var tdProteinValue = document.createElement('td');
    tdProteinValue.setAttribute('class', 'font-size-h padding-left-media');
    tdProteinValue.textContent = data.mealEntries[i].foodItem[item].protein;
    proteinDiv.append(tdProteinValue);

    var fatsDiv = document.createElement('div');
    fatsDiv.setAttribute('class', 'fats row justify-content-center flex-basis-15');
    tableBodyRow.append(fatsDiv);

    var tdFatsValue = document.createElement('td');
    tdFatsValue.setAttribute('class', 'font-size-h padding-left-media');
    tdFatsValue.textContent = data.mealEntries[i].foodItem[item].fats;
    fatsDiv.append(tdFatsValue);

    var carbsDiv = document.createElement('div');
    carbsDiv.setAttribute('class', 'carbs row justify-content-center flex-basis-15');
    tableBodyRow.append(carbsDiv);

    var tdCarbohydratesValue = document.createElement('td');
    tdCarbohydratesValue.setAttribute('class', 'font-size-h padding-left-media');
    tdCarbohydratesValue.textContent = data.mealEntries[i].foodItem[item].carbohydrates;
    carbsDiv.append(tdCarbohydratesValue);

    var deleteDiv = document.createElement('div');
    deleteDiv.setAttribute('class', 'row justify-content-flex-end flex-basis-15');
    tableBodyRow.append(deleteDiv);

    var deleteIcon = document.createElement('i');
    deleteIcon.setAttribute('class', 'fas fa-minus-circle color-red delete-icon font-size-h padding-right');
    deleteDiv.append(deleteIcon);

  }

  for (i = 0; i < data.mealEntries.length; i++) {
    if (data.mealEntries[i].entryId === entry.entryId) {
      for (var item = 0; item < data.mealEntries[i].foodItem.length; item++) {
        createFoodItem();
      }
    }
  }

  return tableDiv;
}

var mealLog = document.querySelector('.meal-log-view');

mealLog.addEventListener('click', function () {
  var dataMealLog = document.querySelector('div[data-view="meal-log"]');
  data.view = 'meal-log';
  for (var i = data.mealEntries.length - 1; i >= 0; i--) {
    dataMealLog.append(showTodaysMeals(data.mealEntries[i]));
  }
  switchViews();

  var dailySummary = document.querySelector('.daily-summary-heading');
  dailySummary.classList.add('hidden');
  var mealButton = document.querySelector('.meal-button');
  mealButton.classList.add('hidden');
});

var homePageView = document.querySelector('.home-page-view');

homePageView.addEventListener('click', function () {
  if (data.targets.calories === 0) {
    data.view = 'target-input-form';
  } else {
    data.view = 'daily-targets';
  }

  var dailySummary = document.querySelector('.daily-summary-heading');
  dailySummary.classList.add('hidden');
  var mealButton = document.querySelector('.meal-button');
  mealButton.classList.add('hidden');

  switchViews();

  var currentMeals = document.querySelector('div[data-view="current-day-meals"]');
  currentMeals.classList.remove('hidden');
});

window.addEventListener('DOMContentLoaded', function () {
  var formDataView = document.querySelector('div[data-view = target-input-form]');
  var trackingView = document.querySelector('div[data-view = daily-targets]');

  switchViews();

  if (data.targets.calories !== 0 && data.mealEntries.length > 0 && data.mealEntries[data.mealEntries.length - 1].date === data.date && data.view !== 'meal-log') {
    trackTargetProgress(trackingView);
    updateProgress();
    formDataView.classList.add('hidden');
    trackingView.classList.remove('hidden');
  } else if (data.targets.calories !== 0 && data.dailyTotals.calories === 0 && data.targets.date === data.date) {
    trackTargetProgress(trackingView);
    updateProgress();
  }

  var dataViewDiv = document.querySelector('div[data-view = current-day-meals');
  for (var i = 0; i < data.mealEntries.length; i++) {
    if (data.mealEntries[i].date === data.date && data.view !== 'meal-log') {
      dataViewDiv.append(showTodaysMeals(data.mealEntries[i]));
      dataViewDiv.classList.remove('hidden');
    }
  }

  var dataMealLog = document.querySelector('div[data-view="meal-log"]');
  if (data.view === 'meal-log') {

    if (data.mealEntries.length < 1) {
      var noEntries = document.querySelector('.no-entries');
      noEntries.classList.toggle('hidden');
    }

    for (i = data.mealEntries.length - 1; i >= 0; i--) {

      dataMealLog.append(showTodaysMeals(data.mealEntries[i]));
    }
    var dailySummary = document.querySelector('.daily-summary-heading');
    dailySummary.classList.add('hidden');
    var mealButton = document.querySelector('.meal-button');
    mealButton.classList.add('hidden');
  }
});

function updateProgress() {
  if (data.view === 'daily-targets') {
    var calorieP = document.querySelector('.calorie-numbers');
    calorieP.textContent = 'Calories: ' + data.dailyTotals.calories + '/' + data.targets.calories + ' kcal';

    var fillProgressCalories = document.querySelector('.fill-progress-calories');
    fillProgressCalories.style.width = Math.round(data.dailyTotals.calories / data.targets.calories * 100) + '%';
    var calorieLimit = Math.round(data.dailyTotals.calories / data.targets.calories * 100);
    if (calorieLimit > 100) {
      fillProgressCalories.style.backgroundColor = 'red';
    }

    var caloriesText = document.querySelector('.calories-text');
    caloriesText.textContent = fillProgressCalories.style.width;

    var proteinP = document.querySelector('.protein-numbers');
    proteinP.textContent = 'Protein: ' + data.dailyTotals.protein + '/' + data.targets.protein + ' g';

    var fillProgressProtein = document.querySelector('.fill-progress-protein');
    fillProgressProtein.style.width = Math.round(data.dailyTotals.protein / data.targets.protein * 100) + '%';
    var proteinLimit = Math.round(data.dailyTotals.protein / data.targets.protein * 100);
    if (proteinLimit > 100) {
      fillProgressProtein.style.backgroundColor = 'red';
    }

    var proteinText = document.querySelector('.protein-progress-text');
    proteinText.textContent = fillProgressProtein.style.width;

    var fatsP = document.querySelector('.fats-numbers');
    fatsP.textContent = 'Fats: ' + data.dailyTotals.fats + '/' + data.targets.fats + ' g';

    var fillProgressFats = document.querySelector('.fill-progress-fats');
    fillProgressFats.style.width = Math.round(data.dailyTotals.fats / data.targets.fats * 100) + '%';
    var fatsLimit = Math.round(data.dailyTotals.fats / data.targets.fats * 100);
    if (fatsLimit > 100) {
      fillProgressFats.style.backgroundColor = 'red';
    }

    var fatsText = document.querySelector('.fats-progress-text');
    fatsText.textContent = fillProgressFats.style.width;

    var carbohydratesP = document.querySelector('.carbohydrates-numbers');
    carbohydratesP.textContent = 'Carbs: ' + data.dailyTotals.carbohydrates + '/' + data.targets.carbohydrates + ' g';

    var fillProgressCarbohydrates = document.querySelector('.fill-progress-carbohydrates');
    fillProgressCarbohydrates.style.width = Math.round(data.dailyTotals.carbohydrates / data.targets.carbohydrates * 100) + '%';
    var carbohydratesLimit = Math.round(data.dailyTotals.carbohydrates / data.targets.carbohydrates * 100);
    if (carbohydratesLimit > 100) {
      fillProgressCarbohydrates.style.backgroundColor = 'red';
    }

    var carbohydratesText = document.querySelector('.carbohydrates-progress-text');
    carbohydratesText.textContent = fillProgressCarbohydrates.style.width;
  }
}

var cancelDeleteButton = document.querySelector('.delete-food-item-modal');

cancelDeleteButton.addEventListener('click', function cancelDelete(event) {
  var cancelButton = document.querySelector('.cancel-delete-button');
  if (event.target === cancelDeleteButton || event.target === cancelButton) {
    cancelDeleteButton.classList.toggle('hidden');
  }
});

var deleteIconListener = document.querySelector('body');

deleteIconListener.addEventListener('click', showDeleteModal);

var deleteTargetElement;

function showDeleteModal() {
  if (event.target.tagName === 'I') {
    var deleteModal = document.querySelector('.delete-food-item-modal');
    deleteModal.classList.remove('hidden');
    deleteTargetElement = event.target;
  }
}

var confirmDeleteButton = document.querySelector('.delete-button');

confirmDeleteButton.addEventListener('click', deleteFoodItem);

function deleteFoodItem() {

  for (var i = 0; i < data.mealEntries.length; i++) {
    if (deleteTargetElement.closest('table').querySelector('.meal-name-td').nextSibling.nextSibling.textContent === data.mealEntries[i].date && deleteTargetElement.closest('table').querySelector('.meal-name-td').textContent === data.mealEntries[i].mealName) {
      for (var k = 0; k < data.mealEntries[i].foodItem.length; k++) {
        if (deleteTargetElement.closest('tr').firstChild.textContent === data.mealEntries[i].foodItem[k].name) {
          data.mealEntries[i].foodItem.splice(k, 1);
          var deleteModal = document.querySelector('.delete-food-item-modal');
          if (data.targets.date === deleteTargetElement.closest('table').querySelector('.meal-name-td').nextSibling.nextSibling.textContent) {
            data.dailyTotals.calories -= parseInt(deleteTargetElement.closest('tr').querySelector('.calories').textContent);
            data.dailyTotals.protein -= parseInt(deleteTargetElement.closest('tr').querySelector('.protein').textContent);
            data.dailyTotals.carbohydrates -= parseInt(deleteTargetElement.closest('tr').querySelector('.carbs').textContent);
            data.dailyTotals.fats -= parseInt(deleteTargetElement.closest('tr').querySelector('.fats').textContent);
            updateProgress();
          }
          deleteModal.classList.add('hidden');
        }
      }
    }
  }
  location.reload();
}
