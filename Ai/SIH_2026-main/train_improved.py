import json
import random
from pathlib import Path

import numpy as np
import torch
from torch import nn
from torch.utils.data import DataLoader, Subset
from torchvision import datasets, transforms, models

from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix,
)

import matplotlib.pyplot as plt


# ============================================================
# SETTINGS
# ============================================================

SEED = 42

IMG_SIZE = 224
BATCH_SIZE = 32

# First train the new classification layer
HEAD_EPOCHS = 5

# Then fine-tune the last MobileNet layers
FINE_TUNE_EPOCHS = 10

NUM_WORKERS = 0       # Safer for Windows
PATIENCE = 3

PROJECT_ROOT = Path(__file__).parents[2]
AI_ROOT = Path(__file__).parent
DATASET_DIR = PROJECT_ROOT / "dataset" / "balanced_waste_images"

MODEL_DIR = AI_ROOT / "model"
REPORT_DIR = AI_ROOT / "reports"

MODEL_DIR.mkdir(exist_ok=True)
REPORT_DIR.mkdir(exist_ok=True)


# ============================================================
# REPRODUCIBILITY
# ============================================================

random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)

if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)


# ============================================================
# CHECK DATASET
# ============================================================

if not DATASET_DIR.exists():
    raise FileNotFoundError(
        f"Dataset not found:\n{DATASET_DIR}\n\n"
        "Make sure data\\balanced_waste_images exists."
    )

print("=" * 60)
print("E-WASTE AI TRAINING")
print("=" * 60)

print("\nDataset:")
print(DATASET_DIR)


# ============================================================
# IMAGE TRANSFORMS
# ============================================================

# Training images get augmentation.
train_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),

    transforms.RandomHorizontalFlip(p=0.5),

    transforms.RandomRotation(
        degrees=10
    ),

    transforms.RandomResizedCrop(
        IMG_SIZE,
        scale=(0.80, 1.0),
        ratio=(0.90, 1.10)
    ),

    transforms.ColorJitter(
        brightness=0.15,
        contrast=0.15,
        saturation=0.10
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# Validation and test images should NOT be randomly modified.
eval_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ============================================================
# LOAD DATASET
# ============================================================

base_dataset = datasets.ImageFolder(
    DATASET_DIR
)

classes = base_dataset.classes

targets = np.array(
    base_dataset.targets
)

num_classes = len(classes)

print("\nClasses:")
for i, name in enumerate(classes):
    print(f"{i}: {name}")

print("\nNumber of classes:", num_classes)
print("Total images:", len(base_dataset))


# ============================================================
# SHOW CLASS DISTRIBUTION
# ============================================================

print("\nClass distribution:")

for class_id, class_name in enumerate(classes):

    count = np.sum(
        targets == class_id
    )

    print(
        f"{class_name:25s} : {count}"
    )


# ============================================================
# STRATIFIED TRAIN / VALIDATION / TEST SPLIT
# ============================================================

rng = np.random.default_rng(SEED)

train_indices = []
val_indices = []
test_indices = []

for class_id in range(num_classes):

    indices = np.where(
        targets == class_id
    )[0]

    rng.shuffle(indices)

    n = len(indices)

    train_end = int(
        n * 0.70
    )

    val_end = int(
        n * 0.85
    )

    train_indices.extend(
        indices[:train_end]
    )

    val_indices.extend(
        indices[train_end:val_end]
    )

    test_indices.extend(
        indices[val_end:]
    )


rng.shuffle(train_indices)
rng.shuffle(val_indices)
rng.shuffle(test_indices)


print("\nDataset split:")
print("Training   :", len(train_indices))
print("Validation :", len(val_indices))
print("Testing    :", len(test_indices))


# ============================================================
# CREATE DATASETS
# ============================================================

train_dataset_full = datasets.ImageFolder(
    DATASET_DIR,
    transform=train_transform
)

eval_dataset_full = datasets.ImageFolder(
    DATASET_DIR,
    transform=eval_transform
)


train_dataset = Subset(
    train_dataset_full,
    train_indices
)

val_dataset = Subset(
    eval_dataset_full,
    val_indices
)

test_dataset = Subset(
    eval_dataset_full,
    test_indices
)


# ============================================================
# DATA LOADERS
# ============================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=NUM_WORKERS,
    pin_memory=torch.cuda.is_available()
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=NUM_WORKERS,
    pin_memory=torch.cuda.is_available()
)

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=NUM_WORKERS,
    pin_memory=torch.cuda.is_available()
)


# ============================================================
# DEVICE
# ============================================================

device = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)

print("\nTraining device:", device)


