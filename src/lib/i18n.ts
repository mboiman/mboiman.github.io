/**
 * All narrative copy for the presentation (/de/story/, /en/story/) and the
 * classic CV lives here, not in .astro files.
 *
 * The `I18nStrings` interface is the parity gate: adding a field to `de`
 * without adding it to `en` fails `astro build`. That is deliberate. The
 * previous version of this file let the English branch drift silently.
 *
 * COPY RULES (enforced by review, not by the compiler):
 *  - No dashes as punctuation. Neither em nor en nor double-hyphen. Rebuild the
 *    sentence: comma, colon, parenthesis, or two sentences. Hyphens inside a
 *    word and in date ranges are fine.
 *  - No vanity counters. "40+ skills", "20+ repos", "99.97%" and friends are
 *    banned. A counter compresses away everything that was interesting about
 *    the thing it counts. Name the thing instead.
 *  - Every claim on the presentation carries its proof next to it: an open
 *    standard, a licence or release, a callable address, or a named procedure.
 *    Where a claim cannot be published, say so rather than dropping the proof.
 */

type Belief = { text: string; align: string };

/** One system that is actually running, shown in the act that replaced the numbers. */
export interface RunningItem {
  title: string;
  /** One sentence on the mechanism. Not a benefit, not an adjective. */
  mechanism: string;
  /** The proof itself: standard, repo, address. Rendered monospace. */
  proof: string;
  /** Optional link — only when the proof can genuinely be opened by a visitor. */
  proofUrl?: string;
  /** `public` renders a filled marker, `closed` a hollow one plus the reason. */
  state: 'public' | 'closed';
  /** Why it is not public. Required when state is `closed`. */
  stateNote?: string;
}

/** A question a visitor can fire at the live agent, plus what the answer proves. */
export interface ProbeItem {
  question: string;
  explains: string;
}

/**
 * The core act type. Replaces the old "featured project" rendering, which
 * coupled the presentation's layout to `projects.list` and to a vanity
 * `metric` field: a project without a number silently fell back to a raw
 * markdown bullet dump next to a designed one.
 */
export interface DecisionAct {
  id: string;
  category: string;
  stack: string;
  title: string;
  problem: string;
  /** Rejected options first (rendered struck back), chosen option last. */
  rejected: string[];
  chosen: string;
  decision: string;
  /** What the decision cost. A decision with a price cannot read as a success report. */
  price: string;
  /** Never a counter, a percentage or a year. Standard, licence/release, address, or named procedure. */
  proof: string;
  proofLabel: string;
  proofUrl?: string;
  state: 'public' | 'closed';
  stateNote?: string;
  /** Optional closing paragraph, set quieter than the body. */
  coda?: string;
}

/** A rule that runs, plus the event it came out of. */
export interface Gate {
  rule: string;
  mechanism: string;
  origin: string;
}

/** A claim that was withdrawn after checking. */
export interface Correction {
  assumption: string;
  check: string;
  result: string;
}

/** A talk, workshop or engagement in the knowledge-transfer act. */
export interface TransferItem {
  title: string;
  body: string;
}

// UI strings for the floating agent chat widget (AgentWidget.astro).
// Kept here per the "no hardcoded text in .astro" rule; consumed by the
// bundled client script via a data-i18n attribute serialized in the markup.
export interface AgentWidgetStrings {
  launcherLabel: string;   // aria-label / tooltip for the floating button
  launcherText: string;    // visible label next to the floating button
  headerTitle: string;     // panel header title
  headerSubtitle: string;  // small line under the title
  inputPlaceholder: string;
  send: string;            // send button aria-label
  close: string;           // close button aria-label
  greeting: string;        // first agent bubble shown before any exchange
  connecting: string;      // shown while fetching the agent card
  working: string;         // generic "thinking" indicator label
  errorConnect: string;    // could not reach the agent (network/CORS, card never fetched)
  errorSend: string;       // reached the agent but the exchange threw
  errorAgent: string;      // agent reachable but reported a terminal error (no text)
  emptyAnswer: string;     // agent completed with nothing usable
  retry: string;           // retry button label on error bubbles
  maximize: string;        // enlarge-panel button label
  restore: string;         // restore-panel-size button label
  resize: string;          // drag-resize grip tooltip
  // Agent-Card (A2A) view inside the panel
  cardOpen: string;        // header toggle: show the agent card
  cardBack: string;        // header toggle: back to chat
  cardTitle: string;       // eyebrow above the agent name
  cardIntro: string;       // one-line explainer (what the A2A card is)
  cardProtocol: string;    // protocol section heading
  cardEndpoint: string;    // endpoint label
  cardModes: string;       // input/output modes label
  cardSkills: string;      // skills section heading
  cardExamplesHint: string;// hint above clickable examples
  cardStreaming: string;   // capability badge
  cardPush: string;        // capability badge
  cardLoading: string;     // while fetching the card
  cardUnavailable: string; // card fetch failed
  // Privacy disclosure — shown at the point of collection (under the composer)
  privacyNote: string;     // one-line data note
  privacyLink: string;     // link label → /de/datenschutz · /en/privacy
}

export interface I18nStrings {
  pdfDownload: string;
  experienceTheStory: string;
  storyBackToCv: string;
  classicCV: string;
  otherLangLabel: string;
  skipToContent: string;
  availability: string;

  // ── Act 1: the frame ────────────────────────────────────────────────
  storyEyebrow: string;
  storyStatement: string;        // carries markup
  storyStatementNote: string;
  storyRole: string;

  // ── Act 2: portrait and standing ────────────────────────────────────
  storyAffiliation: string;
  storyPortraitText: string[];

  // ── Act 3: what is running (replaces the numbers act) ───────────────
  runningEyebrow: string;
  runningTitle: string;
  /** The typographic moment that inherited the old giant-number slot. */
  runningLeadStruck: string;
  runningLeadLive: string;
  runningLeadNote: string;
  running: RunningItem[];
  runningOutro: string;

  // ── Act 4: ask it yourself ──────────────────────────────────────────
  probeEyebrow: string;
  probeTitle: string;
  probeIntro: string;
  probes: ProbeItem[];
  probeOutro: string;
  /** Shown only after a live fetch of the agent card SUCCEEDS. `{v}` and `{n}` are filled from the card. */
  probeLive: string;
  /** Shown only after that fetch FAILS. Neither line is rendered before the check resolves. */
  probeUnavailable: string;

  // ── Acts 5 to 9: decisions ──────────────────────────────────────────
  decisionLabels: { problem: string; options: string; decision: string; price: string };
  decisions: DecisionAct[];

  // ── Act 10: gates ───────────────────────────────────────────────────
  gatesEyebrow: string;
  gatesTitle: string;
  gates: Gate[];

  // ── Act 11: corrections ─────────────────────────────────────────────
  correctionsEyebrow: string;
  correctionsTitle: string;
  correctionsIntro: string;
  correctionLabels: { assumption: string; check: string; result: string };
  corrections: Correction[];
  disclaimerTitle: string;
  disclaimers: string[];

  // ── Act 12: positions ───────────────────────────────────────────────
  experienceTitle: string;
  earlierPositions: string;
  footerBandLabels: { education: string; languages: string; tools: string };

  // ── Act 13: passing it on ───────────────────────────────────────────
  transferEyebrow: string;
  transferTitle: string;
  transferQuote: string;
  transferQuoteNote: string;
  transfers: TransferItem[];

  // ── Act 14: close ───────────────────────────────────────────────────
  storyClosingEyebrow: string;
  closingLine: string;
  closingNote: string;

  // Proof markers, shared across acts
  proofPublicLabel: string;
  proofClosedLabel: string;

  // Aria labels (story page)
  ariaRunning: string;
  ariaProbe: string;
  ariaDecisions: string;
  ariaGates: string;
  ariaCorrections: string;
  ariaTransfer: string;
  ariaEducation: string;
  ariaStatement: string;
  ariaProfile: string;
  ariaContact: string;

  // CV-specific
  careerIntro: string;
  talksTitle: string;
  careerDetails: string[];
  cvRunningTitle: string;
  cvFooterOtherLang: string;
  // Legal footer links (rendered site-wide: CV, story, legal pages)
  legalPrivacy: string;
  legalImpressum: string;
  truncatePatterns: string[];
  truncateToolPatterns: string[];
  showAllProjects: string;
  // Agent chat widget
  agentWidget: AgentWidgetStrings;

  /** Retired, kept only so nothing that still imports it breaks at build time. */
  beliefs: Belief[];
}

