# Explore Folder - Setup Guide

This folder contains data exploration notebooks. Follow the steps below to set up your development environment.

## Steps to Create Virtual Environment and Install Requirements

### 1. Create a Virtual Environment

#### Windows (PowerShell)
```powershell
python -m venv venv
```

#### Linux/Mac
```bash
python3 -m venv venv
```

### 2. Activate the Virtual Environment

#### Windows (PowerShell)
```powershell
.\venv\Scripts\Activate.ps1
```

**Note:** If you encounter an execution policy error in PowerShell, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Windows (Command Prompt)
```cmd
venv\Scripts\activate.bat
```

#### Linux/Mac
```bash
source venv/bin/activate
```

### 3. Install Requirements

Once the virtual environment is activated, install the required packages:

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the `explore` folder to store the metadata path:

#### Windows (PowerShell)
```powershell
New-Item -Path .env -ItemType File
```

#### Linux/Mac
```bash
touch .env
```

Then, add the following content to the `.env` file:

```env
# Metadata path configuration
# Set the path to your annotations JSON file
# Relative path (recommended): goes up one directory from explore folder
METADATA_PATH=../raw_data/train_annotations.json
```

**Important Notes:** 
- **Relative path (recommended)**: Use `../raw_data/train_annotations.json` to go up one directory level from the `explore` folder
- **Absolute path (alternative)**: You can also use an absolute path
  - Windows example: `METADATA_PATH=C:/Users/rimba/Desktop/AIM/cv/raw_data/train_annotations.json`
  - Linux/Mac example: `METADATA_PATH=/path/to/your/train_annotations.json`
- **No .env file**: If you don't create a `.env` file, the notebook will try to use the default path `../raw_data/train_annotations.json` automatically
- Make sure the path points to your actual annotations JSON file
- Use forward slashes (`/`) in paths, even on Windows

### 5. Verify Installation

Verify that the packages are installed correctly:

```bash
pip list
```

### 6. Deactivate Virtual Environment (when done)

When you're finished working, deactivate the virtual environment:

```bash
deactivate
```

## Requirements

The project requires the following packages (see `requirements.txt`):
- pandas (>=1.5.0)
- notebook (>=6.5.0)
- matplotlib (>=3.7.0)
- seaborn (>=0.12.2)
- Pillow (>=10.0.0)
- python-dotenv (>=1.0.0)

## Usage

After setting up the environment and configuring the `.env` file, you can run the Jupyter notebook:

```bash
jupyter notebook data_explore.ipynb
```

Or use JupyterLab:

```bash
jupyter lab data_explore.ipynb
```

The notebook will automatically load the metadata path from the `.env` file using the `METADATA_PATH` variable.

## Troubleshooting

### Python not found
If you get a "python is not recognized" error, try:
- `python3` instead of `python`
- Ensure Python is installed and added to your PATH

### Permission errors
If you encounter permission errors, try:
- Running PowerShell/Terminal as Administrator
- Using `python -m venv venv` instead of `virtualenv venv`

### Package installation issues
If packages fail to install:
- Upgrade pip: `python -m pip install --upgrade pip`
- Check your internet connection
- Verify Python version compatibility (Python 3.7+ recommended)

### .env file issues
If you get a "METADATA_PATH not found" or "File not found" error:
- **The notebook will automatically try default paths** if `.env` is missing or path is wrong
- Ensure the `.env` file exists in the `explore` folder (or the notebook will use defaults)
- Check that `METADATA_PATH` in `.env` uses the correct path format:
  - Recommended: `METADATA_PATH=../raw_data/train_annotations.json` (relative path)
  - Alternative: Use absolute path like `METADATA_PATH=C:/Users/rimba/Desktop/AIM/cv/raw_data/train_annotations.json`
- Verify the path to your annotations JSON file is correct
- Use forward slashes (`/`) in paths, even on Windows
- Ensure the JSON file exists at the specified path
- The notebook will try multiple alternative paths automatically if the specified path doesn't exist

