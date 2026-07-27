const sourceInput = document.getElementById('sourceInput');
const output = document.getElementById('output');
const encodeBtn = document.getElementById('encodeBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const pythonVersionSelect = document.getElementById('pythonVersionSelect');

const baseAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const customSymbols = '🐉🐲⭐✦✧✨💫🌠⚡🔥💥☄️🌪❄️🌀🥋🥊⚔️👊🙌👐🟠🔴🟡🟢🔵🟣⚫⚪👽🤖👺🐢🐒🦍👑💎🔮🍑🍗🍚🍶🏯⛩⛰🛡👑🧙‍♂️🤜🤛😡😤🥵🤯🌌🌍🌑☀️🌠ДБГИЛПФЦЧШЯ🔮𓆏𓃰𓀄𓁆ΩΨΦ🎏🎐🎋𓅓𓆙𓋹𓀎𓁉あいうえおサシスセソ🎭🃏🎯🎲🎰𓂉𓃊𓅔𓇎𓋪𓎳𓐍𓁺𓀠𓅎𓆈𓆦𓃗𓃠𓄿𓅜𓇢𓈎𓉤𓊗𓋔𓌜𓍯𓎵𓏢𓐔';

const encodeMap = Object.fromEntries(
  [...baseAlphabet].map((char, index) => [char, customSymbols[index % customSymbols.length]])
);
const decodeMap = Object.fromEntries(
  Object.entries(encodeMap).map(([key, value]) => [value, key])
);

function toUtf8Hex(text) {
  return Array.from(new TextEncoder().encode(text), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function enc(text) {
  const noisy = toUtf8Hex(text);
  const mapped = noisy.split('').map((char) => encodeMap[char] ?? char).join('');
  return `shenron("${escapeForPython(mapped)}")`;
}

function shenron(value) {
  const hex = value.split('').map((char) => decodeMap[char] ?? char).join('');
  const bytes = Uint8Array.from(hex.match(/.{1,2}/g).map((pair) => parseInt(pair, 16)));
  return new TextDecoder().decode(bytes);
}

function escapeForPython(text) {
  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function encodeSource() {
  const source = sourceInput.value.trim();
  if (!source) {
    output.value = 'Vui lòng nhập mã Python trước.';
    return;
  }

  const version = pythonVersionSelect ? pythonVersionSelect.value : '3.13';
  const payloadExpr = enc(source);
  const wrapped = `#!/usr/bin/env python${version}
# -*- coding: utf-8 -*-

string = "${baseAlphabet}"\ncust = ${JSON.stringify(customSymbols)}\ne = dict(zip(string, cust))\nd = {v: k for k, v in e.items()}\n\ndef shenron(s):\n    noisy = ''.join(d.get(c, c) for c in s)\n    return bytes.fromhex(noisy).decode('utf-8')\n\nexec(${payloadExpr})\n`;

  output.value = wrapped;
}

function copyOutput() {
  if (!output.value) return;
  navigator.clipboard.writeText(output.value).then(() => {
    copyBtn.textContent = 'Đã sao chép';
    setTimeout(() => {
      copyBtn.textContent = 'Sao chép';
    }, 1200);
  });
}

function clearAll() {
  sourceInput.value = '';
  output.value = '';
}

function downloadPy() {
  if (!output.value) return;
  const version = pythonVersionSelect ? pythonVersionSelect.value : '3.13';
  const blob = new Blob([output.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `encoded_python_${version.replace('.', '')}.py`;
  link.click();
  URL.revokeObjectURL(url);
}

encodeBtn.addEventListener('click', encodeSource);
copyBtn.addEventListener('click', copyOutput);
clearBtn.addEventListener('click', clearAll);
downloadBtn.addEventListener('click', downloadPy);

sourceInput.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    encodeSource();
  }
});
