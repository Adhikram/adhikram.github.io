# Adhikram/adhikram.github.io

🚀 **Automated Resume & Portfolio Generator** - A JSON-based system that generates multiple resume variants and a portfolio website from a single data source. No manual updates needed!

## ✨ Features

- 📝 **Single Source of Truth**: Edit JSON files once, generate everything
- 🎨 **Multiple Resume Variants**: Generate 4 different resume PDFs (main, jobs, referrals, masked)
- 🌐 **Portfolio Website**: Automatic Jekyll-based website generation
- 🤖 **Automated**: LuaTeX + Lua scripting for dynamic PDF generation
- 💼 **Professional**: Clean, modern design using Bulma CSS framework

## 🏗️ Architecture

```
JSON Data Files → → → → → → → → → → → ┬→ LuaTeX → 4 Resume PDFs
(_data/*.json)                        │
                                      └→ Jekyll → Portfolio Website
```

## 📁 Project Structure

```
├── _data/
│   ├── personal.json      # Contact info, skills (4 profile variants)
│   ├── exp.json           # Work experience
│   ├── proj.json          # Products/Projects
│   └── edu.json           # Education
├── _lua/
│   └── parser.lua         # Lua functions for PDF generation
├── *.tex                  # LaTeX templates for each resume variant
├── *.html                 # Jekyll templates for website
└── build_all.sh           # Build script for all PDFs
```

## 🚀 Quick Start

### Prerequisites

1. **Ruby & Jekyll** (for website)
   ```bash
   gem install bundler jekyll
   ```

2. **LaTeX** (for PDFs)
   ```bash
   brew install --cask basictex
   eval "$(/usr/libexec/path_helper)"
   
   # Install required packages
   sudo tlmgr update --self
   sudo tlmgr install enumitem fontawesome luacode marvosym mathdesign \
                      pdfcomment preprint titlesec luatex85 datetime2 \
                      zref marginnote soulpos
   ```

### 🌐 Running the Website

1. **Install dependencies:**
   ```bash
   bundle install --path vendor/bundle
   ```

2. **Run the Jekyll server:**
   ```bash
   bundle exec jekyll serve --baseurl=""
   ```
   
3. **View the site:**
   - Main: http://127.0.0.1:4000/
   - Jobs: http://127.0.0.1:4000/jobs.html
   - Referrals: http://127.0.0.1:4000/refs.html
   - Masked: http://127.0.0.1:4000/masked.html

### 📄 Generating PDFs

**Option 1: Build All Resumes (Recommended)**
```bash
chmod +x build_all.sh
./build_all.sh
```

This generates:
- `Adhikram_Maitra_Resume.pdf` (Main)
- `Adhikram_Maitra_Jobs_Resume.pdf` (Job applications)
- `Adhikram_Maitra_Referrals_Resume.pdf` (Referrals)
- `Adhikram_Maitra_Resume_Masked.pdf` (Masked contact info)

**Option 2: Build Individual Resume**
```bash
# Main resume
lualatex -jobname=Adhikram_Maitra_Resume resume.tex

# Jobs resume
lualatex -jobname=Adhikram_Maitra_Jobs_Resume jobs.tex

# Referrals resume
lualatex -jobname=Adhikram_Maitra_Referrals_Resume refs.tex

# Masked resume
lualatex -jobname=Adhikram_Maitra_Resume_Masked masked.tex
```

## 📝 Editing Content

### 1. Personal Information (`_data/personal.json`)
Contains 4 profile variants with different contact info:
```json
[
  { "name": "...", "email": "...", "skills": [...] },  // Index 1 - Main
  { "name": "...", "email": "...", "skills": [...] },  // Index 2 - Jobs
  { "name": "...", "email": "...", "skills": [...] },  // Index 3 - Referrals
  { "name": "...", "email": "...", "skills": [...] }   // Index 4 - Masked
]
```

### 2. Experience (`_data/exp.json`)
```json
[
  {
    "company": "Company Name",
    "company_location": "Location",
    "role": "Your Role",
    "stack": "Stack:- Technologies",
    "time_duration": "Start - End",
    "details": [
      {
        "title": "Project Name",
        "languages": "Stack:- Tech Stack",
        "scale": "Impact/Scale",
        "descriptions": ["Achievement 1", "Achievement 2"]
      }
    ]
  }
]
```

### 3. Products (`_data/proj.json`)
```json
[
  {
    "company": "Product Name",
    "role": "Your Role",
    "time_duration": "Start - End",
    "site": "https://...",           // Optional
    "repository": "https://...",      // Optional
    "details": [
      {
        "title": "Feature/Component",
        "languages": "Stack:- Technologies",
        "scale": "Impact/Scale",
        "descriptions": ["Detail 1", "Detail 2"]
      }
    ]
  }
]
```

### 4. Education (`_data/edu.json`)
```json
[
  {
    "school": "School Name",
    "school_location": "Location",
    "degree": "Degree Details",
    "time_period": "Start - End"
  }
]
```

## 🎨 Technical Skills Categories

The system now supports 7 skill categories:
1. **Languages** - Programming languages
2. **Backend & Frameworks** - Server-side technologies
3. **Cloud & DevOps** - Cloud platforms and deployment
4. **Databases & Data Engineering** - Data storage and processing
5. **AI & Machine Learning** - AI/ML technologies
6. **Analytics & Monitoring** - Analytics and observability
7. **Software Engineering** - Core CS principles

## 🔧 Customization

### Adding a New Resume Variant
1. Add new profile data to `_data/personal.json`
2. Create new `.tex` file (copy from `resume.tex`)
3. Update the index in `\directlua{printHeading(..., INDEX)}`
4. Add to `build_all.sh`

### Modifying Layout
- **PDF Layout**: Edit custom commands in `.tex` files
- **Website Layout**: Edit HTML templates (`*.html`)
- **Data Structure**: Modify Lua parser (`_lua/parser.lua`)

## 🌍 Deployment

### GitHub Pages (Website)
1. Push to `main` branch
2. Enable GitHub Pages in repository settings
3. Site will be live at `https://username.github.io/`

### Resume PDFs
1. Build PDFs locally using `./build_all.sh`
2. Commit generated PDFs to repository
3. They'll be accessible via the website download links

## 💡 Why This Approach?

✅ **Single Source of Truth**: Update JSON once, everything regenerates  
✅ **Version Control**: All content is in Git  
✅ **Automated**: No manual PDF editing  
✅ **Flexible**: Easy to create new variants  
✅ **Professional**: Consistent formatting  
✅ **Portable**: Website + downloadable PDFs

## 📚 Tech Stack

- **PDF Generation**: LuaTeX, LaTeX, Lua
- **Website**: Jekyll, Ruby, Bulma CSS, Font Awesome
- **Data**: JSON
- **Version Control**: Git, GitHub Pages

## 🤝 Contributing

Feel free to fork and customize for your own use!

## 📄 License

MIT License - See LICENSE file

---

Made with ❤️ using JSON, LuaTeX, and Jekyll
