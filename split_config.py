#!/usr/bin/env python3
"""
Skript zum Aufteilen der mehrsprachigen config.toml in separate Sprachdateien.
Erstellt config.de.toml und config.en.toml aus der Hauptkonfiguration.
"""

import toml
import sys
from pathlib import Path
from typing import Dict, Any

def read_config(file_path: str) -> Dict[Any, Any]:
    """
    Liest die TOML-Konfigurationsdatei ein.
    
    Args:
        file_path: Pfad zur config.toml
        
    Returns:
        Dict mit dem Inhalt der TOML-Datei
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return toml.load(f)
    except Exception as e:
        print(f"Fehler beim Lesen der Konfigurationsdatei: {e}")
        sys.exit(1)

def create_language_config(config: Dict[Any, Any], lang: str) -> Dict[Any, Any]:
    """
    Erstellt eine sprachspezifische Konfiguration.
    
    Args:
        config: Ursprüngliche Konfiguration
        lang: Sprachcode ('de' oder 'en')
        
    Returns:
        Dict mit der sprachspezifischen Konfiguration
    """
    # Basis-Konfiguration kopieren
    lang_config = {
        "baseurl": config.get("baseurl", ""),
        "languageCode": config["languages"][lang]["languageCode"],
        "title": config["languages"][lang]["title"],
        "theme": config.get("theme", ""),
        "disableRSS": config.get("disableRSS", True),
        "disableSitemap": config.get("disableSitemap", True),
        "disable404": config.get("disable404", True),
        "defaultContentLanguage": lang,
        "defaultContentLanguageInSubdir": config.get("defaultContentLanguageInSubdir", True),
    }

    # Parameter aus der Sprachkonfiguration übernehmen
    lang_config["params"] = config["languages"][lang]["params"]

    return lang_config

def write_config(config: Dict[Any, Any], output_file: str) -> None:
    """
    Schreibt die Konfiguration in eine TOML-Datei.
    
    Args:
        config: Zu schreibende Konfiguration
        output_file: Zielpfad für die Datei
    """
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            toml.dump(config, f)
        print(f"Konfiguration erfolgreich in {output_file} geschrieben")
    except Exception as e:
        print(f"Fehler beim Schreiben der Konfigurationsdatei {output_file}: {e}")
        sys.exit(1)

def main():
    """
    Hauptfunktion zum Aufteilen der Konfigurationsdatei.
    """
    # Eingabedatei
    input_file = "config.toml"
    
    # Prüfen ob Eingabedatei existiert
    if not Path(input_file).exists():
        print(f"Fehler: {input_file} nicht gefunden!")
        sys.exit(1)
    
    # Konfiguration einlesen
    config = read_config(input_file)
    
    # Sprachspezifische Konfigurationen erstellen
    de_config = create_language_config(config, "de")
    en_config = create_language_config(config, "en")
    
    # Konfigurationen in separate Dateien schreiben
    write_config(de_config, "config.de.toml")
    write_config(en_config, "config.en.toml")
    
    print("Konfigurationsdateien wurden erfolgreich erstellt!")

if __name__ == "__main__":
    main() 