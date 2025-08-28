# Requirements Specification

<!--
**Document Version:** 1.0
**Date:** 26.08.2025
**Author:** Requirements Engineer
**Method:** SOPHIST Requirements Engineering -->

## 1. Einführung und Kontext

### 1.1 Zweck des Dokuments

Dieses Dokument spezifiziert die Anforderungen für eine digitale Wertungstabelle für das Kartenspiel "Rage" nach deutschen Spielregeln.

### 1.2 Produktvision

**Das System** soll Spielleitern ermöglichen, Rage-Spielstände effizient und fehlerfrei zu verwalten, indem es die Punkteberechnung automatisiert und eine übersichtliche Darstellung der Ergebnisse bietet.

### 1.3 Stakeholder

- **Primärer Akteur:** Spielleiter (Person, die die Punkteeingabe durchführt)
- **Sekundäre Akteure:** Rage-Spieler (Personen, deren Punkte verwaltet werden)

### 1.4 Spielregeln (Fachliche Grundlage)

- Jeder Spieler erhält 1 Punkt pro gewonnenen Stich
- Bei exakter Gebotserfüllung: +10 Bonuspunkte
- Bei Gebotsverfehllung: -5 Strafpunkte
- 3 Bonuskarten à +5 Punkte pro Runde verfügbar
- 3 Strafkarten à -5 Punkte pro Runde verfügbar

## 2. Funktionale Anforderungen

### 2.1 Spielerverwaltung

**FA-01:** Das System **muss** die Möglichkeit bieten, neue Spieler hinzuzufügen.

- **Akzeptanzkriterium:** Ein Spieler wird durch Eingabe eines Namens (1-20 Zeichen) hinzugefügt.

**FA-02:** Das System **muss** die Möglichkeit bieten, Spieler aus dem aktuellen Spiel zu entfernen.

- **Akzeptanzkriterium:** Ein Spieler kann jederzeit aus dem Spiel entfernt werden.

**FA-03:** Das System **muss** zwischen 2 und 8 Spieler pro Spiel unterstützen.

- **Akzeptanzkriterium:**
  - Bei Unterschreitung von 2 Spielern wird eine Fehlermeldung angezeigt.
  - Bei Überschreitung von 8 Spielern wird eine Warnung angezeigt.

**FA-04:** Das System **muss** Spielernamen editierbar machen.

- **Akzeptanzkriterium:** Ein Spielername kann jederzeit geändert werden.

**FA-18:** Das System **muss** ein nachträgliches Ändern der Spielerreihenfolge ermöglichen.

- **Akzeptanzkriterium:** Die Spielerreihenfolge kann jederzeit geändert werden.

### 2.2 Rundenverwaltung

**FA-05:** Das System **muss** eine neue Spielrunde initialisieren können.

- **Akzeptanzkriterium:** Eine neue Runde wird mit der Rundennummer (fortlaufend) und leeren Eingabefeldern für alle Spieler erstellt.

**FA-06:** Das System **muss** für jeden Spieler die Eingabe seines Gebots ermöglichen.

- **Akzeptanzkriterium:** Das Gebot ist eine ganze Zahl zwischen 0 und der Anzahl in der aktuellen Runde ausgeteilter Karten.

**FA-07:** Das System **muss** für jeden Spieler die Eingabe der tatsächlich gewonnenen Stiche ermöglichen.

- **Akzeptanzkriterium:** Die Stichanzahl ist eine ganze Zahl zwischen 0 und der Anzahl in der aktuellen Runde ausgeteilter Karten.

**FA-08:** Das System **muss** für jeden Spieler die Eingabe der Bonuskartenpunkte ermöglichen.

- **Akzeptanzkriterium:** Bonuskartenpunkte sind ganze Zahlen zwischen -15 und +15.

**FA-09:** Das System **muss** die Rundenpunkte nach folgendem Algorithmus berechnen:

