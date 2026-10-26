"""
MeatGuard - Deep Learning Model Training & ONNX Export Script
Incorporates Data Augmentation (torchvision transforms, ColorJitter)
and detects: Fresh, Aging, Frozen_Damaged (Cháy đông / Đá tuyết), Spoiled.
"""

import os
import sys
import time
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
import torchvision.transforms as transforms


# 1. Custom CNN Architecture for 4-Class Meat Evaluation
class MeatFreshnessNet(nn.Module):
    def __init__(self, num_classes=4):
        super(MeatFreshnessNet, self).__init__()
        self.features = nn.Sequential(
            # Block 1: 224x224 -> 56x56
            nn.Conv2d(3, 16, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),

            # Block 2: 56x56 -> 28x28
            nn.Conv2d(16, 32, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),

            # Block 3: 28x28 -> 14x14
            nn.Conv2d(32, 64, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),

            # Block 4: 14x14 -> 1x1
            nn.Conv2d(64, 128, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((1, 1))
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.ReLU(inplace=True),
            nn.Linear(64, num_classes)
        )

    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x


# 2. Data Augmentation Pipeline as requested
# ColorJitter specifically tuned to catch frost/ice crystal reflections and dark freeze burn
augmentation_pipeline = transforms.Compose([
    transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3),
    transforms.RandomHorizontalFlip(p=0.5),
])

mean_tensor = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1)
std_tensor = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1)


# 3. Vectorized Dataset Generator for 4 Classes
# 0: Fresh, 1: Aging, 2: Frozen_Damaged, 3: Spoiled
def create_dataset(n_per_class=240, apply_aug=True):
    print(f"[Dataset] Generating {n_per_class * 4} augmented samples (Fresh, Aging, Frozen_Damaged, Spoiled)...", flush=True)

    n3 = n_per_class // 3

    # --- Class 0: Fresh (Beef, Pork, Poultry) ---
    fresh = torch.zeros(n_per_class, 3, 224, 224)
    fresh[:n3, 0] = torch.empty(n3, 1, 1).uniform_(0.70, 0.95)
    fresh[:n3, 1] = torch.empty(n3, 1, 1).uniform_(0.15, 0.35)
    fresh[:n3, 2] = torch.empty(n3, 1, 1).uniform_(0.15, 0.35)

    fresh[n3:2*n3, 0] = torch.empty(n3, 1, 1).uniform_(0.80, 0.96)
    fresh[n3:2*n3, 1] = torch.empty(n3, 1, 1).uniform_(0.45, 0.65)
    fresh[n3:2*n3, 2] = torch.empty(n3, 1, 1).uniform_(0.45, 0.65)

    # Poultry (Peach-Pink: R > G > B)
    rem = n_per_class - 2 * n3
    fresh[2*n3:, 0] = torch.empty(rem, 1, 1).uniform_(0.85, 0.98)
    fresh[2*n3:, 1] = torch.empty(rem, 1, 1).uniform_(0.62, 0.76)
    fresh[2*n3:, 2] = torch.empty(rem, 1, 1).uniform_(0.48, 0.62)

    # --- Class 1: Aging (Metmyoglobin Brown Oxidation) ---
    aging = torch.zeros(n_per_class, 3, 224, 224)
    aging[:, 0] = torch.empty(n_per_class, 1, 1).uniform_(0.42, 0.62)
    aging[:, 1] = torch.empty(n_per_class, 1, 1).uniform_(0.30, 0.46)
    aging[:, 2] = torch.empty(n_per_class, 1, 1).uniform_(0.18, 0.35)

    # --- Class 2: Frozen_Damaged (Cháy đông / Đá tuyết / Freezer Burn) ---
    # Characterized by cold white/cyan ice glaze or white frost crystals on freeze-burned dry meat
    frozen = torch.zeros(n_per_class, 3, 224, 224)
    half = n_per_class // 2
    # Type A: Thick frost / ice crystals (cold white/bluish glaze: R ≈ G ≈ B > 0.80)
    frozen[:half, 0] = torch.empty(half, 1, 1).uniform_(0.80, 0.96)
    frozen[:half, 1] = torch.empty(half, 1, 1).uniform_(0.82, 0.97)
    frozen[:half, 2] = torch.empty(half, 1, 1).uniform_(0.85, 0.98)
    # Type B: Freeze-burned dark dry patches covered with frost specks
    frozen[half:, 0] = torch.empty(n_per_class - half, 1, 1).uniform_(0.38, 0.55)
    frozen[half:, 1] = torch.empty(n_per_class - half, 1, 1).uniform_(0.28, 0.42)
    frozen[half:, 2] = torch.empty(n_per_class - half, 1, 1).uniform_(0.25, 0.40)
    specks = (torch.rand(n_per_class - half, 1, 224, 224) > 0.60).float()
    frozen[half:] = frozen[half:] * (1 - specks) + torch.empty(n_per_class - half, 3, 224, 224).uniform_(0.85, 0.98) * specks

    # --- Class 3: Spoiled (Greenish / Slate Gray Decomposition) ---
    spoiled = torch.zeros(n_per_class, 3, 224, 224)
    spoiled[:, 0] = torch.empty(n_per_class, 1, 1).uniform_(0.22, 0.38)
    spoiled[:, 1] = torch.empty(n_per_class, 1, 1).uniform_(0.40, 0.58)
    spoiled[:, 2] = torch.empty(n_per_class, 1, 1).uniform_(0.28, 0.45)

    # Combine all classes
    X = torch.cat([fresh, aging, frozen, spoiled], dim=0)

    # Apply Data Augmentation (ColorJitter & Flip)
    if apply_aug:
        # Batch color jitter & flip
        X = augmentation_pipeline(X)

    noise = torch.randn_like(X) * 0.02
    X = torch.clamp(X + noise, 0.0, 1.0)
    # Normalize with ImageNet standard
    X = (X - mean_tensor) / std_tensor

    y = torch.cat([
        torch.zeros(n_per_class, dtype=torch.long),           # 0: fresh
        torch.ones(n_per_class, dtype=torch.long),            # 1: aging
        torch.full((n_per_class,), 2, dtype=torch.long),      # 2: frozen_damaged
        torch.full((n_per_class,), 3, dtype=torch.long)       # 3: spoiled
    ])

    return X, y


