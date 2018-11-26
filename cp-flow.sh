#!/usr/bin/env bash

for file in flow/*.js; do
    echo "Copying $file to $to"
    to="lib/$(basename "$file" .js).js.flow"  
    cp "$file" "$to"
done