WM Tippspiel Fix: Fristen je Spiel

Aenderung:
- Tippfrist ist jetzt fuer jedes Spiel automatisch 30 Minuten vor dem jeweiligen Anpfiff.
- Teilnehmer koennen ihre Tipps bis zur jeweiligen Frist beliebig oft aendern.
- Andere Tipps werden erst nach Ablauf der jeweiligen Frist sichtbar.

Wichtig nach Upload:
1. server.js in GitHub ersetzen.
2. public/app.js nur ersetzen, falls deine aktuelle App-Version aelter ist.
3. Commit Changes.
4. Render Deploy abwarten.
5. App mit Hard Reload neu laden.
6. Im Adminbereich den Button "WM-Spielplan 2026 importieren / Platzhalter überschreiben" einmal klicken.
   Dadurch werden die neuen 30-Minuten-Fristen in Supabase geschrieben.

Hinweis:
Der Import ueberschreibt Spielnamen, Phasen, Anpfiffzeiten und Fristen. Teilnehmer, Tipps und Ergebnisse bleiben erhalten.
