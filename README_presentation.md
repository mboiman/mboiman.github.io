# Präsentationsgenerator

Dieses Tool ermöglicht die Erstellung hochwertiger PowerPoint-Präsentationen aus strukturierten YAML-Datendateien. Es trennt die Präsentationsinhalte von der Logik zur Erstellung der Folien, was die Wartung und Anpassung erleichtert.

## Vorteile dieses Ansatzes

- **Trennung von Inhalt und Darstellung**: Inhalte sind in einer übersichtlichen YAML-Datei gespeichert
- **Versionierbarkeit**: Änderungen am Inhalt sind leicht nachvollziehbar
- **Konsistentes Design**: Einheitliches Styling für alle Folien
- **Einfache Anpassbarkeit**: Änderungen können zentral vorgenommen werden
- **Automatisierbarkeit**: Updates können automatisch neue Präsentationen generieren

## Systemanforderungen

- Python 3.6 oder höher
- Benötigte Python-Pakete:
  - python-pptx
  - PyYAML

Installation der Abhängigkeiten:

```bash
pip install python-pptx pyyaml
```

## Verwendung

### Grundlegende Verwendung

```bash
python generate_presentation.py
```

Dies liest die Datei `presentation_data.yaml` im aktuellen Verzeichnis und erstellt eine Präsentation auf dem Desktop.

### Erweiterte Verwendung

```bash
python generate_presentation.py -i meine_daten.yaml -o meine_praesentation.pptx
```

Parameter:

- `-i` oder `--input`: Pfad zur YAML-Datendatei (Standard: presentation_data.yaml)
- `-o` oder `--output`: Pfad zur Ausgabedatei (Standard: Desktop/Freelance_Success_Stories_Michael_Boiman_YYYY-MM-DD.pptx)

## Struktur der YAML-Datei

Die YAML-Datei enthält die gesamte Struktur und alle Inhalte der Präsentation:

```yaml
presentation:
  title: "Haupttitel der Präsentation"
  subtitle: "Untertitel"
  settings:
    width: 13.33 # Breite in Inches (16:9 Format)
    height: 7.5 # Höhe in Inches
    font: "SF Pro Display" # Standardschriftart

  slides: # Liste aller Folien
    - id: 1
      type: title # Titelfolie
      title: "Haupttitel"
      subtitle: "Untertitel"

    - id: 2
      type: bullet # Standardfolie mit Aufzählungspunkten
      title: "Folien-Titel"
      bullets:
        - "Erster Aufzählungspunkt (wird hervorgehoben)"
        - "Zweiter Aufzählungspunkt"
        - "Dritter Aufzählungspunkt"
      placeholder: # Optional: Platzhalter für Grafik/Bild
        text: "Diagramm-Titel"
        note: "Beschreibung, was hier eingefügt werden sollte"

    - id: 3
      type: result # Ergebnisfolie mit KPI-Badge
      title: "Ergebnis-Titel"
      bullets:
        - "Hauptaussage zum Ergebnis (wird hervorgehoben)"
        - "Details zum Ergebnis"
      kpi_text: "IMPACT: 50% Zeitersparnis" # Text für das KPI-Badge
      placeholder: # Optional: Platzhalter für Grafik/Bild
        text: "Chart"
        note: "Beschreibung des Charts"

  styles:# Formatierungseinstellungen
    # Hier folgen alle Styling-Einstellungen
```

## Anpassung des Designs

Das Design der Präsentation kann durch Änderung der `styles`-Sektion in der YAML-Datei angepasst werden. Dort können Schriftgrößen, Farben, Abstände und weitere visuelle Eigenschaften definiert werden.

## Erweiterung

Der Code ist modular aufgebaut und kann leicht um neue Folientypen erweitert werden:

1. Einen neuen Folientyp in der YAML-Datei definieren
2. Eine entsprechende `add_X_slide`-Funktion im Python-Code erstellen
3. Den neuen Typ in der `create_presentation`-Funktion berücksichtigen

## Häufige Fragen

### Welche Schriftarten werden unterstützt?

Alle auf dem System installierten Schriftarten können verwendet werden. Falls eine Schriftart nicht verfügbar ist, wird PowerPoint automatisch eine Alternative verwenden.

### Kann ich Bilder einbinden?

Die aktuelle Version arbeitet mit Platzhaltern für Bilder. Für eine vollständige Bildintegration wäre eine Erweiterung des Codes notwendig.

### Wie kann ich die Farbpalette anpassen?

Die Farben können in der `styles`-Sektion der YAML-Datei als Hex-Werte definiert werden.
