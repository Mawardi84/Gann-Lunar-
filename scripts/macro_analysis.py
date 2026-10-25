#!/usr/bin/env python3
"""
QMAE Macroeconomic Data Analysis Script (Pure Python Standard Library)
Author: Gann-Lunar Architect Engine
Description: Loads fundamental macro events, handles null/unreleased actual values,
and computes statistical comparisons (Nowcast vs Actual vs Consensus).
"""

import json
import math

# Sample dataset mirroring INITIAL_MACRO_EVENTS in Gann-Lunar Architect
MACRO_EVENTS_JSON = [
    {
        "event_id": "cpi-2026-11",
        "event_type": "CPI",
        "indicator_name": "Core Consumer Price Index (YoY - Oktober)",
        "reporting_period": "Oktober 2026",
        "actual_value": None,  # Unreleased / Pending (Strictly protected)
        "consensus_value": 2.5,
        "previous_value": 2.6,
        "nowcast_value": 2.48,
        "nowcast_source": "Federal Reserve Bank of Cleveland",
        "release_time_utc": "2026-11-12T13:30:00Z"
    },
    {
        "event_id": "cpi-2026-10",
        "event_type": "CPI",
        "indicator_name": "Core Consumer Price Index (YoY - September)",
        "reporting_period": "September 2026",
        "actual_value": 2.6,  # Verified actual release
        "consensus_value": 2.6,
        "previous_value": 2.5,
        "nowcast_value": 2.48,
        "nowcast_source": "Federal Reserve Bank of Cleveland",
        "release_time_utc": "2026-10-14T12:30:00Z"
    },
    {
        "event_id": "cpi-2026-03",
        "event_type": "CPI",
        "indicator_name": "Core Consumer Price Index (YoY - Februari)",
        "reporting_period": "Februari 2026",
        "actual_value": 2.5,
        "consensus_value": 2.5,
        "previous_value": 2.5,
        "nowcast_value": 2.51,
        "nowcast_source": "Federal Reserve Bank of Cleveland",
        "release_time_utc": "2026-03-11T12:30:00Z"
    },
    {
        "event_id": "ppi-2026-10",
        "event_type": "PPI",
        "indicator_name": "Core Producer Price Index (MoM)",
        "reporting_period": "September 2026",
        "actual_value": 0.1,
        "consensus_value": 0.2,
        "previous_value": 0.2,
        "nowcast_value": None,  # Non-CPI has no nowcast
        "release_time_utc": "2026-10-15T12:30:00Z"
    }
]

def clean_and_analyze_data(events):
    print("=" * 60)
    print(" QMAE MACRO DATA CLEANING & STATISTICAL ANALYSIS (Pure Python)")
    print("=" * 60)
    
    total_events = len(events)
    verified_actuals = sum(1 for e in events if e.get('actual_value') is not None)
    pending_actuals = sum(1 for e in events if e.get('actual_value') is None)
    active_nowcasts = sum(1 for e in events if e.get('nowcast_value') is not None)
    
    print(f"\n[Data Integrity & Null Handling]")
    print(f" - Total Event Records Loaded        : {total_events}")
    print(f" - Verified Actual Releases          : {verified_actuals}")
    print(f" - Pending/Unreleased Actuals (Null) : {pending_actuals} (Strictly Protected)")
    print(f" - Active Nowcast Estimates (CPI)    : {active_nowcasts}")
    
    # Statistical comparison for CPI events with verified actuals and nowcasts
    cpi_pairs = [
        e for e in events 
        if e.get('event_type') == 'CPI' 
        and e.get('actual_value') is not None 
        and e.get('nowcast_value') is not None
    ]
    
    print(f"\n[Statistical Error Metrics (Nowcast vs Verified Actual)]")
    if cpi_pairs:
        errors = [abs(e['nowcast_value'] - e['actual_value']) for e in cpi_pairs]
        mae = sum(errors) / len(errors)
        print(f" - Analyzed Pairs (Count)            : {len(cpi_pairs)}")
        print(f" - Mean Absolute Error (MAE)         : {mae:.4f}% points")
        for idx, e in enumerate(cpi_pairs, 1):
            gap = e['nowcast_value'] - e['consensus_value']
            print(f"   {idx}. {e['reporting_period']}: Nowcast={e['nowcast_value']}%, Actual={e['actual_value']}%, Consensus={e['consensus_value']}%, Gap={gap:+.2f}%")
    else:
        print(" - No verified actual vs nowcast pairs found.")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    clean_and_analyze_data(MACRO_EVENTS_JSON)