```
Rundenpunkte = Stiche + Gebotsbonus + Bonuskartenpunkte

wobei Gebotsbonus = {
  +10, falls Stiche = Gebot
  -5,  falls Stiche ≠ Gebot
}
```

- **Akzeptanzkriterium:** Die Berechnung erfolgt automatisch bei vollständiger Eingabe der Daten pro Spieler.

**FA-10:** Das System **muss** die Gesamtpunktzahl jedes Spielers aktualisieren.

- **Akzeptanzkriterium:** Gesamtpunktzahl = Summe aller Rundenpunkte des Spielers.

### 2.3 Datenvalidierung

**FA-11a:** Das System **muss** sicherstellen, dass das eigegebene Gebot plausibel ist.

- **Akzeptanzkriterium:** Eingabe über Auswahl aus einer Liste mit Ganzzahlen zwischen 0 und der in der aktuellen Runde ausgeteilten Kartenanzahl.

**FA-11b:** Das System **muss** sicherstellen, dass die Anzahl gewonnener Stiche plausibel ist.

- **Akzeptanzkriterium:** siehe _#FA-11a_.

**FA-12:** Das System **muss** sicherstellen, dass Summe der Bonuskartenpunkte plausibel ist.

- **Akzeptanzkriterium:** Eingabe über Auswahl aus einer Liste mit Ganzzahlen im Bereich [-15, +15] in 5-Punkte-Inkrementen.

**FA-13:** Das System **muss** vor Beginn einer neuen Runde warnen, wenn noch nicht die Daten aller Spieler vollständig sind.

- **Akzeptanzkriterium:** Der "Nächste Runde"-Button ist rot gefärbt und zeigt Warnmeldung an, falls noch nicht alle Pflichtfelder ausgefüllt wurden.

### 2.4 Anzeige und Auswertung

**FA-14:** Das System **muss** die aktuellen Gesamtpunktstände aller Spieler anzeigen.

- **Akzeptanzkriterium:** Gesamtpunktestand ist nach jeder Runde automatisch aktualisiert.

**FA-15:** Das System **muss** eine Historie aller Runden anzeigen können.

- **Akzeptanzkriterium:** Tabellarische Darstellung mit Runde, Spieler, Gebot, Stiche, Bonuspunkte, Rundenpunkte.

**FA-16:** Das System **muss** die aktuelle Rundennummer prominent anzeigen.

- **Akzeptanzkriterium:** Rundennummer ist jederzeit im Header sichtbar.

<!--
**FA-17:** Das System **muss** Punkteänderungen nach Rundenabschluss hervorheben.

- **Akzeptanzkriterium:** Neue Rundenpunkte werden 3 Sekunden farblich hervorgehoben.
-->

## 3. Qualitätsanforderungen

### 3.1 Benutzbarkeit

**QA-02:** Das System **muss** Eingaben mit maximal 6 (Regelfall 4) Klicks pro Spieler und Runde ermöglichen.

- **Messkriterium:** Pfad von Rundenbeginn bis -abschluss erfordert ≤ 6 × Spieleranzahl.

**QA-03:** Das System **soll** auf Smartphones gut bedienbar sein.

- **Messkriterium:** Nutzen der vom jeweiligen OS bereitgestellten nativen Eingabemethoden (z.B. über "select" Elemente) und angepassten Layouts.

### 3.2 Zuverlässigkeit

**QA-04:** Das System **muss** Berechnungen fehlerfrei durchführen.

- **Messkriterium:** 100% korrekte Ergebnisse bei Testfällen mit bekannten Sollwerten.

**QA-05:** Das System **muss** bei ungültigen Eingaben stabil bleiben.

- **Messkriterium:** Keine Systemfehler oder Datenverlust bei beliebigen Eingaben.

**QA-06:** Das System **soll** eingegebene Daten während der Spielsitzung nicht verlieren.

- **Messkriterium:** Daten bleiben bei Seitenwechsel, Seiten-Reload oder kurzeitiger Inaktivität erhalten.

<!--
## 4. Datenmodell

