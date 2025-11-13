# Computer Vision Data Processing Pipeline

This folder contains a complete data processing pipeline for bike part detection and classification. The pipeline consists of three main notebooks that explore, preprocess, and split the dataset.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Notebooks Guide](#notebooks-guide)
- [Usage](#usage)


## 🎯 Overview

This pipeline processes bike part annotations for a computer vision task. The dataset contains images of bicycles with annotated parts, each part having one of four states:
- **0 (intact)**: Part is present and undamaged
- **1 (damaged)**: Part is present but damaged
- **2 (absent)**: Part is missing
- **3 (occluded)**: Part is occluded/not visible

The pipeline consists of three sequential steps:
1. **Data Exploration** (`data_explore.ipynb`) - Analyze dataset statistics and visualize annotations
2. **Data Preprocessing** (`data_preprocess.ipynb`) - Clean and filter annotations based on quality metrics
3. **Data Splitting** (`data_split.ipynb`) - Split dataset into train/validation sets using stratified sampling

## 📦 Prerequisites

- Python 3.7 or higher
- pip (Python package installer)
- Jupyter Notebook or JupyterLab

## 🚀 Setup Instructions

### 1. Create a Virtual Environment

#### Windows (PowerShell)
```powershell
python -m venv venv
```

#### Windows (Command Prompt)
```cmd
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

Once the virtual environment is activated, install all required packages:

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the `notebooks` folder to configure paths and parameters:

#### Windows (PowerShell)
```powershell
New-Item -Path .env -ItemType File
```

#### Linux/Mac
```bash
touch .env
```

Add the following content to the `.env` file (adjust paths according to your setup):

```env
# Data Exploration Notebook
METADATA_PATH=../raw_data/train_annotations.json
TRAIN_PATH=../raw_data/train

# Data Preprocessing Notebook
DATASET_DIR=../raw_data/train
ANNOTATION_PATH=../raw_data/train_annotations.json
OUTPUT_DIR=../processed_data/train
TRUST_THRESHOLD=0.5

# Data Splitting Notebook
DATASET_CLEANED=../processed_data/train
ANNOTATION_CLEANED=../processed_data/train/annotations_cleaned.json
OUTPUT_DIR=../processed_data
TRAIN_JSON=../processed_data/train_split.json
VAL_JSON=../processed_data/val_split.json
TRAIN_CLEANED=../processed_data/train
VAL_CLEANED=../processed_data/val
```


### 5. Verify Installation

Verify that the packages are installed correctly:

```bash
pip list
```

You should see all packages from `requirements.txt` listed.

### 6. Deactivate Virtual Environment (when done)

When you're finished working, deactivate the virtual environment:

```bash
deactivate
```

## 📓 Notebooks Guide

### 1. Data Exploration (`data_explore.ipynb`)

**Purpose:** Analyze and visualize the dataset to understand its characteristics.

**What it does:**
- Loads annotation data from JSON file
- Computes comprehensive statistics:
  - Total number of images
  - Distribution of object states (intact, damaged, absent, occluded)
  - Part-state distribution across all bike parts
  - Trust score distribution
  - Bounding box size analysis
  - Most frequently absent/damaged parts
- Creates visualizations:
  - Overall state distribution bar chart
  - Trust score histogram
  - Top missing parts chart
  - Bounding box area distribution
  - Part-state heatmap
  - Sample image visualizations with bounding boxes

**Key Features:**
- Color-coded bounding boxes:
  - 🟢 Green: Intact
  - 🟠 Orange: Damaged
  - 🔴 Red: Absent
  - ⚫ Gray: Occluded
- Saves visualization outputs to `../outputs/` directory

**Run this notebook first** to understand your dataset before preprocessing.

### 2. Data Preprocessing (`data_preprocess.ipynb`)

**Purpose:** Clean and filter the dataset to remove low-quality annotations.

**What it does:**
- Loads raw annotations from JSON file
- Filters annotations based on:
  - **Trust threshold**: Removes parts with trust scores below threshold (default: 0.5)
  - **Valid bounding boxes**: Ensures bounding boxes are within image bounds and have positive dimensions
- Removes images with no valid parts after filtering
- Copies valid images to output directory
- Saves cleaned annotations to `annotations_cleaned.json`

**Key Parameters:**
- `TRUST_THRESHOLD`: Minimum trust score for a part to be included (default: 0.5)

**Output:**
- Cleaned images in `OUTPUT_DIR`
- `annotations_cleaned.json` with filtered annotations

**Run this notebook after** data exploration to clean your dataset.

### 3. Data Splitting (`data_split.ipynb`)

**Purpose:** Split the cleaned dataset into training and validation sets using stratified sampling.

**What it does:**
- Loads cleaned annotations
- Creates multi-label feature matrix (one label per part-state combination)
- Uses `MultilabelStratifiedShuffleSplit` to ensure:
  - Balanced distribution of part states across train/val splits
  - Stratified sampling maintains class proportions
- Splits data into train (80%) and validation (20%) sets by default
- Copies images to respective train/val folders
- Generates distribution analysis:
  - Overall class distribution comparison
  - Per-part class distribution comparison
- Saves split JSON files: `train_split.json` and `val_split.json`

**Key Features:**
- Maintains class balance across splits
- Visualizes distribution differences between train/val sets
- Handles missing images gracefully

**Run this notebook last** to prepare your final dataset for model training.


## 💻 Usage

### Running the Complete Pipeline

1. **Start with Data Exploration:**
   ```bash
   jupyter notebook data_explore.ipynb
   ```
   - Review statistics and visualizations
   - Understand dataset characteristics

2. **Proceed to Data Preprocessing:**
   ```bash
   jupyter notebook data_preprocess.ipynb
   ```
   - Clean annotations based on trust threshold
   - Verify cleaned dataset quality

3. **Finish with Data Splitting:**
   ```bash
   jupyter notebook data_split.ipynb
   ```
   - Create train/validation splits
   - Verify distribution balance

### Running Individual Notebooks

You can also run notebooks individually using JupyterLab:

```bash
jupyter lab
```

Then open the desired notebook from the file browser.


## 📚 Requirements

The project requires the following packages (see `requirements.txt`):

- **pandas** (>=1.5.0) - Data manipulation and analysis
- **numpy** (>=1.24.0) - Numerical computing
- **notebook** (>=6.5.0) - Jupyter notebook interface
- **ipykernel** (>=6.25.0) - Jupyter kernel support
- **matplotlib** (>=3.7.0) - Plotting and visualization
- **seaborn** (>=0.12.2) - Statistical data visualization
- **opencv-python** (>=4.8.0) - Computer vision and image processing
- **Pillow** (>=10.0.0) - Image processing library
- **python-dotenv** (>=1.0.0) - Environment variable management
- **tqdm** (>=4.66.0) - Progress bars
- **iterstrat** (>=0.1.7) - Iterative stratification for multi-label data

## 📝 Notes

- Always run notebooks in order: explore → preprocess → split
- The trust threshold in preprocessing affects data quality - adjust based on your needs
- Stratified splitting ensures balanced class distribution, which is crucial for model training
- Visualization outputs are saved to `../outputs/` directory
- All paths in `.env` should use forward slashes, even on Windows


