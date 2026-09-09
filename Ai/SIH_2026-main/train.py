import json, random, zipfile
from pathlib import Path
import numpy as np
import torch
from torch import nn
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms

SEED = 42
random.seed(SEED); np.random.seed(SEED); torch.manual_seed(SEED)
ROOT = Path(__file__).parents[2] / "dataset"
ZIP_PATH = ROOT / "waste_images.zip"
EXTRACTED = ROOT / "balanced_waste_images"
MODEL_DIR = Path(__file__).parent / "model"; MODEL_DIR.mkdir(exist_ok=True)
IMG_SIZE = 128
BATCH = 64
EPOCHS = 12

if not EXTRACTED.exists():
    print("Extracting image dataset...")
    with zipfile.ZipFile(ZIP_PATH) as z:
        z.extractall(ROOT)

train_tf = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ColorJitter(brightness=.15, contrast=.15),
    transforms.ToTensor(),
])
eval_tf = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
])

full = datasets.ImageFolder(EXTRACTED, transform=train_tf)
classes = full.classes
n = len(full)
n_train = int(.70*n); n_val = int(.15*n); n_test = n-n_train-n_val
g = torch.Generator().manual_seed(SEED)
train_ds, val_ds, test_ds = random_split(full, [n_train,n_val,n_test], generator=g)

# Validation/test need deterministic transforms.
val_ds.dataset.transform = eval_tf
test_ds.dataset.transform = eval_tf

train_loader = DataLoader(train_ds, batch_size=BATCH, shuffle=True, num_workers=0)
val_loader = DataLoader(val_ds, batch_size=BATCH, shuffle=False, num_workers=0)
test_loader = DataLoader(test_ds, batch_size=BATCH, shuffle=False, num_workers=0)

class SmallCNN(nn.Module):
    def __init__(self, k):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3,32,3,padding=1), nn.BatchNorm2d(32), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(32,64,3,padding=1), nn.BatchNorm2d(64), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(64,128,3,padding=1), nn.BatchNorm2d(128), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(128,256,3,padding=1), nn.BatchNorm2d(256), nn.ReLU(), nn.AdaptiveAvgPool2d(1)
        )
        self.head = nn.Sequential(nn.Flatten(), nn.Dropout(.3), nn.Linear(256,k))
    def forward(self,x): return self.head(self.features(x))

device = "cuda" if torch.cuda.is_available() else "cpu"
model = SmallCNN(len(classes)).to(device)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)

def evaluate(loader):
    model.eval(); correct=total=0
    with torch.no_grad():
        for x,y in loader:
            x,y=x.to(device),y.to(device)
            pred=model(x).argmax(1)
            correct += (pred==y).sum().item(); total += y.numel()
    return correct/total

best=0
for epoch in range(1,EPOCHS+1):
    model.train()
    for x,y in train_loader:
        x,y=x.to(device),y.to(device)
        optimizer.zero_grad()
        loss=criterion(model(x),y)
        loss.backward(); optimizer.step()
    va=evaluate(val_loader)
    print(f"epoch {epoch:02d} | val_acc={va:.4f}")
    if va>best:
        best=va
        torch.save({"state_dict":model.state_dict(),
                    "classes":classes,"img_size":IMG_SIZE}, MODEL_DIR/"ewaste_classifier.pt")

test_acc=evaluate(test_loader)
json.dump({"classes":classes,"train_images":n_train,"val_images":n_val,
           "test_images":n_test,"best_val_accuracy":best,
           "test_accuracy":test_acc,"device":device},
          open(MODEL_DIR/"metrics.json","w"), indent=2)
print("Saved model/ewaste_classifier.pt")
print("Test accuracy:", test_acc)
