const wordVisibility = document.querySelector('.word-visibility');
const mainChapter = document.querySelector('.main-unit-list');
const mainUnit = document.querySelector('.main-unit');
const home = document.querySelector('.home');
const recessUnit = document.querySelector('.recess-unit');
const wordTitle = document.querySelector('.word-title');
const wordLevel = document.querySelector('.word-level');
const levelBox = document.querySelector('.level');
const serialBox = document.querySelector('.serial');
const attainablePoint = document.querySelector('.attainable-point');
const wordExplanation = document.querySelector('.word-explanation');
const pronunciationUl = document.querySelector('.pronunciation-ul');
const wordAccentUl = document.querySelector('.word-accent-ul');
const wordArrayUl = document.querySelector('.word-array-ul');
const hintButton = document.querySelector('.hint-button');
const listenButton = document.querySelector('.listen-button');
const nextButton = document.querySelector('.next-button');
const pointToday = document.querySelector('.point-today-value');
const pointTotal = document.querySelector('.point-total-value');
const keyboardConatiner = document.querySelector('.keyboard-container');
const keyboardUl = document.querySelector('.keyboard-ul');
const audioClear = new Audio('audio/clear.mp3');
const audioYes = new Audio('audio/yes.mp3');
const audioNo = new Audio('audio/no.mp3');
const vowel = 'AEIOU';
// const consonants = ['B','C','D','F','G','H','J','K','L','M','N','P','Q','R','S','T','V','W','X','Y','Z'];
const consonants = 'BCDFGHJKLMNPQRSTVWXYZ'
let consonantsLis;
let today = new Intl.DateTimeFormat('kr').format(new Date());
let lastDay;
let level;
let attainableScoreValue;
let answer;
let wordWidth;
let wordList;
let blank;
let blankLength;
let blankTurn; // 현재 몇번째 공란을 채워야 할 차례인지
let accent;
let accentLength;
let matchSerial;
let matchSerialBefore;
let pointTodayValue;
let pointTotalValue;
let appendType;
let serial;
let wordSerial;
let wordSerialRandom10 = [];
let numbers = [];
let pronunciationArray = [];
let wordArray = [];
let levelItems = [];
let wordLength;
let isAvailable = true;


init();


//----EVENTS--------------------------------------------------------------

mainChapter.addEventListener('click', (e)=> {
  let isAvailable = e.target.classList.contains("list");
  // 만일 list라는 클래스가 포함되어 있지 않으면(메뉴버튼이 아닌 빈공간 클릭시) return. 즉 문단을 중단하라
  if(!isAvailable){
    return;
  }

  // 누른 레벨버튼에서 숫자만 추출하여 level변수에 넣음
  level = e.target.textContent.substr(6,1);
  mainUnit.style.visibility = 'hidden';
  setTimeout(() => {
    wordVisibility.style.opacity = 1;
    // level에 맞는 단어들을 불러옴
    levelItems = wordArray.filter(word => word.level == level) 
console.log(levelItems);
    makeWordSerialRandom();
    displayQuiz(wordArray);
    console.log("레벨 아이템 총:",levelItems.length," 개")
  }, 1300);
})

// home 버튼을 누르면 메뉴판이 보인다.
home.addEventListener('click',()=>{
  wordVisibility.style.opacity = 0;
  setTimeout(() => {
    mainUnit.style.visibility = 'visible';
    // level에 맞는 단어들을 불러옴
  }, 700);
})



// 맞춰야 할 빈칸을 클릭하면(빈칸에는 word-blank-cursor 클래스속성이 부여되어 있다.)
wordArrayUl.addEventListener('click',(e)=>{
  if(!e.target.classList.contains('word-blank-cursor')){
    return;
  }
  wordList[blankTurn].classList.remove('word-blank-active');
  e.target.classList.add('word-blank-active');
  blankTurn = parseInt(e.target.dataset.serial);
  
  console.log('blankTurn:',blankTurn,blank);
})



// 주어진 키보드를 클릭하면
keyboardConatiner.addEventListener('click',(e)=>{
  // 단어를 다 맞추고 다음문제가 나오기 전까지는 키보드 입력이 불가함
  // 한 알파벳을 맞추고 다음 커서가 깜빡일 때 까지 다음 입력이 불가함
  if(!blank || !isAvailable){
    return;
  }
  answer = wordList[blankTurn].dataset.text;
  // console.log("blankTurn: ",blankTurn);
  if(e.target.classList.contains('keyboard')|| e.target.classList.contains('keyboardVowel')){
    let tryAnswer = e.target.textContent;
    wordList[blankTurn].textContent = tryAnswer;
    if(answer === tryAnswer){
      yesCorrect(10);
    }
    else if(answer !== tryAnswer){
      notCorrect();
    }
  }
})


