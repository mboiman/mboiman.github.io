+++
title = "PDF-Export Demo"
outputs = ["Reveal"]
[reveal_hugo]
theme = "moon"
margin = 0.2
+++

# PDF-Export Demo

Eine Demonstration der PDF-Export-Funktionalität

---

## PDF-Export-Funktion

- Klicken Sie auf den "PDF herunterladen" Button links unten
- Der Browser öffnet automatisch den Druckdialog
- Wählen Sie "Als PDF speichern"

---

## Wichtige Tipps

- Aktivieren Sie "Hintergrundgrafiken" in den Druckeinstellungen
- Deaktivieren Sie "Kopf- und Fußzeilen"
- Wählen Sie Querformat für beste Ergebnisse

---

## Beispiel-Inhalt

- Texte werden korrekt formatiert
- Bilder werden mit optimaler Größe angezeigt
- Listen werden sauber dargestellt
- Seitenzahlen werden automatisch hinzugefügt

---

## Wie es funktioniert

```javascript
// PDF-Export-Erkennung
var isPrintPDF = window.location.search.match(/print-pdf/gi);

if (isPrintPDF) {
  // Lade spezielle PDF-Stylesheets
  // Optimiere die Darstellung
  // Füge Seitenzahlen hinzu
}
```

---

## Formatierungsbeispiele

**Fetter Text** wird unterstützt

_Kursiver Text_ wird unterstützt

`Code-Beispiele` werden unterstützt

> Zitate werden unterstützt

---

## Bildbeispiel

![Beispielbild](https://picsum.photos/800/400)

---

## Tabellen-Beispiel

| Name    | Alter | Stadt   |
| ------- | ----- | ------- |
| Max     | 28    | Berlin  |
| Lisa    | 24    | Hamburg |
| Michael | 32    | München |

---

## Probieren Sie es aus!

1. Klicken Sie auf den "PDF herunterladen" Button
2. Wählen Sie "Als PDF speichern"
3. Aktivieren Sie "Hintergrundgrafiken"
4. Speichern Sie die Datei
5. Öffnen Sie das PDF

---

# Vielen Dank!

Perfekte Präsentationen auch als PDF
