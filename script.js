'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-09-30T17:01:17.194Z',
    '2022-09-31T10:51:36.790Z',
    '2022-10-02T23:36:17.929Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 2) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, '0');
  // const month = `${date.getMonth() + 1}`.padStart(2, '0');
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // In each call, print the remaining time to the UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out the user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };

  // Set time to 5 minutes
  let time = 300;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// // FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date and time

    // Experimenting with the API
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', // options: 2-digit, numeric
      year: 'numeric', // options: 2-digit
      // weekday: 'long',
    };

    // const locale = navigator.language;

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    // iso language code table --> lingoes.net

    // const day = `${now.getDate()}`.padStart(2, '0');
    // const month = `${now.getMonth() + 1}`.padStart(2, '0');
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, '0');
    // const min = `${now.getMinutes()}`.padStart(2, '0');
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // day/month/year

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

////////////////////////////////////////////////
// Converting and Checking Numbers

// console.log(23 === 23.0);

// // Base 10 - 0 to 9   1/10 = 0.1, 3/10 = 3.3333333
// // Binary base 2 - 0 1
// console.log(0.1 + 0.2); // 0.3000000000000004
// console.log(0.1 + 0.2 === 0.3); // false
// console.log(' ');
// // Conversion
// console.log(Number('23')); // Number
// console.log(+'23'); // Automatically converts to Number
// console.log(' ');
// // Parsing
// console.log(Number.parseInt('30px')); // 30
// console.log(Number.parseInt('e23')); // NaN
// console.log(' ');
// // !! It needs to start with a number in order to work

// // parseInt has a second argument --> regex
// // implicitly the regex is 10
// console.log(Number.parseInt('30px', 10)); // 30
// console.log(Number.parseInt('e23', 10)); // NaN
// console.log(' ');
// console.log(Number.parseInt('  2.5rem ')); // 2
// console.log(Number.parseFloat('  2.5rem  ')); // 2.5
// // It accepts white space
// console.log(parseFloat('  2.5rem  ')); // 2.5
// // We say that 'Number' provides a 'namespace'
// console.log(' ');
// // Check if value is NaN (literally)
// console.log(Number.isNaN('20')); // false
// console.log(Number.isNaN(20)); // false
// console.log(Number.isNaN(+'20X')); // true
// console.log(Number.isNaN(23 / 0)); // false
// console.log(' ');
// // The isFinite method is actually the best method to check if something is a number or not
// console.log(Number.isFinite('20')); // false
// console.log(Number.isFinite(20)); // true
// console.log(Number.isFinite(+'20X')); // false
// console.log(Number.isFinite(23 / 0)); // false
// console.log(' ');
// console.log(Number.isInteger(23)); // true
// console.log(Number.isInteger(23.0)); // true
// console.log(Number.isInteger(23 / 0)); // false;

////////////////////////////////////////////////
// Math and Rounding

// console.log(Math.sqrt(25));
// console.log(25 ** (1 / 2)); // square root
// console.log(8 ** (1 / 3)); // cubic root
// console.log(' ');
// console.log(Math.max(5, 18, 23, 11, 2)); // 23
// console.log(Math.max(5, 18, '23', 11, 2)); // 23 --> does type conversion
// console.log(Math.max(5, 18, '23px', 11, 25)); // NaN
// console.log(' ');
// console.log(Math.min(5, 18, 23, 11, 2)); // 2
// console.log(' ');
// console.log(Math.PI * Number.parseFloat('10px') ** 2); // 314.1592653589793
// console.log(' ');
// console.log(Math.trunc(Math.random() * 6) + 1); // values from 1 and 6

// const randomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min) + 1) + min;
// // 0...1 -> 0...(max - min) -> 0 + min...(max - min) + min -> min...max
// console.log(randomInt(10, 20));

// // Round integers
// console.log(Math.round(23.3)); // 23
// console.log(Math.round(23.9)); // 24
// console.log(' ');
// console.log(Math.ceil(23.3)); // 24
// console.log(Math.ceil(23.9)); // 24
// console.log(' ');
// console.log(Math.floor(23.3)); // 23
// console.log(Math.floor('23.9')); // 23
// console.log(' ');
// console.log(Math.trunc(23.3)); // 23
// console.log(' ');
// console.log(Math.trunc(-23.3)); // -23
// console.log(Math.floor(-23.3)); // -24
// console.log(' ');
// // Rounding decimals
// console.log((2.7).toFixed(0)); // 3 --> STRING
// console.log((2.7).toFixed(3)); // 2.700 --> STRING
// console.log((2.345).toFixed(2)); // 2.35 --> STRING
// console.log(+(2.345).toFixed(2)); // 2.35 --> Number
// console.log(' ');
////////////////////////////////////////////////
// The Remainder Operator

// console.log(5 % 2); // 1
// console.log(5 / 2); // 2.5

// console.log(8 % 3); // 2
// console.log(8 / 3); // 2.6666666666666665

// console.log(6 % 2); // 0
// console.log(6 / 2); // 3

// console.log(7 % 2); // 1
// console.log(7 / 2); // 3.5

// const isEven = n => n % 2 === 0;
// console.log(isEven(8)); // true
// console.log(isEven(23)); // false
// console.log(isEven(514)); // true

// labelBalance.addEventListener('click', function () {
//   [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
//     if (i % 2 === 0) {
//       row.style.backgroundColor = 'orangered';
//     }
//     if (i % 3 === 0) {
//       row.style.backgroundColor = 'blue';
//     }
//   });
// });
// // Every Nth time --> i % N === 0