hintButton.addEventListener('click', ()=>{
  wordList[blankTurn].textContent = wordList[blankTurn].dataset.text;
  yesCorrect(-5);

  }
  
)

listenButton.addEventListener('click', ()=>{
  listenButton.classList.add('listen-button-hover');
  speech(levelItems[wordSerial].word);
  setTimeout(() => {
    listenButton.classList.remove('listen-button-hover');
  }, 800);
})

nextButton.addEventListener('click',()=>{
  //키보드를 연속으로 눌러 틀리는 경우를 막기위한 변수 isAvailable을 다시 활성화
  isAvailable = true;
  // 다음 문제를 위해 문제번호를 1 증가시킴
  serial++;
  wordSerial = parseInt(wordSerialRandom10[serial])-1;
  
  console.log("wordSerial: ", wordSerial);

  displayButtons();
  displayQuiz(levelItems)
})




// functions-------------------------------------------------------------

function init(){
  serial = 0;
  lastDay = localStorage.getItem('lastDay');
  
  // 마지막으로 저장한 날짜가 오늘날짜이면 오늘의 point점수를 localStorage에서 찾아와서 반영하고 
  // 그렇지 않으면 오늘의 point는 0점으로 시작하라
  // pointTodayValue는 전역정보로 받아온다. 만일 전역정보가 없다면 || (falsy) 기본값 0을 제공한다.
  pointTodayValue = (today === lastDay) ? (parseInt(localStorage.getItem('pointTodayValue')) || 0) : 0;

  //poointTotalValue가 저장되어 있으면 찾아오고, 없다면 0점으로 시작하라
  pointTotalValue = parseInt(localStorage.getItem('pointTotalValue')) || 0;

  displayLevelButton();

  loadPronunciation();
  loadItems()
  // .then(items => {
  //   displayItems(items);
  //   displayKeyboard(items);
  //   blankTurn = parseInt(blank[0])-1;
  //   console.log('blankTurn',blankTurn);
  //   focusBlank(blankTurn);
  //   displayPoint(0);
  // })
  // .catch(console.log);
}

function displayQuiz(wordArray){
    displayItems(levelItems);
    displayKeyboard(levelItems);
    blankTurn = parseInt(blank[0])-1;
    console.log('blankTurn',blankTurn);
    focusBlank(blankTurn);
    displayPoint(0);
    displayPronunciationSymbol();
}

// 정답이 아닐 경우
function notCorrect(){
  if(!isAvailable){
    return;
  }
  audioNo.play();
  // 0.5초간 시도했던 칸을 주황색으로 바꿨다가 다시 원래 배경색으로 되돌린다.
  wordList[blankTurn].classList.add('word-blank-incorrect');
  attainablePoint.classList.add('attainable-point-add');
  
  attainableScoreValue -= 2;
  attainablePoint.textContent = attainableScoreValue;
  
  setTimeout(function(){
    wordList[blankTurn].classList.remove('word-blank-incorrect')
    attainablePoint.classList.remove('attainable-point-add');
    wordList[blankTurn].textContent = '';
    // 연속으로 누르는 것을 방지하기 위함
    isAvailable = true;

  },500)
  isAvailable = false;
}

// 정답일 경우
function yesCorrect(point){
  if(!isAvailable){
    return;
  }
  wordList[blankTurn].classList.remove('word-blank-active');
  wordList[blankTurn].classList.remove('word-blank-cursor');
  blank = blank.filter(e=>e!==(blankTurn+1).toString());
  console.log(blank, blankTurn)
  // blank = blank.replace(blankTurn+1,"");
  blankLength--;
  
  wordList[blankTurn].classList.add('word-blank-correct');
  attainablePoint.classList.add('attainable-point-add');
  
  
  audioYes.play();
  attainableScoreValue += point;
  attainablePoint.textContent = attainableScoreValue;
  // 연속으로 누르는 것을 방지하기 위함
  isAvailable = false;

  setTimeout(function(){
    wordList[blankTurn].classList.remove('word-blank-correct');
    attainablePoint.classList.remove('attainable-point-add');

    if(blankLength === 0){
      afterCorrect();
      return;
    }

    blankTurn = parseInt(blank[0])-1;
    focusBlank(blankTurn);
    isAvailable = true;
  },500)

}


