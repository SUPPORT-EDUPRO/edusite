#!/bin/bash

# Generate branded placeholder images for NCF templates
# Using ImageMagick to create gradient backgrounds with icons

OUTPUT_DIR="public/templates"
mkdir -p "$OUTPUT_DIR"

# Template definitions: name, emoji, gradient-start, gradient-end
templates=(
  "welcome-play:❤️:#ef4444:#dc2626"
  "bright-start:🤝:#3b82f6:#1d4ed8"
  "storytime:💬:#8b5cf6:#6d28d9"
  "coding-blocks:🔢:#6366f1:#4338ca"
  "digital-storytellers:🎨:#ec4899:#be185d"
  "little-engineers:🌍:#10b981:#059669"
)

for template in "${templates[@]}"; do
  IFS=':' read -r name emoji color1 color2 <<< "$template"
  
  echo "Generating $name.jpg..."
  
  convert -size 1200x630 \
    -define gradient:angle=135 \
    gradient:"$color1"-"$color2" \
    -gravity center \
    -pointsize 200 \
    -fill white \
    -annotate +0+0 "$emoji" \
    "$OUTPUT_DIR/${name}.jpg"
done

echo "✅ All template images generated!"
