#!/bin/bash
# Build all resume variants

echo "Building all resume variants..."

# Build main resume
echo "Building Adhikram_Maitra_Resume.pdf..."
lualatex -jobname=Adhikram_Maitra_Resume resume.tex

# Build jobs resume
echo "Building Adhikram_Maitra_Jobs_Resume.pdf..."
lualatex -jobname=Adhikram_Maitra_Jobs_Resume jobs.tex

# Build referrals resume
echo "Building Adhikram_Maitra_Referrals_Resume.pdf..."
lualatex -jobname=Adhikram_Maitra_Referrals_Resume refs.tex

# Build masked resume
echo "Building Adhikram_Maitra_Resume_Masked.pdf..."
lualatex -jobname=Adhikram_Maitra_Resume_Masked masked.tex

# Clean up auxiliary files
echo "Cleaning up auxiliary files..."
rm -f *.aux *.log *.out *.fls *.synctex* *.upa *.upb

echo "Done! All resumes built successfully."
echo ""
echo "Generated files:"
echo "  - Adhikram_Maitra_Resume.pdf"
echo "  - Adhikram_Maitra_Jobs_Resume.pdf"
echo "  - Adhikram_Maitra_Referrals_Resume.pdf"
echo "  - Adhikram_Maitra_Resume_Masked.pdf"
