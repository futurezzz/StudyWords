const mainChapter = document.querySelector('.main-unit-list');
const mainUnit = document.querySelector('.main-unit');
const wordTitle = document.querySelector('.word-title');
const wordExplanation = document.querySelector('.word-explanation');
const wordTitleDown = document.querySelector('.word-title-down');
const wordAccentUl = document.querySelector('.word-accent-ul');
const wordArrayUl = document.querySelector('.word-array-ul');
const hintButton = document.querySelector('.hint-button');
const attainableScore = document.querySelector('.attainable-score');
const remainingChance = document.querySelector('.remaining-chance');
const listenButton = document.querySelector('.listen-button');
const nextButton = document.querySelector('.next-button');
const pointToday = document.querySelector('.point-today-value');
const pointTotal = document.querySelector('.point-total-value');
const audioYes = new Audio('audio/yes.mp3');
const audioNo = new Audio('audio/no.mp3');
const vowel = 'AEIOU';
let attainableScoreValue;
let remainingChanceValue;
let wordValue;
let wordLis;
let blank;
let blankLength;
let accent;
let accentLength;
let matchSerial;
let matchSerialBefore;
let pointTodayValue;
let pointTotalValue;
let appendType;
let wordSerial;
let pronunciationArray = [];
let wordArray = [];


init();


//----EVENTS--------------------------------------------------------------

mainUnit.addEventListener('click', (e)=> {
  let isAvailable = e.target.classList.contains("list");

  // 만일 list라는 클래스가 포함되어 있지 않으면(메뉴버튼이 아닌 빈공간 클릭시) return. 즉 문단을 중단하라
  if(!isAvailable){
    return;
  }

  // list 클래스가 포함되어 있을 경우 아래 문단을 실행하라
  mainUnit.style.visibility = 'hidden';
})
// input에 알파벳을 넣고 다른 칸이나 빈회면을 클릭하였을 때 정답을 체크함
window.addEventListener('click',(e)=>{
  isCorrect();
})

wordArrayUl.addEventListener('keyup', (e)=>{
  // matchSerial은 현재 몇번째 li를 클릭했는지 나타냄.
  matchSerial = e.target.dataset.serial;
  console.log(wordArray[wordSerial].word[matchSerial])
  // matchSerialBefore에 현재 선택된 li번호를 저장했다가 
  // 한글이 입력된 경우 focus blur 할 때 영문으로 바꿔줘야 함
  matchSerialBefore = matchSerial;
  // wordLis[matchSerial].value = e.code.substr(3,1);
  wordValue = wordLis[matchSerial].value;
  console.log(e.key,e.code,e.code.substr(3,1));
})

hintButton.addEventListener('click', ()=>{
  // 획득가능점수가 0점이면 hint 기능을 사용하지 못하고 return된다.
  if(attainableScoreValue == 0){
    return;
  }
  for(let i=0; i<blank.length; i++){
    // 채워지지 않은 빈칸중에 왼쪽부터 채우는 논리
    // 일단 hint 버튼으로 하나 채우고 나면 for문을 빠져나온다.
    if(!wordLis[blank[i]-1].value){
      wordLis[blank[i]-1].value = wordLis[blank[i]-1].textContent;
      attainableScoreValue -= 10;
      attainableScore.textContent = attainableScoreValue;

      if(attainableScoreValue === 10){
        hintButton.style.display = 'none';
        listenButton.style.visibility = 'visible';
      }
      // 만일 힌트버튼을 눌러서 단어를 맞추게 되면 afterCorrect 함수를 실행한다.
      if(i == blank.length-1){
        afterCorrect();
      }

      return;
    }
  }
})

listenButton.addEventListener('click', ()=>{
  speech(wordArray[wordSerial].word);
})

nextButton.addEventListener('click',()=>{
  wordSerial++;
  console.log(wordSerial);
  displayButtons();
  displayItems(wordArray)
})




// functions-------------------------------------------------------------

function init(){
  wordSerial = 0;

  // pointTodayValue는 전역정보로 받아온다. 만일 전역정보가 없다면 || (falsy) 기본값 0을 제공한다.
  pointTodayValue = parseInt(localStorage.getItem('pointTodayValue')) || 0;
  pointTotalValue = 1500;
  
  loadPronunciation();
  loadItems()
  .then(items => {
    displayItems(items);
    displayPoint(0);
  })
  .catch(console.log);
}


