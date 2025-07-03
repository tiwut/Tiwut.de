<?php
// ===== 1. LOGIK: SESSION, ZUSTIMMUNG & SPRACHE =====

// Starte die Session, um die Zustimmung des Benutzers zu speichern
session_start();

// Verarbeite die Formular-Antwort
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'agree') {
            $_SESSION['consent_given'] = true;
            // Lade die Seite neu, um den Inhalt anzuzeigen (verhindert erneutes Senden des Formulars)
            header("Location: " . $_SERVER['PHP_SELF']);
            exit;
        }
        if ($_POST['action'] === 'disagree') {
            // Leite zu einer neutralen Seite weiter
            header('Location: https://tiwut.de/Tools');
            exit;
        }
    }
}

// Übersetzungs-Array für alle Texte (HTML und JavaScript)
$texts = [
    'en' => [
        'lang_code' => 'en',
        'consent_title' => 'Data Usage & Consent',
        'consent_intro' => 'This website collects and displays technical data from your browser to demonstrate what information is accessible to websites. This includes your IP address, browser type, screen resolution, and other technical details.',
        'consent_question' => 'To proceed to the demonstration page, you must agree to the collection of this data for display purposes. If you disagree, you will be redirected.',
        'consent_agree' => 'Agree and Continue',
        'consent_disagree' => 'Disagree and Leave',
        'page_title' => 'What Your Browser Reveals',
        'main_h1' => 'What Your Browser (and the Server) Know About You',
        'main_p1' => 'This page displays information that websites can retrieve from your browser and your system. Some information (like the IP address) is collected by the server, others directly from your browser via JavaScript.',
        'server_h2' => 'Information Collected by the Server',
        'category_col' => 'Category',
        'value_col' => 'Value',
        'ip_address' => 'IP Address',
        'ip_na' => 'Not available',
        'user_agent_server' => 'User-Agent (seen by server)',
        'languages_server' => 'Accepted Languages (seen by server)',
        'referrer' => 'Referrer (if any)',
        'referrer_na' => 'Came directly or not sent',
        'client_h2' => 'Information Collected by the Browser (Client-side via JavaScript)',
        'additional_h2' => 'Additional APIs (may require permission)',
        'request_location' => 'Request Location',
        'location_info' => 'Location information will be displayed here...',
        'battery_info_container' => 'Battery information will be displayed here... (not all browsers support this)',
        'network_info_container' => 'Network information will be displayed here... (not all browsers support this)',
        'what_it_means_h2' => 'What Does This Mean?',
        'what_it_means_p1' => 'Much of this information is harmless and necessary for the web to function (e.g., screen resolution for layout). However, others can be used for detailed tracking and profiling (fingerprinting), even if you block cookies.',
        'privacy_tips_h' => 'Tips to Protect Your Privacy:',
        'privacy_tip_1' => 'Use a privacy-focused browser (e.g., Firefox with appropriate settings, Brave).',
        'privacy_tip_2' => 'Use browser extensions like uBlock Origin, Privacy Badger.',
        'privacy_tip_3' => 'Use a VPN to mask your IP address.',
        'privacy_tip_4' => 'Regularly check your browser settings for permissions (location, camera, etc.).',
        'privacy_tip_5' => 'Be cautious about which permissions you grant to websites.',
        'js' => [
            'loc_requesting' => 'Requesting location...',
            'loc_success' => '<b>Location retrieved successfully:</b><br>',
            'loc_error' => 'Error retrieving location: ',
            'loc_denied' => 'Permission denied.',
            'loc_unavailable' => 'Position unavailable.',
            'loc_timeout' => 'Timeout.',
            'loc_unknown' => 'Unknown error.',
            'loc_unsupported' => 'Geolocation is not supported by this browser.',
            'latitude' => 'Latitude', 'longitude' => 'Longitude', 'accuracy' => 'Accuracy', 'altitude' => 'Altitude', 'altitude_accuracy' => 'Altitude Accuracy', 'heading' => 'Heading', 'speed' => 'Speed', 'timestamp' => 'Timestamp', 'meters' => 'meters',
            'battery_status' => '<b>Battery Status:</b><br>',
            'charging_state' => 'Charging State', 'charging' => 'Charging', 'discharging' => 'Discharging',
            'level' => 'Level', 'charge_time' => 'Time to full charge', 'discharge_time' => 'Time to empty', 'minutes' => 'min',
            'na' => 'N/A',
            'battery_error' => 'Error accessing Battery API.',
            'battery_unsupported_text' => 'Battery API is not supported by this browser.',
            'battery_info_text' => 'Battery information:',
            'net_info' => '<b>Network Information:</b><br>',
            'net_type' => 'Connection Type', 'net_effective_type' => 'Effective Type', 'net_downlink' => 'Downlink (est.)', 'net_rtt' => 'RTT (est.)', 'net_save_data' => 'Save Data Mode',
            'net_type_ex' => '(e.g., wifi, cellular)', 'net_eff_type_ex' => '(e.g., 4g, 3g)', 'net_mbps' => 'Mbps', 'net_ms' => 'ms',
            'net_active' => 'Active', 'net_inactive' => 'Inactive',
            'net_error' => 'Network information could not be fully loaded.',
            'net_no_object' => 'Network API is present, but connection object not accessible.',
            'net_unsupported_text' => 'Network Information API is not supported by this browser.',
            'net_info_text' => 'Network information:',
            'canvas_note' => 'Unique image data created by rendering on a canvas. Can be very specific to a browser/OS/hardware combination.',
            'canvas_error_note' => 'Some browsers or extensions block canvas read-out attempts.',
        ]
    ],
    'de' => [
        'lang_code' => 'de',
        'consent_title' => 'Datennutzung & Zustimmung',
        'consent_intro' => 'Diese Webseite sammelt und zeigt technische Daten Ihres Browsers an, um zu demonstrieren, welche Informationen für Webseiten zugänglich sind. Dies umfasst Ihre IP-Adresse, den Browsertyp, die Bildschirmauflösung und weitere technische Details.',
        'consent_question' => 'Um zur Demonstrationsseite zu gelangen, müssen Sie der Erhebung dieser Daten zum Zweck der Anzeige zustimmen. Wenn Sie nicht zustimmen, werden Sie weitergeleitet.',
        'consent_agree' => 'Zustimmen und Fortfahren',
        'consent_disagree' => 'Ablehnen und Verlassen',
        'page_title' => 'Was dein Browser verrät',
        'main_h1' => 'Was dein Browser (und der Server) über dich wissen',
        'main_p1' => 'Diese Seite zeigt Informationen an, die Websites von deinem Browser und deinem System abrufen können. Einige Informationen (wie die IP-Adresse) werden vom Server erfasst, andere direkt von deinem Browser über JavaScript.',
        'server_h2' => 'Vom Server erfasste Informationen',
        'category_col' => 'Kategorie',
        'value_col' => 'Wert',
        'ip_address' => 'IP-Adresse',
        'ip_na' => 'Nicht verfügbar',
        'user_agent_server' => 'User-Agent (vom Server gesehen)',
        'languages_server' => 'Akzeptierte Sprachen (vom Server gesehen)',
        'referrer' => 'Referrer (falls vorhanden)',
        'referrer_na' => 'Nicht direkt gekommen oder nicht gesendet',
        'client_h2' => 'Vom Browser (Client-seitig via JavaScript) erfasste Informationen',
        'additional_h2' => 'Zusätzliche APIs (erfordern ggf. Zustimmung)',
        'request_location' => 'Standort abfragen',
        'location_info' => 'Standortinformationen werden hier angezeigt...',
        'battery_info_container' => 'Batterieinformationen werden hier angezeigt... (nicht alle Browser unterstützen dies)',
        'network_info_container' => 'Netzwerkinformationen werden hier angezeigt... (nicht alle Browser unterstützen dies)',
        'what_it_means_h2' => 'Was bedeutet das?',
        'what_it_means_p1' => 'Viele dieser Informationen sind harmlos und notwendig, damit das Web funktioniert (z.B. Bildschirmauflösung für das Layout). Andere können jedoch für detailliertes Tracking und Profiling (Fingerprinting) verwendet werden, selbst wenn du Cookies blockierst.',
        'privacy_tips_h' => 'Tipps zum Schutz deiner Privatsphäre:',
        'privacy_tip_1' => 'Verwende einen datenschutzfreundlichen Browser (z.B. Firefox mit entsprechenden Einstellungen, Brave).',
        'privacy_tip_2' => 'Nutze Browser-Erweiterungen wie uBlock Origin, Privacy Badger.',
        'privacy_tip_3' => 'Verwende ein VPN, um deine IP-Adresse zu verschleiern.',
        'privacy_tip_4' => 'Überprüfe regelmäßig deine Browser-Einstellungen bezüglich Berechtigungen (Standort, Kamera etc.).',
        'privacy_tip_5' => 'Sei vorsichtig, welche Berechtigungen du Webseiten erteilst.',
        'js' => [
            'loc_requesting' => 'Standort wird abgefragt...',
            'loc_success' => '<b>Standort erfolgreich abgerufen:</b><br>',
            'loc_error' => 'Fehler beim Abrufen des Standorts: ',
            'loc_denied' => 'Zugriff verweigert.',
            'loc_unavailable' => 'Position nicht verfügbar.',
            'loc_timeout' => 'Timeout.',
            'loc_unknown' => 'Unbekannter Fehler.',
            'loc_unsupported' => 'Geolocation wird von diesem Browser nicht unterstützt.',
            'latitude' => 'Breitengrad', 'longitude' => 'Längengrad', 'accuracy' => 'Genauigkeit', 'altitude' => 'Höhe', 'altitude_accuracy' => 'Höhengenauigkeit', 'heading' => 'Richtung', 'speed' => 'Geschwindigkeit', 'timestamp' => 'Zeitstempel', 'meters' => 'Meter',
            'battery_status' => '<b>Batteriestatus:</b><br>',
            'charging_state' => 'Ladestatus', 'charging' => 'Lädt', 'discharging' => 'Entlädt',
            'level' => 'Level', 'charge_time' => 'Verbleibende Ladezeit', 'discharge_time' => 'Verbleibende Entladezeit', 'minutes' => 'Min',
            'na' => 'N/A',
            'battery_error' => 'Fehler beim Zugriff auf Batterie-API.',
            'battery_unsupported_text' => 'Batterie-API wird von diesem Browser nicht unterstützt.',
            'battery_info_text' => 'Batterieinformationen:',
            'net_info' => '<b>Netzwerkinformationen:</b><br>',
            'net_type' => 'Verbindungstyp', 'net_effective_type' => 'Effektiver Typ', 'net_downlink' => 'Downlink (gesch.)', 'net_rtt' => 'RTT (gesch.)', 'net_save_data' => 'Datensparmodus',
            'net_type_ex' => '(z.B. wifi, cellular)', 'net_eff_type_ex' => '(z.B. 4g, 3g)', 'net_mbps' => 'Mbps', 'net_ms' => 'ms',
            'net_active' => 'Aktiviert', 'net_inactive' => 'Deaktiviert',
            'net_error' => 'Netzwerkinformationen konnten nicht vollständig geladen werden.',
            'net_no_object' => 'Netzwerk-API ist vorhanden, aber Verbindungsobjekt nicht zugreifbar.',
            'net_unsupported_text' => 'Network Information API wird von diesem Browser nicht unterstützt.',
            'net_info_text' => 'Netzwerkinformationen:',
            'canvas_note' => 'Eindeutige Bilddaten, die durch das Rendern auf einem Canvas entstehen. Kann sehr spezifisch für eine Browser/OS/Hardware-Kombination sein.',
            'canvas_error_note' => 'Manche Browser oder Erweiterungen blockieren Canvas-Ausleseversuche.',
        ]
    ],
    'es' => [
        'lang_code' => 'es',
        'consent_title' => 'Uso de Datos y Consentimiento',
        'consent_intro' => 'Este sitio web recopila y muestra datos técnicos de su navegador para demostrar qué información es accesible para los sitios web. Esto incluye su dirección IP, tipo de navegador, resolución de pantalla y otros detalles técnicos.',
        'consent_question' => 'Para continuar a la página de demostración, debe aceptar la recopilación de estos datos con fines de visualización. Si no está de acuerdo, será redirigido.',
        'consent_agree' => 'Aceptar y Continuar',
        'consent_disagree' => 'Rechazar y Salir',
        'page_title' => 'Lo que tu navegador revela',
        'main_h1' => 'Lo que tu navegador (y el servidor) saben de ti',
        'main_p1' => 'Esta página muestra información que los sitios web pueden obtener de tu navegador y tu sistema. Parte de la información (como la dirección IP) es recopilada por el servidor, otra directamente desde tu navegador a través de JavaScript.',
        'server_h2' => 'Información recopilada por el servidor',
        'category_col' => 'Categoría',
        'value_col' => 'Valor',
        'ip_address' => 'Dirección IP',
        'ip_na' => 'No disponible',
        'user_agent_server' => 'User-Agent (visto por el servidor)',
        'languages_server' => 'Idiomas aceptados (vistos por el servidor)',
        'referrer' => 'Referer (si existe)',
        'referrer_na' => 'Vino directamente o no se envió',
        'client_h2' => 'Información recopilada por el navegador (lado del cliente a través de JavaScript)',
        'additional_h2' => 'APIs adicionales (pueden requerir permiso)',
        'request_location' => 'Solicitar ubicación',
        'location_info' => 'La información de ubicación se mostrará aquí...',
        'battery_info_container' => 'La información de la batería se mostrará aquí... (no todos los navegadores lo soportan)',
        'network_info_container' => 'La información de la red se mostrará aquí... (no todos los navegadores lo soportan)',
        'what_it_means_h2' => '¿Qué significa esto?',
        'what_it_means_p1' => 'Mucha de esta información es inofensiva y necesaria para que la web funcione (por ejemplo, la resolución de pantalla para el diseño). Sin embargo, otra puede ser utilizada para el seguimiento detallado y la creación de perfiles (fingerprinting), incluso si bloqueas las cookies.',
        'privacy_tips_h' => 'Consejos para proteger tu privacidad:',
        'privacy_tip_1' => 'Usa un navegador centrado en la privacidad (por ejemplo, Firefox con la configuración adecuada, Brave).',
        'privacy_tip_2' => 'Usa extensiones de navegador como uBlock Origin, Privacy Badger.',
        'privacy_tip_3' => 'Usa una VPN para ocultar tu dirección IP.',
        'privacy_tip_4' => 'Revisa regularmente la configuración de permisos de tu navegador (ubicación, cámara, etc.).',
        'privacy_tip_5' => 'Ten cuidado con los permisos que otorgas a los sitios web.',
        'js' => [
            'loc_requesting' => 'Solicitando ubicación...',
            'loc_success' => '<b>Ubicación obtenida con éxito:</b><br>',
            'loc_error' => 'Error al obtener la ubicación: ',
            'loc_denied' => 'Permiso denegado.',
            'loc_unavailable' => 'Posición no disponible.',
            'loc_timeout' => 'Tiempo de espera agotado.',
            'loc_unknown' => 'Error desconocido.',
            'loc_unsupported' => 'La geolocalización no es compatible con este navegador.',
            'latitude' => 'Latitud', 'longitude' => 'Longitud', 'accuracy' => 'Precisión', 'altitude' => 'Altitud', 'altitude_accuracy' => 'Precisión de altitud', 'heading' => 'Dirección', 'speed' => 'Velocidad', 'timestamp' => 'Marca de tiempo', 'meters' => 'metros',
            'battery_status' => '<b>Estado de la batería:</b><br>',
            'charging_state' => 'Estado de carga', 'charging' => 'Cargando', 'discharging' => 'Descargando',
            'level' => 'Nivel', 'charge_time' => 'Tiempo de carga restante', 'discharge_time' => 'Tiempo de descarga restante', 'minutes' => 'min',
            'na' => 'N/D',
            'battery_error' => 'Error al acceder a la API de la batería.',
            'battery_unsupported_text' => 'La API de la batería no es compatible con este navegador.',
            'battery_info_text' => 'Información de la batería:',
            'net_info' => '<b>Información de red:</b><br>',
            'net_type' => 'Tipo de conexión', 'net_effective_type' => 'Tipo efectivo', 'net_downlink' => 'Descarga (est.)', 'net_rtt' => 'RTT (est.)', 'net_save_data' => 'Modo ahorro de datos',
            'net_type_ex' => '(ej. wifi, cellular)', 'net_eff_type_ex' => '(ej. 4g, 3g)', 'net_mbps' => 'Mbps', 'net_ms' => 'ms',
            'net_active' => 'Activado', 'net_inactive' => 'Desactivado',
            'net_error' => 'La información de la red no se pudo cargar completamente.',
            'net_no_object' => 'API de red presente, pero objeto de conexión no accesible.',
            'net_unsupported_text' => 'La API de información de red no es compatible con este navegador.',
            'net_info_text' => 'Información de la red:',
            'canvas_note' => 'Datos de imagen únicos creados al renderizar en un lienzo. Pueden ser muy específicos de una combinación de navegador/SO/hardware.',
            'canvas_error_note' => 'Algunos navegadores o extensiones bloquean los intentos de lectura del lienzo.',
        ]
    ]
];

