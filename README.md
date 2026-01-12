# Adhikram/adhikram.github.io

A json based resume webpage. Made to work with `jekyll` based `github-pages`. Same json sources can be used to render a pdf using `lualatex`.

## Running the Jekyll Site

### macOS Setup

1. **Install dependencies:**
   ```bash
   bundle install --path vendor/bundle
   ```

2. **Run the site:**
   ```bash
   bundle exec jekyll serve --baseurl=""
   ```
   
   The site will be available at `http://127.0.0.1:4000/`

### Windows Setup

> On Windows, with latest [MikTex 2.9](https://miktex.org/download), you can compile the pdf by running `lualatex main.tex` in the command line.

## PDF Generation with LaTeX

### macOS LaTeX Installation

For PDF generation, you need `lualatex`. Install LaTeX on macOS:

**Option 1: BasicTeX (Recommended - smaller download)**
```bash
brew install --cask basictex
eval "$(/usr/libexec/path_helper)"
sudo tlmgr update --self
sudo tlmgr install lualatex

```

**Option 2: Full MacTeX (Larger download ~4GB)**
```bash
brew install --cask mactex
eval "$(/usr/libexec/path_helper)"
```

**Option 3: Online (No installation needed)**
You can use the sources here with [Overleaf](https://www.overleaf.com/read/ztqgzvvqspxc#81810b) or ShareLatex. Make sure you use `lualatex` compiler.

### Compiling PDF
Once LaTeX is installed:
```bash
lualatex main.tex
```
