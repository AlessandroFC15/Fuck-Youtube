#!/usr/bin/env bash

. ~/.nvm/nvm.sh
nvm use 9

echo '>> Building the project...'
npm run build

echo '>> Moving .crx file...'
mkdir -p ./releases/latest
mv ./build/Fuck_YouTube.crx ./releases/latest

echo '>> Creating source code zip file...'
zip source_code.zip -r src webpack LICENSE.md package.json package-lock.json README.md
mv ./source_code.zip ./releases/latest

echo '>> Done, crx file and source code are available at /releases/latest <<'