// 단어 전체를 맞추고 나면
function afterCorrect(){
  // audioClear.play();
  listenButton.style.display = 'block';
  nextButton.style.visibility = 'visible';
  // console.log(levelItems[wordSerial].word);
  speech(levelItems[wordSerial].word);
  displayAccent();
  attainablePoint.classList.add('attainable-point-afterCorrect')
  setTimeout(function(){
    displayPoint(attainableScoreValue);
  },1100)

  // 10문제를 맞히고 나면 thumbsup 아이콘이 나타났다가 화면을 지우고 다시 시작함
  if(serial === 9){
    serial = 0;
    audioClear.play();
    recessUnit.style.visibility = 'visible';
    recessUnit.classList.add('thumbsUp');
    wordVisibility.style.opacity = 0;
    makeWordSerialRandom();
    setTimeout(function(){
      recessUnit.style.visibility = 'hidden';
      recessUnit.classList.remove('thumbsUp');
      wordVisibility.style.opacity = 1;
      displayButtons();
      displayQuiz(levelItems);
      isAvailable = true;
    },1100)
  }
  
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
  listenButton.style.display = 'none';
  
  attainablePoint.classList.remove('attainable-point-afterCorrect');
}

function displayPoint(point){
  lastDay = today;
  pointTodayValue = pointTodayValue + point;
  pointTotalValue = pointTotalValue + point;
  localStorage.setItem("pointTodayValue", pointTodayValue);
  localStorage.setItem("pointTotalValue", pointTotalValue);
  localStorage.setItem("lastDay", lastDay);

  pointToday.textContent = pointTodayValue;
  pointTotal.textContent = pointTotalValue;
}

// 알파벳 입력할 칸을 돋보이게 하기(박스 사이즈가 살짝 커짐)
//blankList는 공백인 칸만 들어있는 배열이다.
//처음에는 첫번째 공백이 깜박인다. (blankTurn=0, 기본값)
function focusBlank(blankTurn){
  wordList[blankTurn].classList.add('word-blank-active');
}


function displayKeyboard(items){
  let keyboardConsonants = consonants; //자음 초기화
  //빈칸에 들어가야 할 정답 알파벳이 몇개인지 체크해 두었다가, 키보드에 나머지 채울 알파벳의 갯수를 정하는 데 활용
  let keyboardArray = [];
  let tenNumbers = '0123456789';
  let randomArray = [];
  // ----------K-E-B-O-A-R-D-----------------------------------------------------
  // ----- 빈칸을 채우기 위한 랜덤 키보드 생성.
  // 모음 AEIOU 5개는 이미 생성되어 있음
  // keyboardArray 라는 배열에 빈칸에 들어갈 단어만 일단 모아넣음
  for(let j=0; j<blankLength; j++){
    let blankItem = items[wordSerial].word[blank[j]-1];
    if(!vowel.includes(blankItem)){
      // keyboardArray 에 일단 빈칸에 들어가야 할 알파벳을 먼저 넣어 둔다.
      keyboardArray.push(blankItem);
      // 중복방지를 위해 자음키보드(consonants)에서 이 빈칸 알파벳은 제외한다.replace ""
      keyboardConsonants = keyboardConsonants.replace(blankItem,"");
    };
  }
  // forNum은 빈칸에 들어가야 할 자음을 제외한 나머지 랜덤자음의 개수
  let forNum = 10-keyboardArray.length;

  // 자음 랜덤 10개 생성
  for (let j=0; j<forNum; j++){
    //consonants에 있는 21개자음 중에 랜덤으로 뽑아라
    let n = Math.floor(Math.random()*keyboardConsonants.length);
    keyboardArray.push(keyboardConsonants[n]);
    // 여기서도 중복방지를 위해 
    // keyboardArray 에 들어간 알파벳은 replace명령으로 keyboardConsonants 에서 제거한다.
    keyboardConsonants = keyboardConsonants.replace(keyboardConsonants[n],"");
  }
  // console.log(keyboardArray,keyboardArray.length,keyboardConsonants);

  for(let j=0; j<10; j++){
    let n = Math.floor(Math.random()*tenNumbers.length);
    randomArray.push(tenNumbers[n]);

    //keyboard용 li 만들기. 
    li = document.createElement('li')
    li.textContent = keyboardArray[tenNumbers[n]];
    li.classList.add('keyboard');
    keyboardUl.append(li);
    // 사용한 자리위치 숫자는 tenNumbers에서 제외하여 중복을 방지한다.
    tenNumbers = tenNumbers.replace(tenNumbers[n],"");
  }
}


