#!/bin/bash

# Script to replace hardcoded colors with CSS variable references
# This uses Tailwind's arbitrary value syntax with CSS variables

# Find all TSX files in src/app
find ~/arise-github/src/app -name "*.tsx" -type f | while read file; do
  # Replace primary teal colors
  sed -i 's/bg-\[#0D5C5C\]/bg-primary-500/g' "$file"
  sed -i 's/bg-\[#0a4a4a\]/bg-primary-600/g' "$file"
  sed -i 's/bg-\[#1D4E4E\]/bg-primary-700/g' "$file"
  sed -i 's/text-\[#0D5C5C\]/text-primary-500/g' "$file"
  sed -i 's/text-\[#0a4a4a\]/text-primary-600/g' "$file"
  sed -i 's/text-\[#1D4E4E\]/text-primary-700/g' "$file"
  sed -i 's/border-\[#0D5C5C\]/border-primary-500/g' "$file"
  sed -i 's/hover:bg-\[#0a4a4a\]/hover:bg-primary-600/g' "$file"
  sed -i 's/hover:bg-\[#0D5C5C\]/hover:bg-primary-500/g' "$file"
  sed -i 's/focus:ring-\[#0D5C5C\]/focus:ring-primary-500/g' "$file"
  
  # Replace secondary gold colors
  sed -i 's/bg-\[#D4A84B\]/bg-secondary-500/g' "$file"
  sed -i 's/bg-\[#c49a42\]/bg-secondary-600/g' "$file"
  sed -i 's/bg-\[#E8C97A\]/bg-secondary-300/g' "$file"
  sed -i 's/text-\[#D4A84B\]/text-secondary-500/g' "$file"
  sed -i 's/text-\[#c49a42\]/text-secondary-600/g' "$file"
  sed -i 's/border-\[#D4A84B\]/border-secondary-500/g' "$file"
  sed -i 's/hover:bg-\[#c49a42\]/hover:bg-secondary-600/g' "$file"
  sed -i 's/focus:ring-\[#D4A84B\]/focus:ring-secondary-500/g' "$file"
  
  # Replace neutral/charcoal colors
  sed -i 's/bg-\[#2D2D2D\]/bg-neutral-800/g' "$file"
  sed -i 's/text-\[#2D2D2D\]/text-neutral-800/g' "$file"
  sed -i 's/border-\[#2D2D2D\]/border-neutral-800/g' "$file"
  
  # Replace accent colors
  sed -i 's/bg-\[#7A9A8E\]/bg-sage/g' "$file"
  sed -i 's/text-\[#7A9A8E\]/text-sage/g' "$file"
  sed -i 's/bg-\[#D4856A\]/bg-terracotta/g' "$file"
  sed -i 's/text-\[#D4856A\]/text-terracotta/g' "$file"
  
  # Replace gradient patterns
  sed -i 's/from-\[#0D5C5C\]/from-primary-500/g' "$file"
  sed -i 's/to-\[#0a4a4a\]/to-primary-600/g' "$file"
  sed -i 's/to-\[#1D4E4E\]/to-primary-700/g' "$file"
  sed -i 's/from-\[#D4A84B\]/from-secondary-500/g' "$file"
  sed -i 's/to-\[#D4A84B\]/to-secondary-500/g' "$file"
  
  # Replace opacity variants
  sed -i 's/bg-\[#0D5C5C\]\/5/bg-primary-500\/5/g' "$file"
  sed -i 's/bg-\[#0D5C5C\]\/10/bg-primary-500\/10/g' "$file"
  sed -i 's/bg-\[#0D5C5C\]\/20/bg-primary-500\/20/g' "$file"
  sed -i 's/border-\[#0D5C5C\]\/10/border-primary-500\/10/g' "$file"
  sed -i 's/border-\[#0D5C5C\]\/20/border-primary-500\/20/g' "$file"
  
  # Replace inline style colors with CSS variables
  sed -i "s/color: '#0D5C5C'/color: 'var(--color-primary-500)'/g" "$file"
  sed -i "s/color: '#D4A84B'/color: 'var(--color-secondary-500)'/g" "$file"
  sed -i "s/backgroundColor: '#0D5C5C'/backgroundColor: 'var(--color-primary-500)'/g" "$file"
  sed -i "s/backgroundColor: '#D4A84B'/backgroundColor: 'var(--color-secondary-500)'/g" "$file"
  
done

echo "Color replacement complete!"
