# Model Training Guide

This document explains the model training pipeline for bike parts detection and state classification using Faster R-CNN with multi-task learning.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Training Pipeline Steps](#training-pipeline-steps)
- [Model Architecture](#model-architecture)
- [Configuration](#configuration)
- [Monitoring Training](#monitoring-training)
- [Outputs](#outputs)

## 🎯 Overview

The training pipeline implements a **Multi-Task Faster R-CNN** model that simultaneously performs:
1. **Object Detection**: Detects and localizes bike parts (22 different parts)
2. **State Classification**: Classifies the state of each detected part into 4 categories:
   - **0 (intact)**: Part is present and undamaged
   - **1 (damaged)**: Part is present but damaged
   - **2 (absent)**: Part is missing
   - **3 (occluded)**: Part is occluded/not visible

The model is based on Faster R-CNN with ResNet-50 FPN backbone, pre-trained on COCO dataset.

## 📦 Prerequisites

Before running the training notebook, ensure you have:

- Python 3.7+
- PyTorch 1.13+ with CUDA support (recommended)
- All packages from `requirements.txt` installed
- Properly configured `.env` file with dataset paths
- Completed data preprocessing pipeline (exploration → preprocessing → splitting)

## 🚀 Training Pipeline Steps

### Step 1: Import Libraries and Setup

**Cell 0: Imports**
- Imports all necessary libraries:
  - PyTorch and torchvision for deep learning
  - PIL for image processing
  - json, os, pathlib for file handling
  - wandb for experiment tracking
  - numpy, tqdm for utilities

**Cell 1: Load Configuration from Environment**
- Loads environment variables from `.env` file:
  - `TRAIN_JSON`: Path to training annotations JSON
  - `VAL_JSON`: Path to validation annotations JSON
  - `TRAIN_CLEANED`: Directory containing training images
  - `VAL_CLEANED`: Directory containing validation images
  - `OUTPUT_DIR`: Directory for saving outputs (COCO files, models)
- Creates output directory structure
- Defines paths for COCO format files and model checkpoint

**Key Outputs:**
- Paths verified and printed
- Output directory created

### Step 2: Initialize Weights & Biases and Set Random Seeds

**Cell 2: W&B and Reproducibility**
- Initializes Weights & Biases for experiment tracking
- Sets random seeds for reproducibility (seed=42)
  - Python `random`, `numpy`, PyTorch CPU and CUDA
- Configures CUDA deterministic operations
- Checks GPU availability and prints device information

**Key Outputs:**
- Device being used (CPU/GPU)
- GPU name and CUDA version (if available)
- W&B project initialized

### Step 3: Convert Annotations to COCO Format

**Cell 3: COCO Format Conversion**
- Converts custom JSON annotation format to COCO format
- **Function: `convert_to_coco()`**
  - Inputs:
    - `json_path`: Path to annotation JSON file
    - `images_dir`: Directory containing images (for metadata)
    - `save_path`: Output path for COCO JSON
  - Process:
    1. Collects all unique part names from annotations
    2. Creates category mappings (one per part)
    3. Creates state category mappings (intact, damaged, absent, occluded)
    4. For each image:
       - Extracts image metadata (id, filename, height, width)
       - For each part annotation:
         - Extracts bounding box coordinates
         - Maps part name to category ID
         - Includes state classification
         - Calculates bounding box area
  - Outputs COCO-formatted JSON file

**Key Outputs:**
- `train_coco.json`: COCO format training annotations
- `val_coco.json`: COCO format validation annotations
- Statistics: number of images and annotations converted

### Step 4: Create PyTorch Dataset and DataLoader

**Cell 4: Dataset and DataLoader**
- **Class: `BikePartsDataset`**
  - Inherits from `torch.utils.data.Dataset`
  - **`__init__()`**:
    - Loads COCO JSON file
    - Stores image and annotation mappings
    - Creates efficient lookup dictionary (`img_id_to_anns`) for fast annotation retrieval
  - **`__getitem__()`**:
    - Loads image from disk using PIL
    - Retrieves all annotations for the image
    - Converts bounding boxes from (x, y, w, h) to (x1, y1, x2, y2) format
    - Creates target dictionary with:
      - `boxes`: Tensor of bounding box coordinates
      - `labels`: Tensor of part category IDs
      - `states`: Tensor of state classifications
      - `image_id`: Image identifier
    - Handles edge cases (empty annotations)
    - Applies transforms (ToTensor)
  - **`__len__()`**: Returns number of images

- **Collate Function:**
  - Custom collate function to handle variable-length batches
  - Returns tuples of (images, targets)

- **DataLoaders:**
  - Training DataLoader:
    - Batch size: 2
    - Shuffle: True
    - Workers: 2 (parallel data loading)
    - Pin memory: True (if GPU available) for faster GPU transfer
    - Prefetch factor: 2 for optimization
  - Validation DataLoader:
    - Batch size: 2
    - Shuffle: False
    - Same optimization settings

**Key Outputs:**
- Dataset instances for train and validation
- DataLoader instances ready for training
- Batch count information

### Step 5: Define Multi-Task Model Architecture

**Cell 5: Model Architecture**
- **Class: `MultiTaskFasterRCNN`**
  - Inherits from `nn.Module`
  - **Architecture:**
    1. **Base Model**: Faster R-CNN with ResNet-50 FPN backbone
       - Pre-trained weights from COCO ("DEFAULT")
       - Feature Pyramid Network (FPN) for multi-scale feature extraction
    2. **Part Detection Head**: 
       - Modified box predictor for 22 bike parts + background class
       - Uses `FastRCNNPredictor` with input features from ROI head
    3. **State Classification Head**:
       - Separate neural network head for state prediction
       - Architecture: Linear(1024 → 256) → ReLU → Dropout(0.2) → Linear(256 → 4)
       - Uses CrossEntropyLoss for multi-class classification

  - **Forward Pass (Training Mode):**
    1. Calls base Faster R-CNN model to get detection losses
    2. Extracts ROI features from detected regions
    3. Passes ROI features through state classification head
    4. Computes state classification loss
    5. Combines detection and state losses (state loss weighted at 0.5)
    6. Returns total loss and individual loss components

  - **Forward Pass (Evaluation Mode):**
    - Returns standard Faster R-CNN detections

**Key Features:**
- Multi-task learning: simultaneous detection and classification
- Shared feature extraction for efficiency
- Weighted loss combination for balanced learning

### Step 6: Training Loop

**Cell 6: Model Training**
- **Model Initialization:**
  - Loads number of parts from COCO JSON
  - Creates model instance and moves to device (GPU/CPU)
  - Number of states: 4 (intact, damaged, absent, occluded)

- **Optimizer and Scheduler:**
  - **Optimizer**: AdamW
    - Learning rate: 1e-4
    - Weight decay: 1e-4 (L2 regularization)
  - **Scheduler**: ReduceLROnPlateau
    - Reduces learning rate when validation loss plateaus
    - Factor: 0.5 (halves learning rate)
    - Patience: 3 epochs
  - **Mixed Precision Training:**
    - GradScaler for automatic mixed precision (AMP)
    - Faster training with lower memory usage
    - Only enabled if CUDA is available

- **Training Configuration:**
  - Number of epochs: 20
  - Best model tracking based on validation loss

- **Training Loop:**
  For each epoch:
  1. **Training Phase:**
     - Sets model to training mode
     - Iterates through training batches with progress bar
     - For each batch:
       - Moves images and targets to device
       - Forward pass with mixed precision (if GPU available)
       - Computes loss (detection + state classification)
       - Backward pass with gradient scaling
       - Updates model parameters
       - Logs individual loss components to W&B
     - Calculates average training loss

  2. **Validation Phase:**
     - Sets model to evaluation mode
     - Disables gradient computation (`torch.no_grad()`)
     - Iterates through validation batches
     - Computes validation loss
     - No parameter updates

  3. **Post-Epoch Processing:**
     - Updates learning rate scheduler based on validation loss
     - Logs metrics to W&B:
       - Average training loss
       - Average validation loss
       - Learning rate
     - Saves model if validation loss improved (best model checkpoint)

**Key Metrics Logged:**
- `train_loss`: Total training loss per batch
- `train_loss_classifier`: Part classification loss
- `train_loss_box_reg`: Bounding box regression loss
- `train_loss_objectness`: RPN objectness loss
- `train_loss_rpn_box_reg`: RPN box regression loss
- `train_loss_state`: State classification loss
- `avg_train_loss`: Average training loss per epoch
- `avg_val_loss`: Average validation loss per epoch
- `learning_rate`: Current learning rate

**Key Outputs:**
- Best model checkpoint saved to `OUTPUT_DIR/fasterrcnn_multitask_best.pth`
- Training metrics logged to W&B dashboard
- Console output showing epoch progress and loss values

### Step 7: Model Evaluation and Visualization

**Cell 7: Inference and Visualization**
- Loads best saved model checkpoint
- Sets model to evaluation mode
- Runs inference on a sample validation batch
- Visualizes predictions:
  - Shows input image
  - Displays number of detections
  - Shows confidence scores for top predictions

**Key Outputs:**
- Visualization of model predictions
- Detection statistics

## 🏗️ Model Architecture

### Faster R-CNN Components

1. **Backbone (ResNet-50 + FPN)**:
   - Extracts multi-scale features from input images
   - Feature Pyramid Network provides features at multiple resolutions

2. **Region Proposal Network (RPN)**:
   - Generates region proposals (candidate object locations)
   - Classifies regions as object/background
   - Refines proposal bounding boxes

3. **ROI Heads**:
   - **ROI Pooling**: Extracts fixed-size features from proposals
   - **Box Head**: Further processes ROI features
   - **Box Predictor**: 
     - Classifies ROI as one of 22 parts or background
     - Regresses bounding box coordinates

4. **State Classification Head**:
   - Takes ROI features as input
   - Predicts state (intact/damaged/absent/occluded) for each detected part

### Loss Function

**Total Loss = Detection Loss + 0.5 × State Loss**

- **Detection Loss Components:**
  - Classification loss (part categories)
  - Box regression loss (bounding box coordinates)
  - RPN objectness loss
  - RPN box regression loss

- **State Loss:**
  - Cross-entropy loss for state classification
  - Weighted at 0.5 to balance with detection tasks

## ⚙️ Configuration

### Hyperparameters

- **Learning Rate**: 1e-4 (initial), reduced by scheduler
- **Weight Decay**: 1e-4
- **Batch Size**: 2
- **Number of Epochs**: 20
- **Optimizer**: AdamW
- **Scheduler**: ReduceLROnPlateau (factor=0.5, patience=3)
- **Mixed Precision**: Enabled (CUDA only)

### Data Augmentation

Currently minimal (only ToTensor). Can be extended with:
- Random horizontal flipping
- Color jittering
- Random cropping/resizing

## 📊 Monitoring Training

### Weights & Biases Dashboard

The training automatically logs all metrics to W&B. View:
- Loss curves (training and validation)
- Individual loss components
- Learning rate schedule
- Model checkpoints

Access dashboard at: https://wandb.ai

### Key Metrics to Watch

1. **Total Loss**: Should decrease over time
2. **Validation Loss**: Should track training loss (watch for overfitting)
3. **State Loss**: Should decrease (indicates state classification learning)
4. **Learning Rate**: Should reduce when validation plateaus

### Early Stopping Considerations

The notebook saves the best model based on validation loss. You can add early stopping:
- Monitor validation loss
- Stop if no improvement for N epochs
- Restore best model weights

## 📁 Outputs

### Generated Files

1. **`train_coco.json`**: COCO format training annotations
2. **`val_coco.json`**: COCO format validation annotations
3. **`fasterrcnn_multitask_best.pth`**: Best model checkpoint (state dictionary)
   - Contains all model parameters
   - Can be loaded for inference or continued training

### Model Checkpoint Contents

- Model architecture parameters
- Trained weights for:
  - Backbone (ResNet-50 + FPN)
  - RPN heads
  - ROI heads
  - Part classification head
  - State classification head

## 💡 Tips and Best Practices

1. **GPU Memory Management:**
   - Adjust batch size based on GPU memory
   - Use gradient accumulation for larger effective batch sizes
   - Enable mixed precision for memory efficiency

2. **Training Stability:**
   - Monitor loss components individually
   - Adjust loss weights if one task dominates
   - Use learning rate warmup if needed

3. **Data Quality:**
   - Ensure balanced distribution of parts and states
   - Verify annotation quality before training
   - Use stratified splitting (already done in data_split.ipynb)

4. **Hyperparameter Tuning:**
   - Start with default learning rate
   - Adjust based on loss curves
   - Consider different optimizers (SGD with momentum)
   - Experiment with state loss weight

5. **Model Evaluation:**
   - Use validation set for hyperparameter tuning
   - Reserve test set for final evaluation
   - Compute metrics: mAP, precision, recall per part/state


## 📚 Next Steps

After training:
1. Evaluate on test set
2. Compute detailed metrics (mAP, per-class accuracy)
3. Analyze failure cases
4. Fine-tune hyperparameters
5. Consider data augmentation
6. Experiment with different architectures