//levelItems에 있는 단어들 중에서 랜덤으로 10개를 뽑아라
function makeWordSerialRandom(){
  // levelItems의 갯수만큼 숫자배열을 만든다.
  wordSerialRandom10.length = 0; //random배열 초기화
  numbers.length = 0;
  numbers = Array(levelItems.length).fill().map((v,i)=>i+1);
  for(let i=0; i<10; i++){
    let n = Math.floor(Math.random()*numbers.length);
    // numbers에서 랜덤으로 뽑은 숫자를 꺼내어
    let poped = numbers.splice(n,1);
    // wordSerialRandom10에 그 숫자를 넣는다
    wordSerialRandom10.push(...poped);
  }
  console.log("random",wordSerialRandom10);
}

// 단어 출력하기(공백도 함께)
function displayItems(items){
  wordSerial = parseInt(wordSerialRandom10[serial])-1;
  // wordSerial = 33;
  wordLength = items[wordSerial].word.length;
  wordWidth = wordLength < 10 ? 35 : 28;
  // console.log(items[wordSerial]);
  // 숫자인 blank를 문자열로 바꿔서 배열처럼 하나하나 불러올 예정임
  // blank는 단어중에 빈칸으로 표시할 곳 (숫자로 표기되어 있음)
  // blank = items[wordSerial].blank.toString(); 
  blank = items[wordSerial].blank.split(","); 
  blankLength = blank.length;

  let explanation = items[wordSerial].뜻영문;
  let pronunciationSerial = items[wordSerial].pronunciation - 1;
  
  attainableScoreValue = 10;
  attainablePoint.textContent = attainableScoreValue;
  // wordLevel.innerHTML = `Level ${items[wordSerial].level} \u00A0\u00A0 ${serial+1}`
  levelBox.textContent = level;
  serialBox.textContent = serial+1;
  wordExplanation.textContent = explanation;
  wordAccentUl.innerHTML = ''; //자리 차지하고 있던 li들 모두 제거
  wordArrayUl.innerHTML = ''; //자리 차지하고 있던 li들 모두 제거
  keyboardUl.innerHTML = ''; //자음키보드도 초기화
  pronunciationUl.innerHTML = ''; //발음기호 초기화


  for(let i=0 ; i<wordLength; i++){
      li = document.createElement('li');
      let wordItem = items[wordSerial].word[i];
    // i가 blank필드 자릿수에 해당하면 그곳은 빈칸으로 만들어 사용자가 입력하게 함
    if( blank.includes((i+1).toString())){
      //공백으로 남겨두는 대신에 정답확인을 위해 dataset에 단어를 저장한다.
      li.dataset.text = wordItem;
      li.classList.add('word-blank-cursor');
    }
    else{
      li.textContent = wordItem; //json data에 담겨있는 단어글자를 li에 표시
    }
      li.classList.add('word-unit');

      // 단어길이가 10글자 이상이면 단어 칸의 길이를 35px에서 28px 로 줄여서 화면에 채움
      if(wordLength >= 10){
        li.style.width = '28px';
      }
      li.dataset.serial = i;

      // 만일 li에 입력될 글자가 모음(vowel)이면 바탕색을 카키색으로(word-unit-vowel)을 추가하라
      if(vowel.includes(wordItem)){
        li.classList.add('word-unit-vowel')
      } 

      wordArrayUl.append(li);
    }
    wordList = document.querySelectorAll('.word-unit');
}


// 강세표시-----------------------------------
function displayAccent(){
  accent = levelItems[wordSerial].accent.toString(); 
  accentLength = accent.length;
  if(accent == 0){
    return;
  }
  liA = document.createElement('li');
  liA.classList.add('word-accent');
  
  // 단어길이가 10글자 이상이면 단어 칸의 길이를 35px에서 28px 로 줄여서 화면에 채움
  if(wordLength >= 10){
    liA.style.width = '28px';
  }
  // accent가 한글자일 경우도 있지만 2~3글자일 경우 엑센트 그림이 위치할 크기가 2~3배로 커져야 한다.
  let width = accent.length * wordWidth;
  // accent가 표시될 위치는 첫번째 accent가 표시되는 지점까지 marginLeft로 공간이동을 해줘야 한다.
  let marginLeft = (accent[0]-1)*wordWidth;
  liA.style.width = `${width}px`;
  liA.style.marginLeft = `${marginLeft}px`;
  wordAccentUl.append(liA);
}


