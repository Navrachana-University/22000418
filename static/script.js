const textarea = document.getElementById('code');
const lineNumbers = document.getElementById('line-numbers');
const loaderContainer = document.getElementById('loader-container');
const progressBar = document.getElementById('progress-bar');
const outputElement = document.getElementById('output');
const runButton = document.getElementById('runButton');

function updateLineNumbers() {
  const lineCount = textarea.value.split('\n').length;
  lineNumbers.innerHTML = '';

  for (let i = 1; i <= lineCount; i++) {
    const line = document.createElement('div');
    line.textContent = i;
    line.className = 'leading-snug';
    lineNumbers.appendChild(line);
  }
}

function clearEditor() {
  textarea.value = '';
  updateLineNumbers();
  outputElement.textContent = '';
  outputElement.classList.remove('hidden');
}

async function runCompilation() {
  const code = textarea.value;
  const runProgress = document.getElementById('run-progress');
  const runText = document.getElementById('run-text');

  outputElement.textContent = 'Compiling...';
  outputElement.classList.remove('hidden');

  runProgress.style.width = '0%';
  runProgress.classList.remove('hidden');

  let progress = 0;
  const interval = setInterval(() => {
    if (progress < 100) {
      progress += 1.5;
      runProgress.style.width = progress + '%';
    } else {
      clearInterval(interval);
    }
  }, 50);

  try {
    const response = await fetch('/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code }),
    });

    const result = await response.json();

    setTimeout(() => {
      clearInterval(interval);
      runProgress.style.width = '0%';
      outputElement.textContent = result.output || result.error || 'An unknown error occurred.';
    }, 3000);
  } catch (error) {
    clearInterval(interval);
    runProgress.style.width = '0%';
    outputElement.textContent = '⚠️ Error: Could not compile the code.';
  }
}

textarea.addEventListener('input', updateLineNumbers);
textarea.addEventListener('scroll', () => {
  lineNumbers.scrollTop = textarea.scrollTop;
});

updateLineNumbers();

function toggleLineNumbers() {
  const lineNumbers = document.getElementById('line-numbers');
  lineNumbers.classList.toggle('hidden');
}