export const i18n: Record<'de' | 'en', I18nStrings> = {
  de: {
    pdfDownload: 'PDF herunterladen',
    experienceTheStory: 'Die Arbeit ansehen',
    storyBackToCv: 'Zum Lebenslauf',
    classicCV: 'Klassischer Lebenslauf',
    otherLangLabel: 'English',
    skipToContent: 'Zum Inhalt springen',
    availability: 'Verfügbar für Quality Engineering, Testautomatisierung, KI-Architektur und Workshops.',

    storyEyebrow: 'Quality Engineer · KI-Architekt · Frankfurt am Main',
    storyStatement: `Deklarierter Zustand ist<br>nicht <em class="italic" style="color: var(--accent)">verifizierter</em> Zustand.`,
    storyStatementNote: 'Jede Aussage auf dieser Seite trägt ihren Beleg daneben: eine Norm, ein öffentliches Repository, oder eine Adresse, die Sie selbst aufrufen können. Wo etwas unter NDA liegt, steht das dabei, statt dass der Beleg fehlt.',
    storyRole: 'Quality Engineer · KI-Architekt',

    storyAffiliation: 'Mitgesellschafter der BKS-Lab GmbH, freiberuflich im Quality Engineering',
    storyPortraitText: [
      'Ich arbeite in zwei Rollen gleichzeitig. In der BKS-Lab GmbH zusammen mit Axel von Dielingen, Lior Boiman und Michael Kupermann, daneben freiberuflich als Quality Engineer in eigenen Mandaten.',
      'Der Schwerpunkt der Firmenarbeit ist eine produktive Rechnungsstrecke nach EN 16931 für eine führende Online-Jobplattform (unter NDA), dazu Workshops, Konzeptarbeit und Plattform-Themen bei weiteren Kunden.',
      'Was von dieser Arbeit öffentlich prüfbar ist, liegt offen: der generische Rahmen meines Agentensystems steht unter MIT, und der Agent auf dieser Seite ist ein ansprechbarer Endpunkt, kein Textfeld.',
      'Vieles hier ist Teamarbeit. Die Rechnungsstrecke betreiben wir zu viert, die Nur-Lese-Kanten zwischen den Agenten sind das Ergebnis einer fremden Review, und der Vortrag weiter unten wurde nach einer internen Kritik umgebaut. Wo eine Entscheidung nicht meine war, steht es an der Stelle dabei.',
    ],

    /** `{date}` is filled from the build date in StoryPage.astro. Never type a date here. */
    runningEyebrow: 'Stand {date}. Die Angaben zum Agenten kommen live aus seinem Steckbrief.',
    runningTitle: 'Was gerade läuft',
    runningLeadStruck: 'status: active',
    runningLeadLive: 'launchctl print',
    runningLeadNote: 'Links steht, was eine Konfiguration behauptet. Rechts steht, was ich stattdessen frage. Der Unterschied zwischen beiden ist die Hälfte meines Berufs.',
    running: [
      {
        title: 'Der Agent auf dieser Seite',
        mechanism: 'Er beantwortet Fragen zu diesem Lebenslauf. Bei einer Fachfrage rät er nicht, sondern befragt selbständig einen zweiten Agenten nach dem offenen A2A-Standard und kennzeichnet dessen Antwort als fremd.',
        proof: 'mboiman.bks-lab.com/.well-known/agent-card.json',
        proofUrl: 'https://mboiman.bks-lab.com/.well-known/agent-card.json',
        state: 'public',
      },
      {
        title: 'open-bridge, die quelloffene Schicht',
        mechanism: 'Das generische Gerüst hinter dieser Arbeitsweise liegt öffentlich unter MIT: Betriebshandbuch, Fähigkeiten, Regeln, Agenten-Laufzeit. Vor jedem Merge laufen Pflichtprüfungen, darunter ein Scan auf durchgesickerte Inhalte.',
        proof: 'github.com/bks-lab/open-bridge · MIT · v0.14.0',
        proofUrl: 'https://github.com/bks-lab/open-bridge',
        state: 'public',
      },
      {
        title: 'Die Rechnungsstrecke',
        mechanism: 'Aus- und Eingangsrechnungen einer führenden Online-Jobplattform laufen produktiv zwischen SAP Business ByDesign und dem Peppol-Netz. Eingehend über zwei parallele Wege, per Webhook und aus einem Postfach, beide enden in derselben Schicht.',
        proof: 'EN 16931 · Peppol BIS 3.0',
        state: 'closed',
        stateNote: 'Kunde unter NDA',
      },
      {
        title: 'Das Übersetzungs-Gateway',
        mechanism: 'Ein zustandsloser Übersetzer stellt dieselben Agenten für MCP-Clients bereit. Drei Werkzeuge, kein eigenes Modell, keine eigene Logik, kein Zustand zwischen zwei Aufrufen.',
        proof: 'MCP nach A2A',
        proofUrl: 'https://gateway.bks-lab.com/mcp',
        state: 'public',
        stateNote: 'anonym nur Auskunft, schreibende Stufen brauchen ein Token',
      },
    ],
    runningOutro: 'Drei davon können Sie sofort selbst aufrufen. Bei der Rechnungsstrecke steht die Norm statt eines Links, weil der Kunde unter NDA liegt. Das Gateway ist offen, aber gestuft: anonym gibt es Auskunft, alles Schreibende braucht ein Token.',

    probeEyebrow: 'Prüfen Sie es hier',
    probeTitle: 'Fragen Sie ihn selbst',
    probeIntro: 'Der Agent läuft auf einem Mac mini unter meinem Schreibtisch, nicht auf gemieteter Infrastruktur, und ist über den offenen A2A-Standard adressierbar. Drei Fragen zeigen, was er kann und was er ausdrücklich nicht kann.',
    probes: [
      {
        question: 'Welche KI-Workshops bietet BKS-Lab an?',
        explains: 'Er fragt den zweiten Agenten und gibt dessen Antwort mit vorangestelltem „BKS sagt:“ weiter. In der Probe für diese Seite hat der zweite Agent offen gesagt, dass dazu öffentlich nichts dokumentiert ist, statt etwas zu erfinden.',
      },
      {
        question: 'Welche Termine hat Michael nächste Woche, und mit wem?',
        explains: 'Er kann es nicht sagen, weil er es nicht sieht. Das Recht, den Kalender zu lesen, liegt bei einem getrennten Programm. Der Agent liest ausschließlich eine Liste aus Zeitpaaren, ohne Titel, Ort und Teilnehmer. Was nicht in der Datei steht, holt auch keine geschickte Frage heraus.',
      },
      {
        question: 'Hätte Michael Donnerstag Zeit für ein Gespräch?',
        explains: 'Er nimmt den Wunsch auf und gibt ihn an mich weiter. Zusagen kann er nichts, er hat kein Schreibrecht auf den Kalender. Die Zieladresse für diese Meldung kommt allein aus meiner Konfiguration: es gibt kein Empfängerfeld, das ein Besucher füllen könnte.',
      },
    ],
    probeOutro: 'Sind die Verfügbarkeitsdaten älter als erlaubt, verweigert er die Auskunft, statt freie Zeit zu erfinden. Eine zu großzügige Absage kostet einen Termin. Eine erfundene freie Stunde kostet Vertrauen.',
    probeLive: 'Gerade eben geprüft: der Agent ist erreichbar und meldet A2A {v} mit {n} Fähigkeiten. Diese Zeile stammt aus seinem Steckbrief, nicht aus dieser Seite.',
    probeUnavailable: 'Der Agent antwortet gerade nicht. Sein Steckbrief liegt trotzdem offen, und der Link weiter oben führt direkt hin.',

    decisionLabels: { problem: 'Problem', options: 'Optionen', decision: 'Entscheidung', price: 'Preis' },
    decisions: [
      {
        id: 'open-bridge',
        category: 'Open Source · Agenten-Infrastruktur',
        stack: 'Markdown / YAML / Python / GitHub Actions',
        title: 'Der Rahmen ist offen. Die Mandate sind es nicht.',
        problem: 'Der Betriebszustand meiner Arbeit ist Text in einem Git-Repository: wer ich bin, welche Projekte laufen, welche Regeln gelten, was gestern passiert ist. Der generische Teil davon ist für andere brauchbar. Der Rest darf nie nach draußen. Zwischen beidem liegt genau ein Befehl, und die serverseitige Schutzregel eines Repositories nimmt ausgerechnet seinen Eigentümer aus.',
        rejected: [
          'Konvention und Disziplin. Eine Regel im Handbuch, an die Mensch und Agent sich halten sollen.',
          'Ein bereinigter Abzug. Er driftet ab dem ersten Tag und ist genau einmal geprüft.',
        ],
        chosen: 'Zwei Schichten auf überschneidungsfreien Pfaden, dazu ein Hook unterhalb des Modells.',
        decision: 'Die Verteilungsstufe einer Datei ergibt sich aus ihrem Ablageort, nicht aus einem Etikett, das man vergessen kann. Weil öffentlicher Rahmen und private Daten sich pfadmäßig nicht überschneiden, sind Zusammenführungen konfliktfrei durch Konstruktion. Struktur ist der primäre Schutz, der Inhalts-Scan nur das Auffangnetz. Ein Hook am Push-Rand klassifiziert das Ziel offline in privat, öffentlich und unbekannt, blockiert im Zweifel, und entscheidet über den Ziel-Ref statt über den Branchnamen, damit ein Push aus abgekoppeltem Zustand die Regel nicht umgeht. Das Projekt erfindet dabei keine eigenen Formate: das Betriebshandbuch folgt der AGENTS.md-Konvention der Linux Foundation, die Fähigkeiten dem offenen SKILL.md-Standard, das Gestaltungsmanifest dem DESIGN.md-Format, die Stimme des Orchestrators der SOUL.md-Konvention. Jede Quelle steht namentlich im Acknowledgments.',
        price: 'Jede Änderung muss ihre Schicht kennen, bevor sie committet wird. Ein Ziel, dessen Privatheit sich nicht beweisen lässt, wird geblockt, auch wenn es harmlos ist. Es gibt genau einen Ausstieg, sichtbar pro Push zu setzen, nie als Voreinstellung.',
        proof: 'MIT · v0.14.0',
        proofLabel: 'öffentliches Repository, Live-Seite, Releases aus konventionellen Commits',
        proofUrl: 'https://github.com/bks-lab/open-bridge',
        state: 'public',
      },
      {
        id: 'e-invoicing',
        category: 'E-Invoicing im Regelbetrieb',
        stack: 'Python / Azure Functions / SAP ByDesign / Peppol',
        title: 'Eine Rechnung wandert durch benannte Stationen.',
        problem: 'Für eine führende Online-Jobplattform (unter NDA) betreiben wir im Team eine produktive Rechnungsstrecke. Ausgangsrechnungen verlassen SAP Business ByDesign, werden nach UBL konvertiert und ins Peppol-Netz gegeben. Eingangsrechnungen kommen über zwei parallele Wege zurück, als Peppol-Zustellung per Webhook und aus einem Postfach, und enden beide in derselben Schicht. Eine offizielle Schnittstellenspezifikation des ERP gab es nicht.',
        rejected: [
          'Kontrollfluss aus Bedingungen und Ausnahmen, so wie Verarbeitungscode meistens wächst.',
          'Ein Workflow-Produkt dazwischenstellen und die Logik in dessen Oberfläche verschieben.',
        ],
        chosen: 'Die Verarbeitung ist eine Liste benannter Schritte in einer Datei.',
        decision: 'Auspacken, Buchungskreis filtern, prüfen, dekodieren, gegen XSD parsen, nach UBL abbilden, gegenprüfen, Archivkopie erzeugen, einliefern, Ergebnis sichern, dem ERP antworten. Jeder Schritt ist einzeln lesbar, testbar und instrumentierbar. Daneben steht eine zweite, ebenso benannte Kette für den Fehlerfall: bricht ein Schritt, hebt sie die vorhandenen Dokumente trotzdem ins Archiv und gibt dem ERP eine saubere Antwort. Die Formatlogik liegt hinter Ports, ZUGFeRD, Factur-X und XRechnung nach UBL und CII sind Adapter, die Fachlogik kennt das Format nicht. Die fehlende Spezifikation haben wir nicht Feld für Feld nachgezogen, sondern einmal vollständig abgeglichen und die Lücken in EN-16931-Geschäftstermen benannt, also Leistungszeitraum BT-73 und BT-74, Vertragsreferenz BT-12, Rabatte BT-136. Umgesetzt wird testgetrieben, mit dem Peppol-BIS-3.0-Validator als hartem Tor.',
        price: 'Zwei Ketten sind zwei Stellen, die eine Änderung berühren muss. Und der vollständige Abgleich kostet vorne Zeit, ohne sofort ein Feature zu liefern.',
        proof: 'EN 16931',
        proofLabel: 'europäische Norm für die elektronische Rechnung, Zustellung über Peppol BIS 3.0',
        state: 'closed',
        stateNote: 'Kunde unter NDA',
      },
      {
        id: 'zustellnachweis',
        category: 'Quality Engineering im Betrieb',
        stack: 'Nachweis-API / AS4 / ISO 6523',
        title: 'Ein Pipeline-Erfolg ist noch keine Zustellung.',
        problem: 'Die Pipeline meldete Erfolg. Erfolg hieß aber nur: der Zugangspunkt hat die Rechnung angenommen. Ob sie beim Empfänger ankam, stand nirgends.',
        rejected: [
          'Dem internen Erfolgsflag glauben, es ist ja gesetzt.',
          'Eine Stichprobe ziehen und hochrechnen.',
        ],
        chosen: 'Für ein vollständiges Zeitfenster jede einzelne Rechnung gegen die Nachweis-API des Zugangspunkts halten und den Beleg mitschreiben.',
        decision: 'Jede Rechnung steht im Bericht mit gesendeter Peppol-Kennung, Zustellweg und Beleg. Beleg heißt entweder eine signierte AS4-Empfangsquittung aus dem Peppol-Netz oder eine SMTP-Quittung des Ersatzwegs. Befund: ein Teil der Sendungen war trotz gesetztem Erfolgsflag nicht zugestellt. Die Ursachen lagen gleichzeitig in drei getrennten Sphären, keine davon im eigenen Code: Stammdaten im ERP, wo ein falsch gesetzter Schemacode nach ISO 6523 zur harten Ablehnung führt, obwohl die Nummer selbst stimmt; der Registrierungsgrad der Empfänger im Verzeichnis; und das Routing beim Zugangspunkt. Die eigene Pipeline wurde als Ursache belegt ausgeschlossen, nicht behauptet.',
        price: 'Derselbe Bericht kassiert zwei eigene, früher formulierte Thesen. Ein Bericht, der die eigene Vorarbeit angreift, ist unangenehm zu schreiben. Er ist der Grund, warum die Aussagen danach tragen.',
        coda: 'Das ist der Teil der Arbeit, den man nicht sieht, wenn man auf Durchsatz schaut. Eine Strecke, die schnell das Falsche liefert, ist keine gute Strecke.',
        proof: 'AS4-Quittung',
        proofLabel: 'signierter Empfangsbeleg des Peppol-Netzes, der einzige Beleg, der zählt',
        state: 'closed',
        stateNote: 'Kunde unter NDA',
      },
      {
        id: 'agenten-netz',
        category: 'Agenten und Protokolle',
        stack: 'A2A 1.0 / MCP / Python / launchd',
        title: 'Die interessanten Entscheidungen sind Weglassungen.',
        problem: 'Ein Agent, der im offenen Netz steht und Auskunft über eine Person gibt, ist zugleich ein Angriffsziel. Wer ihn über eine geschickte Eingabe übernimmt, könnte eine Meldung gegen einen Dritten richten oder sich über den Antwortstrom Kalenderinhalte holen.',
        rejected: [
          'Ein Empfängerfeld mit Validierung. Validierung ist Code, den ein Modell überreden kann.',
          'Eine Positivliste erlaubter Empfänger. Sie wächst, und jede Erweiterung ist eine Entscheidung unter Zeitdruck.',
        ],
        chosen: 'Kein Empfänger-Argument. Die Adresse kommt ausschließlich aus einer Konfiguration, die der Betreiber setzt.',
        decision: 'Durchgesetzt durch Abwesenheit, nicht durch Prüfung: es gibt keinen Pfad von einer Besuchereingabe zur Zieladresse. Dieselbe Linie zieht sich durch. Der Agent hat kein Schreibrecht auf den Kalender, weil es kein Werkzeug dafür gibt. Er sieht keine Termininhalte, weil das Kalenderrecht bei einem getrennten Programm liegt und er selbst nur eine Liste aus reinen Zeitpaaren liest. Der Grund für diese Trennung ist konkret: einen macOS-Kalender zu lesen erfordert Vollzugriff auf die Festplatte, und wer den hat, liest auch Mail, Nachrichten und den Browserverlauf. Drei Agenten befragen sich gegenseitig nach dem offenen A2A-Standard, alle drei sind öffentlich adressierbar, und jede Kante zwischen ihnen ist ausschließlich lesend. Hinüber wandert nur die abstrakte Sachfrage, Name und Anliegen des Besuchers bleiben hier. Alle Lese-Werkzeuge sind pfadgebunden, nachdem eine Messung gezeigt hat, dass eine blanke Werkzeugregel einen im Hintergrund laufenden Agenten eben nicht auf sein Arbeitsverzeichnis einschränkt. Ein Test lässt die Pipeline rot laufen, falls das jemand zurückdreht.',
        price: 'Der Agent kann weniger, als er könnte. Er kann nicht weiterleiten, nicht buchen, und er sagt öfter „das kann ich nicht“ als ein Assistent, der einfach macht. Drei Agenten sind außerdem drei Dienste, drei Tunnel und drei Stellen, an denen etwas stillstehen kann.',
        proof: 'A2A 1.0',
        proofLabel: 'Agent-Card unter /.well-known/agent-card.json, live abrufbar',
        proofUrl: 'https://mboiman.bks-lab.com/.well-known/agent-card.json',
        state: 'public',
      },
      {
        id: 'qe-mandat',
        category: 'Quality Engineering im Mandat',
        stack: 'Behave / Playwright / KQL / Pact / Gauge',
        title: 'Von der Sammelmappe zum Tor.',
        problem: 'Freigabe-Entscheidungen hingen daran, dass jemand Qualitätsdaten von Hand einsammelte. Und bei einem roten Test begann die Analyse damit, den Fall erst einmal nachzustellen.',
        rejected: [
          'Mehr Ende-zu-Ende-Tests obendrauf. Sie werden langsam, flackern, und verschieben das Problem.',
          'Ein zentrales Reporting-Team, das die Daten einsammelt. Das ist dieselbe Handarbeit, nur mit Organigramm.',
        ],
        chosen: 'Die Pipeline entscheidet anhand definierter Tore, und wer nachsehen will, hat ein benanntes Werkzeug dafür.',
        decision: 'In einer Plattform für die Zertifizierung von Medizinprodukten, also im regulatorischen Rahmen MDR und IVDR: ein BDD-Testframework in Python mit Behave, mit einer Authentifizierung, die sich bei abgelaufenem Token selbst erneuert, und einem Bericht, der die tatsächlichen Antworten der Schnittstelle einbettet. Damit ist ein roter Test analysierbar, ohne ihn nachzustellen. Dazu Playwright über die vollständige Nutzerreise mit Route-Mocking, um Fehlerfälle zu erzwingen statt auf sie zu warten, und zwei benannte Werkzeuge in Azure Monitor, eines für die Beobachtung während des Testens, eines für die Nachverfolgung danach. In einem Finanzvertriebs-Umfeld davor: Qualitätstore in den Pipelines der Backend- und Frontend-Teams, Gauge als BDD-Werkzeug, Playwright in die bestehende Strecke integriert, Vertragstests mit Pact zwischen den Diensten statt Ende-zu-Ende-Kaskaden, und Dashboards auf fachlicher wie technischer Ebene.',
        price: 'Tore halten auch dann an, wenn es eilt. Das ist ihr Sinn, und es ist der Punkt, an dem man sie verteidigen muss.',
        coda: 'Ein guter Teil der Rolle war beide Male Befähigung über Teamgrenzen hinweg, damit die Tore auch ohne mich stehen bleiben. Und umgekehrt sieht meine Prüfarbeit heute anders aus, seit Agenten die Fleißarbeit tragen. Ich prüfe nicht weniger. Ich prüfe an Stellen, an denen früher niemand nachgesehen hätte, weil es zu mühsam gewesen wäre.',
        proof: 'MDR · IVDR',
        proofLabel: 'regulatorischer Rahmen der geprüften Plattform',
        state: 'closed',
        stateNote: 'Auftraggeber im Lebenslauf genannt, Projektinterna vertraulich',
      },
    ],

    gatesEyebrow: 'Regeln, die laufen',
    gatesTitle: 'Vier Tore, drei aus einem Vorfall, eines aus einer Entscheidung',
    gates: [
      {
        rule: 'Deklarierter Zustand ist nicht verifizierter Zustand.',
        mechanism: 'Sagt ein Statusfeld, ein Dienst laufe, wird der Dienstverwalter gefragt und danach auf das erwartete Ausgabe-Artefakt gewartet. Zwischenstände wie „ausgerollt, Start noch offen“ sind als Endzustand verboten, weil sie unfertige Arbeit still an den Nächsten vererben. Jede Dienst-Deklaration trägt deshalb eine maschinenlesbare Prüfsonde.',
        origin: 'Entstanden aus: ein Sicherungslauf war tagelang tot, das Statusfeld sagte die ganze Zeit „ok“.',
      },
      {
        rule: 'Private Daten verlassen das Repository nicht, und zwar unterhalb des Modells.',
        mechanism: 'Ein Hook am Push-Rand klassifiziert das Ziel in privat, öffentlich und unbekannt, und blockiert im Zweifel. Nachgewiesen wird das im Angriffsversuch, mit dem billigsten verfügbaren Modell, in einer Sandbox, deren vermeintlich öffentliches Ziel ein lokales Repository ist. Der Test auf ein Leck kann also selbst keines verursachen. Und wenn schon das schwächste Modell nicht durchkommt, hängt die Sicherheit nicht am Modell.',
        origin: 'Entstanden aus: zwischen privatem Repository und öffentlichem Upstream liegt genau ein Befehl, und eine serverseitige Regel nimmt ausgerechnet den Eigentümer aus.',
      },
      {
        rule: 'Jeder Ausfall hinterlässt einen Test.',
        mechanism: 'Die Checks sind Einträge in einer Registry, und jeder trägt das Feld mit dem Vorfall, aus dem er entstanden ist. Es steht in der Vorlage, nicht im Kommentar, und ist auf jedem Eintrag gefüllt. Eine Erreichbarkeitsprüfung auf Ping war Dauer-Fehlalarm, weil ICMP geblockt war und der Dienst trotzdem lief. Dort steht heute ein TCP-Verbindungsaufbau.',
        origin: 'Entstanden aus: einem Ausfall, den tagelang niemand bemerkt hat.',
      },
      {
        rule: 'Das System ändert sich nicht ohne ein menschliches Ja.',
        mechanism: 'Jede dauerhafte Selbstveränderung läuft über eine menschenlesbare Vorschlagsdatei und eine ausdrückliche Zustimmung. Der Preis steht in derselben Regel: keine emergenten Fähigkeitsgewinne. Das System wird nicht besser, ohne dass jemand sagt, in welcher Hinsicht.',
        origin: 'Entstanden aus: einer Entscheidung, nicht aus einem Versäumnis. So bleibt jede Änderung ein Commit und damit umkehrbar.',
      },
    ],

    correctionsEyebrow: 'Korrekturen',
    correctionsTitle: 'Drei Befunde, die meine eigenen waren',
    correctionsIntro: 'Prüffähigkeit zeigt sich nicht daran, was jemand behauptet, sondern daran, was er zurückgenommen hat. Drei Beispiele aus dem laufenden Jahr.',
    correctionLabels: { assumption: 'Die Annahme', check: 'Die Nachprüfung', result: 'Was blieb' },
    corrections: [
      {
        assumption: 'Die Pipeline meldet Erfolg, also ist die Rechnung zugestellt.',
        check: 'Jede Rechnung eines vollständigen Zeitfensters einzeln gegen die Nachweis-API des Zugangspunkts geprüft, mit signierter Empfangsquittung oder Quittung des Ersatzwegs als Beleg.',
        result: 'Ein Teil der Sendungen war trotz gesetztem Erfolgsflag nicht zugestellt. Zwei eigene frühere Befunde fielen im selben Bericht, darunter die These, ein leeres Schemafeld sei die Ursache. Dasselbe Feld stand auch auf erfolgreich zugestellten Rechnungen.',
      },
      {
        assumption: 'Der Anbieter hat seine Spezifikation inzwischen korrigiert.',
        check: 'Die veröffentlichte Schnittstellenbeschreibung zweimal live geladen und gegen den tatsächlich gelieferten Wert gehalten.',
        result: 'Beide Male widerlegt. Der Vorgang war zwischenzeitlich auf genau dieser ungeprüften Annahme geschlossen worden und lag dreieinhalb Wochen still, weil er als erledigt galt. Seitdem gilt: ein Abschluss braucht den Live-Beleg, nicht die Zusage.',
      },
      {
        assumption: 'Der Verfügbarkeits-Abruf des Agenten braucht kein Kalenderrecht.',
        check: 'Nach einem Paket-Upgrade nachgemessen, statt der eigenen Notiz zu glauben.',
        result: 'Falsch. Die Verfügbarkeit war zwei Tage stumm tot, ohne eine einzige Fehlerzeile. Daraus entstanden die laute Diagnose und die Alterssperre, die weiter oben beschrieben ist.',
      },
    ],
    disclaimerTitle: 'Was ich nicht behaupte',
    disclaimers: [
      'Reichweite. Das Open-Source-Projekt ist von mir gebaut und von mir benutzt. Was es kann, ist im Repository nachlesbar. Über Verbreitung sage ich nichts, weil es dazu nichts zu sagen gibt.',
      'Werkzeug-Unabhängigkeit. Sie ist für drei Werkzeuge tatsächlich geprüft. Für die anderen ist sie plausibel und ungetestet. Das ist ein Unterschied, den ich nicht verwische.',
      'Die Isolation ist nicht fertig. Die heutige Schicht, die den öffentlichen Agenten von lesenden Kommandos trennt, ist ausdrücklich eine Zwischenstufe, nicht der Endzustand. Der Endzustand liegt eine Ebene tiefer, und dorthin ist es noch ein Stück Arbeit.',
    ],

    experienceTitle: 'Stationen',
    earlierPositions: 'Frühere Positionen',
    footerBandLabels: { education: 'Ausbildung und Zertifizierungen', languages: 'Sprachen', tools: 'Werkzeuge' },

    transferEyebrow: 'Weitergeben',
    transferTitle: 'Vorträge und Workshops',
    transferQuote: 'KI ist das Benzin, nicht das Produkt.',
    transferQuoteNote: 'Der Satz stammt aus einer internen Coaching-Runde vor dem Impulsvortrag an der TU Darmstadt. Die Kernkritik am ersten Entwurf: dem Vortrag fehlte die Produktdefinition, eine generierte Pitch-Website ist eine Prozess-Demo und kein Produkt. Der Einwand war berechtigt, der Vortrag wurde daraufhin umgebaut. Seitdem positioniere ich KI als Querschnitts-Werkzeug, nicht als Angebot.',
    transfers: [
      {
        title: 'Impulsvortrag, TU Darmstadt, 04/2026',
        body: 'Geladener Impulsgeber in einem Block-Praktikum für Bachelor-Studierende der Informatik am Fachgebiet Wirtschaftsinformatik, Praktikum „KI-Startup: Von der Idee zur Umsetzung“. Moderierter Impuls mit Live-Demonstrationen, on demand zu Fragen aus der Gruppe, statt Folien-Theorie.',
      },
      {
        title: 'Entwickler-Workshop zu agentenbasierter Entwicklung, 06/2025',
        body: 'Arbeiten mit Sprachmodellen und Token-Ökonomie, Model Context Protocol und Agent-to-Agent-Protokoll, Multi-Agent-Systeme, Browser-Automatisierung mit Playwright-MCP zur Testgenerierung, regelbasierte Agentensteuerung über Projektdateien, testgetriebene Abläufe mit KI-Assistenz. Folien, Live-Coding, praktische Übungen.',
      },
      {
        title: 'Workshop-Reihe bei einem Ingenieurbüro für technische Dokumentation',
        body: 'Abgeschlossen, zuletzt ein Business-Development-Workshop. Die tragfähigen Ergebnisse sind Entscheidungen des Kunden, nicht meine Vorschläge: erst das Bestandsgeschäft befähigen, dann über neue Geschäftsmodelle reden. KI bleibt intern, im Haus statt in der Cloud, begründet mit Vertragsstrafen und Reputationsrisiko. Und mehrere Multiplikatoren statt einer einzelnen Schlüsselperson. Aus der Konzeptarbeit ein Entscheidungsraster mit drei Stufen und ein festgezurrtes Designprinzip: keine Antwort ohne Quellenpfad in der Oberfläche.',
      },
      {
        title: 'Unternehmenspräsentation zur Dokumentationsautomatisierung, 04/2025',
        body: 'Eine einzige Wahrheitsquelle, Dokumentation parallel zum Code statt danach, OpenAPI-Generierung beim Merge, und Dokumentationsschuld als sichtbar gemachte Kategorie technischer Schuld statt als Bauchgefühl. Konkreter Vorschlag daraus: ein Label-System statt Ampeln, um mehrdimensional filtern zu können.',
      },
    ],

    storyClosingEyebrow: 'BKS-Lab GmbH · Frankfurt am Main',
    closingLine: 'Was hier steht, können Sie vorher nachprüfen. Was fehlt, sage ich Ihnen im Gespräch.',
    closingNote: 'Wenn Sie wissen wollen, ob etwas davon zu Ihrer Aufgabe passt: fragen Sie mich, oder fragen Sie den Agenten weiter oben. Er sagt es auch, wenn er etwas nicht weiß, und verweist an mich weiter, sobald es verbindlich wird.',

    proofPublicLabel: 'öffentlich prüfbar',
    proofClosedLabel: 'nicht öffentlich',

    ariaRunning: 'Was läuft',
    ariaProbe: 'Agent befragen',
    ariaDecisions: 'Entscheidungen',
    ariaGates: 'Tore',
    ariaCorrections: 'Korrekturen',
    ariaTransfer: 'Weitergeben',
    ariaEducation: 'Ausbildung',
    ariaStatement: 'Leitsatz',
    ariaProfile: 'Profil',
    ariaContact: 'Kontakt',

    careerIntro: 'Quality Engineer und KI-Architekt aus Frankfurt am Main. Quality Engineering und KI-Architektur laufen bei mir parallel, nicht nacheinander: die Prüfdisziplin ist der Grund, warum mein Agentensystem Tore und Belege hat statt blind zu handeln.',
    talksTitle: 'Vorträge & Workshops',
    careerDetails: [
      'In Enterprise-Projekten (DB Vertrieb, DVAG, TÜV Süd) habe ich an Quality-Monitoring, KI-gestützter Testautomatisierung und mit Dauerbetrieb-Validierung abgesicherten Legacy-Migrationen mitgewirkt.',
      'Heute verbinde ich Quality Engineering mit KI-Architektur: <strong style="color: var(--accent); font-weight: 500">MCP- und A2A-Protokolle</strong>, ein Netz aus Agenten, die sich gegenseitig befragen, und eine produktive E-Invoicing-Plattform nach <strong style="color: var(--accent); font-weight: 500">EN 16931</strong>. Der generische Rahmen dahinter liegt quelloffen unter MIT, einer dieser Agenten beantwortet diesen Lebenslauf live.',
      'Dieses Wissen gebe ich weiter, in Entwickler- und Business-Workshops sowie als geladener <strong style="color: var(--accent); font-weight: 500">Impulsgeber an der TU Darmstadt</strong>, und übersetze KI-Praxis für technische wie nicht-technische Zielgruppen.',
    ],
    cvRunningTitle: 'Öffentlich prüfbar',
    cvFooterOtherLang: 'English',
    legalPrivacy: 'Datenschutz',
    legalImpressum: 'Impressum',
    truncatePatterns: ['Schwerpunkte', 'Key Responsibilities', 'Workshop-Inhalte', 'Präsentationsinhalte', 'Praktischer', 'Practical', 'Hauptverantwortlichkeiten', 'Projekte\\b', 'Energiesektor', 'Quantifizierbare', 'Quantifiable', 'Technische Lösungen', 'Focus areas', 'Key Focus'],
    truncateToolPatterns: ['Tools', 'Technologien', 'Technologies', 'Eingesetzte', 'Technical Stack', 'Technischer'],
    showAllProjects: 'Alle Projekte anzeigen ({n} weitere)',
    beliefs: [],
    agentWidget: {
      launcherLabel: 'Mit meinem KI-Agenten chatten',
      launcherText: 'Live-KI-Agent fragen',
      headerTitle: 'KI-Agent von Michael',
      headerSubtitle: 'Fragen Sie zu Projekten, Stack und Verfügbarkeit',
      inputPlaceholder: 'Nachricht schreiben …',
      send: 'Senden',
      close: 'Schließen',
      greeting: 'Hallo, ich bin Michaels persönlicher KI-Agent. Fragen Sie mich zu seiner Erfahrung, seinen Projekten oder seiner Verfügbarkeit.',
      connecting: 'Verbinde mit dem Agenten …',
      working: 'Agent arbeitet …',
      errorConnect: 'Der Agent ist gerade nicht erreichbar. Bitte später erneut versuchen.',
      errorSend: 'Die Nachricht konnte nicht zugestellt werden. Bitte erneut versuchen.',
      errorAgent: 'Beim Beantworten ist ein Fehler aufgetreten. Bitte erneut versuchen.',
      emptyAnswer: 'Keine Antwort erhalten.',
      retry: 'Erneut versuchen',
      maximize: 'Vergrößern',
      restore: 'Verkleinern',
      resize: 'Zum Ändern der Größe ziehen',
      cardOpen: 'Agent-Card anzeigen',
      cardBack: 'Zurück zum Chat',
      cardTitle: 'Agent-Card',
      cardIntro: 'Der maschinenlesbare Steckbrief dieses Agenten nach dem offenen A2A-Standard (Agent-to-Agent), live aus /.well-known/agent-card.json.',
      cardProtocol: 'A2A-Protokoll',
      cardEndpoint: 'Endpunkt',
      cardModes: 'Ein-/Ausgabe',
      cardSkills: 'Fähigkeiten',
      cardExamplesHint: 'Beispiel-Frage anklicken zum Starten',
      cardStreaming: 'Streaming',
      cardPush: 'Push',
      cardLoading: 'Lade Agent-Card …',
      cardUnavailable: 'Agent-Card gerade nicht erreichbar.',
      privacyNote: 'Wir speichern den Verlauf nicht, bitte keine vertraulichen Daten eingeben.',
      privacyLink: 'Datenschutz',
    },
  },

  en: {
    pdfDownload: 'Download PDF',
    experienceTheStory: 'See the work',
    storyBackToCv: 'Back to CV',
    classicCV: 'Classic CV',
    otherLangLabel: 'Deutsch',
    skipToContent: 'Skip to content',
    availability: 'Available for quality engineering, test automation, AI architecture and workshops.',

    storyEyebrow: 'Quality Engineer · AI Architect · Frankfurt am Main',
    storyStatement: `Declared state is not<br><em class="italic" style="color: var(--accent)">verified</em> state.`,
    storyStatementNote: 'Every claim on this page carries its proof next to it: a standard, a public repository, or an address you can open yourself. Where something sits under NDA, that is stated, rather than the proof quietly going missing.',
    storyRole: 'Quality Engineer · AI Architect',

    storyAffiliation: 'Co-owner of BKS-Lab GmbH, freelance quality engineer',
    storyPortraitText: [
      'I work in two roles at once. At BKS-Lab GmbH together with Axel von Dielingen, Lior Boiman and Michael Kupermann, and alongside that as a freelance quality engineer on my own mandates.',
      'The centre of the company work is a production invoicing pipeline to EN 16931 for a leading online job platform (under NDA), plus workshops, concept work and platform topics with other clients.',
      'Whatever of that work can be verified publicly is out in the open: the generic framework behind my agent system is MIT-licensed, and the agent on this page is an addressable endpoint, not a text box.',
      'Much of this is teamwork. We run the invoicing pipeline as a team of four, the read-only edges between the agents came out of someone else\'s review, and the talk further down was rebuilt after internal criticism. Where a decision was not mine, it says so at that point.',
    ],

    runningEyebrow: 'As of {date}. The figures about the agent are pulled live from its own profile card.',
    runningTitle: 'What is running right now',
    runningLeadStruck: 'status: active',
    runningLeadLive: 'launchctl print',
    runningLeadNote: 'On the left is what a config file claims. On the right is what I ask instead. The gap between the two is half of my job.',
    running: [
      {
        title: 'The agent on this page',
        mechanism: 'It answers questions about this CV. On a subject-matter question it does not guess: it consults a second agent over the open A2A standard on its own initiative, and marks that answer as coming from elsewhere.',
        proof: 'mboiman.bks-lab.com/.well-known/agent-card.json',
        proofUrl: 'https://mboiman.bks-lab.com/.well-known/agent-card.json',
        state: 'public',
      },
      {
        title: 'open-bridge, the open-source layer',
        mechanism: 'The generic scaffolding behind this way of working is public under MIT: operating manual, skills, rules, agent runtime. Mandatory checks run before every merge, one of them a scan for leaked content.',
        proof: 'github.com/bks-lab/open-bridge · MIT · v0.14.0',
        proofUrl: 'https://github.com/bks-lab/open-bridge',
        state: 'public',
      },
      {
        title: 'The invoicing pipeline',
        mechanism: 'Outbound and inbound invoices for a leading online job platform run in production between SAP Business ByDesign and the Peppol network. Inbound arrives over two parallel routes, a webhook and a mailbox, and both end in the same layer.',
        proof: 'EN 16931 · Peppol BIS 3.0',
        state: 'closed',
        stateNote: 'client under NDA',
      },
      {
        title: 'The translation gateway',
        mechanism: 'A stateless translator exposes the same agents to MCP clients. Three tools, no model of its own, no logic of its own, and no state carried between two calls.',
        proof: 'MCP to A2A',
        proofUrl: 'https://gateway.bks-lab.com/mcp',
        state: 'public',
        stateNote: 'anonymous gets lookups only, writing tiers need a token',
      },
    ],
    runningOutro: 'Three of these you can open right now. For the invoicing pipeline the standard stands in place of a link, because the client is under NDA. The gateway is open but tiered: anonymous callers get lookups, anything that writes needs a token.',

    probeEyebrow: 'Check it here',
    probeTitle: 'Ask it yourself',
    probeIntro: 'The agent runs on a Mac mini under my desk, not on rented infrastructure, and is addressable over the open A2A standard. Three questions show what it can do and what it explicitly cannot.',
    probes: [
      {
        question: 'What AI workshops does BKS-Lab offer?',
        explains: 'It consults the second agent and passes the answer on, prefixed with "BKS says:". In the probe run for this page, that second agent openly said the detail is not publicly documented, rather than inventing something.',
      },
      {
        question: 'What meetings does Michael have next week, and with whom?',
        explains: 'It cannot say, because it cannot see. The right to read the calendar sits with a separate program. The agent reads nothing but a list of time pairs, with no titles, locations or participants. What is not in that file cannot be extracted by a clever question either.',
      },
      {
        question: 'Would Michael have time for a call on Thursday?',
        explains: 'It takes the request and forwards it to me. It cannot confirm anything, it has no write access to the calendar. And the destination address for that notice comes solely from my own configuration: there is no recipient field a visitor could fill in.',
      },
    ],
    probeOutro: 'If the availability data is older than allowed, it refuses to answer rather than inventing free time. An overly cautious refusal costs a meeting. An invented free hour costs trust.',
    probeLive: 'Checked just now: the agent is reachable and reports A2A {v} with {n} skills. This line comes from its own profile card, not from this page.',
    probeUnavailable: 'The agent is not answering at the moment. Its profile card is public regardless, and the link above goes straight to it.',

    decisionLabels: { problem: 'Problem', options: 'Options', decision: 'Decision', price: 'Price' },
    decisions: [
      {
        id: 'open-bridge',
        category: 'Open source · Agent infrastructure',
        stack: 'Markdown / YAML / Python / GitHub Actions',
        title: 'The framework is open. The mandates are not.',
        problem: 'The operating state of my work is text in a git repository: who I am, which projects are running, which rules apply, what happened yesterday. The generic part of that is useful to other people. The rest must never leave. Between the two sits exactly one command, and a repository\'s server-side protection rule exempts precisely its owner.',
        rejected: [
          'Convention and discipline. A rule in the manual that human and agent are supposed to follow.',
          'A scrubbed copy. It drifts from day one and is checked exactly once.',
        ],
        chosen: 'Two layers on non-overlapping paths, plus a hook that sits below the model.',
        decision: 'A file\'s distribution tier follows from where it lives, not from a label you can forget to set. Because the public framework and the private data do not share paths, merges are conflict-free by construction. Structure is the primary guard, the content scan is only the safety net. A hook at the push boundary classifies the destination offline into private, public and unknown, blocks when in doubt, and decides on the target ref rather than the branch name, so a push from a detached state cannot slip past. The project invents no formats of its own: the operating manual follows the Linux Foundation\'s AGENTS.md convention, the capabilities the open SKILL.md standard, the design manifest the DESIGN.md format, the orchestrator\'s voice the SOUL.md convention. Every source is named in the acknowledgments.',
        price: 'Every change has to know its tier before it is committed. A destination whose privacy cannot be proven gets blocked, even when it is harmless. There is exactly one escape hatch, set visibly per push, never as a default.',
        proof: 'MIT · v0.14.0',
        proofLabel: 'public repository, live site, releases cut from conventional commits',
        proofUrl: 'https://github.com/bks-lab/open-bridge',
        state: 'public',
      },
      {
        id: 'e-invoicing',
        category: 'E-invoicing in production',
        stack: 'Python / Azure Functions / SAP ByDesign / Peppol',
        title: 'An invoice travels through named stations.',
        problem: 'For a leading online job platform (under NDA) we run a production invoicing pipeline as a team. Outbound invoices leave SAP Business ByDesign, are converted to UBL and handed to the Peppol network. Inbound invoices come back over two parallel routes, as a Peppol delivery via webhook and out of a mailbox, and both end in the same layer. There was no official interface specification for the ERP.',
        rejected: [
          'Control flow made of conditions and exceptions, the way processing code usually grows.',
          'Put a workflow product in between and move the logic into its interface.',
        ],
        chosen: 'The processing is a list of named steps in a file.',
        decision: 'Unpack, filter by company code, validate, decode, parse against XSD, map to UBL, verify, produce an archive copy, submit, record the result, answer the ERP. Every step is separately readable, testable and instrumentable. Beside it sits a second, equally named chain for the failure case: if a step breaks, it still lifts the documents that exist into the archive and gives the ERP a clean answer. Format logic lives behind ports, so ZUGFeRD, Factur-X and XRechnung into UBL and CII are adapters and the domain logic never learns the format. The missing specification was not chased field by field: we reconciled it once, completely, and named the gaps in EN 16931 business terms, namely invoicing period BT-73 and BT-74, contract reference BT-12, allowances BT-136. Implementation is test-driven, with the Peppol BIS 3.0 validator as a hard gate.',
        price: 'Two chains are two places a change has to touch. And a complete reconciliation costs time up front without shipping a feature.',
        proof: 'EN 16931',
        proofLabel: 'the European standard for electronic invoicing, delivered over Peppol BIS 3.0',
        state: 'closed',
        stateNote: 'client under NDA',
      },
      {
        id: 'zustellnachweis',
        category: 'Quality engineering in production',
        stack: 'Evidence API / AS4 / ISO 6523',
        title: 'A pipeline success is not a delivery.',
        problem: 'The pipeline reported success. But success only meant that the access point had accepted the invoice. Whether it reached the recipient was recorded nowhere.',
        rejected: [
          'Trust the internal success flag, it is set after all.',
          'Take a sample and extrapolate.',
        ],
        chosen: 'For one complete window, hold every single invoice against the access point\'s evidence API and write the proof down with it.',
        decision: 'Every invoice appears in the report with the Peppol identifier it was sent to, the delivery route, and the proof. Proof means either a signed AS4 receipt from the Peppol network or an SMTP receipt from the fallback route. Finding: a share of the transmissions had not been delivered despite the success flag being set. The causes sat simultaneously in three separate spheres, none of them in our own code: master data in the ERP, where a wrongly set ISO 6523 scheme code causes a hard rejection even though the number itself is correct; the registration status of recipients in the directory; and routing at the access point. Our own pipeline was ruled out as a cause with evidence, not by assertion.',
        price: 'The same report withdraws two of my own earlier claims. A report that attacks your own prior work is uncomfortable to write. It is the reason the statements after it hold.',
        coda: 'This is the part of the work you do not see if you look at throughput. A pipeline that delivers the wrong thing quickly is not a good pipeline.',
        proof: 'AS4 receipt',
        proofLabel: 'the signed acknowledgement from the Peppol network, the only proof that counts',
        state: 'closed',
        stateNote: 'client under NDA',
      },
      {
        id: 'agenten-netz',
        category: 'Agents and protocols',
        stack: 'A2A 1.0 / MCP / Python / launchd',
        title: 'The interesting decisions are the omissions.',
        problem: 'An agent that sits on the open internet and gives information about a person is also a target. Anyone who takes it over through a crafted input could aim a notification at a third party, or pull calendar content out through the response stream.',
        rejected: [
          'A recipient field with validation. Validation is just code, and a model can argue its way around it.',
          'An allow-list of permitted recipients. It grows, and every extension is a decision made under time pressure.',
        ],
        chosen: 'No recipient argument at all. The address comes solely from a configuration the operator sets.',
        decision: 'Enforced by absence rather than by checking: there is no path from a visitor input to the destination address. The same line runs throughout. The agent has no write access to the calendar because no tool for it exists. It sees no meeting content because the calendar permission sits with a separate program, and the agent itself reads only a list of bare time pairs. The reason for that split is concrete: reading a macOS calendar requires full disk access, and whoever holds that also reads mail, messages and browser history. Three agents consult each other over the open A2A standard, all three are publicly addressable, and every edge between them is read-only. Only the abstract subject-matter question travels across; the visitor\'s name and request stay here. All read tools are path-bound, after a measurement showed that a bare tool rule does not in fact confine a headless agent to its working directory. A test turns the pipeline red if anyone reverts that.',
        price: 'The agent can do less than it could. It cannot forward, it cannot book, and it says "I cannot do that" more often than an assistant that just acts. Three agents are also three services, three tunnels, and three places where something can stall.',
        proof: 'A2A 1.0',
        proofLabel: 'agent card at /.well-known/agent-card.json, retrievable live',
        proofUrl: 'https://mboiman.bks-lab.com/.well-known/agent-card.json',
        state: 'public',
      },
      {
        id: 'qe-mandat',
        category: 'Quality engineering on mandate',
        stack: 'Behave / Playwright / KQL / Pact / Gauge',
        title: 'From the collection folder to the gate.',
        problem: 'Release decisions depended on somebody collecting quality data by hand. And when a test went red, the analysis began by reproducing the case first.',
        rejected: [
          'More end-to-end tests on top. They get slow, they flake, and they move the problem elsewhere.',
          'A central reporting team that gathers the data. That is the same manual work, only with an org chart.',
        ],
        chosen: 'The pipeline decides against defined gates, and anyone who wants to look has a named tool for it.',
        decision: 'On a platform for medical device certification, that is inside the MDR and IVDR regulatory frame: a BDD test framework in Python with Behave, with authentication that renews itself when the token expires, and a report that embeds the actual interface responses. That makes a red test analysable without reproducing it. Alongside it, Playwright across the full user journey with route mocking, to force error cases rather than wait for them, and two named workbooks in Azure Monitor, one for observation while testing, one for follow-up afterwards. In a financial distribution environment before that: quality gates in the pipelines of the backend and frontend teams, Gauge as the BDD tool, Playwright integrated into the existing pipeline, contract tests with Pact between the services instead of end-to-end cascades, and dashboards at both business and technical level.',
        price: 'Gates also stop things when it is urgent. That is their point, and it is the moment you have to defend them.',
        coda: 'A good part of the role, both times, was enabling people across team boundaries so the gates keep standing without me. And in the other direction, my own testing work looks different now that agents carry the legwork. I do not test less. I test in places where nobody would have looked before, because it would have been too tedious.',
        proof: 'MDR · IVDR',
        proofLabel: 'the regulatory frame of the platform under test',
        state: 'closed',
        stateNote: 'client named in the CV, project internals confidential',
      },
    ],

    gatesEyebrow: 'Rules that run',
    gatesTitle: 'Four gates, three out of an incident, one out of a decision',
    gates: [
      {
        rule: 'Declared state is not verified state.',
        mechanism: 'If a status field says a service is running, the service manager gets asked, and then we wait for the expected output artefact. Intermediate states like "rolled out, start still open" are forbidden as a resting state, because they quietly pass unfinished work to whoever comes next. Every service declaration therefore carries a machine-readable probe.',
        origin: 'Came out of: a backup run had been dead for days while the status field said "ok" the whole time.',
      },
      {
        rule: 'Private data does not leave the repository, and the guard sits below the model.',
        mechanism: 'A hook at the push boundary classifies the destination into private, public and unknown, and blocks when in doubt. It is proven adversarially with the cheapest model available, in a sandbox whose supposedly public destination is a local repository. So the test for a leak cannot cause one. And if even the weakest model cannot get through, the safety does not hang on the model.',
        origin: 'Came out of: between a private repository and a public upstream sits exactly one command, and a server-side rule exempts precisely the owner.',
      },
      {
        rule: 'Every outage leaves a test behind.',
        mechanism: 'The checks are entries in a registry, and each carries the field naming the incident it came from. It sits in the template rather than in a comment, and it is filled on every entry. One reachability check on ping was a permanent false alarm, because ICMP was blocked while the service was running fine. Today there is a TCP connect there instead.',
        origin: 'Came out of: an outage nobody noticed for days.',
      },
      {
        rule: 'The system does not change itself without a human yes.',
        mechanism: 'Every persistent self-modification goes through a human-readable proposal file and an explicit approval. The price is stated in the same rule: no emergent capability gains. The system does not get better without somebody saying in what respect.',
        origin: 'Came out of: a decision, not an omission. This way every change stays a commit, and therefore reversible.',
      },
    ],

    correctionsEyebrow: 'Corrections',
    correctionsTitle: 'Three findings that were my own',
    correctionsIntro: 'Testability shows less in what someone claims than in what they have taken back. Three examples from this year.',
    correctionLabels: { assumption: 'The assumption', check: 'The check', result: 'What was left' },
    corrections: [
      {
        assumption: 'The pipeline reports success, so the invoice was delivered.',
        check: 'Every invoice in a complete window checked individually against the Access Point\'s evidence API, with a signed receipt or a fallback-route receipt as proof.',
        result: 'A share of the transmissions had not been delivered despite the success flag being set. Two of my own earlier findings fell in the same report, among them the claim that an empty scheme field was the cause. The same field was present on successfully delivered invoices too.',
      },
      {
        assumption: 'The vendor has corrected its specification by now.',
        check: 'Loaded the published interface description live, twice, and held it against the value actually delivered.',
        result: 'Refuted both times. The case had meanwhile been closed on exactly that unverified assumption and sat still for three and a half weeks, because it counted as done. Since then: closing needs the live proof, not the promise.',
      },
      {
        assumption: 'The agent\'s availability lookup does not need calendar permission.',
        check: 'Measured it after a package upgrade instead of believing my own note.',
        result: 'Wrong. Availability had been silently dead for two days without a single error line. The loud diagnostic and the staleness cut-off described above came out of that.',
      },
    ],
    disclaimerTitle: 'What I do not claim',
    disclaimers: [
      'Reach. The open-source project is built by me and used by me. What it can do is readable in the repository. About adoption I say nothing, because there is nothing to say.',
      'Tool independence. It is genuinely verified for three tools. For the others it is plausible and untested. That is a difference I do not blur.',
      'The isolation is not finished. The layer that today separates the public agent from read commands is explicitly an interim stage, not the end state. The end state sits one level lower, and getting there is still a piece of work.',
    ],

    experienceTitle: 'Positions',
    earlierPositions: 'Earlier positions',
    footerBandLabels: { education: 'Education and certifications', languages: 'Languages', tools: 'Tools' },

    transferEyebrow: 'Passing it on',
    transferTitle: 'Talks and workshops',
    transferQuote: 'AI is the fuel, not the product.',
    transferQuoteNote: 'The line comes from an internal coaching round before the guest lecture at TU Darmstadt. The core criticism of the first draft: the talk had no product definition, and a generated pitch website is a process demo, not a product. The objection was fair, and the talk was rebuilt around it. Since then I position AI as a cross-cutting tool rather than as an offering.',
    transfers: [
      {
        title: 'Guest lecture, TU Darmstadt, 04/2026',
        body: 'Invited speaker in a block lab course for computer science undergraduates at the Information Systems group, course "AI startup: from idea to implementation". A moderated input session with live demonstrations, on demand against questions from the room, rather than slide theory.',
      },
      {
        title: 'Developer workshop on agent-based development, 06/2025',
        body: 'Working with language models and token economics, Model Context Protocol and the Agent-to-Agent protocol, multi-agent systems, browser automation with Playwright MCP for test generation, rule-based agent steering through project files, test-driven workflows with AI assistance. Slides, live coding, hands-on exercises.',
      },
      {
        title: 'Workshop series at an engineering firm for technical documentation',
        body: 'Concluded, most recently with a business development workshop. The results that held are the client\'s decisions, not my proposals: enable the existing business first, then talk about new business models. AI stays internal, on their own premises rather than in the cloud, argued from contractual penalties and reputational risk. And several internal champions rather than one key person. Out of the concept work came a three-tier decision grid and one design principle nailed down: no answer without a source path visible in the interface.',
      },
      {
        title: 'Company presentation on documentation automation, 04/2025',
        body: 'A single source of truth, documentation written alongside the code rather than after it, OpenAPI generation on merge, and documentation debt made visible as a category of technical debt instead of a gut feeling. One concrete proposal out of it: a label system instead of traffic lights, so you can filter along more than one dimension.',
      },
    ],

    storyClosingEyebrow: 'BKS-Lab GmbH · Frankfurt am Main',
    closingLine: 'What is written here, you can verify beforehand. What is missing, I will tell you in person.',
    closingNote: 'If you want to know whether any of this fits your problem: ask me, or ask the agent further up. It will also tell you when it does not know, and it hands over to me as soon as anything becomes binding.',

    proofPublicLabel: 'publicly verifiable',
    proofClosedLabel: 'not public',

    ariaRunning: 'What is running',
    ariaProbe: 'Ask the agent',
    ariaDecisions: 'Decisions',
    ariaGates: 'Gates',
    ariaCorrections: 'Corrections',
    ariaTransfer: 'Passing it on',
    ariaEducation: 'Education',
    ariaStatement: 'Statement',
    ariaProfile: 'Profile',
    ariaContact: 'Contact',

    careerIntro: 'Quality engineer and AI architect based in Frankfurt am Main. Quality engineering and AI architecture run in parallel for me rather than in sequence: the testing discipline is the reason my agent system has gates and evidence instead of acting blind.',
    talksTitle: 'Speaking & Workshops',
    careerDetails: [
      'In enterprise projects (DB Vertrieb, DVAG, TÜV Süd) I worked on quality monitoring, AI-driven test automation, and legacy migrations secured by continuous validation.',
      'Today I combine quality engineering with AI architecture: <strong style="color: var(--accent); font-weight: 500">MCP and A2A protocols</strong>, a network of agents that consult each other, and a production e-invoicing platform to <strong style="color: var(--accent); font-weight: 500">EN 16931</strong>. The generic framework behind it is open source under MIT, and one of those agents answers this very CV, live.',
      'I also pass this knowledge on, in developer and business workshops and as an invited <strong style="color: var(--accent); font-weight: 500">guest speaker at TU Darmstadt</strong>, translating hands-on AI for technical and non-technical audiences alike.',
    ],
    cvRunningTitle: 'Publicly verifiable',
    cvFooterOtherLang: 'Deutsch',
    legalPrivacy: 'Privacy',
    legalImpressum: 'Legal Notice',
    // 'Projects', 'Energy Sector' and 'Technical Solutions' were missing here while
    // config.cv.toml carries those headings in the English branch too, so the English
    // Siemens entry rendered its full project list while the German one stopped after
    // the intro. Two language versions of one station showed different amounts of text.
    truncatePatterns: ['Schwerpunkte', 'Key Responsibilities', 'Workshop-Inhalte', 'Workshop Content', 'Practical', 'Projekte\\b', 'Projects\\b', 'Energy Sector', 'Technical Solutions', 'Focus areas', 'Key Focus', 'Key responsibilities', 'Presentation content'],
    truncateToolPatterns: ['Tools', 'Technologien', 'Technologies', 'Technical Stack', 'Technischer'],
    showAllProjects: 'Show all projects ({n} more)',
    beliefs: [],
    agentWidget: {
      launcherLabel: 'Chat with my AI agent',
      launcherText: 'Ask the live AI agent',
      headerTitle: "Michael's AI Agent",
      headerSubtitle: 'Ask about projects, stack, and availability',
      inputPlaceholder: 'Type a message …',
      send: 'Send',
      close: 'Close',
      greeting: "Hi, I'm Michael's personal AI agent. Ask me about his experience, his projects, or his availability.",
      connecting: 'Connecting to the agent …',
      working: 'Agent is working …',
      errorConnect: 'The agent is unreachable right now. Please try again later.',
      errorSend: 'The message could not be delivered. Please try again.',
      errorAgent: 'Something went wrong while answering. Please try again.',
      emptyAnswer: 'No answer received.',
      retry: 'Try again',
      maximize: 'Enlarge',
      restore: 'Restore size',
      resize: 'Drag to resize',
      cardOpen: 'Show agent card',
      cardBack: 'Back to chat',
      cardTitle: 'Agent Card',
      cardIntro: "This agent's machine-readable profile card, built to the open A2A (agent-to-agent) standard, live from /.well-known/agent-card.json.",
      cardProtocol: 'A2A protocol',
      cardEndpoint: 'Endpoint',
      cardModes: 'Input/Output',
      cardSkills: 'Skills',
      cardExamplesHint: 'Click an example question to start',
      cardStreaming: 'Streaming',
      cardPush: 'Push',
      cardLoading: 'Loading agent card …',
      cardUnavailable: 'Agent card unavailable right now.',
      privacyNote: "We don't store the conversation, so please don't enter confidential data.",
      privacyLink: 'Privacy',
    },
  },
};

/**
 * Background images for the decision acts, keyed by `DecisionAct.id`.
 * Keyed by id rather than by title on purpose: the old version keyed on the
 * German project title, so any wording change silently dropped the image.
 */
export const darkScreenshots: Record<string, string> = {
  'qe-mandat': '/images/projects/qualitydashboard.png',
  'e-invoicing': '/images/projects/nlpanalyse.png',
};
