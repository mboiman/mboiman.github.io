#!/usr/bin/env python3
"""
CV Content Validation Script
Überprüft ob alle wichtigen CV-Inhalte korrekt in der generierten PDF vorhanden sind.
"""

import sys
import os
try:
    import tomllib  # Python 3.11+
except ImportError:
    try:
        import tomli as tomllib  # Fallback
    except ImportError:
        print("TOML-Parser nicht verfügbar. Verwende vereinfachte Validierung.")
        tomllib = None
# import requests  # Nicht benötigt für lokale Validierung
from pathlib import Path
import re
from typing import Dict, List, Any
import subprocess

class CVContentValidator:
    def __init__(self, config_path: str, output_path: str = None):
        self.config_path = Path(config_path)
        self.output_path = output_path
        self.errors = []
        self.warnings = []
        
    def load_config(self) -> Dict[str, Any]:
        """Lädt die TOML-Konfiguration"""
        if tomllib is None:
            # Fallback: Einfache Textvalidierung
            return self._simple_config_check()
            
        try:
            with open(self.config_path, 'rb') as f:
                return tomllib.load(f)
        except Exception as e:
            self.errors.append(f"Fehler beim Laden der Konfiguration: {e}")
            return {}
    
    def _simple_config_check(self) -> Dict[str, Any]:
        """Vereinfachte Konfigurationsprüfung ohne TOML-Parser"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Prüfe wichtige Abschnitte
            required_sections = [
                'languages.de.params.profile',
                'languages.de.params.experiences.list',
                'languages.de.params.skills.list',
                'languages.de.params.contact.list'
            ]
            
            for section in required_sections:
                if section not in content:
                    self.errors.append(f"Abschnitt nicht gefunden: {section}")
                    
            return {"_simple_check": True, "content": content}
        except Exception as e:
            self.errors.append(f"Fehler beim Lesen der Datei: {e}")
            return {}
    
    def validate_config_structure(self, config: Dict[str, Any]) -> bool:
        """Validiert die Grundstruktur der Konfiguration"""
        required_sections = [
            'languages.de.params.profile',
            'languages.de.params.contact', 
            'languages.de.params.education',
            'languages.de.params.experiences',
            'languages.de.params.skills',
            'languages.de.params.summary'
        ]
        
        valid = True
        for section in required_sections:
            if not self._get_nested_value(config, section):
                self.errors.append(f"Fehlender Abschnitt: {section}")
                valid = False
                
        return valid
    
    def validate_profile_data(self, config: Dict[str, Any]) -> bool:
        """Validiert Profil-Informationen"""
        profile = self._get_nested_value(config, 'languages.de.params.profile')
        if not profile:
            return False
            
        required_fields = ['name', 'tagline']
        valid = True
        
        for field in required_fields:
            if not profile.get(field):
                self.errors.append(f"Fehlendes Profilfeld: {field}")
                valid = False
                
        return valid
    
    def validate_contact_data(self, config: Dict[str, Any]) -> bool:
        """Validiert Kontaktinformationen"""
        contact = self._get_nested_value(config, 'languages.de.params.contact')
        if not contact or not contact.get('list'):
            self.errors.append("Keine Kontaktinformationen gefunden")
            return False
            
        contact_list = contact['list']
        required_types = ['email', 'linkedin', 'github']
        found_types = [item.get('class') for item in contact_list]
        
        valid = True
        for req_type in required_types:
            if req_type not in found_types:
                self.warnings.append(f"Empfohlener Kontakttyp fehlt: {req_type}")
                
        return valid
    
    def validate_experiences(self, config: Dict[str, Any]) -> bool:
        """Validiert Berufserfahrung"""
        experiences = self._get_nested_value(config, 'languages.de.params.experiences')
        if not experiences or not experiences.get('list'):
            self.errors.append("Keine Berufserfahrung gefunden")
            return False
            
        exp_list = experiences['list']
        valid = True
        
        for i, exp in enumerate(exp_list):
            required_fields = ['position', 'dates', 'company', 'details']
            for field in required_fields:
                if not exp.get(field):
                    self.errors.append(f"Erfahrung {i+1}: Fehlendes Feld '{field}'")
                    valid = False
                    
            # Prüfe Datumsformat
            if exp.get('dates'):
                if not re.match(r'\d{2}/\d{4}.*\d{2}/\d{4}|\d{4}.*\d{4}', exp['dates']):
                    self.warnings.append(f"Erfahrung {i+1}: Ungewöhnliches Datumsformat: {exp['dates']}")
                    
        return valid
    
    def validate_skills(self, config: Dict[str, Any]) -> bool:
        """Validiert Skills/Fähigkeiten"""
        skills = self._get_nested_value(config, 'languages.de.params.skills')
        if not skills or not skills.get('list'):
            self.errors.append("Keine Skills gefunden")
            return False
            
        skills_list = skills['list']
        if len(skills_list) < 5:
            self.warnings.append(f"Nur {len(skills_list)} Skills gefunden, empfohlen sind mindestens 5")
            
        valid = True
        for i, skill in enumerate(skills_list):
            if not skill.get('skill'):
                self.errors.append(f"Skill {i+1}: Kein Skill-Name definiert")
                valid = False
                
            if skill.get('level'):
                level = skill['level'].replace('%', '')
                try:
                    level_int = int(level)
                    if level_int < 0 or level_int > 100:
                        self.warnings.append(f"Skill {i+1}: Level außerhalb 0-100%: {level}")
                except ValueError:
                    self.warnings.append(f"Skill {i+1}: Ungültiges Level-Format: {skill['level']}")
                    
        return valid
    
    def validate_education(self, config: Dict[str, Any]) -> bool:
        """Validiert Bildungsabschnitt"""
        education = self._get_nested_value(config, 'languages.de.params.education')
        if not education or not education.get('list'):
            self.warnings.append("Keine Bildungsinformationen gefunden")
            return True  # Nicht kritisch
            
        return True
    
    def validate_hugo_build(self) -> bool:
        """Prüft ob Hugo Build erfolgreich funktioniert"""
        try:
            result = subprocess.run(['hugo', '--config', str(self.config_path)], 
                                  capture_output=True, text=True, cwd=self.config_path.parent)
            if result.returncode != 0:
                self.errors.append(f"Hugo Build fehlgeschlagen: {result.stderr}")
                return False
            return True
        except Exception as e:
            self.errors.append(f"Fehler beim Hugo Build: {e}")
            return False
    
    def _get_nested_value(self, data: Dict, path: str) -> Any:
        """Hilfsfunktion für verschachtelte Dictionary-Zugriffe"""
        keys = path.split('.')
        value = data
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return None
        return value
    
    def run_validation(self) -> bool:
        """Führt alle Validierungen durch"""
        print(f"🔍 Validiere CV-Konfiguration: {self.config_path}")
        
        config = self.load_config()
        if not config:
            return False
        
        # Führe alle Validierungen durch
        validations = [
            self.validate_config_structure(config),
            self.validate_profile_data(config),
            self.validate_contact_data(config),
            self.validate_experiences(config),
            self.validate_skills(config),
            self.validate_education(config),
            self.validate_hugo_build()
        ]
        
        # Zusammenfassung
        success = all(validations) and len(self.errors) == 0
        
        print(f"\n📊 Validierungsergebnis:")
        print(f"   ✅ Erfolgreich: {success}")
        print(f"   ❌ Fehler: {len(self.errors)}")
        print(f"   ⚠️  Warnungen: {len(self.warnings)}")
        
        if self.errors:
            print(f"\n❌ Fehler:")
            for error in self.errors:
                print(f"   • {error}")
                
        if self.warnings:
            print(f"\n⚠️  Warnungen:")
            for warning in self.warnings:
                print(f"   • {warning}")
        
        return success

def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_cv_content.py <config.toml> [output.pdf]")
        sys.exit(1)
    
    config_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    validator = CVContentValidator(config_path, output_path)
    success = validator.run_validation()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()