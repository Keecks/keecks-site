# Meta Pixel Documentation

## Cos'è Meta Pixel

Meta Pixel (ex Facebook Pixel) è uno snippet JavaScript che Meta ti dà quando crei un Pixel nel Meta Events Manager. Fa due cose:

1. **Traccia le azioni degli utenti sul tuo sito** (visite, click, form, acquisti...)
2. **Invia i dati a Meta** così puoi creare campagne pubblicitarie ottimizzate su quelle azioni (retargeting, lookalike audiences, conversioni)

## Come si ottiene

1. Vai su Meta Business Suite → Events Manager
2. Clicca **"Connetti origini dei dati"** → **"Web"** → **"Meta Pixel"**
3. Ti viene dato un Pixel ID (un numero tipo `123456789012345`)
4. Inserisci il codice base nel sito

## Il codice base

```html
<script>
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
  n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
  s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
  (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'IL_TUO_PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

## Come funziona nel codice

Dopo che il codice base è caricato, puoi chiamare `fbq()` ovunque:
- **Eventi standard**: `fbq('track', 'Lead')`, `fbq('track', 'ViewContent')` — Meta li riconosce e li usa per ottimizzare le campagne
- **Eventi custom**: `fbq('trackCustom', 'NomeEvento', { dati })` — per tracking personalizzato

---

## I 7 eventi per il vostro sito

Ecco come mappo ogni evento richiesto:

| # | Evento | Tipo | Chiamata `fbq()` | Dove si attiva |
|---|---|---|---|---|
| 1 | Landing page view | Standard | `fbq('track', 'PageView')` | Automatico nel codice base (già incluso) |
| 2 | Scroll (es. 50%, 75%) | Custom | `fbq('trackCustom', 'ScrollDepth', {percent: 50})` | IntersectionObserver o scroll listener |
| 3 | Click sul form | Custom | `fbq('trackCustom', 'FormClick')` | onClick sul container del form |
| 4 | Inizio compilazione | Custom | `fbq('trackCustom', 'FormStart')` | Primo `onFocus`/`onChange` su un campo (una sola volta) |
| 5 | Fine compilazione (campi obbligatori) | Custom | `fbq('trackCustom', 'FormComplete')` | Quando nome + email + data + orario + privacy sono compilati |
| 6 | Invio form | Standard | `fbq('track', 'SubmitApplication')` | Nel `handleSubmit`, prima della fetch |
| 7 | Lead attivo (conferma ricevuta) | Standard | `fbq('track', 'Lead')` | Nella pagina `/book/confirmed` |

---

## Cosa serve da parte vostra

Prima di implementare, ho bisogno di:

1. **Il Pixel ID** — lo trovi in Meta Events Manager dopo aver creato il Pixel.
2. **Conferma sulle percentuali di scroll da tracciare** (25%, 50%, 75%? oppure solo una?).
3. **Su quali pagine va il Pixel?** Solo la landing (`/it/landing`) o anche homepage e `/book`?
4. **Cookie consent** — il Pixel va attivato solo dopo che l'utente accetta i cookie (GDPR). Vuoi che lo condizioni al consenso del cookie banner?

Una volta che ho il Pixel ID, posso implementare tutto nel codice. Vuoi procedere?
