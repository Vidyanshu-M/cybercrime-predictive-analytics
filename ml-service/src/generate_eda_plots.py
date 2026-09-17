"""Generate and save EDA visual plots for inspection."""

import os
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for headless saving
import matplotlib.pyplot as plt

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "raw"
FIG_DIR = BASE_DIR / "reports" / "figures"
os.makedirs(FIG_DIR, exist_ok=True)

atms = pd.read_csv(DATA_DIR / "atms.csv")
complaints = pd.read_csv(DATA_DIR / "complaints.csv")
transactions = pd.read_csv(DATA_DIR / "transactions.csv")

transactions["transaction_time"] = pd.to_datetime(transactions["transaction_time"])
complaints["reported_at"] = pd.to_datetime(complaints["reported_at"])
transactions["hour"] = transactions["transaction_time"].dt.hour
complaints["hour"] = complaints["reported_at"].dt.hour
withdrawals = transactions[transactions["transaction_type"] == "WITHDRAWAL"]

# 1. Hourly Temporal Activity Plot
plt.figure(figsize=(10, 5))
hourly_txns = transactions.groupby("hour").size()
hourly_with = withdrawals.groupby(withdrawals["transaction_time"].dt.hour).size()
hourly_comp = complaints.groupby("hour").size()

plt.plot(hourly_txns.index, hourly_txns.values, marker="o", label="Total Transactions", color="#1f77b4", linewidth=2)
plt.plot(hourly_with.index, hourly_with.values, marker="s", label="Withdrawals", color="#2ca02c", linewidth=2)
plt.plot(hourly_comp.index, hourly_comp.values, marker="^", label="Complaints", color="#d62728", linewidth=2)
plt.title("Diurnal Rhythms: Hourly Activity (00:00 - 23:00)", fontsize=13, pad=12)
plt.xlabel("Hour of Day", fontsize=11)
plt.ylabel("Event Count", fontsize=11)
plt.xticks(range(0, 24))
plt.grid(True, linestyle="--", alpha=0.5)
plt.legend(frameon=True)
plt.tight_layout()
p1 = FIG_DIR / "hourly_activity.png"
plt.savefig(p1, dpi=150)
plt.close()
print(f"Saved: {p1}")

# 2. Spatial Scatter Plot (ATMs vs Complaints)
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 6))
ax1.scatter(atms["longitude"], atms["latitude"], s=16, color="#2b5c8f", alpha=0.7)
ax1.set_title("500 ATM Locations (UP Districts)", fontsize=12)
ax1.set_xlabel("Longitude")
ax1.set_ylabel("Latitude")
ax1.grid(True, linestyle="--", alpha=0.4)

ax2.scatter(complaints["longitude"], complaints["latitude"], s=6, color="#c93b2b", alpha=0.3)
ax2.set_title("10,000 Crime Complaints (Spatial Density)", fontsize=12)
ax2.set_xlabel("Longitude")
ax2.set_ylabel("Latitude")
ax2.grid(True, linestyle="--", alpha=0.4)
plt.tight_layout()
p2 = FIG_DIR / "spatial_distribution.png"
plt.savefig(p2, dpi=150)
plt.close()
print(f"Saved: {p2}")

# 3. Transaction Type & Crime Category Breakdown
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
type_counts = transactions["transaction_type"].value_counts()
ax1.bar(type_counts.index, type_counts.values, color="#3b82f6", edgecolor="black")
ax1.set_title("Transaction Types (30,000 Events)", fontsize=12)
ax1.set_ylabel("Count")
ax1.tick_params(axis="x", rotation=25)
ax1.grid(axis="y", linestyle="--", alpha=0.5)

crime_counts = complaints["crime_category"].value_counts()
ax2.barh(crime_counts.index, crime_counts.values, color="#8b5cf6", edgecolor="black")
ax2.set_title("Complaint Crime Categories (10,000 Reports)", fontsize=12)
ax2.set_xlabel("Complaints")
ax2.invert_yaxis()
ax2.grid(axis="x", linestyle="--", alpha=0.5)
plt.tight_layout()
p3 = FIG_DIR / "types_and_categories.png"
plt.savefig(p3, dpi=150)
plt.close()
print(f"Saved: {p3}")

# 4. Normal vs Fraud Amount Comparison
plt.figure(figsize=(9, 4.5))
norm_amounts = withdrawals[withdrawals["risk_label"] == 0]["amount"]
fraud_amounts = withdrawals[withdrawals["risk_label"] == 1]["amount"]

plt.hist(norm_amounts, bins=30, alpha=0.6, label=f"Normal Activity (Mean: INR {norm_amounts.mean():.0f})", color="#10b981", density=True)
plt.hist(fraud_amounts, bins=20, alpha=0.6, label=f"Fraud Bursts (Mean: INR {fraud_amounts.mean():.0f})", color="#ef4444", density=True)
plt.title("Withdrawal Amount Contrast: Normal vs. Fraud Spikes", fontsize=13, pad=12)
plt.xlabel("Amount (INR)", fontsize=11)
plt.ylabel("Density", fontsize=11)
plt.grid(True, linestyle="--", alpha=0.5)
plt.legend(frameon=True)
plt.tight_layout()
p4 = FIG_DIR / "amount_contrast.png"
plt.savefig(p4, dpi=150)
plt.close()
print(f"Saved: {p4}")

print("All EDA visual plots rendered and saved successfully.")
