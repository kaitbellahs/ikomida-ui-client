mv ./public/build/bundle.js ./public/build/bundle_old.js
yarn javascript-obfuscator  ./public/build/bundle_old.js --output  ./public/build/bundle.js --config JsObfuscator.js
rm ./public/build/bundle_old.js
yarn cap copy
yarn cap sync