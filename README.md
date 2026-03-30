# Propane Tank Card

A custom Lovelace card for Home Assistant that displays a visual propane tank gauge with configurable color thresholds and a tap-to-expand history chart.

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

## Features

- Visual tank gauge with fill animation
- Configurable color thresholds (e.g., red/yellow/green based on level)
- Tap to expand an inline history chart with selectable time ranges (24h to 30d)
- Min/Avg/Max/Current stats display
- Full visual editor — no YAML needed
- Works with any sensor reporting 0–100 (propane, water, battery, etc.)

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Click the three dots in the top right corner and select **Custom repositories**
3. Add this repository URL and select **Dashboard** as the category
4. Click **Install**
5. Restart Home Assistant

### Manual

1. Download `propane-tank-card.js` from the [latest release](../../releases/latest)
2. Copy it to `config/www/propane-tank-card.js`
3. Add the resource in your Lovelace configuration:

```yaml
resources:
  - url: /local/propane-tank-card.js
    type: module
```

## Configuration

This card has a full visual editor. Just add the card from the UI and configure it there.

### YAML Options

| Option         | Type    | Default        | Description                              |
| -------------- | ------- | -------------- | ---------------------------------------- |
| `entity`       | string  | **Required**   | Entity ID of a sensor reporting 0–100    |
| `title`        | string  | `Propane Tank` | Card title                               |
| `show_title`   | boolean | `true`         | Show or hide the card title              |
| `history_hours`| number  | `168`          | Default time range for the history chart |
| `thresholds`   | list    | See below      | Color threshold configuration            |

### Default Thresholds

```yaml
thresholds:
  - level: 20
    color: "#d9534f"
    label: Low
  - level: 40
    color: "#f0ad4e"
    label: Mid
  - level: 100
    color: "#6ab42d"
    label: Good
```

### Example YAML

```yaml
type: custom:propane-tank-card
entity: sensor.propane_tank_level
title: Propane Tank
show_title: true
history_hours: 168
thresholds:
  - level: 20
    color: "#d9534f"
    label: Low
  - level: 40
    color: "#f0ad4e"
    label: Mid
  - level: 100
    color: "#6ab42d"
    label: Good
```
