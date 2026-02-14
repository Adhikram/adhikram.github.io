#!/usr/bin/env python3
"""
Resume Builder CLI
Build different resume variants with ease
"""

import subprocess
import sys
import os
from pathlib import Path

# ANSI color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

# Resume profiles configuration
PROFILES = {
    '1': {
        'name': 'Main Resume',
        'tex_file': 'resume.tex',
        'output': 'Adhikram_Maitra_Resume.pdf',
        'index': 1,
        'description': 'Standard resume for general applications'
    },
    '2': {
        'name': 'Jobs Resume',
        'tex_file': 'jobs.tex',
        'output': 'Adhikram_Maitra_Jobs_Resume.pdf',
        'index': 2,
        'description': 'Resume optimized for job applications'
    },
    '3': {
        'name': 'Referrals Resume',
        'tex_file': 'refs.tex',
        'output': 'Adhikram_Maitra_Referrals_Resume.pdf',
        'index': 3,
        'description': 'Resume for referral requests'
    },
    '4': {
        'name': 'Masked Resume',
        'tex_file': 'masked.tex',
        'output': 'Adhikram_Maitra_Resume_Masked.pdf',
        'index': 4,
        'description': 'Resume with masked personal information'
    }
}

def print_banner():
    """Print a nice banner"""
    banner = f"""
{Colors.OKCYAN}{Colors.BOLD}
╔═══════════════════════════════════════════════════════════╗
║           📄 Resume Builder CLI Tool 📄                   ║
║                                                           ║
║  Automated PDF Resume Generation with LuaLaTeX           ║
╚═══════════════════════════════════════════════════════════╝
{Colors.ENDC}
    """
    print(banner)

def print_profiles():
    """Display available resume profiles"""
    print(f"\n{Colors.BOLD}Available Resume Profiles:{Colors.ENDC}\n")
    for key, profile in PROFILES.items():
        print(f"  {Colors.OKGREEN}[{key}]{Colors.ENDC} {Colors.BOLD}{profile['name']}{Colors.ENDC}")
        print(f"      → {profile['description']}")
        print(f"      → Output: {Colors.OKCYAN}{profile['output']}{Colors.ENDC}\n")
    
    print(f"  {Colors.WARNING}[0]{Colors.ENDC} {Colors.BOLD}Build All Profiles{Colors.ENDC}")
    print(f"      → Generates all 4 resume variants\n")

def build_resume(profile_key):
    """Build a specific resume profile"""
    if profile_key not in PROFILES:
        print(f"{Colors.FAIL}Error: Invalid profile key '{profile_key}'{Colors.ENDC}")
        return False
    
    profile = PROFILES[profile_key]
    print(f"\n{Colors.OKBLUE}Building: {profile['name']}...{Colors.ENDC}")
    print(f"  Source: {profile['tex_file']}")
    print(f"  Output: {profile['output']}\n")
    
    try:
        # Run lualatex
        cmd = ['lualatex', '-interaction=nonstopmode', f"-jobname={profile['output'].replace('.pdf', '')}", profile['tex_file']]
        result = subprocess.run(cmd, capture_output=True, text=True)

        # Check if PDF was actually created (more reliable than return code)
        if os.path.exists(profile['output']):
            print(f"{Colors.OKGREEN}✓ Successfully built {profile['output']}{Colors.ENDC}")
            return True
        else:
            print(f"{Colors.FAIL}✗ Failed to build {profile['output']}{Colors.ENDC}")
            print(f"{Colors.WARNING}Error output:{Colors.ENDC}")
            print(result.stderr[-500:] if len(result.stderr) > 500 else result.stderr)
            return False
    except FileNotFoundError:
        print(f"{Colors.FAIL}Error: lualatex not found. Please install LuaLaTeX.{Colors.ENDC}")
        return False
    except Exception as e:
        print(f"{Colors.FAIL}Error: {str(e)}{Colors.ENDC}")
        return False

def build_all():
    """Build all resume profiles"""
    print(f"\n{Colors.BOLD}Building all resume profiles...{Colors.ENDC}\n")
    success_count = 0
    
    for key in sorted(PROFILES.keys()):
        if build_resume(key):
            success_count += 1
        print()  # Add spacing between builds
    
    return success_count

def cleanup():
    """Clean up auxiliary LaTeX files"""
    print(f"\n{Colors.OKBLUE}Cleaning up auxiliary files...{Colors.ENDC}")
    extensions = ['*.aux', '*.log', '*.out', '*.fls', '*.synctex*', '*.upa', '*.upb']
    
    for ext in extensions:
        for file in Path('.').glob(ext):
            try:
                file.unlink()
                print(f"  Removed: {file}")
            except Exception as e:
                print(f"  {Colors.WARNING}Could not remove {file}: {e}{Colors.ENDC}")
    
    print(f"{Colors.OKGREEN}✓ Cleanup complete{Colors.ENDC}")

def interactive_mode():
    """Run in interactive mode"""
    print_banner()
    print_profiles()
    
    while True:
        try:
            choice = input(f"{Colors.BOLD}Select profile to build (0-4, or 'q' to quit): {Colors.ENDC}").strip()
            
            if choice.lower() in ['q', 'quit', 'exit']:
                print(f"\n{Colors.OKCYAN}Goodbye! 👋{Colors.ENDC}\n")
                sys.exit(0)
            
            if choice == '0':
                success_count = build_all()
                cleanup()
                print(f"\n{Colors.OKGREEN}{Colors.BOLD}✓ Built {success_count}/4 resumes successfully!{Colors.ENDC}\n")
            elif choice in PROFILES:
                build_resume(choice)
                cleanup()
            else:
                print(f"{Colors.FAIL}Invalid choice. Please select 0-4 or 'q' to quit.{Colors.ENDC}\n")
                
        except KeyboardInterrupt:
            print(f"\n\n{Colors.OKCYAN}Goodbye! 👋{Colors.ENDC}\n")
            sys.exit(0)

if __name__ == '__main__':
    # Command-line mode
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        
        if arg in ['--help', '-h']:
            print_banner()
            print(f"{Colors.BOLD}Usage:{Colors.ENDC}")
            print(f"  python build_resume.py           # Interactive mode")
            print(f"  python build_resume.py [1-4]     # Build specific profile")
            print(f"  python build_resume.py 0         # Build all profiles")
            print(f"  python build_resume.py --help    # Show this help\n")
            print_profiles()
            sys.exit(0)
        
        if arg == '0':
            print_banner()
            success_count = build_all()
            cleanup()
            print(f"\n{Colors.OKGREEN}{Colors.BOLD}✓ Built {success_count}/4 resumes successfully!{Colors.ENDC}\n")
        elif arg in PROFILES:
            print_banner()
            build_resume(arg)
            cleanup()
        else:
            print(f"{Colors.FAIL}Error: Invalid argument '{arg}'. Use --help for usage.{Colors.ENDC}")
            sys.exit(1)
    else:
        # Interactive mode
        interactive_mode()