def main():
    print("=" * 60, flush=True)
    print("MeatGuard AI - Model Training with Freezer Burn & Frost Detection", flush=True)
    print("Classes: [0: Fresh, 1: Aging, 2: Frozen_Damaged, 3: Spoiled]", flush=True)
    print("=" * 60, flush=True)

    X_train, y_train = create_dataset(n_per_class=250, apply_aug=True)
    X_val, y_val = create_dataset(n_per_class=60, apply_aug=False)

    train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=32, shuffle=True)
    val_loader = DataLoader(TensorDataset(X_val, y_val), batch_size=32, shuffle=False)

    model = MeatFreshnessNet(num_classes=4)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    print("\nTraining CNN for 6 epochs with Data Augmentation...", flush=True)
    start_time = time.time()

    for epoch in range(1, 7):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for inputs, targets in train_loader:
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            _, predicted = outputs.max(1)
            total += targets.size(0)
            correct += predicted.eq(targets).sum().item()

        train_acc = 100.0 * correct / total
        train_loss = running_loss / total

        # Validation
        model.eval()
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for v_in, v_tg in val_loader:
                v_out = model(v_in)
                _, v_pred = v_out.max(1)
                val_total += v_tg.size(0)
                val_correct += v_pred.eq(v_tg).sum().item()

        val_acc = 100.0 * val_correct / val_total
        print(f"Epoch [{epoch}/6] Loss: {train_loss:.4f} | Train Acc: {train_acc:.1f}% | Val Acc: {val_acc:.1f}%", flush=True)

    print(f"Training completed in {time.time() - start_time:.2f}s!", flush=True)

    # Save PyTorch Model
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(models_dir, exist_ok=True)
    pt_file = os.path.join(models_dir, "meat_freshness_model.pt")
    torch.save(model, pt_file)
    print(f"PyTorch Model saved: {pt_file} ({os.path.getsize(pt_file)/1024:.1f} KB)", flush=True)

    # Export to ONNX
    onnx_file = os.path.join(models_dir, "meat_freshness_model.onnx")
    print(f"\nExporting to ONNX: {onnx_file}...", flush=True)
    model.eval()
    dummy_input = torch.randn(1, 3, 224, 224, dtype=torch.float32)

    torch.onnx.export(
        model,
        dummy_input,
        onnx_file,
        export_params=True,
        opset_version=18,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}}
    )

    size_kb = os.path.getsize(onnx_file) / 1024
    print(f"ONNX Model exported successfully! Size: {size_kb:.1f} KB", flush=True)

    # Verify with onnxruntime
    import onnxruntime as ort
    sess = ort.InferenceSession(onnx_file)
    inp_name = sess.get_inputs()[0].name
    out = sess.run(None, {inp_name: dummy_input.numpy()})
    print(f"ONNX Verification successful! Logits: {out[0][0]} (4 Classes)", flush=True)
    print("=" * 60, flush=True)


if __name__ == "__main__":
    main()
