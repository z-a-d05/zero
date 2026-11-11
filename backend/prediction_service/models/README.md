# Model Files Directory

Place trained XGBoost model files here.

## Expected Files

- `t2dm_model.json` — XGBoost model for Type 2 Diabetes Mellitus
- `t1dm_model.json` — XGBoost model for Type 1 Diabetes Mellitus
- `gdm_model.json`  — XGBoost model for Gestational Diabetes Mellitus
- `mody_model.json` — XGBoost model for Maturity-Onset Diabetes of the Young

## Training

Train models using the standard XGBoost API and save with:

```python
model.save_model("t2dm_model.json")
```

## Fallback

If model files are not present, the predictor automatically falls back to a
medically-grounded heuristic simulation so the API remains fully functional
for development and testing.