function isCorrect(){
  if(matchSerialBefore){

    // 이전에 시도했던 빈칸이 비어있으면 계속 점수가 깍이는 것을 방지하기 위한 논리
    if(wordLis[matchSerialBefore].value == ''){
      return;
    }

    let isAnswer = wordValue.toUpperCase(); //input란에 입력한 영문을 대문자로 바꿈
    let answer = wordArray[wordSerial].word[matchSerialBefore];

    // 정답과 빈칸에 시도한 정답이 같으면 글자를 남겨라.
    if(isAnswer === answer){
      wordLis[matchSerialBefore].value = wordValue;
      matchSerialBefore = '';
      blankLength--;
      if(blankLength === 0){
        afterCorrect();
      }
    } else {
      notCorrect() //시도한 글자가 정답이 아니면 notCorect를 실행하라.
    }
  }
}

// 정답이 아닐 경우
function notCorrect(){
  audioNo.play();
  remainingChanceValue -= 1; 
  remainingChance.textContent = remainingChanceValue;
  // 0.5초간 시도했던 칸을 주황색으로 바꿨다가 다시 원래 배경색으로 되돌린다.
  wordLis[matchSerialBefore].classList.add('word-unit-incorrect');
  wordLis[matchSerialBefore].value = '';
  setTimeout(function(){
    wordLis[matchSerialBefore].classList.remove('word-unit-incorrect')
  },500)
}

// 정답을 맞추고 나면
function afterCorrect(){
  audioYes.play();
  listenButton.style.visibility = 'visible';
  nextButton.style.visibility = 'visible';
  console.log(wordArray[wordSerial].word);
  speech(wordArray[wordSerial].word);
  displayPoint(attainableScoreValue);
}

async function loadPronunciation(){
  const response = await fetch(`data/pronunciation.json`);
  const json = await response.json();
  pronunciationArray = json.items;
  return pronunciationArray;
}

async function loadItems(){
  const response = await fetch(`data/word.json`);
  const json = await response.json();
  wordArray = json.items;
  return wordArray;
}

function displayButtons(){
  nextButton.style.visibility = 'hidden';
  hintButton.style.display = 'block';
  listenButton.style.visibility = 'hidden';
}

function displayPoint(point){
  pointTodayValue = pointTodayValue + point;
  pointTotalValue = pointTotalValue + point;
  localStorage.setItem("pointTodayValue", pointTodayValue);

  pointToday.textContent = pointTodayValue;
  pointTotal.textContent = pointTotalValue;
}

function displayItems(items){
  let length = items[wordSerial].word.length;
  // 숫자인 blank를 문자열로 바꿔서 배열처럼 하나하나 불러올 예정임
  // blank는 단어중에 빈칸으로 표시할 곳 (숫자로 표기되어 있음)
  blank = items[wordSerial].blank.toString(); 
  blankLength = blank.length;
  accent = items[wordSerial].accent.toString(); 
  accentLength = accent.length;
  let explanation = items[wordSerial].explanation;
  let pronunciationSerial = items[wordSerial].pronunciation - 1;

  wordTitleDown.textContent = pronunciationArray[pronunciationSerial].pronunciation;
  wordExplanation.textContent = explanation;
  wordAccentUl.innerHTML = ''; //자리 차지하고 있던 li들 모두 제거
  wordArrayUl.innerHTML = ''; //자리 차지하고 있던 li들 모두 제거

  // 획득가능점수 입력. (blank가 3개면 40점, 4개면 50점, 5개면 60점)
  attainableScoreValue = (blank.length + 1)*10;
  attainableScore.textContent = attainableScoreValue;

  // 남은 도전횟수. 획득가능점수/5로 환산한다.
  remainingChanceValue = attainableScoreValue / 5;
  remainingChance.textContent = remainingChanceValue;

  for(let i=0 ; i<length; i++){
    // i가 blank필드 자릿수에 해당하면 그곳은 빈칸(input type)으로 만들어 사용자가 입력하게 함
    if( blank.includes(i+1) ){
      appendType = 'input'
    }
    else{
      appendType = 'li'
    }
    
    
      li = document.createElement(appendType)
      li.textContent = items[wordSerial].word[i]; //json data에 담겨있는 단어글자를 li에 표시
      li.classList.add('word-unit');
      li.dataset.serial = i;
      
      // accent용 li 만들기. word-accent-ul에 들어갈 요소들
      liA = document.createElement('li')
      liA.textContent = accent.includes(i+1) ? '●' : '';
      // li2.textContent = items[wordSerial].word[i]; //json data에 담겨있는 단어글자를 li에 표시
      liA.classList.add('word-accent');


      // 만일 li에 입력될 글자가 모음(vowel)이면 바탕색을 진노랑으로(word-unit-vowel)을 추가하라
      if(vowel.includes(li.textContent)){
        li.classList.add('word-unit-vowel')
      } 

      // 만일 li타입이 빈칸(input)이 아니라 주어진 글자라면 선택되지 못하게(pointer-events:none)을 추가하라
      if(appendType == 'li'){
        li.classList.add('word-unit-li')
      }

      wordArrayUl.append(li);
      wordAccentUl.append(liA);
      console.log(li, liA);
    }
    wordLis = document.querySelectorAll('.word-unit');
}


