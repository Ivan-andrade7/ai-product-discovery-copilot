# One-shot personal catalog check. Credentials exist only in this process memory.
# No environment key, browser session, transcript, redirect, retry or generation.
param([switch]$ValidateOnly)
$ErrorActionPreference = 'Stop'
if ($ValidateOnly) { return }
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Net.Http
$taskDirectory = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'Codex\AbacusCatalog-01a11360-b7f2-7362-bd48-6cc208037c8d'
$attemptPath = Join-Path $taskDirectory 'catalog-attempt.json'
$resultPath = Join-Path $taskDirectory 'catalog-result.json'
$endpoint = 'https://routellm.abacus.ai/v1/models'

function Save-PublicResult($value) {
    [IO.File]::WriteAllText($resultPath, ($value | ConvertTo-Json -Depth 20), [Text.UTF8Encoding]::new($false))
}

# Preserve numeric tariff fields and explicitly recognized units, not raw bodies.
function Get-TariffFields($node, [string]$path = '') {
    if ($null -eq $node) { return }
    foreach ($property in $node.PSObject.Properties) {
        $name = $property.Name
        $fullPath = if ($path) { "$path.$name" } else { $name }
        $value = $property.Value
        if ($fullPath -match '(?i)price|pricing|cost|credit|token|currency|unit|billing') {
            if ($value -is [ValueType] -and $value -isnot [bool]) {
                [pscustomobject]@{ field = $fullPath; value = $value }
            } elseif ($value -is [string] -and ($value -match '^[-+]?\d+(\.\d+)?([eE][-+]?\d+)?$' -or $value -match '^(?i:usd|credits?|tokens?|per_token|per_1m_tokens|per_million_tokens)$')) {
                [pscustomobject]@{ field = $fullPath; value = $value }
            }
        }
        if ($value -is [pscustomobject]) { Get-TariffFields $value $fullPath }
    }
}

