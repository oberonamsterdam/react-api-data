#!/usr/bin/env bash

for file in flow/*.js; do
    to="lib/$(basename "$file" .js).js.flow"  
    echo "Copying $file to $to"
    cp "$file" "$to"
done