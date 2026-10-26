"""
MeatGuard - High-Speed Deep Learning Training & ONNX Export
Uses vectorized PyTorch operations for instant training and ONNX export.
"""

import os
import sys
import time
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader


# 1. Custom CNN Architecture for Meat Freshness Classification
class MeatFreshnessNet(nn.Module):
    def __init__(self, num_classes=3):
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


# 2. Vectorized Meat Data Generation (Instant in <0.2s)
def create_dataset(n_per_class=300):
    print(f"[Dataset] Generating {n_per_class * 3} vectorized samples...", flush=True)
    mean = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1)
    std = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1)

    n3 = n_per_class // 3
    fresh = torch.zeros(n_per_class, 3, 224, 224)

    # Beef (Deep Red)
    fresh[:n3, 0] = torch.empty(n3, 1, 1).uniform_(0.70, 0.95)
    fresh[:n3, 1] = torch.empty(n3, 1, 1).uniform_(0.15, 0.35)
    fresh[:n3, 2] = torch.empty(n3, 1, 1).uniform_(0.15, 0.35)

    # Pork (Rose Pink)
    fresh[n3:2*n3, 0] = torch.empty(n3, 1, 1).uniform_(0.80, 0.96)
    fresh[n3:2*n3, 1] = torch.empty(n3, 1, 1).uniform_(0.45, 0.65)
    fresh[n3:2*n3, 2] = torch.empty(n3, 1, 1).uniform_(0.45, 0.65)

    # Poultry (Pale Peach)
    rem = n_per_class - 2 * n3
    fresh[2*n3:, 0] = torch.empty(rem, 1, 1).uniform_(0.85, 0.98)
    fresh[2*n3:, 1] = torch.empty(rem, 1, 1).uniform_(0.70, 0.88)
    fresh[2*n3:, 2] = torch.empty(rem, 1, 1).uniform_(0.60, 0.78)

    # Class 1: Aging (Metmyoglobin Brown)
    aging = torch.zeros(n_per_class, 3, 224, 224)
    aging[:, 0] = torch.empty(n_per_class, 1, 1).uniform_(0.42, 0.62)
    aging[:, 1] = torch.empty(n_per_class, 1, 1).uniform_(0.30, 0.46)
    aging[:, 2] = torch.empty(n_per_class, 1, 1).uniform_(0.18, 0.35)

    # Class 2: Spoiled (Greenish / Slate Gray)
    spoiled = torch.zeros(n_per_class, 3, 224, 224)
    spoiled[:, 0] = torch.empty(n_per_class, 1, 1).uniform_(0.22, 0.38)
    spoiled[:, 1] = torch.empty(n_per_class, 1, 1).uniform_(0.40, 0.58)
    spoiled[:, 2] = torch.empty(n_per_class, 1, 1).uniform_(0.28, 0.45)

    # Combine & add noise
    X = torch.cat([fresh, aging, spoiled], dim=0)
    noise = torch.randn_like(X) * 0.03
    X = torch.clamp(X + noise, 0.0, 1.0)
    X = (X - mean) / std

    y = torch.cat([
        torch.zeros(n_per_class, dtype=torch.long),
        torch.ones(n_per_class, dtype=torch.long),
        torch.full((n_per_class,), 2, dtype=torch.long)
    ])

    return X, y


def main():
    print("=" * 60, flush=True)
    print("MeatGuard AI - Fast Model Training & ONNX Export", flush=True)
    print("=" * 60, flush=True)

    X_train, y_train = create_dataset(n_per_class=240)
    X_val, y_val = create_dataset(n_per_class=60)

    train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=32, shuffle=True)
    val_loader = DataLoader(TensorDataset(X_val, y_val), batch_size=32, shuffle=False)

    model = MeatFreshnessNet(num_classes=3)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    print("\nTraining CNN for 5 epochs...", flush=True)
    start_time = time.time()

    for epoch in range(1, 6):
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
        print(f"Epoch [{epoch}/5] Loss: {train_loss:.4f} | Train Acc: {train_acc:.1f}% | Val Acc: {val_acc:.1f}%", flush=True)

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
        opset_version=14,
        do_constant_folding=True,
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
    print(f"ONNX Verification successful! Logits: {out[0][0]}", flush=True)
    print("=" * 60, flush=True)


if __name__ == "__main__":
    main()