if device.type == "cuda":
    print(
        "GPU:",
        torch.cuda.get_device_name(0)
    )
else:
    print(
        "No NVIDIA GPU detected."
    )
    print(
        "Training will run on CPU."
    )


# ============================================================
# CLASS WEIGHTS
# ============================================================

# Helps if some categories have fewer images.
train_targets = targets[
    train_indices
]

class_counts = np.bincount(
    train_targets,
    minlength=num_classes
)

class_weights = (
    len(train_targets)
    /
    (
        num_classes
        * class_counts
    )
)

class_weights = torch.tensor(
    class_weights,
    dtype=torch.float32
).to(device)

print("\nClass weights:")
print(class_weights)


# ============================================================
# LOAD PRETRAINED MOBILENETV3
# ============================================================

print("\nLoading pretrained MobileNetV3-Small...")

try:

    weights = (
        models.MobileNet_V3_Small_Weights.DEFAULT
    )

    model = models.mobilenet_v3_small(
        weights=weights
    )

except Exception as error:

    print("\nCould not download pretrained weights.")

    print(
        "Make sure you have an internet connection."
    )

    print("\nError:")
    print(error)

    raise


# ============================================================
# CHANGE FINAL CLASSIFIER
# ============================================================

input_features = (
    model.classifier[-1].in_features
)

model.classifier[-1] = nn.Linear(
    input_features,
    num_classes
)


# ============================================================
# STAGE 1 — FREEZE BACKBONE
# ============================================================

for parameter in model.features.parameters():

    parameter.requires_grad = False


model = model.to(device)


criterion = nn.CrossEntropyLoss(
    weight=class_weights,
    label_smoothing=0.05
)


optimizer = torch.optim.AdamW(
    model.classifier.parameters(),
    lr=0.001,
    weight_decay=0.0001
)


# ============================================================
# EVALUATION FUNCTION
# ============================================================

def evaluate(loader):

    model.eval()

    true_labels = []
    predicted_labels = []

    with torch.no_grad():

        for images, labels in loader:

            images = images.to(device)

            outputs = model(images)

            predictions = (
                outputs
                .argmax(dim=1)
                .cpu()
                .numpy()
            )

            predicted_labels.extend(
                predictions
            )

            true_labels.extend(
                labels.numpy()
            )

    accuracy = accuracy_score(
        true_labels,
        predicted_labels
    )

    return (
        accuracy,
        np.array(true_labels),
        np.array(predicted_labels)
    )


# ============================================================
# SAVE MODEL
# ============================================================

best_val_accuracy = -1


def save_model():

    torch.save(

        {
            "architecture":
                "mobilenet_v3_small",

            "state_dict":
                model.state_dict(),

            "classes":
                classes,

            "img_size":
                IMG_SIZE
        },

        MODEL_DIR /
        "ewaste_classifier.pt"
    )


# ============================================================
# STAGE 1 TRAINING
# ============================================================

print("\n")
print("=" * 60)
print("STAGE 1 — TRAINING CLASSIFIER")
print("=" * 60)


for epoch in range(
    1,
    HEAD_EPOCHS + 1
):

    model.train()

    total_loss = 0

    for images, labels in train_loader:

        images = images.to(device)

        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(
            outputs,
            labels
        )

        loss.backward()

        optimizer.step()

        total_loss += (
            loss.item()
            * images.size(0)
        )


    average_loss = (
        total_loss
        /
        len(train_dataset)
    )


    val_accuracy, _, _ = evaluate(
        val_loader
    )


    print(
        f"Epoch {epoch:02d}/{HEAD_EPOCHS} | "
        f"Loss: {average_loss:.4f} | "
        f"Validation Accuracy: "
        f"{val_accuracy:.4f}"
    )


    if val_accuracy > best_val_accuracy:

        best_val_accuracy = val_accuracy

        save_model()

        print(
            "  ✓ Best model saved"
        )


# ============================================================
# STAGE 2 — FINE TUNING
# ============================================================

print("\n")
print("=" * 60)
print("STAGE 2 — FINE TUNING")
print("=" * 60)


# Freeze everything first
for parameter in model.features.parameters():

    parameter.requires_grad = False


# Unfreeze last few feature blocks
for parameter in model.features[-3:].parameters():

    parameter.requires_grad = True


optimizer = torch.optim.AdamW(

    filter(
        lambda p:
        p.requires_grad,

        model.parameters()
    ),

    lr=0.00001,

    weight_decay=0.0001
)


bad_epochs = 0