### 4.1 Spieler-Entität

- **ID:** Eindeutige Kennzeichnung (UUID)
- **Name:** Spielername (String, 1-20 Zeichen)
- **Gesamtpunkte:** Aktuelle Punktsumme (Integer)
- **Aktiv:** Status im aktuellen Spiel (Boolean)

### 4.2 Runden-Entität

- **Rundennummer:** Fortlaufende Nummer (Integer)
- **Status:** offen/abgeschlossen (Enumeration)
- **Zeitstempel:** Rundenabschluss (DateTime)

### 4.3 Rundenergebnis-Entität (Relation)

- **Spieler-ID:** Referenz auf Spieler
- **Runden-ID:** Referenz auf Runde
- **Gebot:** Gebot des Spielers (Integer, 0-20)
- **Stiche:** Gewonnene Stiche (Integer, 0-20)
- **Bonuspunkte:** Punkte aus Bonuskarten (Integer, -15 bis +15)
- **Rundenpunkte:** Berechnete Punkte der Runde (Integer)
-->

## 5. Benutzeroberfläche

### 5.1 Hauptansicht-Anforderungen

**UI-01:** Die Hauptansicht **muss** folgende Bereiche enthalten:

- Spielerübersicht mit aktuellen Punktständen
- Eingabebereich für aktuelle Runde
- Aktionsbereich mit Hauptfunktionen

**UI-03:** Der Eingabebereich **muss** je Spieler drei Eingabefelder (Gebot, Stiche, Bonus) enthalten.

**UI-04:** Alle Eingabefelder **müssen** klar beschriftet und visuell gruppiert sein.

### 5.2 Interaktions-Anforderungen

**UI-05:** Das System **muss** bei unvollständigen Eingaben den Benutzer führen.

- **Akzeptanzkriterium:** Fehlende Felder werden farblich markiert mit Hinweistext.

**UI-06:** Das System **muss** vor kritischen Aktionen (z.B. Spieler entfernen) nachfragen.

- **Akzeptanzkriterium:** Modaler Dialog mit "Ja/Nein"-Abfrage und Erklärung der Konsequenzen.

**UI-07:** Das System **soll** Tastaturnavigation unterstützen.

- **Akzeptanzkriterium:** Tab-Reihenfolge folgt logischem Eingabefluss.

## 6. Technische Rahmenbedingungen

### 6.1 Plattform-Anforderungen

**TA-01:** Das System **muss** als Webanwendung implementiert werden.

- **Begründung:** Plattformunabhängigkeit, einfache Bereitstellung.

**TA-02:** Das System **soll** ohne Internetverbindung funktionieren.

- **Begründung:** Es gibt keinen guten Grund, warum man nach dem Laden durchgehend eine Internetverbindung brauchen müsste.

**TA-03:** Das System **muss** auf Desktop-Browsern (Chrome 139+, Firefox 142+) laufen.

**TA-04:** Das System **soll** auf Mobile-Browsern (Chrome Android, Safari iOS) laufen.

### 6.2 Datenhaltung

**TA-05:** Das System **muss** Daten clientseitig speichern.

- **Implementierung:** Browser-lokaler Speicher (localStorage/sessionStorage).

## 8. Ausblick und Erweiterungen

Die folgenden Funktionen sind **nicht Teil** der initialen Umsetzung, aber als zukünftige Erweiterungen denkbar:

**ETA-06:** Das System **soll** Datenexport ermöglichen:

- **Implementierung:** JSON-Download des Spielstands.

**ETA-07:** Das System **soll** Audruck des Spielstands ermöglichen:

- **Implementierung:** PDF-Generierung und -Download des Spielstands.

**EFA-03:** Regelwerk-Varianten (andere Länder-Versionen)

**EFA-04:** Modus mit benutzerdefinierbaren Runden

- Beliebige Anzahl Runden
- Benutzerdefinierte Anzahl an Karten pro Runde
  - ggf. zufällige Anzahl Karten pro Runde
