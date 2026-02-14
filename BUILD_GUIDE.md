# Resume Builder Guide

## 🚀 Quick Start

### Using the Python CLI Tool (Recommended)

The new `build_resume.py` provides an easy-to-use interface for building your resumes.

#### Interactive Mode
```bash
python3 build_resume.py
```
This will show you a menu where you can select which profile to build.

#### Command Line Mode
```bash
# Build a specific profile
python3 build_resume.py 1    # Main Resume
python3 build_resume.py 2    # Jobs Resume
python3 build_resume.py 3    # Referrals Resume
python3 build_resume.py 4    # Masked Resume

# Build all profiles at once
python3 build_resume.py 0

# Show help
python3 build_resume.py --help
```

### Using the Old Bash Script
```bash
./build_all.sh
```

## 📋 Resume Profiles

| Profile | Index | Output File | Description |
|---------|-------|-------------|-------------|
| **Main Resume** | 1 | `Adhikram_Maitra_Resume.pdf` | Standard resume for general applications |
| **Jobs Resume** | 2 | `Adhikram_Maitra_Jobs_Resume.pdf` | Resume optimized for job applications |
| **Referrals Resume** | 3 | `Adhikram_Maitra_Referrals_Resume.pdf` | Resume for referral requests |
| **Masked Resume** | 4 | `Adhikram_Maitra_Resume_Masked.pdf` | Resume with masked personal information |

## 🎨 Bold Formatting in JSON

To make metrics and important points stand out, use `\\textbf{}` in your JSON files:

### Examples:

**Percentages:**
```json
"Optimized performance by \\textbf{60\\%}"
```

**Large Numbers:**
```json
"Processing \\textbf{3 Billion} rows in \\textbf{30 minutes}"
```

**Multipliers:**
```json
"Increased engagement by \\textbf{10x}"
```

**Scale Metrics:**
```json
"Fetching \\textbf{50k records per second}"
```

**Revenue/Growth:**
```json
"Scaling from \\textbf{0 to 20K+ monthly revenue}"
```

## 📁 File Structure

```
.
├── build_resume.py          # New Python CLI tool
├── build_all.sh             # Old bash script
├── resume.tex               # Main resume template (uses profile 1)
├── jobs.tex                 # Jobs resume template (uses profile 2)
├── refs.tex                 # Referrals resume template (uses profile 3)
├── masked.tex               # Masked resume template (uses profile 4)
├── main.tex                 # Generic template
├── _data/
│   ├── personal.json        # Personal info (4 profiles)
│   ├── exp.json             # Experience data
│   ├── proj.json            # Projects data
│   └── edu.json             # Education data
└── _lua/
    └── parser.lua           # Lua script for parsing JSON
```

## 🔧 How It Works

1. **Data Source**: All resume content is stored in JSON files in `_data/`
2. **Templates**: Each `.tex` file is a LaTeX template that references a specific profile index
3. **Lua Parser**: The `parser.lua` script reads JSON and generates LaTeX content
4. **LuaLaTeX**: Compiles the `.tex` files into professional PDFs
5. **Profiles**: Different profiles use different contact info from `personal.json` (indexed 1-4)

## ✨ What's New

### Bold Formatting Added
All important metrics are now bolded in the JSON files:
- ✅ Percentages (60%, 50%, 15%, 80%)
- ✅ Large numbers (3 Billion, 200 Million, 50k, 2k, 10k, 20K+)
- ✅ Multipliers (10x)
- ✅ Time metrics (30 minutes, 5 minute)
- ✅ Key achievements and scale metrics

### New Python CLI Tool
- 🎨 Colorful, user-friendly interface
- 🚀 Build specific profiles or all at once
- 🧹 Automatic cleanup of auxiliary files
- 📊 Progress indicators and success messages
- 💡 Interactive mode for easy selection

## 🛠️ Requirements

- **LuaLaTeX**: Required for PDF generation
  ```bash
  # macOS
  brew install --cask mactex
  
  # Ubuntu/Debian
  sudo apt-get install texlive-luatex
  ```

- **Python 3**: For the CLI tool (usually pre-installed on macOS/Linux)

## 📝 Editing Your Resume

1. **Update Content**: Edit the JSON files in `_data/`
   - `exp.json` - Work experience
   - `proj.json` - Projects/products
   - `edu.json` - Education
   - `personal.json` - Contact info and skills

2. **Bold Important Metrics**: Use `\\textbf{your text}` for emphasis

3. **Build PDFs**: Run `python3 build_resume.py 0`

4. **Check Output**: Review the generated PDF files

## 🎯 Tips

- Use bold formatting sparingly for maximum impact
- Focus on quantifiable achievements (numbers, percentages, scale)
- Keep descriptions concise and action-oriented
- Test your changes by building a single profile first
- All profiles share the same experience/projects data, only contact info differs

## 🐛 Troubleshooting

**Error: lualatex not found**
- Install LuaLaTeX (see Requirements section)

**PDF not updating**
- Delete old PDF files and rebuild
- Check for LaTeX syntax errors in JSON files

**Bold text not showing**
- Make sure to use `\\textbf{}` (double backslash in JSON)
- Verify JSON syntax is valid

## 📞 Support

For issues or questions, check the main README.md or review the LaTeX logs in the build output.

