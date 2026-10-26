# MeatGuard Model Weights Directory

Place your pre-trained PyTorch or ONNX models here:
- `meat_freshness_model.onnx`
- `meat_freshness_model.pt`

When present, `MeatFreshnessAnalyzer` will automatically detect and load them. If absent, the system seamlessly falls back to the built-in Intelligent Heuristic Mock Engine.