//////////////////////////////////////////////
// Numeric Separators

// 287,460,000,000
// We can use '_' in order to make large numbers easier to read
// JavaScript completely ignores the '_'
// const diameter = 287_460_000_000;
// console.log(diameter); // 287460000000

// // 345.99
// const price = 345_99;
// console.log(price);

// const transferFee1 = 15_00; // 15$
// const transferFee2 = 1_500; // 1.5$
// // transferFee1 and transferFee2 are exactly the same number, but they represent different things to us

// const PI = 3.1415;
// // 3._1415 --> X
// // 3_.1415 --> X
// // _3.1415 --> X
// // 3.1415_ --> X
// // 3.14__15 --> X
// console.log(PI);

// console.log(Number('230_000')); // NaN

////////////////////////////////////////////////
// Working with BigInt

// console.log(2 ** 53 - 1); // 9007199254740991
// console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991
// // Anything beyond this becomes unsafe
// // Somethimes it works because the JavaScript engine uses some tricks behind the scenes, however they don't work everytime
// // If we go beyond the maximum number, we lose precision

// console.log(2 ** 53 + 1); // 9007199254740992
// console.log(2 ** 53 + 2); // 9007199254740994
// console.log(2 ** 53 + 3); // 9007199254740996
// console.log(2 ** 53 + 4); // 9007199254740996

// console.log(57438275982743809573975984379); // 5.743827598274381e+28 --> does not have precision
// console.log(57438275982743809573975984379n); // --> BigInt
// console.log(BigInt(57438275982)); // --> for smaller numbers (doesn't work every single time, because it still needs to store the number before doing the conversion)

// // Operations (they only work between bigInts)
// console.log(10000n + 10000n); // 20000n
// console.log(10000n + 4683287487829876578798775646n); // 4683287487829876578798785646n
// // console.log(Math.sqrt(16n)); // --> does not work

// const huge = 4345678987545678967n;
// const num = 23;
// console.log(huge * BigInt(num)); // --> This works

// // Exceptions
// console.log(20n > 15); // true
// console.log(20n === 20); // false
// console.log(typeof 20n); // bigint
// console.log(20n == '20'); // true

// console.log(huge + ' is REALLY big!!!');

// // Divisions
// console.log(11n / 3n); // 3n
// console.log(10 / 3); // 3.3333333333333335
// // console.log(10 / 3n); // error

////////////////////////////////////////////////
// Creating Dates

// // Create a date
// const now = new Date();
// console.log(now);
// console.log(' ');
// console.log(new Date('Oct 02 2022 19:16:52'));
// console.log(new Date('December 24, 2015'));
// console.log(new Date(account1.movementsDates[0]));
// console.log(' ');
// // The month is zero based
// console.log(new Date(2037, 10, 19, 15, 23, 5)); // Nov 10, 2037, 15h:23m:05s
// console.log(' ');
// console.log(new Date(2037, 10, 33)); // Dec 3, 2037
// console.log(' ');
// console.log(new Date(0)); // Jan 01 1970
// console.log(new Date(3 * 24 * 60 * 60 * 1000)); // Jan 4 1970 --> 259200000 = timestamp
// console.log(' ');
// // Working with dates
// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future);
// console.log(future.getFullYear()); // 2037
// console.log(future.getMonth()); // 10 --> Month - 1
// console.log(future.getDate()); // 19 --> Day
// console.log(future.getDay()); // 4 --> Thursday
// console.log(future.getHours()); // 15
// console.log(future.getMinutes()); // 23
// console.log(future.getSeconds()); // 0
// console.log(future.toISOString()); // 2037-11-19T13:23:00.000Z
// console.log(future.getTime()); // 2142249780000 = timestamp (the number of miliseconds since Jan 01 1970)
// console.log(' ');
// console.log(new Date(2142249780000)); // Thu Nov 19 2037 15:23:00 GMT+0200 (Eastern European Standard Time)
// console.log(' ');
// console.log(Date.now());
// console.log(' ');
// future.setFullYear(2040);
// console.log(future); // Nov 19 2040
// console.log(' ');

////////////////////////////////////////////////
// Operations with dates

// const future = new Date(2037, 10, 19, 15, 23);
// console.log(Number(future)); // 2142249780000 --> timestamp
// console.log(+future); // 2142249780000

// const calcDaysPassed = (date1, date2) =>
//   Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

// const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 24));
// console.log(days1); // 10

////////////////////////////////////////////////
// Internationalizing Numbers (Intl)

// const num = 3884764.23;

// const options = {
//   style: 'currency', // percent, currency etc
//   unit: 'mile-per-hour', // celsius, km-per-hour etc
//   currency: 'EUR',
//   // useGrouping: false, // --> without separators
// };

// console.log('UK:      ', new Intl.NumberFormat('en-UK', options).format(num));
// console.log('Germany: ', new Intl.NumberFormat('de-DE', options).format(num));
// console.log('Syria:   ', new Intl.NumberFormat('ar-SY', options).format(num));
// console.log(
//   navigator.language + '    ',
//   new Intl.NumberFormat(navigator.language, options).format(num)
// );

////////////////////////////////////////////////
// Timers: setTimeout and setInterval

// setTimeout --> only executed once
const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕`),
  3000,
  ...ingredients
);
console.log('Waiting...');

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer); // nothing will be printed

// setInterval
setInterval(function () {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  console.log(`${hour}:${minutes}:${seconds}`);
}, 1000);
