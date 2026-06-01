'use client'
import { useLanguage } from '@/contexts/LanguageContext'

const CONTENT = {
  it: {
    title: 'Cookie Policy',
    body: `Gentile Visitatore/Visitatrice (di seguito, "Lei" o l'"Utente"),

Questo sito Internet (https://www.keecks.ai/) (di seguito, il "Sito") è di proprietà di Keecks (di seguito il "Titolare").

Poiché su questo Sito sono utilizzati dei c.d. cookie per diverse finalità, con questa informativa si intende spiegare cosa sono i cookie e come vengono utilizzati sul Sito.

Alcuni cookie (c.d. cookie propri o di prima parte) sono veicolati e controllati direttamente dal titolare. Attraverso questi cookie, il titolare raccoglie e tratta alcuni dati personali che la riguardano. In questa informativa, ai sensi dell'art. 13 del Regolamento UE 2016/679 del 27 aprile 2016 relativo alla protezione delle persone fisiche con riguardo al trattamento dei dati personali (di seguito, "Regolamento"), le verrà spiegato come vengono raccolti questi dati, per quali finalità e quali sono i suoi diritti.

Il Titolare tiene nella massima considerazione il diritto alla privacy e alla protezione dei dati personali dei propri Utenti. Per qualsiasi informazione relativa alla presente Informativa Cookie, gli Utenti possono contattare il Titolare in qualsiasi momento inviando un'e-mail a info@keecks.ai

1. Cosa sono i cookie ed a cosa servono

I cookie sono piccoli file di testo che i siti visitati dall'utente inviano direttamente al suo terminale (solitamente al browser), dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla successiva visita del medesimo utente. Nel corso della navigazione su un sito, l'utente può ricevere sul suo terminale anche cookie di siti o di web server diversi (c.d. cookie di terze parti).

I cookie possono avere una durata limitata ad una singola sessione di navigazione sul browser (c.d. cookie di sessione), ed in tal caso si disattivano automaticamente al momento della chiusura del browser da parte dell'utente; oppure possono avere una scadenza predeterminata (c.d. cookie permanenti).

1.1 I cookie tecnici

I cookie tecnici sono utilizzati sul Sito al solo fine di rendere possibile la tua navigazione sul Sito e consentirti di utilizzarne le funzionalità. Si tratta sempre di cookie di prima parte, in quanto sono veicolati direttamente da noi sul Sito. Come previsto dalla normativa vigente in materia di privacy, per l'installazione di tali cookie non è richiesto il suo preventivo consenso.

1.2 I cookie di monitoraggio o "analytics"

I cookie analytics sono utilizzati sul Sito per raccogliere informazioni statistiche, in forma aggregata o non, sul numero degli utenti che accedono al Sito e su come questi visitano il Sito stesso.

I seguenti cookie analytics di terza parte sono installati sul Sito:

Google Analytics – cookie analytics di terza parte – permanente
https://www.google.com/analytics/learn/privacy.html?hl=it

2. Modalità di trattamento e tempi di conservazione dei dati

I dati personali potrebbero essere memorizzati nei server gestiti da soggetti terzi (es. fornitori di sistemi informatici). I suoi dati personali non saranno comunicati a terzi titolari del trattamento né saranno diffusi.

3. I suoi diritti

Per esercitare i suoi diritti, o ottenere alcuna ulteriore informazione o chiarimento in relazione alla presente Informativa Cookie, la preghiamo di contattare il Titolare inviando un messaggio di posta elettronica all'indirizzo info@keecks.ai

Il Titolare non è responsabile per l'aggiornamento di tutti i link visualizzabili nella presente Informativa Cookies, pertanto ogni qualvolta un link non sia funzionante e/o aggiornato, gli Utenti riconoscono ed accettano che dovranno sempre far riferimento al documento e/o sezione dei siti internet richiamati da tale link.

Il team Keecks`,
  },
  en: {
    title: 'Cookie Policy',
    body: `Dear Visitor (hereinafter, "You" or the "User"),

This website (https://www.keecks.ai/) (hereinafter, the "Website") is owned by Keecks (hereinafter, the "Data Controller").

Since this Website uses cookies for various purposes, this policy is intended to explain what cookies are and how they are used on the Website.

Some cookies (so-called first-party cookies) are managed and controlled directly by the Data Controller. Through these cookies, the Data Controller collects and processes some of your personal data.

The Data Controller holds the right to privacy and the protection of the personal data of its Users in the highest regard. For any information regarding this Cookie Policy, Users may contact the Data Controller at any time by sending an email to info@keecks.ai

1. What are cookies and what are they used for

Cookies are small text files that websites visited by the user send directly to their device (usually the browser), where they are stored and then retransmitted to the same websites on the user's next visit. While browsing a website, the user may also receive cookies from different websites or web servers on their device (so-called third-party cookies).

Cookies may last for a single browsing session (so-called session cookies), in which case they are automatically deactivated when the user closes the browser; or they may have a predetermined expiry date (so-called persistent cookies).

1.1 Technical cookies

Technical cookies are used on the Website solely to enable your browsing and allow you to use its features. These are always first-party cookies, as they are managed directly by us on the Website. As required by current privacy regulations, your prior consent is not required for the installation of these cookies.

1.2 Analytics or tracking cookies

Analytics cookies are used on the Website to collect statistical information, in aggregate or non-aggregate form, on the number of users accessing the Website and how they visit it.

The following third-party analytics cookies are installed on the Website:

Google Analytics – third-party analytics cookie – persistent
https://www.google.com/analytics/learn/privacy.html?hl=en

2. Methods of processing and data retention periods

Personal data may be stored on servers managed by third parties (e.g. IT system providers). Your personal data will not be communicated to third-party data controllers nor will it be disseminated.

3. Your rights

To exercise your rights, or to obtain any further information or clarification regarding this Cookie Policy, please contact the Data Controller by sending an email to info@keecks.ai

The Data Controller is not responsible for updating all links visible in this Cookie Policy, therefore whenever a link is not functioning and/or updated, Users acknowledge and accept that they must always refer to the document and/or section of the websites referred to by such link.

The Keecks Team`,
  },
}

export default function CookiesPage() {
  const { lang } = useLanguage()
  const c = CONTENT[lang]

  return (
    <main className="legal-page">
      <div className="legal-page__inner">
        <a href="/" className="legal-page__back">← Keecks</a>
        <h1 className="legal-page__title">{c.title}</h1>
        <div className="legal-page__body">
          {c.body.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </main>
  )
}
