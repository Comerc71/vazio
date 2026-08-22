# Firmware — Heltec WiFi LoRa 32 V3

Código-fonte (Arduino) dos dois papéis da rede de campo:

- [`transmissor/`](transmissor/transmissor.ino) — roda em cada sensor de campo. Lê um valor (hoje simulado, até você definir o sensor real) e transmite por LoRa a cada 30s.
- [`receptor/`](receptor/receptor.ino) — roda no gateway (o único nó com Wi-Fi). Escuta os transmissores e reenvia cada leitura pro app via internet.

## Preparar o ambiente

1. Instale o [Arduino IDE](https://www.arduino.cc/en/software).
2. Arquivo → Preferências → em "URLs adicionais de gerenciadores de placas", adicione:
   `https://espressif.github.io/arduino-esp32/package_esp32_index.json`
3. Ferramentas → Placa → Gerenciador de Placas → instale **esp32** (Espressif Systems).
4. Selecione a placa **Heltec WiFi LoRa 32(V3)**.
5. Sketch → Incluir biblioteca → Gerenciar bibliotecas → instale **RadioLib** (autor: jgromes).

## Configurar cada nó

- No transmissor: ajuste `NODE_ID` (um número diferente por sensor instalado) e `LORA_FREQUENCY` (915 MHz Brasil/EUA, 868 MHz Europa — confira a legislação de RF local).
- No receptor: preencha `WIFI_SSID`/`WIFI_PASSWORD`, confira `INGEST_URL`, e preencha a lista `devices[]` associando cada `NODE_ID` ao `device_id`/`api_key` mostrados no app em **Ajustes → [dispositivo] → Integração RF**.
- `LORA_FREQUENCY` e o "sync word" (`0x12`) precisam ser **idênticos** entre transmissor(es) e receptor.

## Testar sem sensor real

O transmissor já sai enviando um valor de teste (número aleatório) — dá pra validar a comunicação completa (LoRa → gateway → nuvem → app) antes de decidir qual sensor usar. Quando escolher o sensor, troque a função `lerSensor()` no transmissor pela leitura real (ex: `analogRead(...)`).
