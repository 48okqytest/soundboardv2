const audioElements = {};
const pendingTimers = new Map();
const spinnerElement = document.querySelector('.spinner');
const containerElement = document.querySelector('.flex-container');
let hasLoaded = false;
const time = Date.now();

const queuePlayback = (key, delay, cb) => {
  if (pendingTimers.has(key)) {
    clearTimeout(pendingTimers.get(key));
  }
  const timer = setTimeout(() => {
    pendingTimers.delete(key);
    cb();
  }, delay);
  pendingTimers.set(key, timer);
};

const playSound = (name) => {
  const audio = audioElements[name];
  if (!audio) return;
  audio.currentTime = 0;
  audio.play();
};

fetch(`sounds.json?t=${time}`)
  .then((response) => response.json())
  .then((data) => {
    data.sounds.forEach((sound) => {
      const soundElement = document.createElement('div');
      soundElement.classList.add('sound');

      const aura = document.createElement('div');
      aura.classList.add('sound__aura');
      aura.style.setProperty('--accent', sound.color || '#7cc9ff');
      soundElement.appendChild(aura);

      const header = document.createElement('div');
      header.classList.add('sound__header');

      const buttonElement = document.createElement('button');
      buttonElement.classList.add('sound__trigger');
      buttonElement.style.setProperty('--accent', sound.color || '#7cc9ff');
      buttonElement.innerHTML = '<span class="sound__trigger-icon"></span><span class="sound__trigger-text">Play instantly</span>';
      buttonElement.addEventListener('click', () => playSound(sound.name));

      const nameElement = document.createElement('div');
      nameElement.classList.add('sound__meta');
      nameElement.innerHTML = `<p class="name">${sound.name}</p><p class="tag">Stellar clip</p>`;

      header.appendChild(buttonElement);
      header.appendChild(nameElement);
      soundElement.appendChild(header);

      const controls = document.createElement('div');
      controls.classList.add('sound__controls');

      const delayControl = document.createElement('label');
      delayControl.classList.add('delay');
      delayControl.innerHTML = `<span class="delay__label">Delay</span>`;

      const delayInput = document.createElement('input');
      delayInput.type = 'range';
      delayInput.min = '0';
      delayInput.max = '20';
      delayInput.step = '0.5';
      delayInput.value = '0';
      delayInput.classList.add('delay__slider');
      delayControl.appendChild(delayInput);

      const delayValue = document.createElement('span');
      delayValue.classList.add('delay__value');
      delayValue.textContent = '0s';
      delayControl.appendChild(delayValue);

      delayInput.addEventListener('input', () => {
        delayValue.textContent = `${delayInput.value}s`;
      });

      const delayButton = document.createElement('button');
      delayButton.classList.add('chip', 'chip--glow');
      delayButton.textContent = 'Launch with delay';

      delayButton.addEventListener('click', () => {
        const ms = Number(delayInput.value) * 1000;
        if (ms === 0) {
          playSound(sound.name);
          return;
        }
        delayButton.classList.add('is-armed');
        delayButton.disabled = true;
        delayButton.textContent = `Launching in ${delayInput.value}s`;
        queuePlayback(delayButton, ms, () => {
          playSound(sound.name);
          delayButton.disabled = false;
          delayButton.classList.remove('is-armed');
          delayButton.textContent = 'Launch with delay';
        });
      });

      const cancelButton = document.createElement('button');
      cancelButton.classList.add('chip', 'chip--ghost');
      cancelButton.textContent = 'Cancel delay';
      cancelButton.addEventListener('click', () => {
        if (pendingTimers.has(delayButton)) {
          clearTimeout(pendingTimers.get(delayButton));
          pendingTimers.delete(delayButton);
        }
        delayButton.disabled = false;
        delayButton.classList.remove('is-armed');
        delayButton.textContent = 'Launch with delay';
      });

      const echoButton = document.createElement('button');
      echoButton.classList.add('chip', 'chip--flare');
      echoButton.textContent = 'Echo burst';
      echoButton.addEventListener('click', () => {
        playSound(sound.name);
        setTimeout(() => playSound(sound.name), 380);
      });

      controls.appendChild(delayControl);
      controls.appendChild(delayButton);
      controls.appendChild(cancelButton);
      controls.appendChild(echoButton);
      soundElement.appendChild(controls);

      const audioElement = document.createElement('audio');
      audioElement.src = sound.mp3;
      audioElement.preload = 'auto';
      audioElements[sound.name] = audioElement;
      document.body.appendChild(audioElement);

      const flexContainer = document.querySelector('.flex-container');
      flexContainer.appendChild(soundElement);
    });
    spinnerElement.remove();
    hasLoaded = true;
    console.log(`${data.sounds.length} sounds loaded!`);
  })
  .catch((error) => {
    const errorMessageElement = document.createElement('h3');
    errorMessageElement.style.color = 'red';
    errorMessageElement.innerText = `Error loading soundboard: ${error}`;

    containerElement.appendChild(errorMessageElement);
    spinnerElement.remove();
  });

setTimeout(() => {
  if (!hasLoaded) {
    const errorMessageElement = document.createElement('h3');
    errorMessageElement.style.color = 'red';
    errorMessageElement.innerText = 'A unknown error occured while trying to load the soundboard.';
    containerElement.appendChild(errorMessageElement);
    spinnerElement.remove();
  }
}, 7000);

function playAll() {
  for (const name in audioElements) {
    if (Object.hasOwnProperty.call(audioElements, name)) {
      audioElements[name].currentTime = 0;
      audioElements[name].play();
    }
  }
}

function stopAll() {
  for (const name in audioElements) {
    if (Object.hasOwnProperty.call(audioElements, name)) {
      const el = audioElements[name];
      el.pause();
      el.currentTime = 0;
    }
  }
}