// 발음기호 표시-----------------------------------
function displayPronunciationSymbol(){
  let pronunciationSymbolIndex = parseInt(levelItems[wordSerial].pronunciation.toString())-1; 
  // let pronunciationSpot = levelItems[wordSerial].발음위치; 
  let pronunciationSpotArray = levelItems[wordSerial].발음위치.split('|');
  let arrayLength = pronunciationSpotArray.length;
  let symbol = pronunciationArray[pronunciationSymbolIndex].pronunciation;
console.log(pronunciationSpotArray)
  
  // 표시위치가 2개 이상인 경우
  // else if(arrayLength > 1) {
    for(let i=0; i<arrayLength; i++){
      let liP = document.createElement('li');
      liP.classList.add('word-pronunciation');
      let pronunciationSpot = pronunciationSpotArray[i].split(",")
      // 발음기호가 한글자에 위치할 경우도 있지만 2~3글자일 경우 그 사이에 배치하기 위해 크기가 2~3배로 커져야 한다.
      let width = pronunciationSpot.length * wordWidth;
      // accent가 표시될 위치는 첫번째 accent가 표시되는 지점까지 marginLeft로 공간이동을 해줘야 한다.
      let marginLeft = (pronunciationSpot[0]-1)*wordWidth;
      console.log(pronunciationSpot[0],marginLeft)
      liP.style.width = `${width}px`;
      liP.style.marginLeft = `${marginLeft}px`;

      
  // symbol이 'SILENT'를 포함하고 있으면 SILENT를 제외한 뒤의 글자만 사용한다.
  // symbol = !symbol.includes('SILENT') ? symbol : symbol.replace('SILENT ',"");
  let symbolText;
  if(symbol.includes('SILENT')){
    symbolText = symbol.replace('SILENT ',"");
    let liS = document.createElement('li');
    liS.classList.add('pronuciationSilent');
    let widthS = (pronunciationSpot.length === 1) ? 26 : 28+(symbolText.length*3);
    liS.style.width = `${widthS}px`;
    liS.style.height = `${widthS}px`;
    let extraMargin = (pronunciationSpot.length == symbolText.length) ? 5 : 2+wordWidth*(pronunciationSpot.length - symbolText.length)/2;
    liS.style.marginLeft = `${marginLeft+extraMargin}px`;
    console.log(pronunciationSpot.length, symbolText.length, marginLeft, extraMargin, widthS)
    pronunciationUl.append(liS);
  }
  liP.textContent = symbolText;
  pronunciationUl.append(liP);

    // }
  }
  console.log('발음',pronunciationSpotArray.length)
  
  // pronunciationUl.textContent = pronunciationArray[pronunciation].pronunciation;
  
  
}

// 웹 실행시 최초 출현하는 LEVEL 리스트
function displayLevelButton(){
  for(let i=1; i<9; i++){
    let li = document.createElement('li');
    li.innerHTML = `LEVEL ${i}`;
    li.classList.add('list');
    mainChapter.append(li);
  }
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


//// date관련 최신문법
// let date = new Date();
// let a = new Intl.DateTimeFormat('kr').format(date); //kr, en, fr, jp등등
// let b = new Intl.DateTimeFormat('kr',{dateStyle : 'full', timeStyle: 'full'}).format(date);
// let c = new Intl.RelativeTimeFormat().format(-10,'hours') //10시간 전 이라고 출력됨
// console.log(a)
// console.log(b)
// console.log(c)

////temporal 곧 출시할 js신기능
//// import {Temporal} from "@js-temporal/polyfill";
// let d = Temporal.Now.PlainDateTimeISO(); //현재날짜
// let e = new Temporal.PlainDate(2022,12,9)
// d = d.add({days:10, months:3}) //3개월 10일 뒤의 날짜 출력
// let f = d.round({smallestUnit: 'hour', roundingMond:'floor'}); //시간단위로 반올림
// let Dday = Temporal.PlainDateTime.from('2022-09-30T12:00:00');
// let duration = Dday.since(d); //오늘날짜로부터 Dday까지의 기간
// console.log(d.toString())
// console.log(duration.days) //기간인 몇일인지
// console.log(duration.hours) //기간인 몇시간인지