// Funktion zur Spracherkennung
function get_lang_code() {
    if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
        $lang_str = strtolower($_SERVER['HTTP_ACCEPT_LANGUAGE']);
        if (strpos($lang_str, 'de') === 0) return 'de';
        if (strpos($lang_str, 'es') === 0) return 'es';
    }
    return 'en'; // Standard
}

// Aktuelle Sprache auswählen
$lang_code = get_lang_code();
$T = $texts[$lang_code]; // $T enthält alle Texte für die ausgewählte Sprache

?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($T['lang_code']); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($T['page_title']); ?></title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; margin: 0; color: #333; }
        .background-blur { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-image: url('https://source.unsplash.com/random/1600x900/?nature,water'); background-size: cover; background-position: center; filter: blur(8px); z-index: -1; }
        .container { background-color: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 8px; box-shadow: 0 0 15px rgba(0,0,0,0.2); margin: 40px auto; max-width: 900px; position: relative; z-index: 1; }
        h1 { color: #333; text-align: center; }
        h2 { color: #555; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { text-align: left; padding: 8px; border: 1px solid #ddd; }
        th { background-color: #e9e9e9; }
        td.value { word-break: break-all; }
        .note { font-size: 0.9em; color: #777; margin-top: 5px;}
        button { padding: 10px 20px; font-size: 1em; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        .btn-agree { background-color: #28a745; } .btn-agree:hover { background-color: #218838; }
        .btn-disagree { background-color: #dc3545; } .btn-disagree:hover { background-color: #c82333; }
        #location-info, #battery-info, #network-info { margin-top: 10px; padding: 10px; background-color: #eef; border-radius: 4px;}
        
        /* Styles für den Zustimmungs-Dialog */
        .consent-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; box-sizing: border-box; }
        .consent-modal { background: #fff; padding: 30px; border-radius: 10px; max-width: 550px; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.4); }
        .consent-modal h2 { margin-top: 0; border: none; }
        .consent-modal p { margin-bottom: 25px; }
        .consent-buttons { display: flex; justify-content: center; gap: 15px; }
    </style>
</head>
<body>
    <div class="background-blur"></div>

    <?php if (!isset($_SESSION['consent_given']) || $_SESSION['consent_given'] !== true): ?>
    
    <!-- ===== 2. ZUSTIMMUNGS-DIALOG ANZEIGEN ===== -->
    <div class="consent-overlay">
        <div class="consent-modal">
            <h2><?php echo htmlspecialchars($T['consent_title']); ?></h2>
            <p><?php echo htmlspecialchars($T['consent_intro']); ?></p>
            <p><strong><?php echo htmlspecialchars($T['consent_question']); ?></strong></p>
            <form method="POST" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>">
                <div class="consent-buttons">
                    <button type="submit" name="action" value="agree" class="btn-agree"><?php echo htmlspecialchars($T['consent_agree']); ?></button>
                    <button type="submit" name="action" value="disagree" class="btn-disagree"><?php echo htmlspecialchars($T['consent_disagree']); ?></button>
                </div>
            </form>
        </div>
    </div>

    <?php else: ?>

    <!-- ===== 3. HAUPTINHALT ANZEIGEN (NACH ZUSTIMMUNG) ===== -->
    <div class="container">
        <h1><?php echo htmlspecialchars($T['main_h1']); ?></h1>
        <p><?php echo htmlspecialchars($T['main_p1']); ?></p>

        <h2><?php echo htmlspecialchars($T['server_h2']); ?></h2>
        <table>
            <thead><tr><th><?php echo htmlspecialchars($T['category_col']); ?></th><th><?php echo htmlspecialchars($T['value_col']); ?></th></tr></thead>
            <tbody>
                <tr><td><?php echo htmlspecialchars($T['ip_address']); ?></td><td class="value"><?php echo htmlspecialchars($_SERVER['REMOTE_ADDR'] ?? $T['ip_na']); ?></td></tr>
                <tr><td><?php echo htmlspecialchars($T['user_agent_server']); ?></td><td class="value"><?php echo htmlspecialchars($_SERVER['HTTP_USER_AGENT'] ?? $T['ip_na']); ?></td></tr>
                <tr><td><?php echo htmlspecialchars($T['languages_server']); ?></td><td class="value"><?php echo htmlspecialchars($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? $T['ip_na']); ?></td></tr>
                <tr><td><?php echo htmlspecialchars($T['referrer']); ?></td><td class="value"><?php echo htmlspecialchars($_SERVER['HTTP_REFERER'] ?? $T['referrer_na']); ?></td></tr>
            </tbody>
        </table>

        <h2><?php echo htmlspecialchars($T['client_h2']); ?></h2>
        <table id="client-info-table">
            <thead><tr><th><?php echo htmlspecialchars($T['category_col']); ?></th><th><?php echo htmlspecialchars($T['value_col']); ?></th></tr></thead>
            <tbody><!-- JavaScript füllt diesen Bereich --></tbody>
        </table>

        <h2><?php echo htmlspecialchars($T['additional_h2']); ?></h2>
        <div>
            <button onclick="requestGeolocation()"><?php echo htmlspecialchars($T['request_location']); ?></button>
            <div id="location-info"><?php echo htmlspecialchars($T['location_info']); ?></div>
        </div>
        <div id="battery-info-container" style="margin-top: 15px;">
            <?php echo htmlspecialchars($T['battery_info_container']); ?>
            <div id="battery-info"></div>
        </div>
        <div id="network-info-container" style="margin-top: 15px;">
            <?php echo htmlspecialchars($T['network_info_container']); ?>
            <div id="network-info"></div>
        </div>

        <h2><?php echo htmlspecialchars($T['what_it_means_h2']); ?></h2>
        <p><?php echo htmlspecialchars($T['what_it_means_p1']); ?></p>
        <p><strong><?php echo htmlspecialchars($T['privacy_tips_h']); ?></strong></p>
        <ul>
            <li><?php echo htmlspecialchars($T['privacy_tip_1']); ?></li>
            <li><?php echo htmlspecialchars($T['privacy_tip_2']); ?></li>
            <li><?php echo htmlspecialchars($T['privacy_tip_3']); ?></li>
            <li><?php echo htmlspecialchars($T['privacy_tip_4']); ?></li>
            <li><?php echo htmlspecialchars($T['privacy_tip_5']); ?></li>
        </ul>
    </div>

    <script>
        // JS-Texte aus PHP übergeben
        const JS_TEXTS = <?php echo json_encode($T['js']); ?>;

        function addInfoToTable(category, value, note = '') {
            const tableBody = document.getElementById('client-info-table').getElementsByTagName('tbody')[0];
            const newRow = tableBody.insertRow();
            newRow.insertCell().innerHTML = category;
            newRow.insertCell().innerHTML = `<span class="value">${value}</span>` + (note ? `<div class="note">${note}</div>` : '');
        }

        addInfoToTable('User-Agent (Client)', navigator.userAgent || JS_TEXTS.na);
        addInfoToTable('Platform', navigator.platform || JS_TEXTS.na, 'Gibt oft das Betriebssystem an.');
        addInfoToTable('Browser Language', navigator.language || JS_TEXTS.na);
        addInfoToTable('Installed Languages', (navigator.languages && navigator.languages.join(', ')) || JS_TEXTS.na);
        addInfoToTable('Cookies enabled?', navigator.cookieEnabled ? 'Yes' : 'No');
        addInfoToTable('Hardware Cores (est.)', navigator.hardwareConcurrency || JS_TEXTS.na, 'Kann für Fingerprinting verwendet werden.');
        addInfoToTable('Screen Resolution', `${screen.width}x${screen.height} Pixels`);
        addInfoToTable('Available Screen Size', `${screen.availWidth}x${screen.availHeight} Pixels`);
        addInfoToTable('Color Depth', `${screen.colorDepth} Bit`);
        addInfoToTable('Timezone (Offset)', `UTC${-new Date().getTimezoneOffset() / 60}`);
        try { addInfoToTable('Timezone (IANA Name)', Intl.DateTimeFormat().resolvedOptions().timeZone || JS_TEXTS.na); } catch(e) { /* ignore */ }

        window.requestGeolocation = function() {
            const locationDiv = document.getElementById('location-info');
            locationDiv.textContent = JS_TEXTS.loc_requesting;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (p) => {
                        locationDiv.innerHTML = `${JS_TEXTS.loc_success}` +
                            `${JS_TEXTS.latitude}: ${p.coords.latitude}<br>` +
                            `${JS_TEXTS.longitude}: ${p.coords.longitude}<br>` +
                            `${JS_TEXTS.accuracy}: ${p.coords.accuracy} ${JS_TEXTS.meters}<br>` +
                            `${JS_TEXTS.altitude}: ${p.coords.altitude || JS_TEXTS.na}<br>` +
                            `${JS_TEXTS.timestamp}: ${new Date(p.timestamp).toLocaleString()}`;
                    },
                    (error) => {
                        let msg = JS_TEXTS.loc_error;
                        switch(error.code) {
                            case error.PERMISSION_DENIED: msg += JS_TEXTS.loc_denied; break;
                            case error.POSITION_UNAVAILABLE: msg += JS_TEXTS.loc_unavailable; break;
                            case error.TIMEOUT: msg += JS_TEXTS.loc_timeout; break;
                            default: msg += JS_TEXTS.loc_unknown; break;
                        }
                        locationDiv.textContent = msg;
                    }
                );
            } else { locationDiv.textContent = JS_TEXTS.loc_unsupported; }
        }

        const batteryDivContainer = document.getElementById('battery-info-container');
        if ('getBattery' in navigator) {
            navigator.getBattery().then(function(battery) {
                batteryDivContainer.firstChild.textContent = JS_TEXTS.battery_info_text;
                const batteryDiv = document.getElementById('battery-info');
                function update() {
                    batteryDiv.innerHTML = `${JS_TEXTS.battery_status}` +
                        `${JS_TEXTS.charging_state}: ${battery.charging ? JS_TEXTS.charging : JS_TEXTS.discharging}<br>` +
                        `${JS_TEXTS.level}: ${(battery.level * 100).toFixed(0)}%<br>` +
                        `${JS_TEXTS.discharge_time}: ${battery.dischargingTime === Infinity ? JS_TEXTS.na : (battery.dischargingTime / 60).toFixed(0) + ' ' + JS_TEXTS.minutes}`;
                }
                update();
                battery.addEventListener('levelchange', update);
                battery.addEventListener('chargingchange', update);
            }).catch(e => { batteryDivContainer.firstChild.textContent = JS_TEXTS.battery_error; });
        } else { batteryDivContainer.firstChild.textContent = JS_TEXTS.battery_unsupported_text; }

        const networkDivContainer = document.getElementById('network-info-container');
        if ('connection' in navigator) {
            const conn = navigator.connection;
            networkDivContainer.firstChild.textContent = JS_TEXTS.net_info_text;
            const networkDiv = document.getElementById('network-info');
            function update() {
                 networkDiv.innerHTML = `${JS_TEXTS.net_info}` +
                    `${JS_TEXTS.net_type}: ${conn.type || JS_TEXTS.na}<br>` +
                    `${JS_TEXTS.net_effective_type}: ${conn.effectiveType || JS_TEXTS.na}<br>` +
                    `${JS_TEXTS.net_downlink}: ${conn.downlink ? conn.downlink + ' ' + JS_TEXTS.net_mbps : JS_TEXTS.na}<br>` +
                    `${JS_TEXTS.net_save_data}: ${conn.saveData ? JS_TEXTS.net_active : JS_TEXTS.net_inactive}`;
            }
            update();
            conn.addEventListener('change', update);
        } else { networkDivContainer.firstChild.textContent = JS_TEXTS.net_unsupported_text; }
        
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.fillText('BrowserCanvasTest :)', 2, 12);
            const canvasData = canvas.toDataURL();
            addInfoToTable('Canvas Fingerprint (Hash)', canvasData.substring(0, 50) + '...', JS_TEXTS.canvas_note);
        } catch (e) {
            addInfoToTable('Canvas Fingerprint', 'Error or blocked', JS_TEXTS.canvas_error_note);
        }

        try {
            const glCanvas = document.createElement('canvas');
            const gl = glCanvas.getContext('webgl') || glCanvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                addInfoToTable('WebGL Renderer', debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'N/A');
            }
        } catch (e) { /* ignore */ }
    </script>
    <?php endif; ?>

</body>
</html>