// ------------------------- 음성합성 --------------------------------------//

setVoiceList();
if (window.speechSynthesis.onvoiceschanged !== undefined) {
window.speechSynthesis.onvoiceschanged = setVoiceList;
}


function setVoiceList() {
  voices = window.speechSynthesis.getVoices();
  }
  function speech(txt) {
  if(!window.speechSynthesis) {
  alert("음성 재생을 지원하지 않는 브라우저입니다. 크롬, 파이어폭스 등의 최신 브라우저를 이용하세요");
  return;
  }
  // 한국사 풀 때는 한국말로, 단어공부할 때는 영어로
  var lang = 'en-US';
  var utterThis = new SpeechSynthesisUtterance(txt);
  utterThis.onend = function (event) {
  // console.log('end');
  };
  utterThis.onerror = function(event) {
  console.log('error', event);
  };
  var voiceFound = false;
  for(var i = 0; i < voices.length ; i++) {
  if(voices[i].lang.indexOf(lang) >= 0 || voices[i].lang.indexOf(lang.replace('-', '_')) >= 0) {
  utterThis.voice = voices[i];
  voiceFound = true;
  }
  }
  if(!voiceFound) {
  alert('voice not found');
  return;
  }
  utterThis.lang = lang;
  utterThis.pitch = 1;
  utterThis.rate = 1; //속도
  window.speechSynthesis.speak(utterThis);
  };








// \u0009(탭), \u000B(세로 탭), \u000C(폼피드), \u0020(빈칸), \u00A0(줄바꿈 안하는 빈칸) 및 
// "Any other Unicode space separator”라고 정의하고 있다. 
// 또 별개로 7.3절에 줄 바꿈 문자로 \u000A, \u000D, \u2028, \u2029를 
// 정의하고 있는데 일반적으로 공백 문자에는 줄 바꿈 문자도 포함된다.
// U+0009–U+000D (제어 문자 - 탭, CR, LF 등)
// U+0020 빈칸(space)
// U+0085 NEL (제어 문자 - 다음 줄)
// U+00A0 줄바꿈 안하는 빈칸
// U+1680 OGHAM 빈칸 표시
// U+2000–U+200B (여러 종류의 빈칸들)
// U+2028 LS (줄 구분자) ---근데 안됨 ㅜㅜ
// U+2029 PS (문단 구분자) --- 이것도 안됨 ㅠㅠ
// U+202F NNBSP (줄바꿈 안하는 좁은 빈칸)
// U+3000 상형문자 빈칸

// INPUT style 지정하기-----------------------------------------------------------
// style="ime-mode:auto"
// - 현재 선택되어 있는 상태로 한/영중 선택

// style="ime-mode:active"
// - Default로 한글 선택 되는 모드

// style="ime-mode:inactive"
// - Default로 영문 선택 되는 모드

// style="ime-mode:disabled"
// - 무조건 영문만 입력되도록 하는 모드 (한글 입력 안됨)

// style="ime-mode:disabled; text-transform:uppercase;"
// - 무조건 영문 대문자만 입력되도록 적용