// /it/landing mostra la stessa pagina di /it/assistente-ai (stesso componente e stessi
// metadati, canonical compreso: per i motori di ricerca l'indirizzo ufficiale resta
// /it/assistente-ai). Il vecchio testo "solo parrucchieri" non esiste più.
import AssistenteAiPage, { metadata as assistenteAiMetadata } from '../assistente-ai/page'

export const metadata = assistenteAiMetadata

export default AssistenteAiPage