$form = New-Object Windows.Forms.Form
$form.Text = 'Consulta privada del catalogo de Abacus'
$form.ClientSize = New-Object Drawing.Size(590, 260)
$form.StartPosition = 'CenterScreen'
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.TopMost = $true
$label = New-Object Windows.Forms.Label
$label.Location = New-Object Drawing.Point(20, 20)
$label.Size = New-Object Drawing.Size(550, 78)
$label.Text = "Introduci personalmente la clave API de RouteLLM. Se usa solo en memoria.`r`nSe hara un unico GET /v1/models. No genera contenido ni activa Metering.`r`nLa solicitud cuenta incluso si falla. No hay reintentos."
$secretBox = New-Object Windows.Forms.TextBox
$secretBox.Location = New-Object Drawing.Point(20, 104)
$secretBox.Size = New-Object Drawing.Size(550, 25)
$secretBox.UseSystemPasswordChar = $true
$secretBox.MaxLength = 4096
$submit = New-Object Windows.Forms.Button
$submit.Text = 'Consultar una sola vez'
$submit.Location = New-Object Drawing.Point(20, 144)
$submit.Size = New-Object Drawing.Size(200, 32)
$cancel = New-Object Windows.Forms.Button
$cancel.Text = 'Cerrar'
$cancel.Location = New-Object Drawing.Point(235, 144)
$cancel.Size = New-Object Drawing.Size(100, 32)
$status = New-Object Windows.Forms.Label
$status.Location = New-Object Drawing.Point(20, 190)
$status.Size = New-Object Drawing.Size(550, 55)
$status.Text = 'Esperando clave. Todavia no se envio ninguna solicitud.'
$form.Controls.AddRange(@($label, $secretBox, $submit, $cancel, $status))
$form.AcceptButton = $submit
$form.Add_Shown({ $form.Activate(); $secretBox.Focus() })
$cancel.Add_Click({ $secretBox.Clear(); $form.Close() })
$submit.Add_Click({
    $key = $secretBox.Text
    $secretBox.Clear()
    if ([string]::IsNullOrWhiteSpace($key) -or $key -match '\s') { $key = $null; $status.Text = 'Clave vacia o con espacios. No se envio ninguna solicitud.'; return }
    $submit.Enabled = $false
    $secretBox.Enabled = $false
    $client = $null
    $handler = $null
    $request = $null
    $response = $null
    $reserved = $false
    try {
        [IO.Directory]::CreateDirectory($taskDirectory) | Out-Null
        # Atomic CreateNew prevents restarting or double clicking into another call.
        $marker = [IO.File]::Open($attemptPath, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
        try {
            $bytes = [Text.Encoding]::UTF8.GetBytes('{"requestCount":1,"kind":"catalog","maximumTotal":5}')
            $marker.Write($bytes, 0, $bytes.Length)
        } finally { $marker.Dispose() }
        $reserved = $true
        $handler = [Net.Http.HttpClientHandler]::new()
        $handler.AllowAutoRedirect = $false
        $handler.UseCookies = $false
        $handler.UseDefaultCredentials = $false
        $client = [Net.Http.HttpClient]::new($handler)
        $client.Timeout = [TimeSpan]::FromSeconds(25)
        $client.MaxResponseContentBufferSize = 2097152
        $request = [Net.Http.HttpRequestMessage]::new([Net.Http.HttpMethod]::Get, $endpoint)
        $request.Headers.Authorization = [Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer', $key)
        $key = $null
        $status.Text = 'Consultando catalogo. No cierres esta ventana durante la solicitud.'
        $form.Refresh()
        $response = $client.SendAsync($request).GetAwaiter().GetResult()
        $httpStatus = [int]$response.StatusCode
        if ($httpStatus -ne 200) {
            Save-PublicResult @{ outcome = 'stopped'; httpStatus = $httpStatus; requestCount = 1; reason = 'Catalog access failed. No activation, retry or generation.' }
            $status.Text = "Consulta detenida: HTTP $httpStatus. No se reintentara ni activara facturacion."
            return
        }
        $payload = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json
        $models = if ($payload -is [array]) { $payload } elseif ($null -ne $payload.data) { $payload.data } elseif ($null -ne $payload.models) { $payload.models } else { @() }
        $matches = @($models | Where-Object { $_.id -ceq 'claude-sonnet-4-6' })
        if ($matches.Count -ne 1) {
            Save-PublicResult @{ outcome = 'stopped'; httpStatus = 200; requestCount = 1; reason = 'Exact authorized model ID absent or ambiguous. No substitute selected.' }
            $status.Text = 'Sonnet 4.6 no identificado de forma unica. Prueba detenida sin sustitucion.'
            return
        }
        $fields = @(Get-TariffFields $matches[0])
        Save-PublicResult @{ outcome = 'catalog-read'; modelId = 'claude-sonnet-4-6'; requestCount = 1; tariffFields = $fields; generationAccess = 'not-tested'; creditConversion = 'requires-explicit-unit'; capturedAt = [DateTime]::UtcNow.ToString('o') }
        $status.Text = 'Consulta terminada. Se conservaron solo campos numericos de tarifa. Cerrar borra la sesion.'
        $payload = $null
        $models = $null
        $matches = $null
    } catch {
        if ($reserved) {
            Save-PublicResult @{ outcome = 'stopped'; requestCount = 1; reason = 'Catalog timeout, parse or transport failure. Details intentionally not logged.' }
            $status.Text = 'Consulta detenida por error o timeout. Cuenta como solicitud; no se reintentara.'
        } else { $status.Text = 'No se envio: consulta ya reservada o registro local inaccesible.' }
    } finally {
        $key = $null
        if ($null -ne $request) { $request.Headers.Authorization = $null; $request.Dispose() }
        if ($null -ne $response) { $response.Dispose() }
        if ($null -ne $client) { $client.Dispose() }
        elseif ($null -ne $handler) { $handler.Dispose() }
    }
})
try { [void]$form.ShowDialog() } finally { $secretBox.Clear(); $form.Dispose() }
