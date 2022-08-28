mv ./App/build/bundle.js ./App/build/bundle_old.js
yarn javascript-obfuscator  ./App/build/bundle_old.js --output  ./App/build/bundle.js --config JsObfuscator.js
rm ./App/build/bundle_old.js
yarn cap copy
yarn cap sync