for epoch in range(
    1,
    FINE_TUNE_EPOCHS + 1
):

    model.train()

    total_loss = 0

    for images, labels in train_loader:

        images = images.to(device)

        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(
            outputs,
            labels
        )

        loss.backward()

        optimizer.step()

        total_loss += (
            loss.item()
            * images.size(0)
        )


    average_loss = (
        total_loss
        /
        len(train_dataset)
    )


    val_accuracy, _, _ = evaluate(
        val_loader
    )


    print(
        f"Fine Epoch {epoch:02d}/{FINE_TUNE_EPOCHS} | "
        f"Loss: {average_loss:.4f} | "
        f"Validation Accuracy: "
        f"{val_accuracy:.4f}"
    )


    if val_accuracy > best_val_accuracy:

        best_val_accuracy = val_accuracy

        bad_epochs = 0

        save_model()

        print(
            "  ✓ Best model saved"
        )

    else:

        bad_epochs += 1

        if bad_epochs >= PATIENCE:

            print(
                "\nEarly stopping."
            )

            break


# ============================================================
# LOAD BEST MODEL
# ============================================================

print("\nLoading best model...")

checkpoint = torch.load(

    MODEL_DIR /
    "ewaste_classifier.pt",

    map_location=device
)

model.load_state_dict(
    checkpoint["state_dict"]
)


# ============================================================
# FINAL TEST
# ============================================================

test_accuracy, y_true, y_pred = evaluate(
    test_loader
)


precision, recall, f1, _ = (
    precision_recall_fscore_support(

        y_true,

        y_pred,

        average="weighted",

        zero_division=0
    )
)


classification_report_text = (
    classification_report(

        y_true,

        y_pred,

        target_names=classes,

        zero_division=0
    )
)


# ============================================================
# FINAL RESULTS
# ============================================================

print("\n")
print("=" * 60)
print("FINAL TEST RESULTS")
print("=" * 60)

print(
    f"Best Validation Accuracy : "
    f"{best_val_accuracy:.4f}"
)

print(
    f"Test Accuracy            : "
    f"{test_accuracy:.4f}"
)

print(
    f"Weighted Precision       : "
    f"{precision:.4f}"
)

print(
    f"Weighted Recall          : "
    f"{recall:.4f}"
)

print(
    f"Weighted F1              : "
    f"{f1:.4f}"
)

print("=" * 60)


print("\nClassification Report:")
print(
    classification_report_text
)


# ============================================================
# SAVE METRICS
# ============================================================

metrics = {

    "architecture":
        "MobileNetV3-Small",

    "classes":
        classes,

    "total_images":
        len(base_dataset),

    "train_images":
        len(train_dataset),

    "validation_images":
        len(val_dataset),

    "test_images":
        len(test_dataset),

    "best_validation_accuracy":
        float(best_val_accuracy),

    "test_accuracy":
        float(test_accuracy),

    "weighted_precision":
        float(precision),

    "weighted_recall":
        float(recall),

    "weighted_f1":
        float(f1),

    "device":
        str(device)
}


with open(

    MODEL_DIR /
    "metrics.json",

    "w",

    encoding="utf-8"

) as file:

    json.dump(
        metrics,
        file,
        indent=4
    )


# ============================================================
# SAVE CLASSIFICATION REPORT
# ============================================================

with open(

    REPORT_DIR /
    "classification_report.txt",

    "w",

    encoding="utf-8"

) as file:

    file.write(
        classification_report_text
    )


# ============================================================
# CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(
    y_true,
    y_pred
)


plt.figure(
    figsize=(12, 10)
)

plt.imshow(
    cm,
    interpolation="nearest"
)

plt.title(
    "E-Waste AI Confusion Matrix"
)

plt.colorbar()

ticks = np.arange(
    num_classes
)

plt.xticks(
    ticks,
    classes,
    rotation=90
)

plt.yticks(
    ticks,
    classes
)

plt.xlabel(
    "Predicted Class"
)

plt.ylabel(
    "Actual Class"
)

plt.tight_layout()

plt.savefig(

    REPORT_DIR /
    "confusion_matrix.png",

    dpi=180
)

plt.close()


# ============================================================
# DONE
# ============================================================

print("\n")
print("=" * 60)
print("TRAINING COMPLETE")
print("=" * 60)

print(
    "\nModel:"
)

print(
    "model/ewaste_classifier.pt"
)

print(
    "\nMetrics:"
)

print(
    "model/metrics.json"
)

print(
    "\nClassification report:"
)

print(
    "reports/classification_report.txt"
)

print(
    "\nConfusion matrix:"
)

print(
    "reports/confusion_matrix.png"
)

print("\nYou can now test the model with predict.py.")