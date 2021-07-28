document.addEventListener('submit', submitTargets);

function submitTargets() {
  event.preventDefault();

  var inputForm = document.querySelector('.target-input-form');
  var inputValue = inputForm.elements;

  data.targets.calories = inputValue.calories.value;
  data.targets.protein = inputValue.protein.value;
  data.targets.fats = inputValue.fats.value;
  data.targets.carbohydrates = inputValue.carbohydrates.value;

  data.view = 'daily-targets';
  inputForm.reset();

  var dataViewDiv = document.querySelector('div[data-view = daily-targets]');
  trackTargetProgress(dataViewDiv);
  switchViews();

}

function trackTargetProgress(element) {

  /*
        <div class="row align-items-center">
          <div class="column-33">
            <p class="daily-target-calories">Calories: 0/0 kcal</p>
          </div>
          <div class="column-66 padding-right">
            <div class="progress-bar background-color-white row align-items-center">
              <div style="width: 100%;" class="fill-progress-calories progress text-align-center padding-top-3">
                <p class="text-progress-calories margin-top-0 color-white font-weight-bold">100%</p>
              </div>
            </div>
          </div>
        </div>
        <div class="row align-items-center">
          <div class="column-33">
            <p class="daily-target-protein">Protein: 0/0g</p>
          </div>
          <div class="column-66 padding-right">
            <div class="progress-bar background-color-white row align-items-center">
              <div style="width: 75%;" class="fill-progress-protein progress text-align-center padding-top-3">
                <p class="text-progress-protein margin-top-0 color-white font-weight-bold">75%</p>
              </div>
            </div>
          </div>
        </div>
        <div class="row align-items-center">
          <div class="column-33">
            <p class="daily-target-fats">Fats: 0/0g</p>
          </div>
          <div class="column-66 padding-right">
            <div class="progress-bar background-color-white row align-items-center">
              <div style="width: 50%;" class="fill-progress-fats progress text-align-center padding-top-3">
                <p class="text-progress-fats margin-top-0 color-white font-weight-bold">50%</p>
              </div>
            </div>
          </div>
        </div>
        <div class="row align-items-center">
          <div class="column-33">
            <p class="daily-target-carbohydrates">Carbohydrates: 0/0g</p>
          </div>
          <div class="column-66 padding-right">
            <div class="progress-bar background-color-white row align-items-center">
              <div style="width: 25%;" class="fill-progress-carbohydrates progress text-align-center padding-top-3">
                <p class="text-progress-carbohydrates margin-top-0 color-white font-weight-bold">25%</p>
              </div>
            </div>
          </div>
        </div>
*/

  var calorieRow = document.createElement('div');
  calorieRow.setAttribute('class', 'row align-items-center');
  element.appendChild(calorieRow);

  var calorieColumnThird = document.createElement('div');
  calorieColumnThird.setAttribute('class', 'column-33');
  calorieRow.appendChild(calorieColumnThird);

  var calorieP = document.createElement('p');
  calorieP.textContent = 'Calories: ' + data.dailyTotals.calories + '/' + data.targets.calories + ' kcal';
  calorieColumnThird.appendChild(calorieP);

  var calorieTwoThirds = document.createElement('div');
  calorieTwoThirds.setAttribute('class', 'column-66 padding-right');
  calorieRow.appendChild(calorieTwoThirds);

  var progressBarDiv = document.createElement('div');
  progressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  calorieTwoThirds.appendChild(progressBarDiv);

  var progressFillDiv = document.createElement('div');
  progressFillDiv.setAttribute('style', 'width: ' + data.dailyTotals.calories / data.targets.calories * 100 + '%');
  progressFillDiv.setAttribute('class', 'fill-progress-calories progress text-align-center padding-top-3');
  progressBarDiv.appendChild(progressFillDiv);

  var progressFillText = document.createElement('p');
  progressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold');
  progressFillText.textContent = progressFillDiv.style.width;
  progressFillDiv.appendChild(progressFillText);

  // Protein

  var proteinRow = document.createElement('div');
  proteinRow.setAttribute('class', 'row align-items-center');
  element.appendChild(proteinRow);

  var proteinColumnThird = document.createElement('div');
  proteinColumnThird.setAttribute('class', 'column-33');
  proteinRow.appendChild(proteinColumnThird);

  var proteinP = document.createElement('p');
  proteinP.textContent = 'Protein: ' + data.dailyTotals.protein + '/' + data.targets.protein + ' g';
  proteinColumnThird.appendChild(proteinP);

  var proteinTwoThirds = document.createElement('div');
  proteinTwoThirds.setAttribute('class', 'column-66 padding-right');
  proteinRow.appendChild(proteinTwoThirds);

  var proteinProgressBarDiv = document.createElement('div');
  proteinProgressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  proteinTwoThirds.appendChild(proteinProgressBarDiv);

  var proteinProgressFillDiv = document.createElement('div');
  proteinProgressFillDiv.setAttribute('style', 'width: ' + (data.dailyTotals.protein / data.targets.protein * 100) + '%');
  proteinProgressFillDiv.setAttribute('class', 'fill-progress-protein progress text-align-center padding-top-3');
  proteinProgressBarDiv.appendChild(proteinProgressFillDiv);

  var proteinProgressFillText = document.createElement('p');
  proteinProgressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold');
  proteinProgressFillText.textContent = proteinProgressFillDiv.style.width;
  proteinProgressFillDiv.appendChild(proteinProgressFillText);

  // Fats

  var fatsRow = document.createElement('div');
  fatsRow.setAttribute('class', 'row align-items-center');
  element.appendChild(fatsRow);

  var fatsColumnThird = document.createElement('div');
  fatsColumnThird.setAttribute('class', 'column-33');
  fatsRow.appendChild(fatsColumnThird);

  var fatsP = document.createElement('p');
  fatsP.textContent = 'Fats: ' + data.dailyTotals.fats + '/' + data.targets.fats + ' g';
  fatsColumnThird.appendChild(fatsP);

  var fatsTwoThirds = document.createElement('div');
  fatsTwoThirds.setAttribute('class', 'column-66 padding-right');
  fatsRow.appendChild(fatsTwoThirds);

  var fatsProgressBarDiv = document.createElement('div');
  fatsProgressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  fatsTwoThirds.appendChild(fatsProgressBarDiv);

  var fatsProgressFillDiv = document.createElement('div');
  fatsProgressFillDiv.setAttribute('style', 'width: ' + data.dailyTotals.fats / data.targets.fats * 100 + '%');
  fatsProgressFillDiv.setAttribute('class', 'fill-progress-fats progress text-align-center padding-top-3');
  fatsProgressBarDiv.appendChild(fatsProgressFillDiv);

  var fatsProgressFillText = document.createElement('p');
  fatsProgressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold');
  fatsProgressFillText.textContent = fatsProgressFillDiv.style.width;
  fatsProgressFillDiv.appendChild(fatsProgressFillText);

  // Carbs

  var carbohydratesRow = document.createElement('div');
  carbohydratesRow.setAttribute('class', 'row align-items-center');
  element.appendChild(carbohydratesRow);

  var carbohydratesColumnThird = document.createElement('div');
  carbohydratesColumnThird.setAttribute('class', 'column-33');
  carbohydratesRow.appendChild(carbohydratesColumnThird);

  var carbohydratesP = document.createElement('p');
  carbohydratesP.textContent = 'Carbs: ' + data.dailyTotals.carbohydrates + '/' + data.targets.carbohydrates + ' g';
  carbohydratesColumnThird.appendChild(carbohydratesP);

  var carbohydratesTwoThirds = document.createElement('div');
  carbohydratesTwoThirds.setAttribute('class', 'column-66 padding-right');
  carbohydratesRow.appendChild(carbohydratesTwoThirds);

  var carbohydratesProgressBarDiv = document.createElement('div');
  carbohydratesProgressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  carbohydratesTwoThirds.appendChild(carbohydratesProgressBarDiv);

  var carbohydratesProgressFillDiv = document.createElement('div');
  carbohydratesProgressFillDiv.setAttribute('style', 'width: ' + (data.dailyTotals.carbohydrates / data.targets.carbohydrates * 100) + '%');
  carbohydratesProgressFillDiv.setAttribute('class', 'fill-progress-carbohydrates progress text-align-center padding-top-3');
  carbohydratesProgressBarDiv.appendChild(carbohydratesProgressFillDiv);

  var carbohydratesProgressFillText = document.createElement('p');
  carbohydratesProgressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold');
  carbohydratesProgressFillText.textContent = carbohydratesProgressFillDiv.style.width;
  carbohydratesProgressFillDiv.appendChild(carbohydratesProgressFillText);

  return element;

}

function switchViews() {
  var dataViewElements = document.querySelectorAll('div[data-view]');

  for (var i = 0; i < dataViewElements.length; i++) {
    if (data.view === dataViewElements[i].getAttribute('data-view')) {
      dataViewElements[i].classList.toggle('hidden');
    } else {
      dataViewElements[i].classList.add('hidden');
    }
  }
}
