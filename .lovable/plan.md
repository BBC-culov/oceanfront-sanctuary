Dato che hai scelto di usare Resend per tutte le email, Lovable Emails va disabilitata per evitare conflitti o doppi invii.

Stato attuale: il progetto ha un dominio Lovable configurato (`notify.bazhouse.it`) con Auth emails attive. Le edge function `auth-email-hook` e `send-transactional-email` sono già state riscritte per inviare direttamente via Resend, quindi il sistema Lovable è ridondante.

### Cosa fare

1. **Disabilitare Lovable Emails** nel progetto, così l'auth hook non invoca più il vecchio flusso Lovable e le email non vengono doppiate.
2. **Verificare il dominio su Resend**: assicurarsi che `noreply@bazhouse.com` (o il dominio che vuoi usare) sia verificato nella dashboard Resend, altrimenti i messaggi saranno bloccati con errore 403.
3. **Confermare il secret Resend**: la chiave API (`RESEND_API_KEY`) deve essere presente come secret del progetto e accessibile alle edge function.
4. **Redeployare le edge function** `auth-email-hook` e `send-transactional-email` dopo il toggle, per garantire che l'ultima versione Resend sia in produzione.
5. **Testare un invio**: fare un signup di test e controllare `email_send_log` per confermare che lo stato sia `sent` con `provider: 'resend'`.

### Nota importante
Disabilitare Lovable Emails NON rimuove i record DNS del dominio delegato (`notify.bazhouse.it`) dal tuo provider DNS: se non serve più, dovrai rimuoverli manualmente dal pannello del tuo registrar. Inoltre, il toggle fa tornare le email di default a template Lovable generici solo se non ci sono le edge function attive: qui invece rimangono i template custom perché invochiamo Resend direttamente.